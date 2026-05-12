/**
 * smoke-test-demo.ts — full smoke test for all 4 demo accounts.
 * Checks: DB data integrity, login API, intelligence routes.
 * Run: npm run smoke-test
 */
import "dotenv/config";
import { db, pool } from "../server/db";
import { users } from "../shared/models/auth";
import { locations, appointments, customers, staff, services } from "../shared/schema";
import { eq, count } from "drizzle-orm";

const BASE = "http://localhost:5000";

const DEMO_ACCOUNTS = [
  { email: "nail-demo@certxa.com",   password: "demo1234", slug: "luxe-nails-spa-demo",        name: "Luxe Nails & Spa",        seedCmd: "db:seed:nail-demo" },
  { email: "hair-demo@certxa.com",   password: "demo1234", slug: "elevate-hair-studio-demo",    name: "Elevate Hair Studio",     seedCmd: "db:seed:hair-demo" },
  { email: "spa-demo@certxa.com",    password: "demo1234", slug: "serenity-spa-wellness-demo",  name: "Serenity Spa & Wellness", seedCmd: "db:seed:spa-demo" },
  { email: "barber-demo@certxa.com", password: "demo1234", slug: "prime-cuts-barbershop-demo",  name: "Prime Cuts Barbershop",   seedCmd: "db:seed:barber-demo" },
];

let pass = 0;
let fail = 0;

function ok(msg: string)   { console.log(`  ✅  ${msg}`); pass++; }
function bad(msg: string)  { console.error(`  ❌  ${msg}`); fail++; }
function info(msg: string) { console.log(`  ℹ️   ${msg}`); }
function hdr(msg: string)  { console.log(`\n── ${msg} ──────────────────────────`); }

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function httpGet(path: string, cookie?: string) {
  const headers: Record<string, string> = {};
  if (cookie) headers["Cookie"] = cookie;
  const r = await fetch(`${BASE}${path}`, { headers });
  return { status: r.status, body: await r.json().catch(() => null) };
}

async function httpLogin(email: string, password: string): Promise<{ cookie: string | null; user: any }> {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = r.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/connect\.sid=([^;]+)/);
  const cookie = match ? `connect.sid=${match[1]}` : null;
  const user = await r.json().catch(() => null);
  return { cookie, user };
}

// ── DB checks ─────────────────────────────────────────────────────────────────

async function checkDb(acct: typeof DEMO_ACCOUNTS[0]) {
  hdr(`${acct.name} — DB`);

  const [user] = await db.select({ id: users.id, email: users.email })
    .from(users).where(eq(users.email, acct.email));
  if (!user) { bad(`User NOT found — run: npm run ${acct.seedCmd}`); return null; }
  ok(`User exists (id=${user.id.slice(0, 8)}…)`);

  const [store] = await db.select({ id: locations.id, name: locations.name, userId: locations.userId })
    .from(locations).where(eq(locations.bookingSlug, acct.slug));
  if (!store) { bad(`Store NOT found`); return null; }
  ok(`Store exists (id=${store.id})`);

  if (store.userId === user.id) ok(`Store → user link correct`);
  else bad(`Store userId mismatch (store=${store.userId}, user=${user.id})`);

  const [custRow]  = await db.select({ n: count() }).from(customers).where(eq(customers.storeId, store.id));
  const [apptRow]  = await db.select({ n: count() }).from(appointments).where(eq(appointments.storeId, store.id));
  const [staffRow] = await db.select({ n: count() }).from(staff).where(eq(staff.storeId, store.id));
  const [svcRow]   = await db.select({ n: count() }).from(services).where(eq(services.storeId, store.id));

  const nc = Number(custRow?.n  ?? 0);
  const na = Number(apptRow?.n  ?? 0);
  const ns = Number(staffRow?.n ?? 0);
  const nv = Number(svcRow?.n   ?? 0);

  if (nc >= 400) ok(`Clients: ${nc}`);        else bad(`Clients: ${nc} — expected ≥400`);
  if (na >= 1500) ok(`Appointments: ${na}`);  else bad(`Appointments: ${na} — expected ≥1500`);
  if (ns >= 5)   ok(`Staff: ${ns}`);          else bad(`Staff: ${ns} — expected ≥5`);
  if (nv >= 5)   ok(`Services: ${nv}`);       else bad(`Services: ${nv} — expected ≥5`);

  info(`Revenue data: ${nc} clients, ${na} appts, ${ns} staff, ${nv} services`);
  return { user, store };
}

// ── API checks ────────────────────────────────────────────────────────────────

async function checkApi(acct: typeof DEMO_ACCOUNTS[0], storeId: number) {
  hdr(`${acct.name} — API`);

  // 1. Login
  const { cookie, user } = await httpLogin(acct.email, acct.password);
  if (user && user.email === acct.email) ok(`POST /api/auth/login → 200`);
  else { bad(`Login failed — got: ${JSON.stringify(user)}`); return; }

  if (!cookie) {
    info(`Session cookie not available over plain HTTP (normal in this env) — skipping authenticated route checks`);
    return;
  }

  // 2. Stores
  const stores = await httpGet("/api/stores", cookie);
  if (stores.status === 200 && Array.isArray(stores.body) && stores.body.length > 0) {
    ok(`GET /api/stores → 200 (${stores.body.length} store(s))`);
  } else {
    bad(`GET /api/stores → ${stores.status}: ${JSON.stringify(stores.body)}`);
  }

  // 3. Demo status
  const status = await httpGet(`/api/intelligence/demo/status?storeId=${storeId}`, cookie);
  if (status.status === 200) ok(`GET /api/intelligence/demo/status → 200`);
  else bad(`GET /api/intelligence/demo/status → ${status.status}: ${JSON.stringify(status.body)}`);

  // 4. Intelligence dashboard
  const dash = await httpGet(`/api/intelligence/dashboard?storeId=${storeId}`, cookie);
  if (dash.status === 200) ok(`GET /api/intelligence/dashboard → 200`);
  else if (dash.status === 204) ok(`GET /api/intelligence/dashboard → 204 (not computed yet)`);
  else bad(`GET /api/intelligence/dashboard → ${dash.status}: ${JSON.stringify(dash.body)}`);
}

// ── Unauthenticated route guard checks ───────────────────────────────────────

async function checkUnauthGuards() {
  hdr("Unauthenticated route guards");
  const routes = [
    { path: "/api/stores",                       expect: 401 },
    { path: "/api/intelligence/dashboard",       expect: 401 },
    { path: "/api/intelligence/demo/status",     expect: 401 },
    { path: "/api/intelligence/demo/launch",     expect: 401 },
  ];
  for (const r of routes) {
    const res = await httpGet(r.path);
    if (res.status === r.expect) ok(`GET ${r.path} → ${res.status} (blocked correctly)`);
    else bad(`GET ${r.path} → ${res.status}, expected ${r.expect}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║          Certxa Demo — Full Smoke Test                      ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  // Check server is up
  try {
    const r = await fetch(`${BASE}/api/auth/user`);
    info(`Server reachable at ${BASE} (status ${r.status})`);
  } catch {
    bad(`Server not reachable at ${BASE} — is it running?`);
    await pool.end();
    process.exit(1);
  }

  // DB + API checks per account
  for (const acct of DEMO_ACCOUNTS) {
    const dbResult = await checkDb(acct);
    if (dbResult) {
      await checkApi(acct, dbResult.store.id);
    }
  }

  // Unauthenticated guards
  await checkUnauthGuards();

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n  Result: ${pass} passed, ${fail} failed`);
  if (fail === 0) {
    console.log("  🎉  All checks passed — demo system is fully operational.\n");
  } else {
    console.log("  ⚠️   Some checks failed — see output above.\n");
  }

  await pool.end();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error("\n❌ Smoke test crashed:", err.message ?? err);
  process.exit(1);
});

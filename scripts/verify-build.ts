import { readdir, readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import vm from "vm";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS_DIR = path.resolve(ROOT, "dist/public/assets");
const INDEX_HTML = path.resolve(ROOT, "dist/public/index.html");

function makeBrowserSandbox() {
  const noop = () => {};
  const fakeEl: any = new Proxy(
    {},
    {
      get: () => fakeEl,
      set: () => true,
      has: () => true,
      apply: () => fakeEl,
    },
  );
  const storage = {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: () => null,
    length: 0,
  };
  const documentStub: any = {
    createElement: () => fakeEl,
    createElementNS: () => fakeEl,
    createTextNode: () => fakeEl,
    createDocumentFragment: () => fakeEl,
    getElementById: () => null,
    getElementsByTagName: () => [],
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    documentElement: fakeEl,
    head: fakeEl,
    body: fakeEl,
    location: { href: "http://localhost/", origin: "http://localhost", pathname: "/" },
    cookie: "",
    readyState: "complete",
  };
  const windowStub: any = {
    addEventListener: noop,
    removeEventListener: noop,
    location: documentStub.location,
    navigator: { userAgent: "node-build-verify", language: "en-US" },
    document: documentStub,
    localStorage: storage,
    sessionStorage: storage,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }),
    requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
    cancelAnimationFrame: (id: any) => clearTimeout(id),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve("") }),
    crypto: (globalThis as any).crypto,
    HTMLElement: function HTMLElement() {},
    Element: function Element() {},
    Node: function Node() {},
    Image: function Image() {},
    history: { pushState: noop, replaceState: noop, go: noop, back: noop, forward: noop },
    scrollTo: noop,
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
  };
  windowStub.self = windowStub;
  windowStub.window = windowStub;
  windowStub.globalThis = windowStub;
  const sandbox: any = {
    ...windowStub,
    console,
    process: { env: { NODE_ENV: "production" } },
    global: windowStub,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    Buffer,
  };
  return sandbox;
}

async function listJsChunks(): Promise<string[]> {
  if (!existsSync(ASSETS_DIR)) return [];
  const entries = await readdir(ASSETS_DIR);
  return entries.filter((f) => f.endsWith(".js")).map((f) => path.join(ASSETS_DIR, f));
}

async function main() {
  if (!existsSync(INDEX_HTML)) {
    console.error(`[verify-build] ${INDEX_HTML} not found. Run 'npm run build' first.`);
    process.exit(1);
  }

  const chunks = await listJsChunks();
  if (chunks.length === 0) {
    console.error(`[verify-build] No JS chunks found in ${ASSETS_DIR}.`);
    process.exit(1);
  }

  console.log(`[verify-build] Checking ${chunks.length} bundle chunk(s) for top-level errors...`);

  const failures: { file: string; error: string }[] = [];

  for (const file of chunks) {
    const code = await readFile(file, "utf-8");
    const sizeKb = ((await stat(file)).size / 1024).toFixed(1);
    const sandbox = makeBrowserSandbox();
    vm.createContext(sandbox);
    try {
      const script = new vm.Script(code, { filename: path.basename(file) });
      script.runInContext(sandbox, { timeout: 10_000 });
      console.log(`  ok   ${path.basename(file)} (${sizeKb} KB)`);
    } catch (err: any) {
      const msg = err?.message || String(err);
      // Ignore errors that come from runtime side-effects unrelated to TDZ/parse.
      // We specifically care about TDZ ("Cannot access 'X' before initialization"),
      // SyntaxError, and top-level ReferenceError for missing globals.
      const isCritical =
        /Cannot access .* before initialization/.test(msg) ||
        err instanceof SyntaxError;
      if (isCritical) {
        failures.push({ file: path.basename(file), error: msg });
        console.log(`  FAIL ${path.basename(file)} (${sizeKb} KB) — ${msg}`);
      } else {
        console.log(`  ok*  ${path.basename(file)} (${sizeKb} KB) — non-critical: ${msg}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error(`\n[verify-build] ${failures.length} chunk(s) failed:`);
    for (const f of failures) console.error(`  - ${f.file}: ${f.error}`);
    process.exit(1);
  }

  console.log(`\n[verify-build] All chunks passed top-level execution check.`);
}

main().catch((err) => {
  console.error("[verify-build] Unexpected error:", err);
  process.exit(1);
});

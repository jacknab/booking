import { readdir, readFile, stat, writeFile, mkdir, rm } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import vm from "vm";
import { build as esbuild } from "esbuild";

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

async function findEntryChunk(): Promise<string | null> {
  const html = await readFile(INDEX_HTML, "utf-8");
  // Find the main entry script tag (Vite emits <script type="module" src="/assets/index-*.js">)
  const match = html.match(/<script[^>]+src="\/assets\/(index-[^"]+\.js)"/);
  if (match) return path.join(ASSETS_DIR, match[1]);
  // Fallback: the largest index-*.js
  const entries = await readdir(ASSETS_DIR);
  const candidates = entries.filter((f) => /^index-.*\.js$/.test(f));
  if (candidates.length === 0) return null;
  let best: { name: string; size: number } | null = null;
  for (const name of candidates) {
    const s = await stat(path.join(ASSETS_DIR, name));
    if (!best || s.size > best.size) best = { name, size: s.size };
  }
  return best ? path.join(ASSETS_DIR, best.name) : null;
}

async function bundleForVerification(entry: string): Promise<string> {
  // Use esbuild to merge the entry chunk with all its sibling chunks (which it
  // imports via relative paths) into a single IIFE we can evaluate in vm.
  const tmpDir = await mkdir(path.join(os.tmpdir(), `verify-build-${Date.now()}`), { recursive: true });
  const outFile = path.join(tmpDir as string, "bundle.js");
  await esbuild({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    platform: "browser",
    write: true,
    outfile: outFile,
    logLevel: "silent",
    legalComments: "none",
    // Vite chunks can contain `import.meta` references; esbuild handles this in browser.
  });
  const code = await readFile(outFile, "utf-8");
  await rm(tmpDir as string, { recursive: true, force: true });
  return code;
}

async function main() {
  if (!existsSync(INDEX_HTML)) {
    console.error(`[verify-build] ${INDEX_HTML} not found. Run 'npm run build' first.`);
    process.exit(1);
  }

  const entry = await findEntryChunk();
  if (!entry) {
    console.error(`[verify-build] Could not find an index-*.js entry chunk in ${ASSETS_DIR}.`);
    process.exit(1);
  }

  console.log(`[verify-build] Entry: ${path.basename(entry)}`);
  console.log(`[verify-build] Bundling all chunks for execution check...`);

  let code: string;
  try {
    code = await bundleForVerification(entry);
  } catch (err: any) {
    console.error(`[verify-build] Failed to bundle chunks: ${err?.message || err}`);
    process.exit(1);
  }

  const sizeKb = (code.length / 1024).toFixed(1);
  console.log(`[verify-build] Bundled ${sizeKb} KB. Executing in sandbox...`);

  const sandbox = makeBrowserSandbox();
  vm.createContext(sandbox);
  try {
    const script = new vm.Script(code, { filename: "verify-bundle.js" });
    script.runInContext(sandbox, { timeout: 15_000 });
    console.log(`[verify-build] OK — bundle executed without TDZ or syntax errors.`);
  } catch (err: any) {
    const msg = err?.message || String(err);
    const isCritical =
      /Cannot access .* before initialization/.test(msg) ||
      err instanceof SyntaxError;
    if (isCritical) {
      console.error(`[verify-build] FAIL — ${msg}`);
      if (err?.stack) console.error(err.stack.split("\n").slice(0, 5).join("\n"));
      process.exit(1);
    }
    console.log(`[verify-build] OK* — non-critical runtime error from sandbox stub: ${msg}`);
  }
}

main().catch((err) => {
  console.error("[verify-build] Unexpected error:", err);
  process.exit(1);
});

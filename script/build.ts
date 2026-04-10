import { build as esbuild, Plugin } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");

const EXTENSIONS = [
  ".tsx", ".ts", ".jsx", ".js",
  "/index.tsx", "/index.ts", "/index.jsx", "/index.js",
];

function resolveWithExt(base: string): string | undefined {
  for (const ext of EXTENSIONS) {
    const full = base + ext;
    if (existsSync(full)) return full;
  }
  return undefined;
}

// Path-alias plugin for the SSR bundle
// Maps @/, @shared/, @assets/ to their source directories
// Probes for the correct file extension so esbuild can load the file directly.
const pathAliasPlugin: Plugin = {
  name: "path-alias",
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => {
      const base = path.resolve(ROOT, "client/src", args.path.slice(2));
      const resolved = resolveWithExt(base) ?? base;
      return { path: resolved };
    });
    build.onResolve({ filter: /^@shared\// }, (args) => {
      const base = path.resolve(ROOT, "shared", args.path.slice(8));
      const resolved = resolveWithExt(base) ?? base;
      return { path: resolved };
    });
    build.onResolve({ filter: /^@assets\// }, (args) => {
      const base = path.resolve(ROOT, "attached_assets", args.path.slice(8));
      const resolved = resolveWithExt(base) ?? base;
      return { path: resolved };
    });
  },
};

// Server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "bcryptjs",
  "connect-pg-simple",
  "date-fns",
  "date-fns-tz",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-session",
  "nanoid",
  "pg",
  "ws",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  // ── 1. Vite client build ────────────────────────────────────────────────────
  console.log("building client...");
  await viteBuild();

  // ── 2. SSR bundle (Node.js CJS — used by server/ssr.ts at runtime) ─────────
  console.log("building SSR bundle...");
  await mkdir(path.resolve(ROOT, "dist/server"), { recursive: true });
  await esbuild({
    entryPoints: [path.resolve(ROOT, "client/src/entry-server.tsx")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(ROOT, "dist/server/entry-server.cjs"),
    jsx: "automatic",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    plugins: [pathAliasPlugin],
    logLevel: "info",
    // Don't minify — helpful for debugging SSR errors in production
    minify: false,
  });

  // ── 3. Express server bundle ────────────────────────────────────────────────
  console.log("building server...");
  const pkg = JSON.parse(await readFile(path.resolve(ROOT, "package.json"), "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

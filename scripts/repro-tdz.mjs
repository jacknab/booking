import { JSDOM } from "jsdom";
import { readFile } from "fs/promises";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const html = await readFile(path.join(ROOT, "dist/public/index.html"), "utf-8");
const jsMatch = html.match(/<script[^>]+src="\/assets\/(index-[^"]+\.js)"/);
if (!jsMatch) { console.error("no entry"); process.exit(1); }
const js = await readFile(path.join(ROOT, "dist/public/assets", jsMatch[1]), "utf-8");

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
dom.window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve("") });
class FakeObs { constructor() {} observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
dom.window.IntersectionObserver = FakeObs;
dom.window.ResizeObserver = FakeObs;
dom.window.MutationObserver = FakeObs;
dom.window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} });
dom.window.scrollTo = () => {};
dom.window.HTMLCanvasElement.prototype.getContext = () => null;
const errors = [];
const tdzErrors = [];
const isTdz = (e) => e && /Cannot access .* before initialization/.test(e.message || "");
dom.window.addEventListener("error", (e) => {
  const err = e.error || e;
  errors.push(err);
  if (isTdz(err)) tdzErrors.push(err);
});
const origConsoleError = dom.window.console.error;
dom.window.console.error = (...args) => {
  for (const a of args) if (isTdz(a)) tdzErrors.push(a);
  origConsoleError.apply(dom.window.console, args);
};
process.on("unhandledRejection", (r) => { errors.push(r); if (isTdz(r)) tdzErrors.push(r); });
try {
  dom.window.eval(js);
  await new Promise((r) => setTimeout(r, 2000));
} catch (e) {
  errors.push(e);
  if (isTdz(e)) tdzErrors.push(e);
}
const caught = tdzErrors[0] || null;
console.error(`Total errors observed: ${errors.length}, TDZ errors: ${tdzErrors.length}`);
for (let i = 0; i < Math.min(5, errors.length); i++) {
  console.error(`--- err ${i}: ${errors[i]?.message}`);
  if (errors[i]?.stack) console.error(errors[i].stack.split("\n").slice(0, 4).join("\n"));
}
if (caught) {
  console.error("\nFIRST TDZ:", caught?.message || caught);
  if (caught?.stack) console.error(caught.stack.split("\n").slice(0, 10).join("\n"));
  process.exit(1);
}
console.log("OK — no error");

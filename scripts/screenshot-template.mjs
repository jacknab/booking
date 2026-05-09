/**
 * screenshot-template.mjs
 *
 * Takes a 1280×800 viewport screenshot (header + hero) of a built LaunchSite
 * template and saves it as a JPEG thumbnail.
 *
 * Usage:
 *   node scripts/screenshot-template.mjs --id=<template-id> --out=<path.jpg> [--port=8104]
 *
 * Exit codes:
 *   0 — screenshot saved successfully
 *   1 — any failure (stderr contains the reason)
 */

import puppeteer from 'puppeteer-core';
import { existsSync } from 'fs';

// Prefer the env var set by Replit's playwright nix package; fall back to a
// known nix-store path so the script still works in CI / older environments.
const CHROMIUM_PATH =
  process.env.REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  '/nix/store/kcvsxrmgwp3ffz5jijyy7wn9fcsjl4hz-playwright-browsers-1.55.0-with-cjk/chromium-1187/chrome-linux/chrome' ||
  '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome';

// Parse --key=value CLI args
function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    if (eq === -1) out[a.slice(2)] = true;
    else out[a.slice(2, eq)] = a.slice(eq + 1);
  }
  return out;
}

async function main() {
  const { id, out, port = '8104' } = parseArgs(process.argv.slice(2));

  if (!id || !out) {
    process.stderr.write(
      'Usage: screenshot-template.mjs --id=<template-id> --out=<path.jpg> [--port=8104]\n'
    );
    process.exit(1);
  }

  if (!existsSync(CHROMIUM_PATH)) {
    process.stderr.write(`Chromium not found at: ${CHROMIUM_PATH}\n`);
    process.exit(1);
  }

  // Scraped templates are served as static HTML files directly; React templates
  // are served as SPA routes. Both end up at the same path pattern.
  const url = `http://127.0.0.1:${port}/launchsite/templates/${encodeURIComponent(id)}/`;
  process.stdout.write(`Screenshotting: ${url}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--hide-scrollbars',
      '--mute-audio',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    // Dismiss any JS alerts / confirms so they don't block rendering
    page.on('dialog', d => d.dismiss().catch(() => {}));

    // Best-effort: navigate and wait for network to settle
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
    } catch {
      // Fallback: just wait for DOM if networkidle times out (e.g. long-polling)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    }

    // Hide scrollbars + suppress any fixed/sticky cookie banners that obscure the hero
    await page.evaluate(() => {
      document.documentElement.style.setProperty('scrollbar-width', 'none');
      const style = document.createElement('style');
      style.textContent = `
        ::-webkit-scrollbar { display: none !important; }
        [class*="cookie"], [class*="Cookie"], [id*="cookie"], [id*="Cookie"],
        [class*="banner"], [class*="popup"], [class*="overlay"],
        [class*="gdpr"], [class*="consent"] { display: none !important; }
      `;
      document.head.appendChild(style);
    });

    // Give fonts / lazy images / entrance animations a moment to settle
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({
      path: out,
      type: 'jpeg',
      quality: 90,
      fullPage: false,   // viewport only — captures header + hero
    });

    process.stdout.write(`Thumbnail saved to: ${out}\n`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  process.stderr.write(`Screenshot error: ${err.message}\n`);
  process.exit(1);
});

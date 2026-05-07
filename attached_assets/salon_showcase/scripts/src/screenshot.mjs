/**
 * Headless screenshot script for Launchit Admin.
 * Usage: node scripts/src/screenshot.mjs <url> <output.jpg> [viewport_width]
 *
 * Captures the top 620px (header + hero) of a page at desktop width,
 * saves it as a 900×620 JPEG thumbnail.
 */

import puppeteer from 'puppeteer-core';
import { writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const [,, url, outputPath, viewportWidthArg] = process.argv;

if (!url || !outputPath) {
  console.error('Usage: screenshot.mjs <url> <output.jpg> [viewport_width]');
  process.exit(1);
}

const VIEWPORT_W = parseInt(viewportWidthArg ?? '1440', 10);
const THUMB_W    = 900;
const THUMB_H    = 620;

// Known Chromium locations — tried in order
const CHROMIUM_CANDIDATES = [
  '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
];

function findChrome() {
  for (const p of CHROMIUM_CANDIDATES) {
    if (existsSync(p)) return p;
  }
  return null;
}

const executablePath = findChrome();
if (!executablePath) {
  console.error('ERROR: No Chromium binary found.');
  process.exit(2);
}

let browser;
try {
  browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      `--window-size=${VIEWPORT_W},900`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_W, height: 900, deviceScaleFactor: 1 });

  // Block analytics/tracking to speed up load
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (['media', 'font'].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Let lazy images and CSS animations settle
  await new Promise(r => setTimeout(r, 1800));

  // Screenshot the top THUMB_H pixels at full viewport width
  const buf = await page.screenshot({
    type: 'jpeg',
    quality: 92,
    clip: { x: 0, y: 0, width: VIEWPORT_W, height: THUMB_H },
  });

  // If we shot at a wider viewport, we need to scale down to THUMB_W.
  // We do this with a second canvas pass inside puppeteer itself.
  if (VIEWPORT_W !== THUMB_W) {
    const resized = await page.evaluate(
      async ({ buf, srcW, srcH, dstW, dstH }) => {
        const blob   = new Blob([new Uint8Array(buf)], { type: 'image/jpeg' });
        const imgEl  = new Image();
        const loaded = new Promise((res, rej) => { imgEl.onload = res; imgEl.onerror = rej; });
        imgEl.src = URL.createObjectURL(blob);
        await loaded;
        const canvas  = document.createElement('canvas');
        canvas.width  = dstW;
        canvas.height = dstH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0, dstW, dstH);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        return dataUrl.split(',')[1]; // base64
      },
      { buf: Array.from(buf), srcW: VIEWPORT_W, srcH: THUMB_H, dstW: THUMB_W, dstH: THUMB_H }
    );
    const finalBuf = Buffer.from(resized, 'base64');
    writeFileSync(outputPath, finalBuf);
  } else {
    writeFileSync(outputPath, buf);
  }

  console.log('OK');
  process.exit(0);

} catch (err) {
  console.error('ERROR: ' + err.message);
  process.exit(1);
} finally {
  if (browser) await browser.close().catch(() => {});
}

/**
 * screenshot-url.mjs
 *
 * Takes a 1280×800 viewport screenshot of any live URL (header + hero)
 * and saves it as a JPEG thumbnail.
 *
 * Usage:
 *   node scripts/screenshot-url.mjs --url=<https://...> --out=<path.jpg>
 *
 * Exit codes:
 *   0 — screenshot saved successfully
 *   1 — any failure (stderr contains the reason)
 */

import puppeteer from 'puppeteer-core';

const CHROMIUM_PATH =
  process.env.REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  '/nix/store/kcvsxrmgwp3ffz5jijyy7wn9fcsjl4hz-playwright-browsers-1.55.0-with-cjk/chromium-1187/chrome-linux/chrome' ||
  '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome';

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
  const { url, out } = parseArgs(process.argv.slice(2));

  if (!url || !out) {
    process.stderr.write('Usage: screenshot-url.mjs --url=<https://...> --out=<path.jpg>\n');
    process.exit(1);
  }

  if (!CHROMIUM_PATH || !(await import('fs')).default.existsSync(CHROMIUM_PATH)) {
    process.stderr.write(`Chromium not found at: ${CHROMIUM_PATH}\n`);
    process.exit(1);
  }

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
      '--disable-web-security',
      '--ignore-certificate-errors',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    // Suppress JS dialogs so they don't block rendering
    page.on('dialog', d => d.dismiss().catch(() => {}));

    // Block analytics, trackers, and heavy third-party scripts to speed up load
    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      const url  = req.url();
      if (
        type === 'media' ||
        /google-analytics|googletagmanager|facebook\.net|hotjar|intercom|zendesk|drift\.com|tawk\.to|crisp\.chat/i.test(url)
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate — try networkidle2 first, fall back to domcontentloaded
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    } catch {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      } catch (err) {
        process.stderr.write(`Navigation failed: ${err.message}\n`);
        process.exit(1);
      }
    }

    // Hide scrollbars and common cookie/popup banners
    await page.evaluate(() => {
      document.documentElement.style.setProperty('scrollbar-width', 'none');
      const style = document.createElement('style');
      style.textContent = `
        ::-webkit-scrollbar { display: none !important; }
        [class*="cookie"], [class*="Cookie"], [id*="cookie"], [id*="Cookie"],
        [class*="consent"], [class*="Consent"], [id*="consent"],
        [class*="gdpr"], [class*="GDPR"],
        [class*="banner"], [class*="Banner"],
        [class*="popup"], [class*="Popup"],
        [class*="overlay"], [class*="modal"],
        [class*="newsletter"], [class*="subscribe"],
        [class*="notification"], [class*="alert"],
        [aria-label*="cookie" i], [role="dialog"] { display: none !important; }
      `;
      document.head.appendChild(style);

      // Scroll back to top in case of anchor redirects
      window.scrollTo(0, 0);
    });

    // Wait for fonts, lazy images, and entrance animations to settle
    await new Promise(r => setTimeout(r, 2500));

    await page.screenshot({
      path: out,
      type: 'jpeg',
      quality: 92,
      fullPage: false,  // viewport-only: captures header + hero at 1280×800
    });

    process.stdout.write(`Screenshot saved to: ${out}\n`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  process.stderr.write(`Screenshot error: ${err.message}\n`);
  process.exit(1);
});

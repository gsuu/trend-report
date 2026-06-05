// Capture a source page as a card thumbnail — used as the LAST tier of image
// resolution when og:image / twitter:image / platform fallback all fail.
//
// Usage: node scripts/screenshot_fallback.mjs <url> <outPath>
// Exits 0 and prints the outPath on success; exits 1 on failure (caller keeps blank).
import { chromium } from 'playwright';

const url = process.argv[2];
const out = process.argv[3];

if (!url || !out) {
  console.error('usage: node screenshot_fallback.mjs <url> <outPath>');
  process.exit(1);
}

const DISMISS_SELECTORS = [
  '#onetrust-accept-btn-handler',
  'button#truste-consent-button',
  'button[aria-label="Accept all"]',
  'button:has-text("Accept all")',
  'button:has-text("Accept")',
  'button:has-text("I agree")',
  'button:has-text("동의")',
  'button:has-text("모두 동의")',
  'button:has-text("확인")',
];

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 1,
    locale: 'ko-KR',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  });
  const resp = await page
    .goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    .catch(() => null);
  if (!resp || !resp.ok()) {
    // 4xx/5xx or navigation failure → not a usable thumbnail
    const status = resp ? resp.status() : 'no-response';
    throw new Error(`navigation failed (${status})`);
  }
  for (const sel of DISMISS_SELECTORS) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.click({ timeout: 800 });
        break;
      }
    } catch {
      /* ignore */
    }
  }
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: out,
    clip: { x: 0, y: 0, width: 1200, height: 800 },
  });
  console.log(out);
} catch (err) {
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
} finally {
  await browser.close();
}

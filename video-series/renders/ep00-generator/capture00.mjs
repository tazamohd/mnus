import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const FPS = Number(process.env.FPS || 30);
const DUR = Number(process.env.DUR || 75);
const LANG = process.env.LANG_VIDEO || 'en';
const OUT = process.env.OUT || path.join(DIR, 'frames00-' + LANG);
const TEST = process.env.TEST ? process.env.TEST.split(',').map(Number) : null;

function findChrome() {
  const base = '/opt/pw-browsers';
  for (const d of fs.readdirSync(base)) {
    const p1 = path.join(base, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p1)) return p1;
  }
  throw new Error('chromium not found');
}

const browser = await chromium.launch({
  executablePath: findChrome(),
  args: ['--no-sandbox', '--force-color-profile=srgb', '--disable-lcd-text', '--hide-scrollbars'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(DIR, 'render-ep00.html') + '?lang=' + LANG);
await page.waitForFunction('typeof window.renderFrame === "function"');
// make sure the Arabic font is loaded before drawing
await page.evaluate(() => document.fonts.load('700 34px "Noto Sans Arabic"'));

fs.mkdirSync(OUT, { recursive: true });

if (TEST) {
  for (let i = 0; i < TEST.length; i++) {
    await page.evaluate(t => window.renderFrame(t), TEST[i]);
    await page.screenshot({ path: path.join(OUT, `test-${i}.png`), type: 'png' });
    console.log('test frame', TEST[i], 's');
  }
} else {
  const total = FPS * DUR;
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.renderFrame(t), f / FPS);
    await page.screenshot({ path: path.join(OUT, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90 });
    if (f % 300 === 0) {
      const rate = (f + 1) / ((Date.now() - t0) / 1000);
      console.log(`[${LANG}] frame ${f}/${total} (${rate.toFixed(1)} fps)`);
    }
  }
  console.log(`[${LANG}] done`, total, 'frames');
}
await browser.close();

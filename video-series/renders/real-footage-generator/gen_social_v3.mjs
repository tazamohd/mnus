// V3 social clips: hook overlays only (bg + outro already exist from gen_social.mjs).
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CLIPS = [
  { id: 'v3c1', hook: 'عميلك يتابع سيارته بنفسه', sub: 'رحلة الخدمة خطوة بخطوة + كل مركباته بمكان واحد' },
  { id: 'v3c2', hook: 'حجز بدون مكالمة', sub: 'أربع خطوات: السيارة، الخدمة، واليوم والوقت' },
  { id: 'v3c3', hook: 'عرض السعر يوصله قبل ما يتصل', sub: 'يشوف المبلغ ويعتمده — وفواتيره بحالاتها' },
];

function findChrome() {
  const base = '/opt/pw-browsers';
  for (const d of fs.readdirSync(base)) {
    const p = path.join(base, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  throw new Error('no chromium');
}
const browser = await chromium.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto('about:blank');
await page.setContent(`<canvas id="c" width="1080" height="1920"></canvas>
<style>html,body{margin:0;background:transparent}</style>`);
await page.evaluate(async () => {
  await document.fonts.load('800 78px "Noto Sans Arabic"');
  await document.fonts.load('600 44px "Noto Sans Arabic"');
});

for (const { id, hook, sub } of CLIPS) {
  await page.evaluate(({ hook, sub }) => {
    const ctx = document.getElementById('c').getContext('2d');
    const W = 1080;
    ctx.clearRect(0, 0, W, 1920);
    ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ctx.font = '800 78px "Noto Sans Arabic"';
    const words = hook.split(' '); const lines = []; let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > 960 && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    let y = 1330;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16;
    for (const ln of lines) { ctx.fillText(ln, 540, y); y += 104; }
    ctx.shadowBlur = 0;
    const og = ctx.createLinearGradient(420, 0, 660, 0);
    og.addColorStop(0, 'rgba(249,115,22,0)'); og.addColorStop(0.5, '#F97316'); og.addColorStop(1, 'rgba(249,115,22,0)');
    ctx.fillStyle = og; ctx.fillRect(390, y - 62, 300, 5);
    ctx.font = '600 44px "Noto Sans Arabic"';
    const sw = sub.split(' '); const sl = []; let s = '';
    for (const w of sw) {
      const t = s ? s + ' ' + w : w;
      if (ctx.measureText(t).width > 980 && s) { sl.push(s); s = w; } else s = t;
    }
    if (s) sl.push(s);
    let sy = y + 8;
    ctx.fillStyle = '#9CC7FF';
    for (const ln of sl) { ctx.fillText(ln, 540, sy); sy += 62; }
  }, { hook, sub });
  const el = await page.$('#c');
  await el.screenshot({ path: `social/hook_${id}.png`, omitBackground: true });
  console.log('hook', id, 'done');
}
await browser.close();

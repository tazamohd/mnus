// Social clips (9:16): brand background + per-clip Arabic hook overlays + outro overlay.
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CLIPS = [
  { id: 'v1c1', hook: 'سجّل دخول بضغطة وحدة', sub: 'اختر الدور… والنظام يعبّي البيانات بنفسه' },
  { id: 'v1c2', hook: '٩ حسابات تجريبية ببلاش', sub: 'اختر دورك وجرّب — بدون تسجيل' },
  { id: 'v2c1', hook: 'ورشتك كلها بنظرة وحدة', sub: 'المؤشرات + مراحل العمل لحظة بلحظة' },
  { id: 'v2c2', hook: 'وين وصلت سيارة فلان؟', sub: 'بطاقة العمل بتفاصيلها: السيارة والعميل والفني' },
  { id: 'v2c3', hook: 'أسبوعك مرتب', sub: 'تقويم المواعيد + الفواتير بمكان واحد' },
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
  await document.fonts.load('700 46px "Noto Sans Arabic"');
  await document.fonts.load('600 40px "Noto Sans Arabic"');
});

// ---------- background ----------
await page.evaluate(() => {
  const ctx = document.getElementById('c').getContext('2d');
  const W = 1080, H = 1920;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0B1F3B'); g.addColorStop(0.55, '#081831'); g.addColorStop(1, '#050D1C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // soft blue glow behind the screen slot (screen: 20,590 .. 1060,1175)
  const rg = ctx.createRadialGradient(540, 880, 80, 540, 880, 780);
  rg.addColorStop(0, 'rgba(11,179,255,0.16)'); rg.addColorStop(1, 'rgba(11,179,255,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  // faint circuit dots
  ctx.fillStyle = 'rgba(11,179,255,0.10)';
  const pts = [[90,300],[980,260],[140,1500],[950,1560],[70,1750],[1010,420],[200,180],[860,1700]];
  for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(11,179,255,0.08)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(90,300); ctx.lineTo(200,180); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(950,1560); ctx.lineTo(860,1700); ctx.stroke();
  // wordmark
  ctx.textAlign = 'center'; ctx.direction = 'rtl';
  ctx.font = '800 64px "Noto Sans Arabic"';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('سالس أوتو', 540, 190);
  ctx.font = '700 30px "DejaVu Sans"';
  ctx.fillStyle = '#7FD4FF';
  ctx.fillText('S A L I S   A U T O', 540, 248);
  // orange accent under wordmark
  const og = ctx.createLinearGradient(440, 0, 640, 0);
  og.addColorStop(0, 'rgba(249,115,22,0)'); og.addColorStop(0.5, '#F97316'); og.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.fillStyle = og; ctx.fillRect(400, 274, 280, 5);
  // screen frame (video sits at 20,590 size 1040x585)
  ctx.lineWidth = 4;
  const fg = ctx.createLinearGradient(0, 580, 0, 1185);
  fg.addColorStop(0, '#0A5ED7'); fg.addColorStop(1, '#0BB3FF');
  ctx.strokeStyle = fg;
  ctx.beginPath(); ctx.roundRect(14, 584, 1052, 597, 10); ctx.stroke();
  ctx.strokeStyle = 'rgba(11,179,255,0.25)'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.roundRect(9, 579, 1062, 607, 14); ctx.stroke();
  // bottom domain
  ctx.font = '800 46px "DejaVu Sans"';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
  ctx.fillText('salisauto.app', 540, 1836);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#F97316';
  ctx.beginPath(); ctx.arc(540 - 190, 1820, 7, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(540 + 190, 1820, 7, 0, 7); ctx.fill();
});
let el = await page.$('#c');
await el.screenshot({ path: 'social/bg.png' });
console.log('bg done');

// ---------- hook overlays ----------
for (const { id, hook, sub } of CLIPS) {
  await page.evaluate(({ hook, sub }) => {
    const ctx = document.getElementById('c').getContext('2d');
    const W = 1080;
    ctx.clearRect(0, 0, W, 1920);
    ctx.direction = 'rtl'; ctx.textAlign = 'center';
    // hook: wrap at 960px
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
    // orange separator
    const og = ctx.createLinearGradient(420, 0, 660, 0);
    og.addColorStop(0, 'rgba(249,115,22,0)'); og.addColorStop(0.5, '#F97316'); og.addColorStop(1, 'rgba(249,115,22,0)');
    ctx.fillStyle = og; ctx.fillRect(390, y - 62, 300, 5);
    // sub line: wrap at 980px
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
  el = await page.$('#c');
  await el.screenshot({ path: `social/hook_${id}.png`, omitBackground: true });
  console.log('hook', id, 'done');
}

// ---------- outro overlay ----------
await page.evaluate(() => {
  const ctx = document.getElementById('c').getContext('2d');
  ctx.clearRect(0, 0, 1080, 1920);
  ctx.direction = 'rtl'; ctx.textAlign = 'center';
  ctx.font = '800 72px "Noto Sans Arabic"';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16;
  ctx.fillText('جرّبها الحين ببلاش', 540, 1360);
  ctx.shadowBlur = 0;
  ctx.font = '600 46px "Noto Sans Arabic"';
  ctx.fillStyle = '#9CC7FF';
  ctx.fillText('١٤ حساب تجريبي — بدون تسجيل', 540, 1445);
});
el = await page.$('#c');
await el.screenshot({ path: 'social/outro_cap.png', omitBackground: true });
console.log('outro cap done');
await browser.close();

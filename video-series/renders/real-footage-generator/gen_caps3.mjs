// Video 3 captions: RTL Arabic dialect subtitle bars as transparent PNGs.
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CAPS = [
  'الحين نشوف المنصة بعين عميلك — بوابة العميل في سالس أوتو',
  'ادخل بحساب العميل خالد — نفس الطريقة: ضغطة وحدة وأنت داخل بوابتك',
  'أول شي يشوفه عميلك: رحلة خدمته — نفس الكامري اللي شفناها عند المالك، يتابعها خطوة بخطوة: تسجيل، فحص، عرض سعر، إصلاح، جودة، استلام',
  'وكل سياراته في مكان واحد — آخر صيانة وقراءة العداد لكل وحدة',
  'يبي يحجز؟ أربع خطوات: يختار السيارة، نوع الخدمة، واليوم والوقت — بدون مكالمة ولا انتظار',
  'وإذا أرسلت الورشة عرض سعر، يوصله هنا — يشوف المبلغ ويعتمده مع مستشاره بكل شفافية',
  'مواعيده وفواتيره قدامه — المدفوع والمستحق واضح بدون سؤال',
  'هذي تجربة تريّح عميلك — وترجّعه لك كل مرة. جرّبها على salisauto.app',
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
const page = await browser.newPage({ viewport: { width: 1920, height: 320 }, deviceScaleFactor: 1 });
await page.goto('about:blank');
await page.setContent(`<canvas id="c" width="1920" height="320"></canvas>
<style>html,body{margin:0;background:transparent}</style>`);
await page.evaluate(() => document.fonts.load('600 38px "Noto Sans Arabic"'));

for (let i = 0; i < CAPS.length; i++) {
  await page.evaluate((text) => {
    const ctx = document.getElementById('c').getContext('2d');
    const W = 1920, H = 320;
    ctx.clearRect(0, 0, W, H);
    ctx.direction = 'rtl';
    const size = 38, lh = 58, maxW = 1420;
    ctx.font = '600 ' + size + 'px "Noto Sans Arabic"';
    const words = text.split(' '); const lines = []; let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    const pad = 28, bw = 1560, bh = lines.length * lh + pad * 2 - 6;
    const x = (W - bw) / 2, y = H - bh - 24;
    ctx.fillStyle = 'rgba(4,12,26,0.82)';
    ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 16); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + bh);
    g.addColorStop(0, '#0A5ED7'); g.addColorStop(1, '#0BB3FF');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x + bw - 9, y, 9, bh, 4); ctx.fill();
    ctx.fillStyle = '#F0F6FF'; ctx.textAlign = 'right';
    lines.forEach((ln, j) => ctx.fillText(ln, x + bw - 44, y + pad + 34 + j * lh));
  }, CAPS[i]);
  const el = await page.$('#c');
  await el.screenshot({ path: `cap03-${i}.png`, omitBackground: true });
  console.log('cap', i, 'done');
}

// outro overlay: site + CTA in upper area, clear of caption bar
await page.evaluate(() => {
  const ctx = document.getElementById('c').getContext('2d');
  const W = 1920, H = 320;
  ctx.clearRect(0, 0, W, H);
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.font = '800 64px "DejaVu Sans"';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14;
  ctx.fillText('salisauto.app', W / 2, 120);
  ctx.font = '700 40px "Noto Sans Arabic"';
  ctx.fillStyle = '#7FD4FF';
  ctx.fillText('جرّب بوابة العميل بنفسك — دخول بضغطة وحدة', W / 2, 205);
});
const el = await page.$('#c');
await el.screenshot({ path: 'cap03-outro.png', omitBackground: true });
console.log('outro overlay done');
await browser.close();

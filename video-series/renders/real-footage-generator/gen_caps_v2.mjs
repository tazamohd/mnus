// Render RTL Arabic caption bars as transparent PNGs for overlaying on footage.
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CAPS = [
  'تعال نلف لفة في مكتب صاحب الورشة — لوحة تحكم المالك في سالس أوتو',
  'ادخل بحساب المالك من الدخول السريع — ضغطة وحدة وأنت داخل',
  'أول ما تفتح، الأرقام المهمة قدامك: الإيرادات، الأعمال النشطة، العملاء، والمخزون — بنظرة وحدة تعرف وضع ورشتك اليوم',
  'وهذا خط سير الشغل: كم سيارة في الاستقبال، كم تحت الإصلاح، وكم في فحص الجودة — تعرف وين كل سيارة وأنت في مكتبك',
  'الرسوم تعطيك الصورة الكبيرة: إيراداتك شهر بشهر وتوزيع أعمالك — أرقام تبني عليها قرارك',
  'من القائمة افتح بطاقات العمل — كل شغلة بتفاصيلها: السيارة والعميل والفني والحالة',
  'وتقويم المواعيد يرتب أسبوعك — تشوف الزحمة قبل لا تجيك',
  'والفواتير كلها في مكان واحد: المدفوع والمستحق، وكل فاتورة جاهزة للطباعة',
  'هذي لمحة سريعة من مكتب المالك — والباقي أكثر. جرّب بنفسك على salisauto.app',
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
  await el.screenshot({ path: `capv2-${i}.png`, omitBackground: true });
  console.log('cap', i, 'done');
}

// outro overlay: site + accounts pill (upper area, clear of caption)
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
  ctx.fillText('٩ حسابات تجريبية ببلاش — جرّبها الحين', W / 2, 205);
});
const el = await page.$('#c');
await el.screenshot({ path: 'capv2-outro.png', omitBackground: true });
console.log('outro overlay done');
await browser.close();

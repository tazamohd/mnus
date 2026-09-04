// Video 2: record the real owner-dashboard tour on the Arabic UI (v2: warm-up + longer dwells).
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

function findChrome() {
  const base = '/opt/pw-browsers';
  for (const d of fs.readdirSync(base)) {
    const p = path.join(base, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  throw new Error('no chromium');
}
const CURSOR_JS = fs.readFileSync('record_flow.mjs', 'utf8').match(/const CURSOR_JS = `([\s\S]*?)`;/)?.[1] || `
(() => {
  if (window.__cur) return;
  const c = document.createElement('div');
  c.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;width:26px;height:26px;left:0;top:0';
  c.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.5 15.5 L11.5 22 L14.5 20.5 L11.5 14.5 L17 14 Z" fill="#fff" stroke="#111" stroke-width="1.4"/></svg>';
  const add=()=>document.body&&document.body.appendChild(c);
  document.body?add():document.addEventListener('DOMContentLoaded',add);
  window.addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';},true);
  window.addEventListener('mousedown',e=>{const r=document.createElement('div');
    r.style.cssText='position:fixed;z-index:2147483646;pointer-events:none;width:14px;height:14px;border-radius:50%;border:3px solid #0BB3FF;left:'+(e.clientX-10)+'px;top:'+(e.clientY-10)+'px;opacity:.9;transition:all .45s ease-out';
    document.body.appendChild(r);requestAnimationFrame(()=>{r.style.transform='scale(3)';r.style.opacity='0';});setTimeout(()=>r.remove(),500);},true);
  window.__cur=true;
})();`;

const exe = findChrome();

async function loginOwner(page) {
  await page.goto('http://127.0.0.1:8787/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.locator('text=المالك / الرئيس التنفيذي').first().click();
  await page.waitForTimeout(1100);
  await page.locator('button').filter({ hasText: /تسجيل الدخول/ }).last().click();
  await page.waitForURL(/dashboard/, { timeout: 30000 }).catch(()=>{});
}

// pass 0: Arabic state + warm the pages (API cold-start absorbed here)
{
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const cx = await b.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'ar-SA' });
  const p = await cx.newPage();
  await p.goto('http://127.0.0.1:8787/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  const arBtn = p.locator('button,a').filter({ hasText: /عرب/ }).first();
  if (await arBtn.count()) { await arBtn.click().catch(()=>{}); await p.waitForTimeout(2000); }
  await cx.storageState({ path: 'ar-state.json' });
  await loginOwner(p);
  await p.waitForTimeout(3000);
  for (const label of ['بطاقات العمل', 'تقويم المواعيد', 'الفواتير']) {
    const el = p.locator('a,button,div[role="button"]').filter({ hasText: label }).first();
    if (await el.count()) { await el.click().catch(()=>{}); await p.waitForTimeout(5000); }
  }
  console.log('warmup done');
  await b.close();
}

// pass 1: record
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 }, locale: 'ar-SA',
  storageState: 'ar-state.json',
  recordVideo: { dir: 'rec2', size: { width: 1920, height: 1080 } },
});
await ctx.addInitScript(CURSOR_JS);
const page = await ctx.newPage();
const t0 = Date.now();
const marks = {};
const mark = k => { marks[k] = (Date.now() - t0) / 1000; console.log('mark', k, marks[k].toFixed(1)); };
async function glide(loc, ms = 900) {
  const bb = await loc.boundingBox().catch(()=>null);
  if (!bb) { console.log('no bbox for glide'); return false; }
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: Math.round(ms / 16) });
  return true;
}

// SHOT 2 (~9s): login -> owner -> dashboard
await page.mouse.move(960, 820);
await page.goto('http://127.0.0.1:8787/login', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
mark('s2_start');
const owner = page.locator('text=المالك / الرئيس التنفيذي').first();
await glide(owner, 1000); await page.waitForTimeout(400);
await owner.click(); await page.waitForTimeout(1300);
const submit = page.locator('button').filter({ hasText: /تسجيل الدخول/ }).last();
await glide(submit, 700); await submit.click();
await page.waitForURL(/dashboard/, { timeout: 30000 }).catch(()=>{});
await page.waitForSelector('text=إجمالي الإيرادات', { timeout: 20000 }).catch(()=>console.log('kpi wait failed'));
await page.waitForTimeout(2500);

// SHOT 3 (~12s): KPI hovers
mark('s3_start');
for (const label of ['إجمالي الإيرادات', 'الأعمال النشطة', 'العملاء', 'المخزون']) {
  const el = page.locator(`text=${label}`).first();
  if (await el.count()) { await glide(el, 900); await page.waitForTimeout(1950); }
  else console.log('kpi missing:', label);
}

// SHOT 4 (~10s): pipeline tiles
mark('s4_start');
for (const label of ['الاستقبال', 'قيد الإصلاح', 'فحص الجودة', 'تم التسليم']) {
  const el = page.locator(`text=${label}`).first();
  if (await el.count()) { await el.scrollIntoViewIfNeeded().catch(()=>{}); await glide(el, 700); await page.waitForTimeout(1700); }
}

// SHOT 5 (~10s): charts
mark('s5_start');
const chart = page.locator('text=اتجاه الإيرادات').first();
if (await chart.count()) { await chart.scrollIntoViewIfNeeded().catch(()=>{}); await glide(chart, 900); }
await page.waitForTimeout(4000);
const donut = page.locator('text=حالة الأعمال').first();
if (await donut.count()) { await glide(donut, 900); }
await page.waitForTimeout(3800);

// SHOT 6 (~12s): job cards + open first row
mark('s6_start');
const jc = page.locator('a,button,div[role="button"]').filter({ hasText: 'بطاقات العمل' }).first();
await glide(jc, 900); await jc.click().catch(()=>{});
await page.waitForSelector('text=Toyota Camry', { timeout: 15000 }).catch(()=>{});
await page.waitForTimeout(3200);
const row = page.locator('table tbody tr').first();
if (await row.count()) { await glide(row, 800); await row.click().catch(()=>{}); await page.waitForTimeout(5200); }
else { await page.mouse.wheel(0, 300); await page.waitForTimeout(5200); }

// SHOT 7 (~8s): appointments calendar
mark('s7_start');
const cal = page.locator('a,button,div[role="button"]').filter({ hasText: 'تقويم المواعيد' }).first();
if (await cal.count()) { await cal.scrollIntoViewIfNeeded().catch(()=>{}); await glide(cal, 900); await cal.click().catch(()=>{}); }
await page.waitForTimeout(6800);

// SHOT 8 (~8s): invoices
mark('s8_start');
const inv = page.locator('a,button,div[role="button"]').filter({ hasText: 'الفواتير' }).first();
if (await inv.count()) { await inv.scrollIntoViewIfNeeded().catch(()=>{}); await glide(inv, 900); await inv.click().catch(()=>{}); }
await page.waitForTimeout(7200);
mark('end');

const video = page.video();
await ctx.close();
fs.writeFileSync('rec2/marks.json', JSON.stringify({ marks, video: await video.path() }, null, 2));
console.log('done');
await browser.close();

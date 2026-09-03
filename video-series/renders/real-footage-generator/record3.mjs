// Video 3: customer journey on the Arabic portal (warm-up pass + recorded pass with marks).
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
const CURSOR_JS = `
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

async function loginCustomer(page) {
  await page.goto('http://127.0.0.1:8787/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.locator('text=خالد العامري').first().click();
  await page.waitForTimeout(1100);
  await page.locator('button').filter({ hasText: /تسجيل الدخول/ }).last().click();
  await page.waitForURL(/customer-portal/, { timeout: 30000 }).catch(()=>{});
}

// pass 0: warm-up (absorb cold API)
{
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const cx = await b.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'ar-SA', storageState: 'ar-state.json' });
  const p = await cx.newPage();
  await loginCustomer(p);
  await p.waitForSelector('text=خدمة نشطة', { timeout: 20000 }).catch(()=>console.log('warm: no active-service'));
  await p.waitForTimeout(2500);
  await p.goto('http://127.0.0.1:8787/customer-portal/booking', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('text=اختر المركبة', { timeout: 20000 }).catch(()=>{});
  await p.waitForTimeout(2500);
  console.log('warmup done');
  await b.close();
}

// pass 1: record
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 }, locale: 'ar-SA',
  storageState: 'ar-state.json',
  recordVideo: { dir: 'rec3', size: { width: 1920, height: 1080 } },
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

// SHOT 2 (~8s): login -> customer role -> portal
await page.mouse.move(960, 830);
await page.goto('http://127.0.0.1:8787/login', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
mark('s2_start');
const cust = page.locator('text=خالد العامري').first();
await glide(cust, 1000); await page.waitForTimeout(400);
await cust.click(); await page.waitForTimeout(1300);
const submit = page.locator('button').filter({ hasText: /تسجيل الدخول/ }).last();
await glide(submit, 700); await submit.click();
await page.waitForURL(/customer-portal/, { timeout: 30000 }).catch(()=>{});
await page.waitForSelector('text=خدمة نشطة', { timeout: 20000 }).catch(()=>console.log('active service wait failed'));
await page.waitForTimeout(2200);

// SHOT 3 (~12s): journey stages, right-to-left across the blue card
mark('s3_start');
for (const label of ['التسجيل', 'الفحص', 'عرض السعر', 'الإصلاح', 'فحص الجودة', 'استلام']) {
  const el = page.locator(`text=${label}`).first();
  if (await el.count()) { await glide(el, 800); await page.waitForTimeout(1250); }
  else console.log('stage missing:', label);
}

// SHOT 4 (~10s): my vehicles
mark('s4_start');
const veh = page.locator('text=مركباتي').first();
await veh.scrollIntoViewIfNeeded().catch(()=>{});
await page.waitForTimeout(900);
for (const car of ['Toyota Camry 2022', 'Nissan Patrol 2021', 'Hyundai Sonata 2023', 'Lexus ES 350 2020']) {
  const el = page.locator(`text=${car}`).first();
  if (await el.count()) { await glide(el, 750); await page.waitForTimeout(1450); }
}

// SHOT 5 (~14s): booking flow up to time selection
mark('s5_start');
const bookBtn = page.locator('a,button').filter({ hasText: 'احجز' }).first();
await page.mouse.wheel(0, -1200); await page.waitForTimeout(700);
await glide(bookBtn, 800); await bookBtn.click().catch(()=>{});
await page.waitForSelector('text=اختر المركبة', { timeout: 15000 }).catch(()=>{});
await page.waitForTimeout(1500);
const car = page.locator('text=Toyota Camry 2022').first();
await glide(car, 800); await car.click().catch(()=>{}); await page.waitForTimeout(1200);
const svc = page.locator('text=تغيير الزيت').first();
if (await svc.count()) { await svc.scrollIntoViewIfNeeded().catch(()=>{}); await glide(svc, 800); await svc.click().catch(()=>{}); }
await page.waitForTimeout(1300);
const dt = page.locator('text=التاريخ والوقت').first();
if (await dt.count()) await dt.scrollIntoViewIfNeeded().catch(()=>{});
await page.waitForTimeout(800);
const day = page.locator('text=الأحد').first();
if (await day.count()) { await glide(day, 700); await day.click().catch(()=>{}); }
await page.waitForTimeout(1100);
const slot = page.locator('text=10:00 AM').first();
if (await slot.count()) { await glide(slot, 700); await slot.click().catch(()=>{}); }
await page.waitForTimeout(2200);

// SHOT 6 (~10s): back home -> pending quote card
mark('s6_start');
const home = page.locator('a,button').filter({ hasText: 'الرئيسية' }).first();
await glide(home, 800); await home.click().catch(()=>{});
await page.waitForSelector('text=عرض سعر معلّق', { timeout: 15000 }).catch(()=>console.log('quote wait failed'));
await page.waitForTimeout(1200);
const quote = page.locator('text=عرض سعر معلّق').first();
if (await quote.count()) { await quote.scrollIntoViewIfNeeded().catch(()=>{}); await glide(quote, 900); }
await page.waitForTimeout(2000);
const amount = page.locator('text=SAR 3,600').first();
if (await amount.count()) { await glide(amount, 800); }
await page.waitForTimeout(3500);

// SHOT 7 (~10s): appointments + invoices
mark('s7_start');
const appts = page.locator('text=المواعيد القادمة').first();
if (await appts.count()) { await appts.scrollIntoViewIfNeeded().catch(()=>{}); await glide(appts, 800); }
await page.waitForTimeout(2600);
const inv = page.locator('text=الفواتير الأخيرة').first();
if (await inv.count()) { await inv.scrollIntoViewIfNeeded().catch(()=>{}); await glide(inv, 800); }
await page.waitForTimeout(1400);
const inv1 = page.locator('text=INV-2026-0142').first();
if (await inv1.count()) { await glide(inv1, 700); }
await page.waitForTimeout(2400);
mark('end');

const video = page.video();
await ctx.close();
fs.writeFileSync('rec3/marks.json', JSON.stringify({ marks, video: await video.path() }, null, 2));
console.log('done');
await browser.close();

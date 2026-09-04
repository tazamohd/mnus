// Record the real demo-access flow on the live Arabic UI, with a visible fake
// cursor, and log cut timestamps for each planned shot.
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
  c.id='__fakecursor';
  c.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;width:26px;height:26px;left:0;top:0;transition:none';
  c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.5 15.5 L11.5 22 L14.5 20.5 L11.5 14.5 L17 14 Z" fill="#fff" stroke="#111" stroke-width="1.4"/></svg>';
  const add = () => document.body && document.body.appendChild(c);
  document.body ? add() : document.addEventListener('DOMContentLoaded', add);
  window.addEventListener('mousemove', e => { c.style.left = e.clientX+'px'; c.style.top = e.clientY+'px'; }, true);
  window.addEventListener('mousedown', e => {
    const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;width:14px;height:14px;border-radius:50%;border:3px solid #0BB3FF;left:'+(e.clientX-10)+'px;top:'+(e.clientY-10)+'px;opacity:0.9;transition:all .45s ease-out';
    document.body.appendChild(r);
    requestAnimationFrame(() => { r.style.transform='scale(3)'; r.style.opacity='0'; });
    setTimeout(() => r.remove(), 500);
  }, true);
  window.__cur = true;
})();`;

const exe = findChrome();
// pass 1: set Arabic, save storage state
{
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const cx = await b.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'ar-SA' });
  const p = await cx.newPage();
  await p.goto('http://127.0.0.1:8787/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  const arBtn = p.locator('button,a').filter({ hasText: /عرب/ }).first();
  if (await arBtn.count()) { await arBtn.click().catch(()=>{}); await p.waitForTimeout(2000); }
  await cx.storageState({ path: 'ar-state.json' });
  await b.close();
}

// pass 2: record
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 }, locale: 'ar-SA',
  storageState: 'ar-state.json',
  recordVideo: { dir: 'rec', size: { width: 1920, height: 1080 } },
});
await ctx.addInitScript(CURSOR_JS);
const page = await ctx.newPage();
const t0 = Date.now();
const marks = {};
const mark = k => { marks[k] = (Date.now() - t0) / 1000; console.log('mark', k, marks[k].toFixed(1)); };

async function glide(loc, ms = 900) {
  const bb = await loc.boundingBox();
  if (!bb) throw new Error('no bbox');
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: Math.round(ms / 16) });
}

// SHOT 3: home -> click sign in -> login page
await page.mouse.move(960, 700);
await page.goto('http://127.0.0.1:8787/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
mark('s3_start');
await page.waitForTimeout(1200);
const signInNav = page.locator('a,button').filter({ hasText: /تسجيل الدخول|Sign In/ }).first();
await glide(signInNav, 1100);
await page.waitForTimeout(350);
await signInNav.click();
await page.waitForURL(/login/, { timeout: 15000 }).catch(()=>{});
await page.waitForTimeout(2200);
mark('s4_start');

// SHOT 4: hover the quick-access panel, click owner role -> autofill
const owner = page.locator('text=المالك / الرئيس التنفيذي').first();
await glide(owner, 1400);
await page.waitForTimeout(700);
const advisor = page.locator('text=مستشار الخدمة').first();
if (await advisor.count()) { await glide(advisor, 900); await page.waitForTimeout(500); }
await glide(owner, 900);
await page.waitForTimeout(400);
await owner.click();
await page.waitForTimeout(2600);
mark('s5_start');

// SHOT 5: click sign in -> dashboard
const submit = page.locator('button').filter({ hasText: /تسجيل الدخول/ }).last();
await glide(submit, 900);
await page.waitForTimeout(400);
await submit.click();
await page.waitForURL(/dashboard/, { timeout: 25000 }).catch(()=>{});
await page.waitForTimeout(3500);
mark('s6_start');

// SHOT 6: dashboard tour — slow scroll + hover a KPI card
await page.mouse.move(1200, 400, { steps: 30 });
await page.mouse.wheel(0, 500);
await page.waitForTimeout(1500);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(1500);
await page.mouse.wheel(0, -1000);
await page.waitForTimeout(1500);
mark('s7_start');

// SHOT 7: logout -> pick فني -> sign in -> its dashboard
const logout = page.locator('text=تسجيل الخروج').first();
await logout.scrollIntoViewIfNeeded().catch(()=>{});
await glide(logout, 1000);
await page.waitForTimeout(300);
await logout.click().catch(async e => { console.log('logout fail, goto /login'); await page.goto('http://127.0.0.1:8787/login'); });
await page.waitForURL(/login|^http:\/\/127.0.0.1:8787\/$/, { timeout: 15000 }).catch(()=>{});
await page.waitForTimeout(1800);
if (!/login/.test(page.url())) { await page.goto('http://127.0.0.1:8787/login'); await page.waitForTimeout(1800); }
const tech = page.locator('text=فني').first();
await glide(tech, 1100);
await page.waitForTimeout(400);
await tech.click();
await page.waitForTimeout(1500);
const submit2 = page.locator('button').filter({ hasText: /تسجيل الدخول/ }).last();
await glide(submit2, 700);
await submit2.click();
await page.waitForURL(/dashboard/, { timeout: 25000 }).catch(()=>{});
await page.waitForTimeout(3200);
mark('end');

const video = page.video();
await ctx.close();
const vp = await video.path();
fs.writeFileSync('rec/marks.json', JSON.stringify({ marks, video: vp }, null, 2));
console.log('video:', vp);
await browser.close();

// 阶段B新增验证：字体/对比度/抽屉合一/灯箱/reduced-motion/meta
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'http://localhost:8898';
const DIR = __dirname;
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { console.log(`${cond ? '✓' : '✗'} ${name}${cond ? '' : '  ← ' + (extra || '')}`); cond ? pass++ : fail++; };
const read = (f) => fs.readFileSync(path.join(DIR, f), 'utf8');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 860 } });
  await page.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  /* ── 1. 五个 SPA 壳页：字体链接（含手写体）── */
  for (const f of ['index.html', 'phase-1.html', 'phase-2.html', 'phase-3.html', 'story.html']) {
    const raw = read(f);
    ok(`${f} 加载 Noto+手写体`, raw.includes('fonts.googleapis.com/css2') && raw.includes('Zhi+Mang+Xing'));
    ok(`${f} 加载 nav.js`, raw.includes('scripts/nav.js'));
  }

  /* ── 2. 全部 8 页：description/og/favicon ── */
  const pages8 = ['index.html','phase-1.html','phase-2.html','phase-3.html','story.html','enroll.html','donate.html','wallet.html','nt-flow-progression.html','gratitude-design.html'];
  for (const f of pages8) {
    const raw = read(f);
    ok(`${f} meta 三件套`, raw.includes('name="description"') && raw.includes('og:title') && raw.includes('rel="icon"'));
  }

  /* ── 3. CSS：蓝灰文字已换深、reduced-motion 存在 ── */
  const css = read('styles/site.css');
  ok('site.css 无残留蓝灰文字色', !/color:\s*var\(--blue-[0-9]00\)/.test(css));
  ok('site.css 有 reduced-motion', /prefers-reduced-motion/.test(css));
  ok('nav.css 有 reduced-motion', /prefers-reduced-motion/.test(read('styles/nav.css')));
  ok('时间轴圆点背景保留', css.includes('background: var(--blue-400)'));

  /* ── 4. 抽屉合一：app.js 无抽屉残留、nav.js 有 inert ── */
  const appjs = read('scripts/app.js');
  ok('app.js 无 renderDrawer', !appjs.includes('renderDrawer'));
  const navjs = read('scripts/nav.js');
  ok('nav.js 有 inert 焦点管理', navjs.includes('inert') && navjs.includes('lastOpener'));

  /* ── 5. 首页行为：字体色值生效、抽屉单按钮、焦点管理、灯箱收窄 ── */
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const bodyColor = await page.evaluate(() => getComputedStyle(document.querySelector('.body-copy')).color);
  ok('首页正文色 = #55644e', bodyColor === 'rgb(85, 100, 78)', bodyColor);
  const btnCount = await page.evaluate(() => document.querySelectorAll('.site-nav > .menu-button').length);
  ok('首页无重复固定菜单按钮', btnCount === 0, `${btnCount}`);
  const inertClosed = await page.evaluate(() => document.querySelector('.site-nav .drawer').hasAttribute('inert'));
  ok('抽屉关闭时 inert（不可 Tab 进入）', inertClosed);
  // 模拟真实路径：用户先聚焦菜单按钮 → 打开 → 关闭 → 焦点应归还
  await page.evaluate(() => document.querySelector('.top-nav [data-drawer-toggle]').focus());
  await page.evaluate(() => window.openDrawer());
  await page.waitForTimeout(400);
  const focusIn = await page.evaluate(() => document.querySelector('.site-nav .drawer').contains(document.activeElement));
  ok('打开抽屉焦点进入抽屉', focusIn);
  await page.evaluate(() => window.closeDrawer());
  await page.waitForTimeout(300);
  const focusBack = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-drawer-toggle') !== null);
  ok('关闭抽屉焦点归还菜单按钮', focusBack);

  /* ── 6. archive 卡路径已退役：灯箱不再响应 archive-image ── */
  const appRaw = read('scripts/app.js');
  ok('灯箱触发器不含 archive-image', !appRaw.includes('closest(".work-image, .archive-image")'));
  /* ── 7. 作品图开灯箱（role=dialog + 焦点）── */
  await page.goto(BASE + '/phase-1.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  await page.click('.work-image');
  await page.waitForTimeout(400);
  const lb = await page.evaluate(() => {
    const l = document.getElementById('lightbox');
    return { open: l.getAttribute('aria-hidden') === 'false', role: l.getAttribute('role'), focus: l.contains(document.activeElement) };
  });
  ok('作品图灯箱打开且 role=dialog 焦点入内', lb.open && lb.role === 'dialog' && lb.focus, JSON.stringify(lb));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  /* ── 8. donate 红边条改造 + wallet 外链/收尾 ── */
  await page.goto(BASE + '/donate.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const dn = await page.evaluate(() => {
    const n = document.querySelector('.refund-note');
    const t = document.querySelector('.refund-note .t');
    return { blw: getComputedStyle(n).borderLeftWidth, tc: getComputedStyle(t).color };
  });
  ok('donate 返还卡无 3px 侧红条', dn.blw === '1px', dn.blw);
  ok('donate 返还标题印章红保留', dn.tc === 'rgb(163, 40, 29)', dn.tc);
  await page.goto(BASE + '/wallet.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const wl = await page.evaluate(() => {
    const mm = document.querySelector('a[href*="metamask"]');
    const back = document.querySelector('a.btn-secondary[href="index.html"]');
    return { rel: mm ? mm.getAttribute('rel') || '' : null, tgt: mm ? mm.getAttribute('target') : null, back: !!back };
  });
  ok('metamask 外链 rel=noopener 新窗口', wl.rel && wl.rel.includes('noopener') && wl.tgt === '_blank', JSON.stringify(wl));
  ok('wallet 页尾返回首页 CTA', wl.back);

  ok('全程无 JS 错误', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

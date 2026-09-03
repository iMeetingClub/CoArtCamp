const { chromium } = require('playwright');
const BASE = 'http://localhost:8898';
let pass = 0, fail = 0;
const ok = (n, c, extra) => { console.log((c ? '✓' : '✗') + ' ' + n + (c ? '' : '  ← ' + (extra || ''))); c ? pass++ : fail++; };

(async () => {
  const browser = await chromium.launch();

  /* ── 360px 横向溢出 ── */
  for (const f of ['nt-flow-progression.html', 'gratitude-design.html']) {
    const page = await browser.newPage({ viewport: { width: 360, height: 740 } });
    await page.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + '/' + f, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(f + ' 360px scrollWidth≤360', sw <= 360, 'scrollWidth=' + sw);
    ok(f + ' 无 JS 错误', errs.length === 0, errs.join(';'));
    await page.close();
  }

  /* ── nt 页专项检查 ── */
  const nt = await browser.newPage({ viewport: { width: 430, height: 860 } });
  await nt.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  await nt.goto(BASE + '/nt-flow-progression.html', { waitUntil: 'domcontentloaded' });
  await nt.waitForTimeout(500);
  const ntChecks = await nt.evaluate(() => ({
    title: document.title,
    fakeSvgGone: !document.querySelector('svg[data-icon-name="menu"]'),
    menuBtns: document.querySelectorAll('.site-nav .menu-button').length,
    noAbsoluteScreens: !Array.from(document.querySelectorAll('body > div > div')).some(d => getComputedStyle(d).position === 'absolute'),
    bodyH: document.body.scrollHeight,
    text: document.body.innerText,
  }));
  ok('nt title', ntChecks.title === 'NT 的流通 · 南塘艺术共创营', ntChecks.title);
  ok('nt 假菜单 SVG 已删', ntChecks.fakeSvgGone);
  ok('nt 真菜单按钮已注入(2个:开+关)', ntChecks.menuBtns === 2, 'count=' + ntChecks.menuBtns);
  ok('nt 六屏无绝对定位', ntChecks.noAbsoluteScreens);
  ok('nt 内容完整(落款数据来源仍在)', ntChecks.text.includes('gNT 脚本对账'));
  ok('nt 数字未动(61,216/119,764/35,940/24,293)', ['61,216','119,764','35,940','24,293','17,014','3,114'].every(n => ntChecks.text.includes(n)));
  await nt.close();

  /* ── gratitude 手风琴 ── */
  const gr = await browser.newPage({ viewport: { width: 360, height: 740 } });
  await gr.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  await gr.goto(BASE + '/gratitude-design.html', { waitUntil: 'domcontentloaded' });
  await gr.waitForTimeout(500);
  const g0 = await gr.evaluate(() => ({
    title: document.title, lang: document.documentElement.lang,
    hiddenBefore: document.querySelector('[data-gratitude-panel="phase-1"]').hidden,
    ariaBefore: document.querySelector('[data-gratitude-trigger="phase-1"]').getAttribute('aria-expanded'),
  }));
  ok('gratitude lang=zh-CN', g0.lang === 'zh-CN', g0.lang);
  ok('gratitude title', g0.title === '合作的丰碑 · 南塘艺术共创营', g0.title);
  ok('手风琴初始收起(JS)', g0.hiddenBefore === true);
  ok('aria-expanded 初始 false(JS 设置)', g0.ariaBefore === 'false', String(g0.ariaBefore));
  await gr.click('[data-gratitude-trigger="phase-1"]');
  await gr.waitForTimeout(300);
  const g1 = await gr.evaluate(() => ({
    open: !document.querySelector('[data-gratitude-panel="phase-1"]').hidden,
    aria: document.querySelector('[data-gratitude-trigger="phase-1"]').getAttribute('aria-expanded'),
    active: document.querySelector('[data-gratitude-trigger="phase-1"]').classList.contains('is-active'),
    panelText: document.querySelector('[data-gratitude-panel="phase-1"]').innerText,
  }));
  ok('点击展开 phase-1', g1.open && g1.aria === 'true' && g1.active);
  ok('面板内容完整(10,000 元借款已还)', g1.panelText.includes('10,000'));
  await gr.click('[data-gratitude-trigger="phase-1"]');
  await gr.waitForTimeout(300);
  const g2 = await gr.evaluate(() => ({
    closed: document.querySelector('[data-gratitude-panel="phase-1"]').hidden,
    aria: document.querySelector('[data-gratitude-trigger="phase-1"]').getAttribute('aria-expanded'),
  }));
  ok('再点收起', g2.closed && g2.aria === 'false');
  // 键盘操作（先键盘交互再断言 :focus-visible——程序化 focus 不触发该伪类，属浏览器规范行为）
  await gr.focus('[data-gratitude-trigger="august"]');
  await gr.keyboard.press('Enter');
  await gr.waitForTimeout(300);
  const outline = await gr.evaluate(() => {
    const el = document.querySelector('[data-gratitude-trigger="august"]');
    const cs = getComputedStyle(el);
    return cs.outlineStyle + '/' + cs.outlineWidth + '/' + cs.outlineColor;
  });
  ok('焦点框生效(focus-visible)', outline.includes('2px') && outline.includes('rgb(85, 100, 78)'), outline);
  await gr.waitForTimeout(300);
  const g3 = await gr.evaluate(() => !document.querySelector('[data-gratitude-panel="august"]').hidden);
  ok('键盘 Enter 展开 august', g3);
  const augText = await gr.evaluate(() => document.body.innerText);
  ok('红榜数字未动(30,000/24,600/8,955/49,054)', ['30,000','24,600','8,955','49,054'].every(n => augText.includes(n)));
  ok('待认领掩码为真实后六位(出处:第三期募捐返还确认)', ['50ea6e','9CC2cf','612a6F','9313e2','baD3Ef','51094E','a0ff23','043289','4c86Ac'].every(t => augText.includes(t)) && !augText.includes('····86'));
  // 排他式：august 展开中点击 phase-1 → phase-1 开、august 及其他期全关（置于文本断言后：innerText 不含 display:none 面板内容）
  await gr.click('[data-gratitude-trigger="phase-1"]');
  await gr.waitForTimeout(300);
  const g4 = await gr.evaluate(() => ({
    p1open: !document.querySelector('[data-gratitude-panel="phase-1"]').hidden,
    augClosed: document.querySelector('[data-gratitude-panel="august"]').hidden,
    augAria: document.querySelector('[data-gratitude-trigger="august"]').getAttribute('aria-expanded'),
    augActive: document.querySelector('[data-gratitude-trigger="august"]').classList.contains('is-active'),
    othersClosed: ['phase-2', 'phase-3'].every(k => document.querySelector('[data-gratitude-panel="' + k + '"]').hidden),
  }));
  ok('排他：开 phase-1 自动收起 august', g4.p1open && g4.augClosed && g4.augAria === 'false' && !g4.augActive && g4.othersClosed, JSON.stringify(g4));
  await gr.close();

  /* ── 禁用 JS：面板全部可见（渐进增强）── */
  const nojs = await browser.newPage({ viewport: { width: 360, height: 740 }, javaScriptEnabled: false });
  await nojs.goto(BASE + '/gratitude-design.html', { waitUntil: 'domcontentloaded' });
  const vis = await nojs.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('[data-gratitude-panel]'));
    return panels.map(p => { const r = p.getBoundingClientRect(); return r.height > 100; });
  });
  ok('无 JS 时 4 面板全部可见', vis.length === 4 && vis.every(Boolean), JSON.stringify(vis));
  await nojs.close();

  await browser.close();
  console.log('\n==== ' + pass + ' passed, ' + fail + ' failed ====');
  process.exit(fail ? 1 : 0);
})();

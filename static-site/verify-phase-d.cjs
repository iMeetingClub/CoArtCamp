// 阶段D验证：丰碑待认领表格 + NT流通折叠
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

  /* ── 1. 丰碑待认领表格 ── */
  const grat = read('gratitude-design.html');
  ok('待认领表格存在', grat.includes('data-pencil-name="待认领表格"'));
  ok('表格含表头（地址后六位/转入时间）', grat.includes('地址后六位') && grat.includes('转入时间'));
  const tails = ['50ea6e','9CC2cf','612a6F','9313e2','baD3Ef','51094E','a0ff23','043289','4c86Ac'];
  ok('9 个后六位在表格中', tails.every(t => grat.includes('····' + t)));
  const dates = ['2026-05-23','2026-05-24','2026-05-27','2026-06-04'];
  ok('转入时间日期齐（出处：返还确认）', dates.every(d => grat.includes(d)));
  ok('含微信认领指引', grat.includes('微信联系项目组') && grat.includes('完整钱包地址'));
  ok('联系人占位保留', grat.includes('联系人姓名 / 微信'));
  ok('金额不上表（领多少微信联系）', !/····[0-9a-fA-F]{6}[^<]*NT/.test(grat));
  ok('旧核对文案已替换', !grat.includes('可按地址后六位核对：'));

  await page.goto(BASE + '/gratitude-design.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.click('[data-gratitude-trigger="august"]');
  await page.waitForTimeout(500);
  const tbl = await page.evaluate(() => {
    const t = document.querySelector('[data-pencil-name="待认领表格"]');
    if (!t) return null;
    return { rows: t.querySelectorAll(':scope > div').length, visible: t.offsetHeight > 0 };
  });
  ok('表格可见且 10 行（表头+9）', tbl && tbl.visible && tbl.rows === 10, JSON.stringify(tbl));

  /* ── 2. NT 流通折叠 ── */
  const nt = read('nt-flow-progression.html');
  ok('NT 页加载 nt-flow.js', nt.includes('scripts/nt-flow.js'));
  ok('NT 页有 3 个 trigger 属性', (nt.match(/data-nt-trigger=/g) || []).length === 3);
  ok('NT 页 trigger 有焦点样式', /\[data-nt-trigger\]:focus-visible/.test(nt));
  const ntjs = read('scripts/nt-flow.js');
  ok('nt-flow.js 排他逻辑', ntjs.includes('aria-expanded'));

  await page.goto(BASE + '/nt-flow-progression.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const n1 = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('[data-nt-panel]')];
    const triggers = [...document.querySelectorAll('[data-nt-trigger]')];
    return {
      p: panels.length,
      t: triggers.length,
      allHidden: panels.every(x => x.hidden),
      aria: triggers.every(x => x.getAttribute('aria-expanded') === 'false'),
    };
  });
  ok('NT 三面板默认收起', n1.p === 3 && n1.allHidden, JSON.stringify(n1));
  ok('NT trigger aria 初始 false', n1.t === 3 && n1.aria);

  await page.click('[data-nt-trigger="phase-2"]');
  await page.waitForTimeout(500);
  const n2 = await page.evaluate(() => ({
    open: !document.querySelector('[data-nt-panel="phase-2"]').hidden,
    others: ['phase-1', 'phase-3'].every(k => document.querySelector('[data-nt-panel="' + k + '"]').hidden),
    aria: document.querySelector('[data-nt-trigger="phase-2"]').getAttribute('aria-expanded'),
  }));
  ok('NT 点开二期：展开且排他', n2.open && n2.others && n2.aria === 'true', JSON.stringify(n2));

  await page.click('[data-nt-trigger="phase-2"]');
  await page.waitForTimeout(400);
  const n3 = await page.evaluate(() => document.querySelector('[data-nt-panel="phase-2"]').hidden);
  ok('NT 再点同一期收起', n3);

  // 键盘路径
  await page.evaluate(() => document.querySelector('[data-nt-trigger="phase-3"]').focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const n4 = await page.evaluate(() => !document.querySelector('[data-nt-panel="phase-3"]').hidden);
  ok('NT 键盘 Enter 展开三期', n4);

  // 禁 JS：全部可见
  const nojs = await browser.newPage({ viewport: { width: 430, height: 860 }, javaScriptEnabled: false });
  await nojs.goto(BASE + '/nt-flow-progression.html', { waitUntil: 'domcontentloaded' });
  await nojs.waitForTimeout(400);
  const n5 = await nojs.evaluate(() => {
    const panels = [...document.querySelectorAll('[data-nt-panel]')];
    return panels.length === 3 && panels.every(x => !x.hidden);
  });
  ok('NT 禁 JS 全部可见', n5);
  await nojs.close();

  // 360px 仍无溢出
  const p360 = await browser.newPage({ viewport: { width: 360, height: 780 } });
  await p360.goto(BASE + '/nt-flow-progression.html', { waitUntil: 'domcontentloaded' });
  await p360.waitForTimeout(500);
  const n6 = await p360.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok('NT @360px 无横向溢出', n6.sw <= n6.cw + 1, String(n6.sw));
  await p360.close();

  ok('全程无 JS 错误', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

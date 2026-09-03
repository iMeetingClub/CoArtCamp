const { chromium } = require('playwright');
let pass = 0, fail = 0;
const ok = (n, c, e) => { console.log((c?'✓':'✗')+' '+n+(c?'':'  ← '+(e||''))); c?pass++:fail++; };
(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 360, height: 740 } });
  await p.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8898/nt-flow-progression.html', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  const st = (k) => p.evaluate((k) => ({
    hidden: document.querySelector('[data-nt-panel="'+k+'"]').hidden,
    aria: document.querySelector('[data-nt-trigger="'+k+'"]').getAttribute('aria-expanded'),
    active: document.querySelector('[data-nt-trigger="'+k+'"]').classList.contains('is-active'),
  }), k);
  const s0 = await Promise.all(['phase-1','phase-2','phase-3'].map(st));
  ok('默认三面板全收起+aria false', s0.every(s => s.hidden && s.aria === 'false' && !s.active), JSON.stringify(s0));
  await p.screenshot({ path: '_ui_preview/phase-d/nt-accordion-default.png' });
  // 点二期
  await p.click('[data-nt-trigger="phase-2"]');
  await p.waitForTimeout(400);
  const s1 = await Promise.all(['phase-1','phase-2','phase-3'].map(st));
  ok('点二期→二期开,一/三期关', !s1[1].hidden && s1[1].aria==='true' && s1[1].active && s1[0].hidden && s1[2].hidden, JSON.stringify(s1));
  await p.screenshot({ path: '_ui_preview/phase-d/nt-accordion-phase2.png', fullPage: false });
  // 排他：再点三期
  await p.click('[data-nt-trigger="phase-3"]');
  await p.waitForTimeout(400);
  const s2 = await Promise.all(['phase-1','phase-2','phase-3'].map(st));
  ok('排他:点三期→三期开(含条形图屏),二期关', !s2[2].hidden && s2[1].hidden && s2[0].hidden, JSON.stringify(s2));
  // 三期面板包含屏4+屏5两屏内容
  const p3text = await p.evaluate(() => document.querySelector('[data-nt-panel="phase-3"]').innerText);
  ok('三期面板含平台系统+谁在发布任务', p3text.includes('平台任务系统') && p3text.includes('谁在发布任务') && p3text.includes('79.9%'));
  // 再点三期收起
  await p.click('[data-nt-trigger="phase-3"]');
  await p.waitForTimeout(400);
  const s3 = await st('phase-3');
  ok('再点三期→收起(toggle)', s3.hidden && s3.aria==='false' && !s3.active, JSON.stringify(s3));
  // 键盘 Space 开一期
  await p.focus('[data-nt-trigger="phase-1"]');
  await p.keyboard.press('Space');
  await p.waitForTimeout(400);
  const s4 = await st('phase-1');
  ok('键盘 Space 展开一期', !s4.hidden && s4.aria==='true');
  // 焦点框（键盘交互后）
  const ol = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector('[data-nt-trigger="phase-1"]')); return cs.outlineStyle+'/'+cs.outlineWidth+'/'+cs.outlineColor; });
  ok('nt 触发卡焦点框生效', ol.includes('2px') && ol.includes('rgb(85, 100, 78)'), ol);
  // is-active 视觉色（!important 覆盖内联背景）
  const bg = await p.evaluate(() => getComputedStyle(document.querySelector('[data-nt-trigger="phase-1"]')).backgroundColor);
  ok('is-active 背景 #d8e5de 生效', bg === 'rgb(216, 229, 222)', bg);
  // 落款屏始终可见
  const foot = await p.evaluate(() => { const el = document.querySelector('[data-pencil-name="屏6 落款"]'); return el.getBoundingClientRect().height > 50; });
  ok('落款屏在面板外保持可见', foot);
  ok('nt 无 JS 错误', errs.length === 0, errs.join(';'));
  await p.close();
  // 禁 JS：全部可见
  const nojs = await browser.newPage({ viewport: { width: 360, height: 740 }, javaScriptEnabled: false });
  await nojs.goto('http://localhost:8898/nt-flow-progression.html', { waitUntil: 'domcontentloaded' });
  const vis = await nojs.evaluate(() => Array.from(document.querySelectorAll('[data-nt-panel]')).map(p => p.getBoundingClientRect().height > 100));
  ok('禁 JS 时 3 面板全部可见', vis.length === 3 && vis.every(Boolean), JSON.stringify(vis));
  await nojs.close();
  await browser.close();
  console.log('\n==== '+pass+' passed, '+fail+' failed ====');
  process.exit(fail ? 1 : 0);
})();

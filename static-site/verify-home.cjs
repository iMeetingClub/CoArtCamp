// 首页故事书验证：结构顺序、锚点、timeline 数量、无 JS 报错
const { chromium } = require('playwright');
const URL = 'http://localhost:8898/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 860 } });
  await page.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let pass = 0, fail = 0;
  const ok = (name, cond) => { console.log(`${cond ? '✓' : '✗'} ${name}`); cond ? pass++ : fail++; };

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  // 1. 结构顺序
  const order = await page.evaluate(() => {
    const ids = ['phase-1', 'phase-2', 'phase-3', 'story', 'enroll'];
    const pos = ids.map(id => {
      const el = document.getElementById(id);
      return { id, found: !!el, y: el ? el.getBoundingClientRect().top + window.scrollY : -1 };
    });
    return pos;
  });
  ok('锚点 phase-1/2/3/story/enroll 全部存在', order.every(o => o.found));
  const sorted = order.every((o, i) => i === 0 || o.y > order[i - 1].y);
  ok('故事块顺序：一期→二期→三期→故事→报名', sorted);

  // 2. story-phase 数量与钩子
  const hooks = await page.evaluate(() =>
    document.querySelectorAll('.story-phase__hook').length
  );
  ok('4 个故事块钩子卡', hooks === 4);

  // 3. 首页纪事精选 3 条（#story 块内；完整版在 story.html）
  const tlCount = await page.evaluate(() => {
    const story = document.getElementById('story');
    return story ? story.querySelectorAll('.timeline-item').length : -1;
  });
  ok('#story 内 timeline = 3 条（首页精选）', tlCount === 3);

  // 4. 流通与感谢 ×3 + 捐助历史
  const gCount = await page.evaluate(() => document.querySelectorAll('.gratitude-note').length);
  ok('流通与感谢小节 ×3', gCount === 3);
  const dh = await page.evaluate(() => !!document.querySelector('.donation-history'));
  ok('捐助历史段存在', dh);

  // 5. 报名行按钮指向 enroll.html
  const enrollBtn = await page.evaluate(() => {
    const a = document.querySelector('.enroll-line__button');
    return a ? a.getAttribute('href') : null;
  });
  ok('报名按钮 → enroll.html', enrollBtn === 'enroll.html');

  // 6. 数字抽查（红线：与核对清单一致）
  // 章节卡默认收起是新设计——先逐章展开，确认数字真的可达可见，再取 innerText
  await page.evaluate(() => {
    document.querySelectorAll('.story-phase__toggle').forEach((t) => {
      const body = document.getElementById(t.getAttribute('aria-controls'));
      if (body) { body.hidden = false; t.setAttribute('aria-expanded', 'true'); }
    });
  });
  await page.waitForTimeout(200);
  const nums = await page.evaluate(() => document.body.innerText);
  const checks = [
    ['61,216.3 NT', '一期结项流通'],
    ['119,763.6 NT', '二期累计流通'],
    ['49,054 NT', '二期募捐'],
    ['555 条', '三期任务'],
    ['24,293 NT', '三期流转'],
    ['30,000 NT → 24,600 元', '三期返还'],
    ['10,000 元', '一期借款'],
    ['8,955 NT', '待认领'],
  ];
  checks.forEach(([num, name]) => ok(`数字 ${name}: ${num}`, nums.includes(num)));

  // 7. 作品全量（一期24 + 二期22 + 三期10 = 56）
  const workCount = await page.evaluate(() => document.querySelectorAll('.work-card').length);
  ok(`作品全量 56 幅（实际 ${workCount}）`, workCount === 56);

  // 8. 共创人（三期 10 位）
  const personCount = await page.evaluate(() => document.querySelectorAll('.person-card').length);
  ok(`三期共创人 10 位（实际 ${personCount}）`, personCount === 10);

  // 9. 无 JS 报错
  ok('无页面 JS 错误', errors.length === 0);
  if (errors.length) console.log('  errors:', errors.join(' | '));

  // 10. 锚点跳转可用（单步：#phase-2 直达 → 完整加载，滚到正确位置）
  await page.goto(URL + '#phase-2', { waitUntil: 'load' });
  await page.waitForTimeout(2300);
  const diag = await page.evaluate(() => {
    const el = document.getElementById('phase-2');
    return { top: el ? el.getBoundingClientRect().top : null, y: window.scrollY };
  });
  console.log('  diag(单步):', JSON.stringify(diag));
  ok('#phase-2 锚点定位（单步）', diag.top !== null && Math.abs(diag.top - 96) < 70);

  // 11. 两步场景（已加载页面 → hash-only 导航）：校准重试应修正懒加载漂移
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await page.goto(URL + '#phase-2');
  await page.waitForTimeout(2300);
  const diag2 = await page.evaluate(() => {
    const el = document.getElementById('phase-2');
    return { top: el ? el.getBoundingClientRect().top : null, y: window.scrollY };
  });
  console.log('  diag(两步):', JSON.stringify(diag2));
  ok('#phase-2 锚点定位（两步）', diag2.top !== null && Math.abs(diag2.top - 96) < 70);

  await browser.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})();

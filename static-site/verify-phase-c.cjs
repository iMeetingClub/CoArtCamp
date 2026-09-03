// 阶段C验证：目录式故事书（章节手风琴）+ 丰碑排他
const { chromium } = require('playwright');
const BASE = 'http://localhost:8898';
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { console.log(`${cond ? '✓' : '✗'} ${name}${cond ? '' : '  ← ' + (extra || '')}`); cond ? pass++ : fail++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 860 } });
  await page.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  /* ── 1. 默认全部收起 + 提示行 ── */
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const init = await page.evaluate(() => {
    const bodies = [...document.querySelectorAll('.story-phase__body')];
    const toggles = [...document.querySelectorAll('.story-phase__toggle')];
    return {
      count: bodies.length,
      allHidden: bodies.every(b => b.hidden),
      allAriaFalse: toggles.every(t => t.getAttribute('aria-expanded') === 'false'),
      hint: !!document.querySelector('.story-hint'),
    };
  });
  ok('4 章默认全部收起', init.count === 4 && init.allHidden, JSON.stringify(init));
  ok('4 章 aria-expanded 全 false', init.allAriaFalse);
  ok('操作提示行存在', init.hint);

  /* ── 2. 点开 02：开且排他 ── */
  await page.click('#toggle-phase-2');
  await page.waitForTimeout(400);
  const s2 = await page.evaluate(() => ({
    open: !document.querySelector('#body-phase-2').hidden,
    aria: document.querySelector('#toggle-phase-2').getAttribute('aria-expanded'),
    others: ['phase-1', 'phase-3', 'story'].every(id => document.querySelector('#body-' + id).hidden),
    isOpen: document.getElementById('phase-2').classList.contains('is-open'),
  }));
  ok('点开 02：展开 + aria=true', s2.open && s2.aria === 'true');
  ok('点开 02：其他章自动关上（排他）', s2.others);
  ok('chevron 旋转类 is-open', s2.isOpen);

  /* ── 3. 换开 04（纪事）：3 条精选时间轴 ── */
  await page.click('#toggle-story');
  await page.waitForTimeout(400);
  const s4 = await page.evaluate(() => ({
    open: !document.querySelector('#body-story').hidden,
    prev: document.querySelector('#body-phase-2').hidden,
    tl: document.querySelectorAll('#body-story .timeline-item').length,
  }));
  ok('换开 04：02 自动关上', s4.open && s4.prev);
  ok('04 展开内时间轴 = 3 条精选', s4.tl === 3, String(s4.tl));

  /* ── 4. 再点同一章：收起 ── */
  await page.click('#toggle-story');
  await page.waitForTimeout(300);
  const s5 = await page.evaluate(() => document.querySelector('#body-story').hidden);
  ok('再点同一章收起', s5);

  /* ── 5. 深链 #phase-3：自动展开且排他 ── */
  await page.goto(BASE + '/index.html#phase-3', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const s6 = await page.evaluate(() => ({
    open: !document.querySelector('#body-phase-3').hidden,
    others: ['phase-1', 'phase-2', 'story'].every(id => document.querySelector('#body-' + id).hidden),
    top: document.getElementById('phase-3').getBoundingClientRect().top,
  }));
  ok('深链 #phase-3 自动展开且排他', s6.open && s6.others);
  ok('深链定位正确', Math.abs(s6.top - 96) < 70, String(Math.round(s6.top)));

  /* ── 6. 展开区拆卡套卡：内层文字卡无框 ── */
  await page.click('#toggle-phase-1');
  await page.waitForTimeout(400);
  const s7 = await page.evaluate(() => {
    const card = document.querySelector('#body-phase-1 .section-card');
    if (!card) return null;
    const cs = getComputedStyle(card);
    return { bw: cs.borderTopWidth, bg: cs.backgroundColor };
  });
  ok('展开区文字卡无框透明', s7 && s7.bw === '0px' && (s7.bg === 'rgba(0, 0, 0, 0)' || s7.bg === 'transparent'), JSON.stringify(s7));

  /* ── 7. 禁 JS：SPA 有 noscript 兜底提示（首页为 JS 渲染架构）── */
  const nojs = await browser.newPage({ viewport: { width: 430, height: 860 }, javaScriptEnabled: false });
  await nojs.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await nojs.waitForTimeout(400);
  const s8 = await nojs.evaluate(() => {
    const ns = document.querySelector('noscript p');
    return ns ? ns.textContent : null;
  });
  ok('禁 JS 时显示 noscript 提示', !!s8 && s8.includes('JavaScript'), String(s8));
  await nojs.close();

  /* ── 8. 丰碑排他 ── */
  await page.goto(BASE + '/gratitude-design.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.click('[data-gratitude-trigger="phase-1"]');
  await page.waitForTimeout(300);
  await page.click('[data-gratitude-trigger="august"]');
  await page.waitForTimeout(400);
  const g1 = await page.evaluate(() => ({
    p1: document.querySelector('[data-gratitude-panel="phase-1"]').hidden,
    aug: !document.querySelector('[data-gratitude-panel="august"]').hidden,
    p1aria: document.querySelector('[data-gratitude-trigger="phase-1"]').getAttribute('aria-expanded'),
  }));
  ok('丰碑：开八月时一期自动关上（排他）', g1.p1 && g1.aug && g1.p1aria === 'false', JSON.stringify(g1));

  ok('全程无 JS 错误', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

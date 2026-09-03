// 全站验证：donate / wallet / enroll / 导航闭环 / 数字红线
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

  /* ══════════ donate.html ══════════ */
  await page.goto(BASE + '/donate.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const dText = await page.evaluate(() => document.body.innerText);

  // 数字红线（全部有出处）
  const dNums = [
    ['17 天', '结项报告（非公告的 20 天）'],
    ['555', '01 申请'],
    ['24,293', '01 申请'],
    ['1,250', '01 申请'],
    ['+5,209', '01 申请'],
    ['3,114', '01 申请'],
    ['30,000 NT', '01 申请'],
    ['20,000 元', '01 申请'],
    ['5,209 元', '01 申请'],
    ['5 ETH', '03 公告'],
    ['S6-3', '03 公告'],
    ['60%', '03 公告'],
    ['纯捐赠性质，项目组不承诺以人民币返还', '03 公告'],
  ];
  dNums.forEach(([n, src]) => ok(`donate 数字 ${n}（${src}）`, dText.includes(n)));
  ok('donate 不含「20 天」', !dText.includes('20 天'));
  ok('donate 不含返还比率 0.8/0.82（与首页 24,600 冲突，不引入）', !dText.includes('0.8') && !dText.includes('0.82'));
  ok('donate 承诺两条', dText.includes('账目全公开') && dText.includes('专款专用'));
  ok('donate 参与方式两种（NT + 人民币）', dText.includes('捐 NT') && dText.includes('捐人民币'));
  ok('donate 占位 NT 收款地址', dText.includes('NT 收款地址'));
  ok('donate 占位收款码', dText.includes('收款码 / 收款账号'));
  ok('donate 联系人占位', dText.includes('联系人姓名 / 微信'));
  const cta = await page.evaluate(() => {
    const a = document.querySelector('.btn-cta');
    return a ? a.getAttribute('href') : null;
  });
  ok('donate CTA → enroll.html', cta === 'enroll.html');
  ok('donate 无 JS 错误', errors.length === 0);
  errors.length = 0;

  /* ══════════ wallet.html ══════════ */
  await page.goto(BASE + '/wallet.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const wText = await page.evaluate(() => document.body.innerText);
  const wNums = [
    ['Polygon', '文档'],
    ['137', '文档'],
    ['polygon-rpc.com', '文档'],
    ['polygonscan.com', '文档'],
    ['$0.01–0.05', '文档'],
    ['新芽', '文档'],
    ['500 CV', '文档'],
    ['2,000 CV', '文档'],
    ['5,000 CV', '文档'],
    ['Soulbound', '文档'],
    ['≥ 0.5 MATIC', '文档'],
    ['metamask.io/download', '文档'],
    ['托管钱包', '文档'],
  ];
  wNums.forEach(([n, src]) => ok(`wallet 数字 ${n}（${src}）`, wText.includes(n)));
  const steps = await page.evaluate(() => document.querySelectorAll('.step-card').length);
  ok('wallet 四步卡片', steps === 4);
  const wLogin = await page.evaluate(() => { const a = document.querySelector('a[href*="nantangyuncun"]'); return a ? a.getAttribute('href') : null; });
  ok('wallet 云村登录链接（用户 2026-09 提供）', wLogin === 'https://nantangyuncun.pages.dev');
  ok('wallet 无 JS 错误', errors.length === 0);
  errors.length = 0;

  /* ══════════ 导航闭环 ══════════ */
  // donate 页：抽屉 6 项 + donate 高亮
  await page.goto(BASE + '/donate.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await page.evaluate(() => window.openDrawer());
  await page.waitForTimeout(300);
  const nav = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.drawer-link'));
    const active = document.querySelector('.drawer-link.is-active');
    return {
      count: links.length,
      titles: links.map(l => l.textContent.trim()),
      activeHref: active ? active.getAttribute('href') : null,
    };
  });
  ok('抽屉 6 项', nav.count === 6);
  ok('donate 页高亮 donate.html', nav.activeHref === 'donate.html');
  ok('导航含报名/流通/丰碑/募捐/钱包', ['报名加入','NT 流通','合作丰碑','第四期募捐','数字身份钱包'].every(t => nav.titles.join('').includes(t)));

  // 点「报名加入」→ enroll.html
  await page.click('.drawer-link[href="enroll.html"]');
  await page.waitForTimeout(500);
  ok('导航跳转 enroll.html', page.url().endsWith('enroll.html'));
  const enrollActive = await page.evaluate(() => {
    const a = document.querySelector('.drawer-link.is-active');
    return a ? a.getAttribute('href') : null;
  });
  ok('enroll 页高亮 enroll.html', enrollActive === 'enroll.html');

  /* ══════════ enroll.html 关键路径 ══════════ */
  const q1 = await page.evaluate(() => !!document.getElementById('q1'));
  const screens = await page.evaluate(() => document.querySelectorAll('.screen').length);
  ok('enroll 表单渲染（13 屏）', q1 && screens === 13);
  // q1 姓名必填 → 填后前进到屏 4（电话必填校验）
  await page.fill('#q1', '验证测试');
  await page.click('.btn-next[data-next="s-q2"]');
  await page.waitForTimeout(200);
  await page.click('.btn-next[data-next="s-q3"]');
  await page.waitForTimeout(200);
  await page.click('.btn-next[data-next="s-q4"]');
  await page.waitForTimeout(200);
  const activeId = await page.evaluate(() => document.querySelector('.screen.active').id);
  ok('enroll 前进到屏4', activeId === 's-q4');
  // 空电话提交 → 校验红字
  await page.click('.btn-next[data-next="s-q5"]');
  await page.waitForTimeout(200);
  const errVisible = await page.evaluate(() => {
    const e = document.getElementById('q5-err');
    return e && !e.hidden;
  });
  ok('enroll 电话必填校验生效', errVisible);
  ok('enroll 无 JS 错误', errors.length === 0);
  errors.length = 0;

  /* ══════════ 首页不回归 ══════════ */
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const homeText = await page.evaluate(() => document.body.innerText);
  ok('首页含四期募捐入口（donate）', homeText.includes('第四期募捐') || homeText.includes('募捐'));
  ok('首页无 JS 错误', errors.length === 0);

  await browser.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})();

// 报名页后端接入验证：q5 必填+格式、提交 409/500/200 三态
const { chromium } = require('playwright');
const URL = 'http://localhost:8898/enroll.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 860 } });
  await page.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  let pass = 0, fail = 0;
  const ok = (name, cond) => { console.log(`${cond ? '✓' : '✗'} ${name}`); cond ? pass++ : fail++; };

  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  /* ── A. q5 手机号校验 ── */
  // 先走到 s-q4：屏1 q1 必填
  await page.fill('#q1', '测试员');
  await page.click('#s-q1 .btn-next');
  await page.click('#s-q2 .btn-next');
  await page.click('#s-q3 .btn-next');
  const on4 = await page.evaluate(() => document.getElementById('s-q4').classList.contains('active'));
  ok('A0 到达屏4', on4);
  // A1 空 → 红字 + 停留
  await page.click('#s-q4 .btn-next');
  const a1 = await page.evaluate(() => ({
    err: !document.getElementById('q5-err').hidden,
    stay: document.getElementById('s-q4').classList.contains('active'),
  }));
  ok('A1 空手机号 → 红字提示+拦截', a1.err && a1.stay);
  // A2 格式错 → 拦截
  await page.fill('#q5', '12345');
  await page.click('#s-q4 .btn-next');
  const a2 = await page.evaluate(() => ({
    err: !document.getElementById('q5-err').hidden,
    stay: document.getElementById('s-q4').classList.contains('active'),
  }));
  ok('A2 格式错 → 红字提示+拦截', a2.err && a2.stay);
  // A3 合法 → 前进 + 红字消失
  await page.fill('#q5', '13800138000');
  await page.click('#s-q4 .btn-next');
  const a3 = await page.evaluate(() => ({
    errHidden: document.getElementById('q5-err').hidden,
    moved: document.getElementById('s-q5').classList.contains('active'),
  }));
  ok('A3 合法手机号 → 前进+红字消失', a3.errHidden && a3.moved);

  /* ── B. 走完必填到回顾页 ── */
  const fill = async (sel, v) => { await page.fill(sel, v); };
  await page.waitForTimeout(500); // 让 A3 后的 shake 动画结束
  await fill('#q8', '产品经理');
  await page.click('#s-q5 .btn-next');
  await page.click('#s-q6 .chip:first-child'); // q9 是 chip 单选
  await page.click('#s-q6 .btn-next');
  await page.click('#s-q7 .chip:first-child');
  await page.click('#s-q7 .btn-next');
  await page.click('#s-q8 .chip:first-child');
  await page.click('#s-q8 .btn-next');
  await fill('#q12', '一起创作，互相补位');
  await fill('#q13', '认同规则，参与共建');
  await page.click('#s-q9 .btn-next');
  await fill('#q14', '期待慢节奏的集体生活');
  await page.click('#s-q10 .chip:first-child');
  await page.click('#s-q10 .btn-next');
  await fill('#q16', '先听大家说完，再一起定规则');
  await fill('#q17', '无过敏史');
  await page.click('#s-q11 .chip:first-child');
  await page.click('#s-q11 .btn-next');
  const onReview = await page.evaluate(() => document.getElementById('s-review').classList.contains('active'));
  ok('B1 走完必填到达回顾页', onReview);

  /* ── C. 提交三态 ── */
  // C1 409 → 已提交过文案 + 复制按钮隐藏
  await page.route('**/api/enrollments', r => r.fulfill({ status: 409, contentType: 'application/json', body: '{"error":"duplicate"}' }));
  await page.click('#btn-submit');
  await page.waitForTimeout(400);
  const c1 = await page.evaluate(() => ({
    t: document.getElementById('fail-box').querySelector('.t').textContent,
    copyHidden: document.getElementById('btn-copy').hidden,
    shown: !document.getElementById('fail-box').hidden,
  }));
  ok('C1 409 → 「你已提交过报名」+隐藏复制', c1.shown && c1.t.includes('已提交过') && c1.copyHidden);

  // C2 500 → 未成功文案 + 复制按钮可见
  await page.unroute('**/api/enrollments');
  await page.route('**/api/enrollments', r => r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"server"}' }));
  await page.click('#btn-submit');
  await page.waitForTimeout(400);
  const c2 = await page.evaluate(() => ({
    t: document.getElementById('fail-box').querySelector('.t').textContent,
    copyVisible: !document.getElementById('btn-copy').hidden,
  }));
  ok('C2 500 → 「提交可能未成功」+复制可见', c2.t.includes('提交可能未成功') && c2.copyVisible);

  // C3 200 → 成功到完成屏
  await page.unroute('**/api/enrollments');
  await page.route('**/api/enrollments', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await page.click('#btn-submit');
  await page.waitForTimeout(400);
  const c3 = await page.evaluate(() => document.getElementById('s-done').classList.contains('active'));
  ok('C3 200 → 到达完成屏', c3);

  await browser.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})();

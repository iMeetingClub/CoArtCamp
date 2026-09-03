// enroll.html「第一步救命包」活体自检：路径B 草稿恢复 + 路径A 提交失败可见 + Enter/芯片/必填提示
const { chromium } = require('playwright');
const BASE = 'http://localhost:8898';
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { console.log((cond ? '✓' : '✗') + ' ' + name + (cond ? '' : '  ← ' + (extra || ''))); cond ? pass++ : fail++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  /* ─── 路径 B：第 1 屏填姓名 → 刷新 → 姓名还在 ─── */
  await page.goto(BASE + '/enroll.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  await page.fill('#q1', '苏测试');
  await page.waitForTimeout(700); // 等 400ms 防抖落盘
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const restored = await page.evaluate(() => document.getElementById('q1').value);
  ok('B 路径：刷新后姓名仍在第 1 屏', restored === '苏测试', 'got ' + JSON.stringify(restored));
  const activeAfterReload = await page.evaluate(() => document.querySelector('.screen.active').id);
  ok('B 路径：刷新后停在第 1 屏', activeAfterReload === 's-q1', activeAfterReload);

  /* ─── 键盘：芯片 Enter 选中 + 不跳屏 ─── */
  await page.click('.btn-next[data-next="s-q2"]');
  await page.waitForTimeout(250);
  await page.focus('.chip[data-v="女"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const chipState = await page.evaluate(() => {
    const c = document.querySelector('.chip[data-v="女"]');
    return { sel: c.classList.contains('selected'), aria: c.getAttribute('aria-pressed'), screen: document.querySelector('.screen.active').id };
  });
  ok('A3：芯片 Enter 选中且 aria-pressed=true', chipState.sel && chipState.aria === 'true', JSON.stringify(chipState));
  ok('A3：芯片 Enter 不跳屏', chipState.screen === 's-q2', chipState.screen);

  /* ─── 键盘：焦点在「上一步」按 Enter → 后退而非前进 ─── */
  await page.focus('.btn-prev[data-prev="s-q1"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const backTo = await page.evaluate(() => document.querySelector('.screen.active').id);
  ok('A3：「上一步」Enter 后退到 s-q1', backTo === 's-q1', backTo);
  const nameStill = await page.evaluate(() => document.getElementById('q1').value);
  ok('A3：后退后姓名仍保留', nameStill === '苏测试', nameStill);

  /* ─── A4：必填提示文字（屏1 姓名已填，去屏5 测职业） ─── */
  await page.click('.btn-next[data-next="s-q2"]'); await page.waitForTimeout(200);
  await page.click('.btn-next[data-next="s-q3"]'); await page.waitForTimeout(200);
  await page.click('.btn-next[data-next="s-q4"]'); await page.waitForTimeout(200);
  // 空电话 → 原有 q5 红字
  await page.click('.btn-next[data-next="s-q5"]'); await page.waitForTimeout(200);
  const q5Err = await page.evaluate(() => !document.getElementById('q5-err').hidden);
  ok('A 路径：空电话红字提示', q5Err);
  await page.fill('#q5', '13800138000');
  await page.click('.btn-next[data-next="s-q5"]'); await page.waitForTimeout(250);
  // 屏5 职业空 → 新必填提示
  await page.click('.btn-next[data-next="s-q6"]'); await page.waitForTimeout(200);
  const formErr = await page.evaluate(() => {
    const e = document.querySelector('#s-q5 [data-form-err]');
    return e ? { shown: !e.hidden, text: e.textContent, role: e.getAttribute('role') } : null;
  });
  ok('A4：必填提示出现且指名题目', formErr && formErr.shown && formErr.text.includes('职业/专业背景'), JSON.stringify(formErr));
  ok('A4：必填提示 role=alert', formErr && formErr.role === 'alert');
  await page.fill('#q8', '视觉设计');
  await page.waitForTimeout(500);
  const errHiddenAfterInput = await page.evaluate(() => {
    const e = document.querySelector('#s-q5 [data-form-err]');
    return e && e.hidden;
  });
  ok('A4：输入后提示自动隐藏', !!errHiddenAfterInput);

  /* ─── 路径 A：填完全部必填 → 回顾屏 → 提交 → 本地 501 → 失败提示必须可见 ─── */
  await page.click('.btn-next[data-next="s-q6"]'); await page.waitForTimeout(250);
  await page.click('.chip[data-v="零基础，但充满好奇与热情"]');
  await page.click('.btn-next[data-next="s-q7"]'); await page.waitForTimeout(250);
  await page.click('.chip[data-v="摄影/摄像"]');
  await page.click('.btn-next[data-next="s-q8"]'); await page.waitForTimeout(250);
  await page.click('.chip[data-v="对工笔画艺术的学习兴趣"]');
  await page.click('.btn-next[data-next="s-q9"]'); await page.waitForTimeout(250);
  await page.fill('#q12', '测试共创看法');
  await page.fill('#q13', '测试规则看法');
  await page.click('.btn-next[data-next="s-q10"]'); await page.waitForTimeout(250);
  await page.fill('#q14', '测试期待与担忧');
  await page.click('.chip[data-v="冷静的观察者和思考者"]');
  await page.click('.btn-next[data-next="s-q11"]'); await page.waitForTimeout(250);
  await page.fill('#q16', '测试分歧处理');
  await page.fill('#q17', '测试健康状况');
  await page.click('.chip[data-v="朋友推荐"]');
  await page.click('.btn-next[data-next="s-review"]'); await page.waitForTimeout(300);
  const review = await page.evaluate(() => ({
    screen: document.querySelector('.screen.active').id,
    items: document.querySelectorAll('.review-item').length
  }));
  ok('A 路径：到达回顾屏且 15 条回顾', review.screen === 's-review' && review.items === 15, JSON.stringify(review));

  await page.click('#btn-submit');
  await page.waitForTimeout(1500); // 本地静态服务器 501
  const failSt = await page.evaluate(() => {
    const b = document.getElementById('fail-box');
    const r = b.getBoundingClientRect();
    const btn = document.getElementById('btn-submit');
    return {
      hidden: b.hidden, visible: r.width > 0 && r.height > 0,
      inReview: !!b.closest('#s-review'), reviewActive: document.querySelector('.screen.active').id === 's-review',
      title: b.querySelector('.t').textContent, btnBack: !btn.disabled && btn.textContent === '提交',
      focused: document.activeElement === b
    };
  });
  ok('P0：提交失败后失败框可见且在回顾屏', failSt.visible && failSt.inReview && failSt.reviewActive, JSON.stringify(failSt));
  ok('P0：失败文案正确且按钮恢复可重试', failSt.title === '提交可能未成功' && failSt.btnBack, JSON.stringify(failSt));
  ok('P0：焦点移到失败框', failSt.focused);
  await page.screenshot({ path: 'enroll-fail-evidence.png', fullPage: true });
  console.log('截图已存: enroll-fail-evidence.png');

  /* ─── 草稿恢复后姓名回顾屏也应显示（A1 连带验证） ─── */
  const reviewName = await page.evaluate(() => {
    const first = document.querySelector('.review-item .rv-ans');
    return first ? first.textContent : '';
  });
  ok('A1：回顾屏姓名条显示草稿恢复的值', reviewName === '苏测试', reviewName);

  ok('无 JS 错误', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log('\n==== ' + pass + ' passed, ' + fail + ' failed ====');
  process.exit(fail ? 1 : 0);
})();
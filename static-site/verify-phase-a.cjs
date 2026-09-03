// 阶段A新增验证：防本次修复再犯（与 verify-home/verify-all 并列运行）
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

  /* ── 1. 每页都有 <title> ── */
  const pages = ['index.html', 'enroll.html', 'donate.html', 'wallet.html', 'nt-flow-progression.html', 'gratitude-design.html'];
  const p430 = await browser.newPage({ viewport: { width: 430, height: 860 } });
  await p430.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  for (const f of pages) {
    await p430.goto(BASE + '/' + f, { waitUntil: 'domcontentloaded' });
    await p430.waitForTimeout(300);
    const t = await p430.title();
    ok(`${f} 有页面标题`, t && t.trim().length > 0, 'title 为空');
  }

  /* ── 2. gratitude 语言标记 ── */
  const gratRaw = read('gratitude-design.html');
  ok('gratitude lang=zh-CN', /<html[^>]*lang="zh-CN"/.test(gratRaw));

  /* ── 3. 360px 视口无横向溢出（全部 6 页）── */
  const p360 = await browser.newPage({ viewport: { width: 360, height: 780 } });
  await p360.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  for (const f of pages) {
    await p360.goto(BASE + '/' + f, { waitUntil: 'domcontentloaded' });
    await p360.waitForTimeout(500);
    const o = await p360.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok(`${f} @360px 无横向溢出`, o.sw <= o.cw + 1, `scrollWidth=${o.sw}`);
  }

  /* ── 4. enroll 提交失败提示位于回顾屏（P0 防再犯）── */
  const enRaw = read('enroll.html');
  const mFail = enRaw.match(/id="fail-box"/);
  ok('enroll 存在 fail-box', !!mFail);
  // 结构断言：fail-box 必须落在 s-review 屏的 HTML 区间内
  const iReview = enRaw.indexOf('id="s-review"');
  const iDone = enRaw.indexOf('id="s-done"');
  const iFail = enRaw.indexOf('id="fail-box"');
  ok('fail-box 在 #s-review 屏内', iReview > -1 && iFail > iReview && (iDone === -1 || iFail < iDone),
     `review@${iReview} fail@${iFail} done@${iDone}`);

  /* ── 5. 首页底部两节渲染（此前 shot.cjs 静默漏拍）── */
  await p430.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await p430.waitForTimeout(600);
  const home = await p430.evaluate(() => ({
    credits: document.querySelectorAll('.credit-card').length,
    donRows: document.querySelectorAll('.donation-history__row').length,
    sideProject: !!document.querySelector('.side-project-section'),
  }));
  ok('首页组办 5 人', home.credits === 5, `${home.credits}`);
  ok('首页捐助历史 4 行', home.donRows === 4, `${home.donRows}`);
  ok('首页共创与支持段存在', home.sideProject);

  /* ── 6. nt-flow 去导出化关键断言 ── */
  const ntRaw = read('nt-flow-progression.html');
  ok('nt-flow 无假菜单 SVG', !ntRaw.includes('data-pencil-name="菜单按钮"'));
  ok('nt-flow 无整页定高 4520px', !ntRaw.includes('4520px'));
  ok('nt-flow 无绝对定位屏', !/position:\s*absolute/.test(ntRaw));
  ok('nt-flow 无 430px 硬编码宽度', !/(?<![a-zA-Z-])width:\s*430px/.test(ntRaw));

  /* ── 7. gratitude 渐进增强 + 宽度 ── */
  ok('gratitude 面板不在 HTML 写死 hidden', !/data-gratitude-panel[^>]*\shidden/.test(gratRaw));
  ok('gratitude 无 430px 硬编码宽度', !/(?<![a-zA-Z-])width:\s*430px/.test(gratRaw));
  ok('gratitude chip 有焦点样式', /\[data-gratitude-trigger\]:focus-visible/.test(gratRaw));

  /* ── 8. 待认领地址掩码 = 真实后六位（出处：共创营/第三期募捐返还确认_2026-08-24.md）── */
  const realTails = ['50ea6e', '9CC2cf', '612a6F', '9313e2', 'baD3Ef', '51094E', 'a0ff23', '043289', '4c86Ac'];
  const fakeTails = ['····86', '····21', '····33', '····07', '····90', '····54', '····11', '····48', '····65'];
  ok('9 个真实后六位全部在页', realTails.every(t => gratRaw.includes(t)), realTails.filter(t => !gratRaw.includes(t)).join(','));
  ok('旧的虚构尾号已清除', fakeTails.every(t => !gratRaw.includes(t)));

  await browser.close();
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

// 可读性验证：全部 13 屏计算样式对比度（文字对自身底色）+ 截图（CJS）
const { chromium } = require('playwright');
const OUT = 'C:/Users/苏砚仁/Desktop/共创营设计预览/报名页代码版';
const URL = 'http://localhost:8898/enroll.html';

function lum(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function rgbToHex(c) {
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return c;
  const [r, g, b, a = 1] = [m[1], m[2], m[3], parseFloat(m[4] ?? 1)];
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') + (a < 1 ? `@${a}` : '');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 860 }, deviceScaleFactor: 2 });
  await page.route(/fonts\.googleapis|fonts\.gstatic/, r => r.abort());
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  const TARGETS = ['s-q1','s-q2','s-q3','s-q4','s-q5','s-q6','s-q7','s-q8','s-q9','s-q10','s-q11','s-review','s-done'];
  const NAMES = { 's-q1':'屏1','s-q2':'屏2','s-q3':'屏3','s-q4':'屏4','s-q5':'屏5','s-q6':'屏6','s-q7':'屏7','s-q8':'屏8-Q11','s-q9':'屏9-Q12/13','s-q10':'屏10-Q14/15','s-q11':'屏11-Q16-19','s-review':'屏12-回顾','s-done':'屏13-完成' };
  const FAILS = [];
  for (const id of TARGETS) {
    await page.evaluate(id => {
      const sec = document.getElementById(id);
      if (!sec.classList.contains('active')) {
        sec.classList.add('active');
        document.querySelectorAll('.screen.active').forEach(s => { if (s !== sec) s.classList.remove('active'); });
      }
    }, id);
    await page.waitForTimeout(120);
    await page.screenshot({ path: `${OUT}/可读性-${NAMES[id]}.png`, fullPage: false });
    const rows = await page.evaluate(id => {
      const sec = document.getElementById(id);
      const bg = getComputedStyle(sec).backgroundColor;
      const out = { bg };
      const g = (s, pseudo) => { const el = sec.querySelector(s); return el ? getComputedStyle(el, pseudo).color : null; };
      out.label = g('.camp-label');
      out.act = g('.act-text');
      out.hint = g('.hint');
      out.question = g('.question');
      out.subq = g('.subq');
      out.chip = g('.chip');
      out.prev = g('.btn-prev');
      const nb = sec.querySelector('.btn-next');
      if (nb) { out.next = getComputedStyle(nb).color; out.nextBg = getComputedStyle(nb).backgroundColor; }
      const il = [...sec.querySelectorAll('.input-line')].find(e => e.hasAttribute('placeholder'));
      if (il) {
        out.underline = getComputedStyle(il).borderBottomColor;
        out.ph = getComputedStyle(il, '::placeholder').color;
      }
      // 回顾页条目
      const rv = sec.querySelector('.rv-ans');
      if (rv) { out.rvAns = getComputedStyle(rv).color; out.rvAnsBg = bg; }
      const rvQ = sec.querySelector('.rv-q');
      if (rvQ) { out.rvQ = getComputedStyle(rvQ).color; out.rvQBg = bg; }
      const rvL = sec.querySelector('.rv-label');
      if (rvL) { out.rvL = getComputedStyle(rvL).color; out.rvLBg = bg; }
      return out;
    }, id);
    const bg = rgbToHex(rows.bg).split('@')[0];
    console.log(`\n== ${NAMES[id]}  bg=${bg} ==`);
    let bad = false;
    const pairBg = (k) => (k === 'next' ? rows.nextBg : k.startsWith('rv') ? rows[k + 'Bg'] : rows.bg);
    for (const [k, v] of Object.entries(rows)) {
      if (k === 'bg' || k.endsWith('Bg') || !v) continue;
      const hex = rgbToHex(v);
      const base = rgbToHex(pairBg(k));
      if (hex.includes('@')) { console.log(`  ${k}: ${hex} (透明，跳过)`); continue; }
      if (base.includes('@')) { console.log(`  ${k}: ${hex} on ${base} (透明底，跳过)`); continue; }
      const r = contrast(hex, base).toFixed(2);
      const ok = parseFloat(r) >= 3.0;
      if (!ok) { bad = true; FAILS.push(`${NAMES[id]}/${k}`); }
      console.log(`  ${ok ? '✓' : '✗'} ${k}: ${hex} = ${r}:1`);
    }
    if (!bad) console.log('  全部 ≥3:1 ✓');
  }
  await browser.close();
  console.log('\n==== 汇总 ====');
  if (FAILS.length) console.log('FAIL:', FAILS.join(', '));
  else console.log('全部 13 屏 PASS，所有文字 ≥3:1');
})();

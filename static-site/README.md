# 艺术共创营（CoArtCamp）静态站

本目录是南塘"艺术共创营"项目的前端静态站点，作为 GitHub 仓库 `iMeetingClub/CoArtCamp` 的主要网页内容。

## 页面

- `index.html` 活动首页（故事书：一期→二期→三期→纪事→报名行+捐助历史）
- `phase-1.html` / `phase-2.html` / `phase-3.html` 三期详情页
- `story.html` 第三期共创纪事页
- `enroll.html` 第四期报名页（13 屏 19 题 5 幕，提交 → Cloudflare Pages Function → 飞书多维表格）
- `donate.html` 第四期募捐页
- `wallet.html` 数字身份钱包教程页
- `nt-flow-progression.html` NT 流通页
- `gratitude-design.html` 合作丰碑页（手风琴）

## 结构

- `styles/site.css` SPA 页（首页/分期/纪事）公共样式
- `styles/nav.css` 全站抽屉导航样式（6 项闭环）
- `scripts/app.js` SPA 页渲染与交互（数据源 `scripts/site-data.js`）
- `scripts/nav.js` 全站抽屉导航组件（自注入，页面已有菜单按钮时只接管不重复注入）
- `scripts/gratitude.js` 丰碑手风琴
- `functions/api/enrollments.js` 报名接口（Pages Function → 飞书，需 5 个环境变量）
- `assets/images/` 本地底图与装饰资源

## 本地预览

```bash
python -m http.server 8898   # 或 node serve.js（4173）
````

## 回归验证

```bash
node verify-home.cjs      # 首页 20 项
node verify-all.cjs       # 全站 49 项
node verify-phase-a.cjs   # 阶段A防再犯 27 项（title/360px溢出/fail-box位置/真实后六位等）
node _audit-fix-check.cjs # NT流通+丰碑专项 22 项
node enroll-fix-test.cjs  # 报名页交互 16 项
````

（均需本地预览运行中，且全局安装 playwright：`$env:NODE_PATH=$(npm root -g)`）

## 部署说明

- 正式访问地址为 `https://coartcamp.imeeting.club/`。
- Cloudflare Pages 项目名为 `coartcamp`，连接 GitHub 仓库 `iMeetingClub/CoArtCamp`，从 `main` 分支自动部署，发布目录为 `static-site`。
- 报名接口需在 Cloudflare 配置 5 个环境变量（FEISHU_APP_ID / FEISHU_APP_SECRET / FEISHU_APP_TOKEN / FEISHU_TABLE_ID / ADMIN_CODE）。
- 所有修改走 分支 → PR → 合并 main。

## 说明

- 页面为真实 HTML 分层结构，移动端优先（内容列最大 430px 居中）。
- 全站浅绿色系（#edf4ed / #55644e），文字对比度按 WCAG AA 调优，支持 prefers-reduced-motion。
- 留空内容以真实占位块呈现（收款码 / 群二维码 / 联系人）。

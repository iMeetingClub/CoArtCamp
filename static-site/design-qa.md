# Design QA

## 2026-09 阶段A/B 后现状

- 验证：verify-home 20/20、verify-all 49/49、verify-phase-a 27/27、_audit-fix-check 22/22、enroll-fix-test 16/16 全绿。
- 截图档案：`thinknote/_ui_preview/`（audit/ 阶段A 前、phase-a/ 阶段A 定妆、phase-b/ 阶段B）。
- 阶段A 已修：报名失败可见性、草稿/键盘/校验提示、NT流通与丰碑去导出化（title/lang/流式布局/360px 无溢出/假菜单删除/渐进增强）、待认领地址真实后六位。
- 阶段B 已修：全站字体加载对齐（含手写体）、文字对比度色板内换深（正文 #55644e、蓝灰 #47626f）、抽屉合一与焦点管理（inert）、灯箱 role=dialog、prefers-reduced-motion、meta/OG/favicon、donate 侧红条改全框红字、wallet 外链 rel 与返回 CTA。
- 已知待办（阶段C）：NT流通/丰碑语义化重构、桌面菜单跟随内容列、enroll 剩余 P2（label 关联/100svh/深链防护）、gratitude 面板 scroll-margin-top。

## 历史记录（2026-08 首轮）

Reference set:
- `project-files/design/untitled.pen` 正式页面结构
- 对应 PNG 导出图
- `project-files/page-planning/艺术共创营-页面结构说明.md`

Checks completed:
- All pages return 200 over local HTTP; shared CSS/JS 200。
- Drawer open/close/backdrop/repeat-toggle/left-swipe；当前页高亮；archive 卡跳详情。
- 页面为移动端优先，桌面保持居中手机宽舞台。

Findings: P0-P2 none；P3 未做浏览器自动截图对比（已于 2026-09 补齐截图体系）。

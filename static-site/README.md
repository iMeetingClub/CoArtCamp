# 艺术共创营（CoArtCamp）静态站

本目录是道南堂“艺术共创营”项目的前端静态站点，作为 GitHub 仓库 `DAO-NanTang/CoArtCamp` 的主要网页内容。

## 目录

- `index.html` 活动首页
- `phase-1.html` 第一期详情页
- `phase-2.html` 第二期详情页
- `phase-3.html` 第三期详情页
- `story.html` 第三期共创故事页
- `styles/site.css` 公共样式
- `scripts/app.js` 页面渲染与交互
- `scripts/site-data.js` 页面内容数据源
- `assets/images/` 本地底图与装饰资源

## 本地预览

在当前目录运行：

```bash
node serve.js
```

默认预览地址：

```text
http://127.0.0.1:4173
```

## 部署说明

- GitHub Actions 会从仓库根目录读取 `static-site/` 并上传为 GitHub Pages artifact。
- Cloudflare Pages 当前项目名可继续使用 `nantang-gongchuangying`，但连接仓库应确认为 `DAO-NanTang/CoArtCamp`。
- 若 GitHub Pages 因私有仓库权限受限，Cloudflare Pages 可作为主要访问入口。

## 说明

- 5 个页面都为真实 HTML 分层结构，页面主体不再使用整页 PNG。
- 所有页面共享同一套移动端视觉系统与同一套侧边栏导航。
- 侧边栏抽屉、遮罩关闭、重复点击关闭、左滑关闭、当前页高亮都已接入。
- 页面中的留空内容以真实前端占位块和占位文案呈现，便于后续继续替换。
- 所有资源均为本地文件，不依赖后端或数据库。

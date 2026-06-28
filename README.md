# 艺术共创营（CoArtCamp）

道南堂“艺术共创营”（CoArtCamp）项目资料仓库，包含静态网页、设计稿导出图、底图素材、历期作品集与会议资料。

GitHub 仓库地址：

```text
https://github.com/DAO-NanTang/CoArtCamp
```

正式访问地址：

```text
https://coartcamp.imeeting.club/
```

## 主要内容

- `static-site/`：前端静态站点主目录
- `前端ui设计稿/`：页面设计稿导出图
- `导出预览/`：预览导出文件
- `底图/`：页面使用的底图与素材
- `第一二期作品集/`：历期作品资料
- `艺术共创营-页面结构说明.md`：页面结构与内容说明

## 网页入口

静态网页主要入口位于：

- `static-site/index.html`：活动首页
- `static-site/phase-1.html`：第一期详情页
- `static-site/phase-2.html`：第二期详情页
- `static-site/phase-3.html`：第三期详情页
- `static-site/story.html`：共创故事页

## 本地预览

进入 `static-site/` 目录后，可使用本地静态服务预览项目。仓库内已包含一个简单的预览脚本：

```bash
node serve.js
```

默认访问地址：

```text
http://127.0.0.1:4173
```

## 部署

本项目主要使用 Cloudflare 的 Workers 和 Pages 服务发布，其中当前网站采用的是 Cloudflare Pages。Pages 适合发布静态网站，并可连接 GitHub 仓库实现 Auto Deploy。

当前部署方式：

- Cloudflare 产品：Workers 和 Pages 中的 Pages
- GitHub 仓库：`DAO-NanTang/CoArtCamp`
- 生产分支：`main`
- 发布目录：`static-site`
- 自动部署：已启用，推送到 `main` 后由 Cloudflare Pages 自动部署
- Cloudflare Pages 项目名：`coartcamp`
- Cloudflare 默认域名：`https://coartcamp.pages.dev/`
- 自定义域名：`https://coartcamp.imeeting.club/`

基本操作流程：

1. 在 Cloudflare Dashboard 进入 Workers 和 Pages。
2. 创建或选择 Pages 项目。
3. 选择 GitHub 作为来源，并关联 `DAO-NanTang/CoArtCamp` 仓库。
4. 设置生产分支为 `main`，发布目录为 `static-site`。
5. 保存后启用 Auto Deploy，之后每次推送 `main` 都会自动发布。

仓库中仍保留 GitHub Pages workflow 作为备用发布尝试；如仓库保持私有，GitHub Pages 是否可发布取决于当前 GitHub 账号/组织套餐与 Pages 设置。

## 说明

- 当前仓库以静态资源为主，适合展示、整理与后续迭代
- 页面相关实现集中在 `static-site/` 中
- 图片与资料文件较多，首次克隆或下载体积会相对较大

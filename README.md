# 艺术共创营（CoArtCamp）

道南堂“艺术共创营”（CoArtCamp）项目资料仓库，包含静态网页、对外材料、设计与会议等项目文件。

GitHub 仓库地址：

```text
https://github.com/DAO-NanTang/CoArtCamp
```

正式访问地址：

```text
https://coartcamp.imeeting.club/
```

## 主要内容

- `static-site/`：前端静态站点主目录，也是 Cloudflare Pages 当前发布目录。
- `public-materials/`：可对外使用或分享的作品、照片、展览与宣传材料。
- `project-files/`：项目过程文件，包括会议记录、设计稿、页面规划、原始素材和整理脚本。
- `.github/`：GitHub Actions 等仓库自动化配置。

## 目录规则

这个仓库按用途分成三类：

- 网站代码放在 `static-site/`，只有这里会被 Cloudflare Pages 自动发布到正式网站。
- 对外材料放在 `public-materials/`，这些内容可以用于网站、宣传、展览或对外分享，但不一定直接发布。
- 项目文件放在 `project-files/`，这里保存内部过程资料、会议记录、设计源文件和整理脚本。

如需新增网站页面或调整线上呈现，优先改 `static-site/`。
如需新增作品集、展览照片、开幕文案等对外材料，优先放 `public-materials/`。
如需保存会议记录、设计过程、原始底图或工作脚本，优先放 `project-files/`。

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

- 当前仓库以静态网站和项目档案为主，适合展示、整理与后续迭代
- 页面相关实现集中在 `static-site/` 中
- 图片与资料文件较多，首次克隆或下载体积会相对较大

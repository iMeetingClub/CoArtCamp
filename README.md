# 艺术共创营（CoArtCamp）

DAO南塘“艺术共创营”（CoArtCamp）项目资料仓库。

这个仓库主要做三件事：

1. 维护正式网站：`static-site/` 是 Cloudflare Pages 的发布目录。
2. 整理对外材料：`public-materials/` 保存可分享的作品、照片、展览与宣传材料。
3. 保存项目档案：`project-files/` 保存会议记录、设计稿、页面规划、原始素材和整理脚本。

GitHub 仓库地址：

```text
https://github.com/iMeetingClub/CoArtCamp
```

正式访问地址：

```text
https://coartcamp.imeeting.club/
```

## 当前状态

- 正式网站由 Cloudflare Pages 发布，不使用 GitHub Pages。
- Cloudflare Pages 读取 `main` 分支的 `static-site/` 目录作为发布内容。
- `main` 是生产分支；任何协作修改都必须先开 branch，再通过 PR 或合并流程进入 `main`。
- 合并进入 `main` 后，Cloudflare Pages 会自动部署正式网站。

## 目录结构

- `static-site/`：前端静态站点主目录，也是 Cloudflare Pages 当前发布目录。
- `public-materials/`：可对外使用或分享的作品、照片、展览与宣传材料。
- `project-files/`：项目过程文件，包括会议记录、设计稿、页面规划、原始素材和整理脚本。

目录整理前后的对外材料路径对应关系见：

```text
public-materials/link-map.md
```

## 放文件的规则

这个仓库按用途分成三类：

- 网站代码放在 `static-site/`，只有这里会被 Cloudflare Pages 自动发布到正式网站。
- 对外材料放在 `public-materials/`，并同步到 `static-site/public-materials/` 供 Cloudflare Pages 对外发布。
- 项目文件放在 `project-files/`，这里保存内部过程资料、会议记录、设计源文件和整理脚本。

如需新增网站页面或调整线上呈现，优先改 `static-site/`。
如需新增作品集、展览照片、开幕文案等对外材料，优先放 `public-materials/`。
如需保存会议记录、设计过程、原始底图或工作脚本，优先放 `project-files/`。

## 协作方式

所有协作修改都必须从新 branch 开始，不直接在 `main` 上改。

建议流程：

1. 先确认要改的是网站、对外材料，还是项目档案。
2. 从 `main` 开一个新 branch，例如：

```bash
git switch main
git pull
git switch -c docs/update-readme
```

3. 在 branch 上修改并本地检查。
4. 提交 commit，并推送 branch。
5. 发起 PR 或请项目维护者检查。
6. 合并进入 `main` 后，Cloudflare Pages 自动部署。
7. 若改动影响正式网站，到 `https://coartcamp.imeeting.club/` 检查结果。

常见 branch 命名：

- `docs/...`：README、说明文件、项目文档
- `site/...`：正式网站页面、样式、交互
- `materials/...`：公开材料、图片、作品集
- `archive/...`：会议记录、项目档案整理

## 网页入口

静态网页主要入口位于：

- `static-site/index.html`：活动首页
- `static-site/phase-1.html`：第一期详情页
- `static-site/phase-2.html`：第二期详情页
- `static-site/phase-3.html`：第三期详情页
- `static-site/story.html`：共创故事页

页面内容数据主要在：

- `static-site/scripts/site-data.js`：页面内容数据源
- `static-site/styles/site.css`：公共样式
- `static-site/scripts/app.js`：页面渲染与交互

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

当前部署配置：

- Cloudflare 产品：Workers 和 Pages 中的 Pages
- GitHub 仓库：`iMeetingClub/CoArtCamp`
- 生产分支：`main`
- 发布目录：`static-site`
- 自动部署：已启用，合并进入 `main` 后由 Cloudflare Pages 自动部署
- Cloudflare Pages 项目名：`coartcamp`
- 正式公开入口：`https://coartcamp.imeeting.club/`
- Cloudflare 提供的 Pages 域名：`https://coartcamp.pages.dev/`，不作为公开分享入口；后续应在 Cloudflare 侧设置 redirect 或 Access 验证。

如需重新设置 Cloudflare Pages，基本配置流程：

1. 在 Cloudflare Dashboard 进入 Workers 和 Pages。
2. 创建或选择 Pages 项目。
3. 选择 GitHub 作为来源，并关联 `iMeetingClub/CoArtCamp` 仓库。
4. 设置生产分支为 `main`，发布目录为 `static-site`。
5. 保存后启用 Auto Deploy，之后每次 `main` 更新都会自动发布。

本项目不再使用 GitHub Pages 作为正式部署路径，原 GitHub Pages workflow 已停用并移除。之后请以 Cloudflare Pages 的部署记录和 `https://coartcamp.imeeting.club/` 的访问结果判断正式网站是否发布成功。

更完整的部署说明见：

```text
project-files/deployment/README.md
```

## 说明

- 当前仓库以静态网站和项目档案为主，适合展示、整理与后续迭代
- 页面相关实现集中在 `static-site/` 中
- 图片与资料文件较多，首次克隆或下载体积会相对较大

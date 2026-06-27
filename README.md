# 艺术共创营（CoArtCamp）

道南堂“艺术共创营”（CoArtCamp）项目资料仓库，包含静态网页、设计稿导出图、底图素材、历期作品集与会议资料。

GitHub 仓库地址：

```text
https://github.com/DAO-NanTang/CoArtCamp
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

## 自动部署

推送到 `main` 分支后，GitHub Actions 会尝试将 `static-site/` 发布到 GitHub Pages。也可以在仓库的 Actions 页面手动触发 `Deploy CoArtCamp static site to GitHub Pages`。

当前 Cloudflare Pages 项目仍可继续使用原项目名：

```text
nantang-gongchuangying
```

Cloudflare 已连接的 GitHub 仓库应确认更新为：

```text
DAO-NanTang/CoArtCamp
```

如仓库保持私有，GitHub Pages 是否可发布取决于当前 GitHub 账号/组织套餐与 Pages 设置；Cloudflare Pages 可作为主要对外部署入口继续使用。

## 说明

- 当前仓库以静态资源为主，适合展示、整理与后续迭代
- 页面相关实现集中在 `static-site/` 中
- 图片与资料文件较多，首次克隆或下载体积会相对较大

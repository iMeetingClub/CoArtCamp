# 部署说明

本项目正式部署路径为 Cloudflare Pages。GitHub 仓库负责保存代码和资料，线上发布由 Cloudflare Pages 连接 GitHub 后自动完成。

## 当前结论

- 正式访问地址：`https://coartcamp.imeeting.club/`
- Cloudflare Pages 默认地址：`https://coartcamp.pages.dev/`
- GitHub 仓库：`DAO-NanTang/CoArtCamp`
- Cloudflare Pages 项目名：`coartcamp`
- 生产分支：`main`
- 发布目录：`static-site`
- 自动部署：已启用，推送到 `main` 后由 Cloudflare Pages 自动部署

## GitHub Pages 状态

本仓库不再使用 GitHub Pages 作为正式部署路径，原 GitHub Pages workflow 已停用并从仓库移除。

这样安排的原因：

- 当前网站已经由 Cloudflare Pages 正常发布。
- GitHub Pages 不是本项目的正式入口。
- 保留 GitHub Pages workflow 会在 GitHub Actions 中产生失败记录，容易让协作者误以为正式网站部署失败。

后续判断网站是否发布成功，应以 Cloudflare Pages 的部署记录和正式访问地址为准，不再以 GitHub Actions 中旧的 GitHub Pages 记录为准。

## 日常更新流程

1. 修改 `static-site/` 内的网站内容。
2. 提交并推送到 GitHub 的 `main` 分支。
3. Cloudflare Pages 自动读取最新内容并发布。
4. 到 `https://coartcamp.imeeting.club/` 检查线上结果。

如果只是整理 `public-materials/` 或 `project-files/`，通常不会改变正式网站页面，除非同步修改了 `static-site/`。

## 需要进入 Cloudflare 调整的情况

- 更换或新增正式域名。
- 调整 Pages 项目的 GitHub 仓库来源。
- 调整生产分支。
- 调整发布目录。
- 查看某次自动部署是否成功。

当前推荐保持：

```text
Branch: main
Build command: 留空
Output directory: static-site
```

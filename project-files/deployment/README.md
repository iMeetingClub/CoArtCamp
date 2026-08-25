# 部署说明

本项目正式部署路径为 Cloudflare Pages。GitHub 仓库负责保存代码和资料，线上发布由 Cloudflare Pages 连接 GitHub 后自动完成。

## 当前结论

- 正式访问地址：`https://coartcamp.imeeting.club/`
- Cloudflare Pages 提供域名：`https://coartcamp.pages.dev/`，不作为公开分享入口
- GitHub 仓库：`iMeetingClub/CoArtCamp`
- Cloudflare Pages 项目名：`coartcamp`
- 生产分支：`main`
- 发布目录：`static-site`
- 自动部署：已启用，`main` 更新后由 Cloudflare Pages 自动部署

## GitHub Pages 状态

本仓库不再使用 GitHub Pages 作为正式部署路径，原 GitHub Pages workflow 已停用并从仓库移除。

这样安排的原因：

- 当前网站已经由 Cloudflare Pages 正常发布。
- GitHub Pages 不是本项目的正式入口。
- 保留 GitHub Pages workflow 会在 GitHub Actions 中产生失败记录，容易让协作者误以为正式网站部署失败。

后续判断网站是否发布成功，应以 Cloudflare Pages 的部署记录和正式访问地址为准，不再以 GitHub Actions 中旧的 GitHub Pages 记录为准。

## Pages 域名访问控制

`https://coartcamp.pages.dev/` 不作为项目的公开访问入口。对外分享、正式传播和验收检查，均以 `https://coartcamp.imeeting.club/` 为准。

后续如果要把 Pages 域名变成测试版本，应优先在 Cloudflare 侧处理：

1. 在 Cloudflare Pages 项目中启用 preview deployments 的 Access policy，限制预览部署访问。
2. 如果要连 `coartcamp.pages.dev` 本身也收起来，在 Cloudflare Access 中为该 Pages 域名建立访问规则。
3. 如果不需要独立测试入口，可将 `coartcamp.pages.dev` redirect 到正式自定义域名。
4. Access 规则建议只允许指定成员、指定邮箱域名或一次性 PIN 验证后的访问者进入。

Cloudflare 侧建议操作：

1. 进入 Workers 和 Pages，选择 Pages 项目 `coartcamp`。
2. 在项目设置中启用 preview deployments 的 Access policy。
3. 到 Zero Trust > Access controls > Applications，检查自动创建的 Access application。
4. 为 `coartcamp.pages.dev` 建立或调整 Access application，让访问者必须通过验证。
5. 若决定不保留测试入口，则改用 Bulk Redirect，将 `coartcamp.pages.dev` 转向 `coartcamp.imeeting.club`。

在完成上述设置前，不应把 `coartcamp.pages.dev` 写入公开文案、邀请函或对外验收说明。

## 日常更新流程

1. 修改 `static-site/` 内的网站内容。
2. 从 `main` 开一个新 branch，在 branch 上提交修改。
3. 推送 branch，并通过 PR 或维护者检查后合并到 `main`。
4. Cloudflare Pages 自动读取 `main` 的最新内容并发布。
5. 到 `https://coartcamp.imeeting.club/` 检查线上结果。

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

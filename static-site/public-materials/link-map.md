# 对外材料搬迁索引

本索引用来说明仓库整理前后，对外展示材料的位置变化。`public-materials/` 是公开材料归档目录；为了维持对外访问，当前已同步一份到 `static-site/public-materials/`，由 Cloudflare Pages 发布。

如果需要把某份材料放入正式网站页面，应再把内容整理进 `static-site/`。

## 旧路径与新路径

| 搬迁前位置 | 搬迁后位置 | 说明 |
| --- | --- | --- |
| `第一二期作品集/第一期·工笔画群展/` | `public-materials/phase-01-工笔画群展/works/` | 第一期作品图片、`data.js`、`metadata.json` |
| `第一二期作品集/第二期·人物志/` | `public-materials/phase-02-南塘人物志/works/` | 第二期作品图片、`data.js`、`metadata.json` |
| `第三期共创人照片/` | `public-materials/phase-03-寻找/cocreator-portraits/` | 第三期共创人介绍 HTML、Markdown 与照片 |
| `第三期/第三期作品介绍.txt` | `public-materials/phase-03-寻找/第三期作品介绍.txt` | 第三期作品介绍文本 |
| `南塘艺术共创营·城市快闪展 开幕致辞.md` | `public-materials/exhibition/城市快闪展-开幕致辞.md` | 城市快闪展开幕致辞 |
| `特征图.jpg` | `public-materials/media/特征图.jpg` | 对外媒体图 |
| `第一期人物照片.jpg` | `public-materials/media/第一期人物照片.jpg` | 对外媒体图 |
| `第二期照片.jpg` | `public-materials/media/第二期照片.jpg` | 对外媒体图 |
| `第二期照片2.jpg` | `public-materials/media/第二期照片2.jpg` | 对外媒体图 |
| `第二期活动照片.jpg` | `public-materials/media/第二期活动照片.jpg` | 对外媒体图 |
| `第三期ai照片.jpg` | `public-materials/media/第三期ai照片.jpg` | 对外媒体图 |
| `第三期共创人照片.png` | `public-materials/media/第三期共创人照片.png` | 对外媒体图 |
| `第三期照片.jpg` | `public-materials/media/第三期照片.jpg` | 对外媒体图 |
| `第三期照片2.jpg` | `public-materials/media/第三期照片2.jpg` | 对外媒体图 |

## 网站访问兼容

为避免旧的 `coartcamp.imeeting.club/...` 网站路径完全失效，`static-site/_redirects` 已加入兼容跳转：

- 旧的一二期作品集文件会跳到 `coartcamp.imeeting.club/public-materials/...` 下的公开文件。
- 旧的第三期共创人照片与第三期作品介绍会跳到 `coartcamp.imeeting.club/public-materials/...` 下的公开文件。
- 旧的根目录媒体图会跳到 `coartcamp.imeeting.club/public-materials/media/...` 下的公开文件。

GitHub 自身的旧文件链接无法由 Cloudflare 接管跳转；如果外部使用的是 GitHub 旧路径，应改用本索引中的新路径，或使用正式站的 `/public-materials/...` 文件地址。

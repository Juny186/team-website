# AGENTS.md

## 项目概览
四川文理学院信息与生物医学交叉创新团队官网。高校科研机构信息型官网，纯静态站，风格对齐 https://fish.njtc.edu.cn/index.htm。

## 技术栈
- 原生 HTML + CSS + JS（无构建步骤）
- CSS：Flexbox + Grid 布局，配色/间距统一通过 `:root` 下的 CSS 变量管理
- 布局：顶部栏 + 学术蓝主导航 + 全宽轮播 Banner + 两栏内容区 + 联系我们色块 + 快速通道色带 + 单行版权

## 项目结构
- `index.html`：页面主文件（唯一 HTML，主文件名必须保持 index.html）
- `styles/main.css`：全部样式，色彩变量见 `:root`（学术蓝 `#1a4a7a`，无金色）
- `scripts/main.js`：原生 JS，含轮播图、汉堡菜单、导航高亮
- `DESIGN.md`：设计规范（色彩 / 字体 / 布局 / 交互 / 禁忌）

## 运行命令
- 开发/预览：`python3 -m http.server ${DEPLOY_RUN_PORT} --bind 0.0.0.0`（由 `.coze` 的 dev.run 定义）
- 静态站无构建脚本，无 lint / tsc

## 关键交互
- 轮播图：`#bannerViewport` 内 `.banner-slide`，原生 JS 自动轮播间隔 4s，鼠标悬停暂停，仅底部指示器（无左右箭头）
- 手机导航：≤768px 折叠为汉堡菜单；`#navToggle` 切换 `#navList.open`
- 导航高亮：滚动时根据当前命中的 `#section` 区段高亮 `#navList` 内 `.nav-item`
  - 存在的 section id：`home` `about` `research` `members` `achievements` `frontier` `news` `contact` `links`
  - 其中 `frontier`=学术前沿、`news`=新闻公告、`contact`=联系我们、`links`=快速通道；`about/research/members/achievements` 无独立 DOM 容器，锚点落地于整站 top/main

## 内容区块结构（替换占位约定）
- 轮播 Banner：`#bannerViewport` 内 `.banner-slide`，占位图为 Unsplash 学术/科研大图（实为 `<img>` 的 `.banner-bg`），替换时改 `src`
- 学术前沿（左栏 `.col-academic`）：`.acad-item` = `.acad-date`（`.date-md` 月.日大号 + `.date-yr` 年份）+ `.acad-title`
- 新闻公告（右栏 `.col-news`）：`.news-item` = `.news-thumb`（`--tone` 控制缩略图底色）+ `.news-tag`（`月.日 / 年` 标签）+ `.news-title` + `.news-brief`
- 联系我们（`.contact-band`）：左 `.contact-labs` 实验室名大字（`.lab-line`）+ 右 `.contact-meta` 联系方式（地址/邮编/邮箱/电话）
- 快速通道（`.quick-band`）：`.quick-list` 内 `<li>` 中的 `.quick-btn` 外链按钮，新增直接加 `<li>`
- 底部 `.footer-inner`：一行式版权

## 注意
- 禁止金色/黄色元素（参考站为纯净蓝白学术风）
- 禁止 emoji 图标（用文字/线条/色块表达）
- 主色始终学术蓝 `#1a4a7a`（避免偏黑），背景以白为主
- 字体用系统无衬线堆栈，不引入外部字体
- 配色统一改 `:root` 变量，勿散落硬编码
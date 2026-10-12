# AGENTS.md

## 项目概览
四川文理学院信息与生物医学交叉创新团队官网。高校科研机构信息型官网，纯静态站。

## 技术栈
- 原生 HTML + CSS + JS（无构建步骤）
- CSS：Flexbox + Grid 布局，配色/间距统一通过 `:root` 下的 CSS 变量管理
- 布局：顶部栏 + 主导航 + 轮播 Banner + 内容区 + 底部版权

## 项目结构
- `index.html`：页面主文件（唯一 HTML，主文件名必须保持 index.html）
- `styles/main.css`：全部样式，色彩变量见 `:root`（深蓝 `#1a3a6b` / 金黄 `#e8b44d`）
- `scripts/main.js`：原生 JS，含轮播图、汉堡菜单、导航高亮
- `DESIGN.md`：设计规范（色彩 / 字体 / 布局 / 交互 / 禁忌）

## 运行命令
- 开发/预览：`python3 -m http.server ${DEPLOY_RUN_PORT} --bind 0.0.0.0`（由 `.coze` 的 dev.run 定义）
- 静态站无构建脚本，无 lint / tsc

## 关键交互
- 轮播图：原生 JS 实现，自动轮播间隔 4s，鼠标悬停暂停，支持左右箭头与页码
- 手机导航：≤768px 折叠为汉堡菜单；内容网格桌面 3 列、中屏 2 列、手机 1 列
- 导航高亮：滚动时根据当前命中的 `#section` 区段高亮顶部导航项
  - 已占位的 section id：`home` `about` `research` `members` `achievements` `frontier` `contact`（各二级导航文案已对应；目前 `about/research/members/achievements` 无独立 DOM 容器，锚点落地于整站 top/main）

## 替换占位内容的约定
- 轮播 Banner：`.banner-slide` 共 4 张，占位背景为 `.slide-bg-1..4` 深蓝渐变，替换为真实图片时改 `.banner-bg` 的 `background-image`
- 新闻公告：`.news-grid` 内 `.news-item`，缩略图用 `.news-thumb` 的 `--tone` 变量控制底色
- 学术前沿：`.frontier-item`，左侧大日期（`.date-day` / `.date-y`）
- 联系方式 / 快速通道：`.contact-item` / `.link-item`
- 团队概况数据：`.stat-num`（成员规模 30+ / 在研项目 20+ / 发表论文 50+）

## 注意
- 禁止使用 emoji 做图标，一律用图形/线条元素
- 主视觉始终深蓝，金色只做点缀，禁止金色大面铺陈
- 字体用系统无衬线堆栈，不引入外部字体
# AGENTS.md

## 项目概览
四川文理学院信息与生物医学交叉创新团队官网。高校科研机构信息型官网，纯静态站，风格对齐 https://fish.njtc.edu.cn/index.htm。

## 技术栈
- 原生 HTML + CSS + JS（无构建步骤）
- CSS：Flexbox + Grid 布局，全部颜色/间距/字号/圆角/阴影/动效通过 `:root` 下的 Design Token（CSS 变量）管理，禁止硬编码魔法值散落
- Token 体系（见 `styles/main.css`）：颜色（primary/neutral 色阶 50–900 + accent/danger/success/warning 备用）、间距 `--sp-xs~xl`(4/8/16/24/32)、字号 `--text-xs~3xl`、圆角 `--radius-sm~full`、阴影 `--shadow-sm~lg`、动效 `--dur-*`+`--ease`、焦点环 `--focus-ring`
- 布局：顶部蓝 Header + 学术蓝主导航 + 全宽轮播 Banner（仅首页）+ 两栏内容区（学术前沿/新闻公告，仅首页）+ 联系我们色块 + 快速通道色带 + 单行版权；子页面为「面包屑 + `.page-hero` 标题区 + `.sub-layout`（左侧栏目导航 `.sub-side` + 右侧内容 `.sub-main`）」，已填入虚拟内容

## 项目结构（多页面静态站）
- `index.html`：首页（主文件名必须保持 index.html），含轮播 Banner + 两栏内容区
- 导航子页面（`.sub-layout` 左侧栏目导航 `.sub-side`(`.sub-side-title`+`.sub-menu-item`) + 右侧内容 `.sub-main`(`.content-card`/`.content-title`/`.content-sub`)，内容为虚拟数据，可替换）：
  - `about.html` 团队概况(richtext 段落)、`research.html` 研究方向(dir-card 方向卡)、`members.html` 团队成员(member-card 网格)
  - `achievements.html` 科研成果(list-item 列表)、`frontier.html` 学术交流(list-item)、`contact.html` 联系我们(contact-grid+form)、`links.html` 资料下载(dl-item)
- 所有页面共享同一份头部（`.topbar`+`.navbar`）、移动端侧边抽屉（`.sidebar`）、页脚（`.footer`）与 `scripts/main.js`、`styles/main.css`；当前页对应 `.nav-item`/`.side-item` 加 `active` 高亮，面包屑指向 `index.html`
- 生成脚本：`/tmp/gen_pages.py`（临时，可据其模板手动编辑各子页面）
- `styles/main.css`：全部样式；组织顺序 重置 → Token → 工具 → 布局 → 组件 → 响应式（断点统一 1200/900/768/560）
- `styles/animations.css`：动效层（滚动进度条/打字机/fade-slide-up 渐入/轮播箭头/彩带 canvas/气泡/动作按钮），降级友好（`.reveal-init` 仅 JS 添加，无 JS 不白屏）
- `scripts/main.js`：原生 JS（IIFE + const/let），含轮播图（自动播放+左右箭头+暂停+指示器）、侧边抽屉、导航高亮、MORE+、rAF 节流（对无轮播/无锚点 section 的子页面均已空值保护）
- `scripts/animations.js`：原生动效引擎（IIFE），含滚动进度条、打字机、IntersectionObserver 渐入、Canvas 彩带粒子、复制邮箱/打招呼气泡；自动注入进度条、自动识别 `.news-item/.member-card/.content-card` 等卡片渐入，尊重 `prefers-reduced-motion`
- 引入 Tailwind CDN（`corePlugins.preflight:false`，置 body 末尾不阻塞首屏；站点栅格仍由本地 CSS 保证，Tailwind 仅作工具类增强）
- `DESIGN.md`：设计规范（Token 体系 / 组件规范 / A11y / 性能 / 禁忌）

## 运行命令
- 开发/预览：`python3 -m http.server ${DEPLOY_RUN_PORT} --bind 0.0.0.0`（由 `.coze` 的 dev.run 定义）
- 静态站无构建脚本，无 lint / tsc

## 关键交互
- 轮播图：`#bannerViewport` 内 `.banner-slide`，原生 JS 自动轮播间隔 4s，鼠标悬停暂停，左右箭头 `#bannerPrev/#bannerNext` 主动切换 + 底部指示器 + 暂停按钮
- 顶部 Header：深蓝底，桌面端左 logo+名称、右侧搜索框，桌面端下方为 `.navbar` 横向导航
- 移动端（≤768px）：桌面搜索框与 `.navbar` 隐藏，显示顶部 `.hamburger`（`#sidebarToggle`）点击后从左侧滑出侧边抽屉 `#sidebar`
  - 侧边抽屉 `#sidebar`：`.side-item` 菜单项，含 `.side-sub` 可展开子菜单（`.side-toggle` "+/−"切换）；底部 `.sidebar-search` 搜索框；遮罩 `#sidebarOverlay` 点击关闭；打开时 `body.menu-open`
  - 菜单项：首页/团队概况/研究方向/团队成员/科研成果/学术交流/联系我们/资料下载
- 面包屑导航：`.breadcrumb`（`.crumb`）位于 Banner 之下、内容区之上，首页默认「🏠 首页」
- MORE+：`.block-more.js-more`，`data-target` 指定滚动目标区块，点击平滑滚动到对应区域（后续可替换为真实列表页地址）
- 导航高亮：滚动时根据当前命中的 `#section` 区段高亮 `#navList` 内 `.nav-item`
  - 存在的 section id：`home` `about` `research` `members` `achievements` `frontier` `news` `contact` `links`
  - 其中 `frontier`=学术前沿、`news`=新闻公告、`contact`=联系我们、`links`=快速通道/资料下载；`about/research/members/achievements` 无独立 DOM 容器，锚点落地于整站 top/main

## 内容区块结构（替换占位约定）
- 轮播 Banner：`#bannerViewport` 内 `.banner-slide`，占位图为 Unsplash 学术/科研大图（实为 `<img>` 的 `.banner-bg`），替换时改 `src`
- 学术前沿（左栏 `.col-academic`）：`.acad-item` = `.acad-date`（`.date-md` 月.日大号 + `.date-yr` 年份）+ `.acad-title`
- 新闻公告（右栏 `.col-news`）：`.news-item` = `.news-thumb`（统一主色蓝底 + 白字 `.thumb-text`，不再用 `--tone`）+ `.news-tag`（`月.日 / 年` 标签）+ `.news-title` + `.news-brief`
- 联系我们（`.contact-band`）：左 `.contact-labs` 实验室名大字（`.lab-line`）+ 右 `.contact-meta` 联系方式（地址/邮编/邮箱/电话）
- 快速通道（`.quick-band`）：`.quick-list` 内 `<li>` 中的 `.quick-btn` 外链按钮，新增直接加 `<li>`
- 底部 `.footer-inner`：一行式版权

## 注意
- 禁止金色/黄色元素（参考站为纯净蓝白学术风）
- 禁止 emoji 图标（用文字/线条/色块表达）
- 主色始终学术蓝 `#1a4a7a`（避免偏黑），背景以白为主
- 字体用系统无衬线堆栈，不引入外部字体
- 配色统一改 `:root` 变量，勿散落硬编码
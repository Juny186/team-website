# DESIGN.md

## 项目与用户画像
- 产品：四川文理学院信息与生物医学交叉创新团队官网
- 属性：高校科研机构官网，需传递「学术、严谨、可信、前沿」的气质
- 参考原型：https://fish.njtc.edu.cn/index.htm（简洁、正式、学术化的高校重点实验室门户站）

## 品牌与视觉方向
- 气质与意象：高校重点实验室门户站——克制的学术蓝 + 大面积留白，信息密度高、秩序清晰；页面透出「严谨、专注、持续产出」的科研节奏感
- 视觉策略：白底为主，深蓝（偏学术蓝，非死黑深蓝）用于导航、日期块与色块强调；无装饰性花哨图形，以细线、色块、下划线铺陈秩序；日期块使用蓝/灰双色块，呼应参考站

## Design Token 体系（全部收敛于 `styles/main.css` 的 `:root`，禁止散落硬编码魔法值）

### 颜色（色阶 50–900）
- 主色 primary（学术蓝）：50 `#eef3f9` → 500 `#1a4a7a` → 900 `#0a2340`
  - 语义映射：`--color-primary`(500) 导航底/标题/日期块/色块；hover/active 用 700/800
- 中性 neutral（灰阶）：50 `#fafbfc` → 400 `#b8bec9` → 800 `#41464e`/900 `#2a2e34`
  - `--color-text`(800)、`--color-text-sub`(600)、`--color-border`(200)、`--color-surface-muted`(100)
- 语义色 —— 备用占位（当前页面未直接使用，按需取用）：
  - accent（强调蓝）：`--c-accent-500 #1f4f96`（日期块蓝）
  - danger：`#d64545 / #b03a3a`；success：`#2e8b57`；warning：`#d9941a`
- 旋转面映射：`--color-bg`(neutral-50)、`--color-surface`(#fff)、`--color-side-bg #eef2f7`、`--color-side-hover #e3eaf2`
- **命名约定（重要，防透明 bug）**：`:root` 中真实色阶定义为 `--c-{primary|neutral|accent|danger|success|warning}-{50..900}`（`c-` 前缀）；代码里使用的 `--color-{name}-{n}`（如 `--color-primary-700`、`--color-neutral-100`）以及 `--color-primary-deep`、`--color-white`、`--color-focus`、`--color-surface-hover` 均为 `:root` 末尾统一定义的**别名**，经 `var()` 映射到 `--c-*`。新增颜色**只能**引用已在 `:root` 定义的变量名——若使用未定义变量，`background` 会静默解析为透明，元素"消失"

### 间距（4px 基线）
- `--sp-xs 4 / sm 8 / md 16 / lg 24 / xl 32`

### 字号
- `--text-xs 12 / sm 13 / base 14 / lg 16 / xl 20 / 2xl 26 / 3xl 34`

### 圆角
- `--radius-sm 2 / md 6 / lg 10 / full 9999`（参考站硬朗直角风格，整体偏小圆角）

### 阴影（层次分级）
- `--shadow-sm`（浅：卡片）、`--shadow-md`（中：弹层）、`--shadow-lg`（深：侧边抽屉等悬浮遮罩）
- 侧边抽屉专用：`--sidebar-shadow`

### 动效 token（统一时长与缓动）
- 时长：`--dur-fast 0.15s` / `--dur-base 0.25s` / `--dur-slow 0.32s` / `--dur-carousel 0.75s`
- 缓动：`--ease` / `--ease-in-out`（所有 transition 统一引用，不再各处写死数值）

### 字体
- `--font-family`：`"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif`（系统无衬线堆栈，不引入外部字体）

## 组件规范（可复用 class，避免内联样式）
- 布局容器：`.container`（宽 1200px）；两栏 `.cols`（5fr:7fr）、中间主区 `.main-col`
- 板块：`.block` + `.block-head`（标题下划线 + 右侧 `.block-more` MORE+）
- 日期块：`.acad-date`（蓝底，`.date-md` 月.日大号 + `.date-yr` 年份）
- 按钮：`.quick-btn`（快速通道外链）、`.search-btn`、`.banner-dot`、`.hamburger`
- 搜索框：`.search`／`.sidebar-search`（内部 `.search-input` + `.search-btn`）
- 新闻条目：`.news-item`（`.news-thumb` 蓝底缩略图 + `.news-body` 内 `.news-tag`/`.news-title`/`.news-brief`）
- 缩略图色块统一为 `.news-thumb`（主色底 + 白字 `.thumb-text`），不再用内联 `--tone` 分散色值

## 状态样式（所有交互元素补齐）
- 通用焦点环：`a/button/input:focus-visible` → `--focus-ring`（3px 主色半透明）
- hover/active/disabled：搜索按钮、导航项、侧边项、轮播指示器、快速通道按钮均具备
- 触控目标：按钮/链接点击区 ≥ 44px

## 布局与响应式
- 顶部 Header（深蓝底）：左 Logo 徽章 + 团队名称；桌面右侧搜索框；移动端右侧汉堡按钮
- 主导航：学术蓝整条横贯，白字，hover 白色下划线由左向右生长；移动端折叠为侧边抽屉
- Banner：全宽大图轮播，图片铺满（`aspect-ratio` 预留防 CLS），右下角指示器 + 左上角暂停按钮（无左右箭头）
- 中间两栏：左「学术前沿」+ 右「新闻公告」（5fr:7fr），标题带下划线，MORE+
- 学术前沿：左侧蓝色日期块（月.日 大号 + 年份）+ 右侧标题
- 新闻公告：左侧缩略图，右侧「月.日 / 年份」标签 + 标题 + 摘要
- 联系我们：独立学术蓝色块（实验室名称大字纵排 + 右 2 列联系方式网格）
- 快速通道：整宽浅灰带外链按钮；页脚一行式版权深蓝底白字
- 断点统一：1200px（缩轮播比例）/ 900px（两栏→单栏）/ 768px（折叠导航、显示汉堡）/ 560px（极窄窄屏单列）
- 支持 `prefers-reduced-motion`：动画近零时长

## 交互与状态
- 轮播：自动播放 4s（`visibilitychange` 暂停后台）；opacity 淡入淡出；鼠标悬停暂停；暂停按钮可键盘触发；指示器为 button，`role=tab`+`aria-selected`
- 侧边抽屉：左滑动画，遮罩点击 / ESC / 关闭按钮关闭，打开锁定 body 滚动，焦点移入关闭按钮，`aria-expanded` 同步
- 导航高亮：滚动用 rAF 节流，命中 `#section` 高亮顶部导航与侧边菜单
- MORE+：灰色右对齐，hover 变学术蓝，`scrollIntoView` 平滑滚动到对应区块（占位）

## 可访问性 A11y
- 语义化：skip-link 跳主内容、header/nav/main/section/article/aside/footer
- 轮播：`aria-live="polite"`、`role="group"`、`aria-roledescription`、图片 alt
- 对比度：正文 `#41464e` 于白底 ≥ 4.5:1；白字于深蓝底满足 AA
- 键盘：所有可交互元素可 Tab、有清晰焦点指示；菜单带 `role`/`aria-expanded`

## 性能
- 首屏轮播首图 `fetchpriority="high"`，其余轮播图 `loading="lazy"`；外部图片指定 `width/height` 防 CLS
- 轮播容器 `aspect-ratio` 预留高度；动画仅用 opacity/transform 避免重排
- 滚动高亮用 rAF 节流；IIFE 隔离变量避免全局污染

## 设计禁忌
- 拒绝任何金色 / 黄色 / 科技蓝紫霓虹元素（参考站为纯净蓝白学术风），因此 danger/warning 语义色仅作状态备用不用于装饰
- 禁止超大圆角、玻璃拟态、渐变炫光装饰；禁止 emoji 图标（用文字/线条/色块）
- 禁止字体过大或过空、禁用商业花哨字体；深蓝不必偏黑，信息排版紧凑、密度高
- 禁止内联 style 硬编码颜色（统一走 class + token）
# 规范：`gongwen.css` — 网页公文版式（GB/T 9704—2012）

本文面向维护者，规定 `gongwen.css` 必须实现的行为、每项行为的标准依据，以及当前实现与标准的已知差异。如何安装、编写和打印公文见 [README](README.md)；README 不重复本文的实现细节，本文也不重复 README 的使用说明。若规范与实现不一致，须修正其中一方。

项目将 Less 编译为 CSS，无运行时依赖；需要 JavaScript 才能实现的排版行为不在项目范围内。

**标准依据：** [GB/T 9704—2012《党政机关公文格式》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=F3CC9BEF482524C895FDA7A08BB4A70E)（2012-06-29 发布，2012-07-01 实施，代替 GB/T 9704—1999）。下文“第 x 条”均指该标准的条款。标准要求优先于本项目的实现选择；标准未规定的数值（如专栏边框、版记行高）以本文为准。

## 文件

| 文件 | 用途 |
|---|---|
| `src/gongwen.less` | 样式表源文件，通过 `npm run build` 使用 Less 编译。 |
| `dist/` | 生成的 Pages 站点，包含编译后的 `gongwen.css`、示例、指南及以指南为内容的首页。不提交到版本库。 |
| `scripts/build.mjs` | 编译样式表、渲染 Markdown 示例并生成公开站点。 |
| `scripts/render-sample.mjs` | 解析 YAML front matter、Markdown 和专栏容器，生成版记并填充模板。 |
| `samples/*.md` | 独立验证示例，包含 YAML front matter 和 Markdown 正文。`samples/Protection_and_inheritance_of_intangible_cultural_heritage.md` 是完整长文示例，用于核验分页、专栏、附件和版记。 |
| `src/markdown-template.html` | 示例 HTML 模板，内含宿主页面 CSS，引用 `gongwen.css` 排版正文。 |
| `src/guide.css` | 编写指南的全部页面样式（界面布局及预览纸张），`src/guide.html` 不含内嵌 `<style>`。 |
| `src/guide.html` | 中文帮助页面，每种元素提供一个示例。每个示例仅在 `<template>` 中编写一次，由内联脚本克隆到 `.gongwen` 实时预览中，并将转义后的源码写入旁边的 `<pre>`（双栏布局，宽度低于约 900px 时改为单栏）。指南自身的 CSS 只调整预览纸张的几何尺寸，其界面选择器不得匹配 `.gongwen` 内部元素。 |
| `README.md` | 面向使用者和贡献者：安装、编写约定、可选类钩子、自定义参数、打印方法和开发命令。 |
| `SPEC.md` | 本文。面向维护者：实现规则、标准条款对照和已知差异。 |
| `LICENSE` | MIT 许可证。 |

## 标准条款对照

条款内容摘自标准正文。“状态”中的“实现”表示已按条款实现；“差异”表示已实现但与条款不完全一致，详见“已知差异”；“范围外”表示不提供样式。

| 条款 | 标准要求 | 本项目实现 | 状态 |
|---|---|---|---|
| 3.1 字 | 一字指一个汉字宽度的距离 | `--gw-char`：版心宽 156mm 均分为 28 字；所有缩进以其为单位，不使用 `em` | 实现 |
| 3.2 行 | 一行指一个汉字高度加 3 号汉字高度 7/8 的距离 | 按第 5.2.3 条“每面 22 行并撑满版心”均分版心高度，见下文“行距” | 差异 |
| 4 | 纸张定量、白度、耐折度等 | 印刷材料要求 | 范围外 |
| 5.1 | A4，210mm×297mm | `@page { size: A4 }`，屏幕纸张宽 210mm | 实现 |
| 5.2.1 | 天头 37mm±1mm，订口 28mm±1mm，版心 156mm×225mm | 页边距上 37、右 26、下 35、左 28mm | 实现 |
| 5.2.2 | 各要素一般用 3 号仿宋体字 | 根元素仿宋 16pt | 实现 |
| 5.2.3 | 一般每面 22 行、每行 28 字，并撑满版心 | `--gw-lines: 22`、`--gw-chars: 28` | 实现 |
| 5.2.4 | 文字颜色均为黑色 | 文字颜色继承自宿主页面 | 差异 |
| 6 | 制版、印刷、装订 | 印制环节 | 范围外 |
| 7.1 | 版心内分为版头、主体、版记；页码位于版心外 | 主体与版记由正文和 `footer` 构成；页码在 `@page` 底部边距框中 | 实现 |
| 7.2 | 份号、密级、紧急程度、发文机关标志、发文字号、签发人、红色分隔线 | 不提供版头样式 | 范围外 |
| 7.3.1 | 标题一般用 2 号小标宋体字，分一行或多行居中排布 | 小标宋 22pt、居中；多行标题使用 `<br>`，梯形或菱形排列由作者断行 | 实现 |
| 7.3.2 | 主送机关在标题下空一行，居左顶格，回行仍顶格 | 标题下外边距 1 行；主送机关缩进为 0 | 实现 |
| 7.3.3 | 正文 3 号仿宋，段首左空二字、回行顶格；层次序数“一、”“（一）”“1.”“（1）”，依次黑体、楷体、仿宋、仿宋 | `p` 首行缩进 2 字；`h2`–`h5` 自动编号和对应字体 | 实现 |
| 7.3.4 | 附件说明在正文下空一行左空二字；多个附件用阿拉伯数字编号；回行与上一行附件名称首字对齐 | 上外边距 1 行，左内边距 2 字；两个及以上附件自动编号并悬挂对齐 | 实现 |
| 7.3.5.1 | 加盖印章时成文日期一般右空四字，署名以成文日期为准居中 | `.gw-sealed`：右外边距 4 字，署名在日期上方居中，上方留 3 行盖章空间 | 实现 |
| 7.3.5.2 | 不加盖印章时正文下空一行右空二字编排署名；日期首字比署名首字右移二字 | 下空一行、右空二字；署名与日期居中对齐 | 差异 |
| 7.3.5.3 | 加盖签发人签名章的公文 | 不提供专用样式 | 范围外 |
| 7.3.5.4 | 成文日期年月日标全，月、日不编虚位 | 由内容负责；示例构建脚本生成的印发日期符合此规则 | 实现 |
| 7.3.5.5 | 空白处不足时可调整行距、字距 | 通过 `--gw-lines`、`--gw-chars` 等参数调整 | 实现 |
| 7.3.6 | 附注居左空二字加圆括号，编排在成文日期下一行 | 无专用元素；普通 `p` 的首行缩进即左空二字 | 实现 |
| 7.3.7 | 附件另面编排；“附件”及顺序号 3 号黑体顶格于版心第一行；附件标题居中于版心第三行 | `section` 打印时另起一页；顺序号黑体顶格；标题上下各空一行，位于第三行 | 实现 |
| 7.4.1 | 版记分隔线与版心等宽；首、末条用粗线（推荐 0.35mm），中间用细线（推荐 0.25mm）；末条与最后一面版心下边缘重合 | 粗线 0.35mm、细线 0.25mm；打印时末条线下边缘与版记页版心下边缘重合 | 实现 |
| 7.4.2 | 抄送机关 4 号仿宋，左右各空一字；回行与冒号后首字对齐；末尾标句号 | 4 号仿宋、左右内缩 16pt；回行不悬挂对齐 | 差异 |
| 7.4.3 | 印发机关左空一字、印发日期右空一字，4 号仿宋，编排在末条分隔线之上；其他要素以细线隔开 | 印发行两端对齐排布，固定为最后一行，直接位于末条线之上；初校/终校等其他要素排在其上，以细线隔开 | 实现 |
| 7.5 | 4 号半角宋体数字，左右各一条一字线；一字线上距版心下边缘 7mm；单页码居右空一字、双页码居左空一字；版记页前有空白页的，空白页和版记页均不编页码；附件页码连续 | 宋体 14pt、`—n—`；一字线上距版心下边缘 7mm；单页居右、双页居左各空一字（14pt）；页码连续。版记页页码隐藏条件见“已知差异” | 差异 |
| 8 | 横排表格的页码位置与表头方向 | 不支持横排页面 | 范围外 |
| 9 | 计量单位、标点符号、数字用法 | 由内容负责 | 范围外 |
| 10 | 信函、命令（令）、纪要格式 | 不提供特定格式；信函格式首页不显示页码（第 10.1 条）可用 `gw-no-first-page-number` 实现 | 范围外 |

## 架构

- `@font-face` 规则位于顶层。其余规则均位于 `@layer gongwen` 内，因此宿主站点未分层的 CSS 始终具有更高优先级。若要让公文规则优先于站点基础样式，站点需声明 `@layer base, gongwen;`。
- 公文规则位于 `@scope (.gongwen) to (.gw-raw)` 内，在 `:scope { … }` 下使用 Less 嵌套编写（构建时展开）。选择器显式写出 `:scope`/`&`，以保留类钩子（`.gw-nonum`、`.gw-sealed` 等）所依赖的选择器优先级。
- 根元素修饰类使用根元素上的复合选择器（`&.gw-no-first-page-number`），而非后代选择器。
- `@page` 规则位于样式层内、`@scope` 外。该层中的规则均不使用 `!important`。
- **纸张样式的职责。** `gongwen.css` 只设置 A4 纸张及其文字的样式：尺寸、页边距（用内边距实现）、文字排版及打印线条。除下文的非正式公文声明外，不设置颜色、背景、阴影或位置。文字和线条使用继承的颜色（线条使用 `currentColor`）。纸张周围的所有样式均由宿主页面负责（内嵌 `<style>` 或独立样式表均可），见“宿主页面的职责”。
- 浏览器支持：`@scope`（Chrome 118+、Safari 17.4+、Firefox 146+），页面边距框（Chromium 131+）。

## 根元素上的参数

| 参数 | 值 | 含义 |
|---|---|---|
| `--gw-font-size` | `16pt` | 三号 |
| `--gw-lines` | `22` | 普通版心的正文行框数 |
| `--gw-page-slack` | `2pt` | 每页为专栏边框及打印取整预留的高度 |
| `--gw-line` | `calc((225mm - var(--gw-page-slack)) / var(--gw-lines))` | 扣除预留高度后均分的 CSS 行距，约 28.90pt，见下文“行距” |
| `--gw-chars` | `28` | 每行字数 |
| `--gw-char` | `calc(156mm / var(--gw-chars))` | 单字占用宽度（约 15.793pt）；所有缩进均为其倍数，不使用 `em` |
| `--gw-box-char` | `calc((156mm - 21.1pt) / 25)` | 专栏单字占用宽度：156mm 减去 2×4.4pt 外边距、2×5.4pt 内边距及 2×0.75pt 边框后，容纳 25 字 |
| `--gw-att-marker` | `calc(1 * var(--gw-char))` | 附件列表中 `1.` 编号的宽度；附件达到 10 个时应增大倍数（如 `1.5`） |

### 行距

第 3.2 条将一行定义为一个汉字高度加 3 号汉字高度的 7/8；3 号字为 16pt 时约为 30pt，22 行约 232.8mm，超出 225mm 版心。第 5.2.3 条同时要求每面 22 行并撑满版心，因此本项目以版心高度均分（225mm÷22≈28.94pt）为准，再扣除 `--gw-page-slack` 预留量，得到约 28.90pt。

## 字体

- `"GW Song"`：通过 `@font-face` 的 `src: local()` 引用 SimSun、宋体、NSimSun、STSong、Songti SC Regular、Noto Serif CJK SC Regular、NotoSerifCJKsc-Regular 和 Source Han Serif SC Regular。必须使用准确的字体全名或 PostScript 名称：在 Linux 上，仅写 `"Noto Serif CJK SC"` 会解析为 ExtraLight 字重。
- `"GW Latin"`：使用相同的字体来源，并设置 `unicode-range: U+0021-007E`。排除 U+0020，使方正字体仍作为计算行度量的主字体。数字、专栏编号、版记日期等 ASCII 字符统一使用宋体字形，与第 7.5 条页码用半角宋体一致。
- 字体栈（`--gw-font-*`）：
  - 仿宋（fangsong）：`"GW Latin", "方正仿宋_GBK", "FZFangSong-Z02", "仿宋_GB2312", "仿宋", FangSong, STFangsong, "FangSong_GB2312", serif`
  - 黑体（hei）：`"GW Latin", "方正黑体_GBK", "FZHei-B01", "黑体", SimHei, "Heiti SC", STHeiti, "Noto Sans CJK SC", "Source Han Sans SC", sans-serif`
  - 楷体（kai）：`"GW Latin", "方正楷体_GBK", "FZKai-Z03", "楷体_GB2312", "楷体", KaiTi, STKaiti, "Kaiti SC", serif`
  - 小标宋（xbs）：`"方正小标宋_GBK", "方正小标宋简体", "FZXiaoBiaoSong-B05S", "华文中宋", STZhongsong, "宋体", SimSun, "Noto Serif CJK SC", serif`
  - 宋体（song）：`"GW Song", "宋体", SimSun, "Songti SC", STSong, "Noto Serif CJK SC Regular", "NotoSerifCJKsc-Regular", "Source Han Serif SC Regular", serif`
- `@page` 边距框不继承自定义属性，因此生成的 CSS 在此处直接写出页码字体栈。

正文内 `strong`、`em` 设置 `line-height: 0`，由段落本身提供固定行框，避免黑体、楷体与仿宋混排时字体度量撑高行框。

## 根元素 `.gongwen`

- 文字排版：仿宋、`var(--gw-font-size)`、正常字重、`line-height: var(--gw-line)`、`letter-spacing: calc(var(--gw-char) - var(--gw-font-size))`（约 -0.207pt，使 28 个全宽汉字填满 156mm）、`text-align: justify`、`hanging-punctuation: allow-end`（仅 Safari 支持）、`text-autospace: normal`（在汉字与拉丁字母或数字之间加入 ⅛em 间距，标点旁不加；Chrome 140+、Safari 18.4+ 支持，其他浏览器忽略）、`line-break: strict`、`word-break: normal`、`overflow-wrap: break-word`、`counter-reset: gw-h2 gw-h3 gw-h4 gw-h5`。所有后代元素及其伪元素均设置 `box-sizing: border-box`。
- 纸张：`width: 210mm; padding: 37mm 26mm 35mm 28mm`。
- `p`：`margin: 0; text-indent: calc(2 * var(--gw-char))`。

## 元素：HTML5 约定 → 可选类钩子

在单个 `<article class="gongwen">` 内使用语义化 HTML5 编写内容。无法遵循约定的标记可使用 `gw-*` 类作为可选钩子；旧的基于类的标记应与遵循约定的标记呈现相同效果。

| 公文元素 | 约定 | 类钩子 | 规则 |
|---|---|---|---|
| 公文标题 | `> header > h1`、`> h1` | `.gw-title` | 小标宋 22pt（二号）、正常字重、居中、缩进为 0、`line-height: var(--gw-line)`、`margin: 0 0 var(--gw-line)`。多行标题使用 `<br>`。 |
| 主送机关 | `> header > h1 ~ p` | `.gw-addressee` | 缩进为 0 |
| 正文-无缩进 | `header`、`footer`、`address`、`dl` 内的 `p`；表格单元格 | `.gw-noindent` | 缩进为 0 |
| 标题1 一、 | `h2` | — | 黑体；`::before counter(gw-h2, simp-chinese-informal) "、"`；`break-after: avoid; break-inside: avoid` |
| 标题2 （一） | `h3` | — | 楷体；`::before "（" counter(gw-h3, simp-chinese-informal) "）"` |
| 标题3 1. | `h4` | — | 仿宋；`::before counter(gw-h4) "."` |
| 标题4 （1） | `h5` | — | 仿宋；`::before "（" counter(gw-h5) "）"` |
| 取消编号 | — | 在 h2–h5 上使用 `.gw-nonum` | `counter-increment: none`、`::before { content: none }` |
| 黑体引导语 | `strong` | — | 黑体、正常字重 |
| 楷体引导语 | `em` | `strong.gw-kai` | 楷体、正体、正常字重 |
| 专栏 | `aside` | `.gw-box` | `margin: 0 4.4pt; border: 0.75pt solid currentColor; padding: 0 5.4pt; box-decoration-break: clone`（同时提供 Safari 使用的 `-webkit-` 形式）；`letter-spacing: calc(var(--gw-box-char) - var(--gw-font-size))`；`p` 缩进 `2 * --gw-box-char` |
| 专栏标题 | `aside > header` | `.gw-box .gw-box-title` | 黑体、居中、缩进为 0、`margin: 0 -5.4pt`（占满专栏宽度，下方无间隙）、`padding-top: 5pt; line-height: 25pt`、`border-bottom: 0.75pt solid currentColor`、`break-after: avoid` |
| 附件说明 | 包含 `<dt>附件：</dt>` 和若干 `dd` 的 `dl` | `.gw-attachment-note`（单个附件，使用 `p`）/ 包含 `.gw-attachments-label` + `ol > li` 的 `.gw-attachments`（多个附件） | 上外边距为 1 行；网格第一列宽 `5 * --gw-char`（放置标签，左内边距为 2 字），第二列放置条目。只有一个 `dd` 时不编号；两个及以上时（`dl:has(> dd + dd)`），每个条目使用宽度为 `--gw-att-marker` 的悬挂编号 `counter(gw-att) "."`，使换行后的文字与编号后的正文对齐。`.gw-attachment-note`：`padding-left: 5 chars; text-indent: -3 chars`。 |
| 落款（无印章） | 包含 `<span>署名</span><time>日期</time>` 的 `address` | 包含 `.gw-sign-org`、`.gw-sign-date` 的 `.gw-signoff` | `display: table`、`margin: var(--gw-line) calc(2 * var(--gw-char)) 0 auto`、正体；子元素为块级、居中、不换行、缩进为 0。右边缘距页边距 2 字，较短的一行相对于较长的一行居中。 |
| 落款（有印章） | `address.gw-sealed` | `.gw-signoff.gw-sealed` | 上外边距为 3 行，右外边距为 4 字；署名行设置 `display: flex; contain: inline-size; justify-content: center`，使整个块的宽度等于日期宽度，署名在日期上方居中。 |
| 附件 | `section` | `.gw-attachment-no` | 打印时设置 `break-before: page`。屏幕上紧接正文显示；页面分隔的视觉效果由宿主提供。重置标题计数器（`section` 使用 `counter-reset`，类钩子使用 `counter-set`）。 |
| 附件顺序号 | `section > header > p` | `.gw-attachment-no` | 黑体、左对齐、缩进为 0、外边距为 0 |
| 附件标题 | `section > header > h1` | `.gw-attachment-title` | 小标宋 16pt、正常字重、居中、缩进为 0、`margin: var(--gw-line) 0`。相邻的类钩子标题消除彼此之间的外边距（使用 `+` 和 `:has(+ …)`）。 |
| 表格 | `table` | — | 宽度 100%、合并边框、上下边框为 `1.5pt solid currentColor`。单元格（`th`、`td`）：`padding: 0 5.4pt`、两端对齐、缩进为 0、`vertical-align: top`、`font: inherit; font-weight: normal`。表头行（`thead th`、`tr:first-child > th`）下边框为 `0.75pt`。唯一的竖线为 `:is(th, td):first-child { border-right: 0.75pt }`。单元格内的 `p` 缩进为 0。 |
| 版记 | `> footer`（最后一个子元素） | `.gw-banji` | 见下文。 |
| 退出公文样式 | — | `.gw-raw` | 见下文。 |

## 非正式公文声明

为防止冒用为正式公文，每页左右页边距中均显示竖向浅灰色（`#c8c8c8`）声明：“本页由 gongwen.css 项目排版生成，不得视为正式公文”。不提供取消该声明的类。

- 打印：使用基础 `@page` 的 `@left-middle` 和 `@right-middle` 边距框。左侧设置 `writing-mode: sideways-rl`，即整行旋转 90°，自上而下阅读；右侧设置 `sideways-lr`，旋转 270°，自下而上阅读；包括汉字在内的所有字符均旋转。需要 Chrome 132+；直接写出宋体字体栈，字号 9pt，`letter-spacing: 1pt`，居中。命名页面和空白页只清除底部边距框，因此包括版记页和空白页在内的每页都有声明。
- 屏幕：`--gw-mark-left` / `--gw-mark-right` 使用 SVG data URL，在左侧 28×297mm、右侧 26×297mm 的平铺图块中，通过 `transform='rotate(90 …)'` / `rotate(270 …)` 旋转横排文字；尺寸以 mm 为单位，并使用独立的字体列表。它们作为根元素的第三、第四层背景绘制（`left center` / `right center`、`repeat-y`、左侧 `28mm 297mm`、右侧 `26mm 297mm`、border-box）。默认值为 `none`，仅在 `@media screen and (min-width: 210mm)` 下设置，因此不会作为背景打印，也不会在窄屏上与正文重叠。`guide.html` 在小尺寸预览中关闭这两层背景。
- `src/gongwen.less` 中的 `@notice-text` 和 `@notice-color` 同时供两个打印边距框及两个 `--gw-mark-*` SVG 使用。
- 根元素的背景层顺序为 `var(--gw-debug-cols), var(--gw-debug-rows), var(--gw-mark-left), var(--gw-mark-right)`，背景定位区域和裁剪区域均为 `content-box ×2, border-box ×2`；最后一层按 border-box 裁剪，使宿主设置的 `background-color` 覆盖整张纸。

## 调试视图

`<article class="gongwen gw-debug">` 在不改变排版的情况下绘制以下内容：

- 字距网格（每隔 `--gw-char` 绘制一条竖线）和行距网格（每隔 `--gw-line` 绘制一条横线），通过 `--gw-debug-cols` / `--gw-debug-rows` 设置。它们是根元素的前两层背景，裁剪到内容框，并使用 `box-decoration-break: clone`，使每个打印页面重新开始绘制网格。
- 块级元素（`p, h1–h5, div, dl, dt, dd, ol, li, address, aside, header, footer, section, table, th, td, small`）上的 `0.5px dashed` 绿色轮廓线。
- 行内元素（`strong, em, span, time`）的黄色底色，以及自动生成编号（`h2–h5, li, dd` 的 `::before`）的紫色底色。

网格仅反映正文的字距和行距；专栏及版记使用各自的间距。宿主必须使用 `background-color` 设置纸张颜色，使用 `background` 简写会清除网格。

## 版记

- 容器：`page: gw-banji`、仿宋 14pt（四号）、`letter-spacing: 1pt`；屏幕上外边距为 2 行。
- 行（`footer > :is(p, small)`、`.gw-banji :is(p, small)`）：块级、`margin: 0; padding: 1.5pt 16pt 0; line-height: 25pt`、字号 14pt（行高 26.5pt，左右各内缩约 1 字，字形位于每条横线下方 8.2pt），缩进为 0。
- 行序（第 7.4.3 条）：抄送机关在前，初校/终校等其他要素居中，印发机关和印发日期行固定为最后一行。示例构建脚本按此顺序生成。
- 线条（第 7.4.1 条）：首行设置 `border-top: 0.35mm`（首条），后续每行设置 `border-top: 0.25mm`，末行设置 `border-bottom: 0.35mm`（末条），分别通过 `footer > :first-child`、`footer > * + *` 和 `footer > :last-child` 选择。在类钩子结构中，`.gw-banji-rows` 设置 0.35mm 的上下边框，`.gw-banji-rows > * + *` 设置 0.25mm 的分隔线。线宽由 `@banji-rule-thick`、`@banji-rule-thin` 设置，与表格线条无关。
- 印发机关/日期行：`footer > p:has(> time)` 或 `.gw-banji-issue` 设置 `display: flex; justify-content: space-between; gap: 1em`（`<p><span>印发机关</span><time>…印发</time></p>`）。
- 初校/终校行：`footer > small` 或 `.gw-banji-note`，与其他行规则相同，须放在印发行之前（类钩子结构中须放在 `.gw-banji-rows` 内）。
- `.gw-banji-cc` 是保留的旧标记，没有规则选择它，不产生效果。
- 打印：`break-before: left; break-inside: avoid; display: flex; flex-direction: column; justify-content: flex-end; height: 225mm; margin-top: 0`，使末条线与版心下边缘重合。版记位于偶数页底部；若正文已在偶数页结束，则插入空白页。调整页边距后，应重新检查版记页线条位置及分页。

## 使用 `.gw-raw` 退出公文样式

`gongwen.css` 的规则不匹配 `.gw-raw` 内部元素（带排除区域的作用域）：其中的 `h2` 不生成编号，也不递增计数器，`p` 不缩进。边界元素本身在样式层内、作用域外重置：`font: initial; letter-spacing: normal; word-spacing: normal; text-indent: 0; text-align: start; line-break: auto; hanging-punctuation: none; text-spacing-trim: initial; text-autospace: initial; overflow-wrap: normal; word-break: normal; white-space: normal; orphans: 2; widows: 2`。除非宿主另行设置样式，其内容使用浏览器默认样式。不支持在 `.gw-raw` 内嵌套 `.gongwen`。

## 打印

- `@page { size: A4; margin: 37mm 26mm 35mm 28mm }`。上、右、下、左页边距分别为 37、26、35、28mm，普通页面版心为 156×225mm，与屏幕纸张内边距一致。正文网格按每面 22 个行框、每行 28 个全宽汉字设置；标题、空行及特殊块会占用版面，实际正文行数不一定为 22。首行两字缩进占两个字位。
- `@media print`：根元素设置 `width: auto; max-width: none; margin: 0; padding: 0`（由 `@page` 页边距接管），以及 `orphans: 1; widows: 1`（关闭孤行控制，使每面按第 5.2.3 条排满版心）。
- `@page` 规则作用于全局：打印包含 `.gongwen` 的页面时，整个页面均使用公文纸张版式、页码和声明。
- 页码（GB/T 9704 §7.5）：`"—" counter(page) "—"`（U+2014，无空格）、宋体字体栈、14pt、`line-height: 1`、`vertical-align: top`。`padding-top: calc(7mm - 0.43 × 14pt)`：宋体一字线位于行框顶端以下约 0.43em，使一字线上距版心下边缘 7mm（`@page-number-rule-gap`）；该偏移量（`@page-number-dash-offset`）按宋体测得，使用回退字体时一字线位置可能略有不同。单页码 `@page :right` 使用 `@bottom-right`，右对齐并设置 `padding-right: 14pt`；双页码 `@page :left` 使用 `@bottom-left`，左对齐并设置 `padding-left: 14pt`，即各空一个 4 号字（`@page-number-indent`）。
- `@page :blank`、版记页以及根元素带有 `gw-no-first-page-number` 时的首页不显示页码。版记页使用 `@page gw-banji`，页边距与普通页面相同。隐藏首页页码通过 `page: gw-nofirst` + `@page gw-nofirst:first` 实现。默认每页均显示页码：第 7.5 条未规定首页例外，仅第 10.1 条信函格式首页不显示页码，且 CSS 无法判断文档是否只有一页。
- README 中的打印说明：选择 A4、100% 缩放、“默认”页边距，并关闭浏览器页眉页脚。

## 标点

桌面排版软件常根据换行位置压缩或悬挂行末标点，使一行容纳更多内容。CSS 无法实现这一行为：不能按行内位置选择字符，且 `text-spacing-trim` 需要方正 GBK 字体不具备的 `halt`/`chws` 字体特性。由于实现这一功能需要 JavaScript，因此不在项目范围内；换行位置可能与桌面排版软件的输出不同。已设置 `hanging-punctuation: allow-end`，但只有 Safari 会应用。标点用法本身（第 9 条，GB/T 15834）由内容负责。

## 宿主页面的职责

宿主页面负责纸张周围的展示样式，写在内嵌 `<style>` 或独立样式表中均可（不分层，因此优先于 `gongwen` 层）：

- 屏幕：页面背景、纸张背景和文字颜色、居中（`margin: 0 auto`）、`max-width: 100%`、阴影、窄屏内边距，以及可选的附件前分隔线（`.gongwen > section, .gongwen .gw-attachment-no`）。窄屏规则应使用 `@media screen and (max-width: 210mm)`；仅使用 `max-width` 查询也会匹配 A4 打印。
- 打印：设置 `html, body { margin: 0; padding: 0 }`，避免浏览器默认的 body 外边距使版心偏移，并设置白色背景。
- `src/markdown-template.html` 以内嵌 `<style>` 提供参考代码片段。`src/guide.html` 的预览纸张由独立样式表 `src/guide.css` 按相同职责划分设置样式；它不分层，因此无论引用顺序都优先于 `gongwen` 层。

## 不在项目范围内的功能

版头（第 7.2 条）、签发人签名章（第 7.3.5.3 条）、横排表格页面（第 8 条）、特定格式（第 10 条）、页眉、脚注、印章图像，以及基于 JavaScript 的排版（如标点压缩）。

## 验证

- 运行 `npm test` 和 `npm run build`，再使用无头 Chrome 打印 `dist/samples/Protection_and_inheritance_of_intangible_cultural_heritage.html`（`--virtual-time-budget=10000`）。调整页边距、行距或版记后须重新核验分页，不能将以往的页数视为固定要求。
- 对照“标准条款对照”逐项检查打印输出：页边距与版心、各级标题字体、编号顺序 `一、（一）（二）二、（一）`、首行缩进 2 字、落款位置、附件另面编排、页码左右交替且各空一字、一字线距版心下边缘 7mm、版记页和空白页无页码、版记末条线与版心下边缘重合，以及 0.75pt 专栏边框。
- `src/guide.html`：每个预览均正常呈现且与源码一致，`gw-raw` 示例不应用公文样式。

## 已知差异

以下为当前实现与标准条款的已知差异，尚未修改，不能据此宣称已全面符合标准：

- 第 3.2 条：行距按第 5.2.3 条均分版心，与“一行”的定义值不同，见“行距”。
- 第 5.2.4 条：未特殊说明的文字应为黑色；当前由宿主页面设置文字颜色。
- 第 7.3.5.2 条：无印章落款的日期首字应比署名首字右移二字，日期较长时日期右空二字并相应增加署名右空字数；当前将两行居中对齐。
- 第 7.4.2 条：抄送机关回行应与冒号后首字对齐；当前不悬挂对齐。左右内缩 16pt 略大于 4 号字的一字（14pt）。
- 第 7.5 条：仅当版记页前有空白页时，空白页和版记页才均不编页码；当前无条件隐藏版记页页码，适用范围比标准更宽。

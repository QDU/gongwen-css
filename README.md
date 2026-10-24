# gongwen-css

`gongwen-css` 为网页内容提供 [GB/T 9704—2012《党政机关公文格式》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=F3CC9BEF482524C895FDA7A08BB4A70E) 的公文版式。将一份公文放入单个 `<article class="gongwen">`，再引用样式表即可；使用时不需要 JavaScript 或运行时依赖。推荐使用 HTML5 结构，旧的 `gw-*` 类仍保留为可选钩子。在线查看[编写指南](https://qdu.github.io/gongwen-css/)（每种元素的写法和实时预览）和[示例列表](https://qdu.github.io/gongwen-css/samples/index.html)，其中[完整长文示例](https://qdu.github.io/gongwen-css/samples/Protection_and_inheritance_of_intangible_cultural_heritage.html)可直接打印预览。

本文面向使用者和贡献者，说明如何安装、编写、打印和构建。各项样式规则的实现细节、对应的标准条款及与标准的已知差异见 [SPEC.md](SPEC.md)。

## 安装与使用

```sh
npm install @qdu/gongwen-css
```

在打包工具中引入编译后的样式：

```js
import '@qdu/gongwen-css';
```

或在 Less 中引用源文件以覆盖构建期变量：

```less
@import '@qdu/gongwen-css/gongwen.less';
```

也可直接通过 [jsDelivr](https://www.jsdelivr.com/package/npm/@qdu/gongwen-css) CDN 使用。最新发布版本：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@qdu/gongwen-css@latest/dist/gongwen.css">
```

| 地址 | 内容 |
|---|---|
| `https://cdn.jsdelivr.net/npm/@qdu/gongwen-css@latest/dist/gongwen.css` | 最新发布版本 |
| `https://cdn.jsdelivr.net/npm/@qdu/gongwen-css@latest/dist/gongwen.min.css` | 最新发布版本，由 jsDelivr 自动压缩 |
| `https://cdn.jsdelivr.net/npm/@qdu/gongwen-css@0/dist/gongwen.css` | 0.x 中的最新版本，不会自动升级到不兼容的主版本 |
| `https://cdn.jsdelivr.net/npm/@qdu/gongwen-css@0.1.1/dist/gongwen.css` | 固定版本，内容永不改变 |

`@latest` 和 `@0` 等别名在发布后由发布工作流刷新 CDN 缓存，但浏览器可能缓存旧文件最长 7 天。正式站点建议使用固定版本号，升级时再手动修改。

### 与站点样式共存

公文规则位于 `@layer gongwen`，并用 `@scope` 限定在 `.gongwen` 内；宿主站点未分层的 CSS 优先级高于该层。若希望公文规则优先于站点全局基础样式，可在加载 `gongwen.css` 前声明层顺序，并把基础样式放入较早的层，例如：

```css
@layer base, gongwen;
@layer base {
  /* site-wide base styles */
}
```

将内容放进 `.gw-raw` 可退出公文样式作用范围；此处显示浏览器默认样式，除非宿主站点另行设置。不要在 `.gw-raw` 内嵌套 `.gongwen`，这种结构不受支持。

## 纸张与页面外观

`gongwen.css` 只负责 A4 纸本身：纸宽、页边距（以内边距实现）、文字排版和版记、表格等的线条。除下文的声明文字外，它不设置任何颜色、背景、阴影或纸张位置；文字和线条沿用继承的颜色（线条为 `currentColor`）。纸张放在页面上的样子（桌面背景、白纸、居中、阴影、窄屏边距、附件之间的屏幕分隔线）以及打印时清除 `body` 默认外边距，都由使用它的页面设置，可写在页面的 `<style>` 中，也可放在单独的样式表里。本项目两种方式都有：示例模板 `src/markdown-template.html` 使用内嵌 `<style>`，编写指南 `src/guide.html` 则引用独立的 `src/guide.css`（构建后为 `dist/guide.css`）。示例模板中的写法如下：

```html
<style>
  @media screen {
    body { margin: 0; background: #eee; }
    .gongwen { margin: 0 auto; max-width: 100%; background-color: #fff; color: #000; box-shadow: 0 2px 12px rgb(0 0 0 / 12%); }
    .gongwen > section, .gongwen .gw-attachment-no { margin-top: 60pt; border-top: 1px dashed #ccc; padding-top: 30pt; }
  }
  @media screen and (max-width: 210mm) {
    .gongwen { padding: 16px; box-shadow: none; }
  }
  @media print {
    html, body { margin: 0; padding: 0; background: #fff; }
  }
</style>
```

给纸张设白底时请用 `background-color`，不要用 `background` 简写，否则会清除 `gw-debug` 的网格。窄屏规则请写成 `@media screen and (max-width: 210mm)`；只写 `max-width` 会在 A4 打印时同样生效，破坏版心。

普通打印页面及屏幕纸张采用上37、右26、下35、左28mm的页边距，形成156×225mm版心。正文默认为三号仿宋（16pt）；Less 变量 `@body-font-size` 提供默认字号，CSS 属性 `--gw-font-size` 支持运行时覆盖。正文网格默认每面22行、每行28字，`--gw-lines: 22`、`--gw-chars: 28` 可调整；行距按225mm版心高度扣除每页2pt的边框及打印取整预留量后均分，约28.90pt（`--gw-page-slack` 可调整），字距约−0.207pt。标题、空行及特殊块会占用版面，首行两字缩进占两个字位。版记页仍保留校对行向下延伸11pt的特殊设置。

## 非正式公文声明

为防止冒用，每页左右页边距中都有浅灰色文字“本页由 gongwen.css 项目排版生成，不得视为正式公文”，整行旋转：左侧顺时针旋转 90°（自上而下读），右侧旋转 270°（自下而上读），汉字和英文一同旋转。打印时由 `@page` 的左右中部边距框输出（需 Chrome 132+），每一页（含空白页和版记页）都有；屏幕上以背景图形式显示在纸张两侧（窗口窄于 210mm 时不显示）。文字和颜色在 `gongwen.less` 顶部的 `@notice-text`、`@notice-color` 中统一设置，两个打印边距框和屏幕 SVG 共用这些变量。

## HTML5 约定

| 公文内容 | 默认结构 / 选择器 | 效果 |
|---|---|---|
| 公文标题 | 根元素直接子级 `<header><h1>`，或直接子级 `h1` | 居中、二号小标宋 |
| 主送机关 | 标题后面的 `<header><p>` | 不缩进 |
| 正文 | `p` | 首行缩进两字 |
| 正文-无缩进 | `header`、`footer`、`address`、`dl` 内容及表格单元格 | 不缩进 |
| 标题1–4 | `h2`–`h5` | 自动编号“一、”“（一）”“1.”“（1）” |
| 黑体 / 楷体引导语 | `strong` / `em` | 黑体 / 正体楷体 |
| 专栏 | `aside`，标题为直接子级 `header` | 专栏边框和标题样式 |
| 附件说明 | `dl`，包含 `<dt>附件：</dt>` 和一个或多个 `dd` | 单个附件不编号；多个自动编号 |
| 落款 | `address` 内含署名 `span` 和日期 `time` | 右对齐，署名与日期居中对应 |
| 有印章的落款 | `<address class="gw-sealed">` | 为印章留白，署名居中于日期 |
| 附件 | `section` 内的 `header` 含顺序号 `p` 和标题 `h1` | 打印另起一页，标题计数器重置 |
| 表格 | `table`、`thead`、`th`、`td` | 三线表及首列竖线 |
| 版记 | 根元素最后的 `footer` | 版记专用页、三条分隔线和校对行 |

标题不要手动输入编号；使用 `h2`–`h5` 按层级编排。标题可加 `gw-nonum` 取消编号且不增加计数器。附件说明单个 `dd` 不编号，两个及以上自动编号；附件数量达到 10 个时，可在根元素调整 `--gw-att-marker`，例如 `style="--gw-att-marker: calc(1.5 * var(--gw-char))"`。

## 可选类钩子

通常只需使用上表中的语义化元素；无法采用默认结构或迁移旧标记时，可继续使用这些类：

| 用途 | 类 |
|---|---|
| 标题、主送机关、取消缩进 | `gw-title`、`gw-addressee`、`gw-noindent` |
| 楷体引导语 | `strong.gw-kai` |
| 专栏 | `gw-box`、`gw-box-title` |
| 附件说明 | `gw-attachment-note`、`gw-attachments`、`gw-attachments-label` |
| 落款 | `gw-signoff`、`gw-sign-org`、`gw-sign-date`、`gw-sealed` |
| 附件 | `gw-attachment-no`、`gw-attachment-title` |
| 版记 | `gw-banji`、`gw-banji-rows`、`gw-banji-cc`、`gw-banji-issue`、`gw-banji-note` |

根元素也可加 `gw-no-first-page-number` 隐藏首页页码；后续页仍按奇偶页显示。默认所有页面均显示页码。

## 调试视图

在根元素加 `gw-debug`（`<article class="gongwen gw-debug">`）可显示排版网格和元素框：蓝色竖线为字距网格，红色横线为行距网格，绿色虚线为块级元素，黄色底为行内元素，紫色底为自动编号。它只绘制背景和轮廓，不改变排版；打印预览中勾选“背景图形”可逐页查看。网格按正文字号和行距绘制，专栏和版记使用各自的字距行距。

## 字体与浏览器

正文优先使用方正仿宋_GBK，标题和引导语使用方正小标宋、黑体及楷体字体栈。ASCII 字母、数字和标点优先使用 SimSun（宋体）；建议安装 SimSun 以获得一致的字形。未安装时，会依次尝试宋体、NSimSun、STSong、Songti SC Regular、Noto Serif CJK SC Regular（含 `NotoSerifCJKsc-Regular`）和 Source Han Serif SC Regular。不同系统的字体可用性不同，字形可能略有差异。

汉字与 ASCII 字母、数字之间自动加入约 1/8 字宽的间距（`text-autospace: normal`），与标点相邻时不加；需要 Chrome 140+ 或 Safari 18.4+，其他浏览器不加间距。

Less 在构建时展开嵌套选择器；生成的 `gongwen.css` 仍使用原生 `@scope`（Chrome 118+、Safari 17.4+、Firefox 146+）。打印页码边距框需要 Chromium 131+。

## 打印

打印时选择 A4、100% 缩放和“默认”页边距，并关闭浏览器页眉页脚。页面需在打印样式中把 `html`、`body` 的外边距设为 0（见上文示例），否则浏览器默认外边距会使版心偏移。`@page` 规则作用于整个页面：打印含 `.gongwen` 的页面时，整页都按公文纸张、页码和声明文字输出。页码位于版心下方 7mm，奇数页居右空一字、偶数页居左空一字；版记另起偶数页，版记页及其前的空白页不显示页码。若启用 `gw-no-first-page-number`，仅首页页码隐藏。

## 标准符合情况

本样式覆盖标准中主体和版记的常用要素（标题、主送机关、正文层次、附件说明、落款、附件、版记、页码），不提供版头（份号、密级、发文机关标志、发文字号等）、签发人签名章及信函、命令、纪要等特定格式。部分细节尚未完全符合标准，例如无印章落款的日期未右移二字、版记页页码一律隐藏；完整对照见 [SPEC.md 的“标准条款对照”和“已知差异”](SPEC.md#标准条款对照)。

生成的页面两侧印有“不得视为正式公文”声明，见上文“非正式公文声明”。

## 开发

### 构建与预览

需要 Node.js 22+ 和 npm。样式源文件为 `src/gongwen.less`，不要直接编辑生成的 CSS。文件顶部的 Less 变量集中管理纸张尺寸、字体、线条、间距及声明文字；`--gw-*` CSS 自定义属性仍可在运行时覆盖。

```sh
npm ci
npm run build
python3 -m http.server 8000 --directory dist
```

打开 <http://localhost:8000/> 查看指南，`/samples/index.html` 查看示例列表，`/samples/quick-check.html` 快速验证，`/samples/Protection_and_inheritance_of_intangible_cultural_heritage.html` 查看完整打印示例。`dist/` 包含指南首页 `index.html`、`guide.html`、`guide.css`、生成的 `samples/*.html` 和编译后的 `gongwen.css`；HTML 中的相对链接也适用于 GitHub Pages 项目子路径。使用样式时复制 `dist/gongwen.css` 即可。源码中的 HTML 需构建后从 `dist/` 预览。

### Markdown 示例

所有独立示例正文放在 `samples/` 下的 `.md` 文件中，支持子目录。构建时使用 `src/markdown-template.html` 生成同路径的 `dist/samples/*.html`，并生成示例列表。`samples/index.md` 为列表页面保留，请勿使用。指南的元素教学示例仍保留在 `src/guide.html` 的 `<template>` 中。

示例模板内嵌的 `<style>` 负责纸张外观、导航和打印页面重置；公文正文通过 `gongwen.css` 排版。编写指南 `src/guide.html` 不内嵌样式，而是引用 `gongwen.css` 和 `guide.css`；指南的界面和预览纸张样式都在 `src/guide.css` 中修改。

每个示例必须提供 YAML front matter 的 `title`。模板会生成文章标题，正文从 `##`（一级正文标题）开始，依次使用 `###`、`####`、`#####`。版记字段可省略；提供 `banji` 时，`issuer` 和 `issued` 必填，`cc` 为可选列表，`proofread` 为可选的初校/终校信息。生成的版记按第 7.4.3 条排列：抄送、初校/终校、印发机关和印发日期（紧贴末条分隔线）：

```markdown
---
title: 公文示例
banji:
  cc: [有关单位]
  issuer: 示例办公室
  issued: "2026-10-24"
  proofread:
    initial: 张三
    final: 李四
---

## 正文标题

正文内容。

:::aside{title="专栏1　示例"}
**黑体引导语**：专栏内容。
:::
```

`:::aside{title="…"}` 生成 `<aside><header>…</header>…</aside>`，专栏内部支持 Markdown 段落，标题不参与正文编号。正文也支持可信的原生 HTML，以保留落款、附件等特殊结构。中文标点位于强调标记内部时，Markdown 的分隔符规则可能导致强调不生效；可将标点放到标记外，或使用 `<strong>`、`<em>`。

渲染使用 [markdown-it-container](https://github.com/markdown-it/markdown-it-container) 扩展和 [YAML](https://eemeli.org/yaml/) 解析器。运行 `npm test` 检查渲染、元数据转义及无效日期处理。

### GitHub Pages

在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。提交并推送项目后，`.github/workflows/pages.yml` 在针对 `main` 的 pull request 上只安装锁定的依赖、运行测试并构建；只有 `main` 分支有新提交时才发布 `dist/`。也可在 Actions 中从 `main` 手动运行工作流重新发布。部署地址可在工作流的 `github-pages` environment 中查看。

流程使用 GitHub 官方的 [Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)，通过内置 `GITHUB_TOKEN` 发布，无需添加个人访问令牌。

### 发布新版本

版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)：只修正样式偏差或文档时升修订号（patch）；新增元素、类钩子或参数时升次版本号（minor）；更改已有 HTML 约定、移除类钩子或改变默认版式而需要使用者修改标记时升主版本号（major）。

`main` 受分支保护，不能直接推送，版本号通过 pull request 修改，合并后再打标签：

```sh
git switch main && git pull
git switch -c release/vX.Y.Z
npm version patch --no-git-tag-version   # 或 minor、major：只更新 package.json 和 package-lock.json
git commit -am "Release vX.Y.Z"
git push -u origin release/vX.Y.Z
gh pr create --fill                       # CI 通过后合并
```

合并后在 `main` 的最新提交上打标签并推送：

```sh
git switch main && git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

推送 `v*` 标签后，`.github/workflows/publish.yml` 在 GitHub 环境 `npm` 中运行：安装依赖、运行测试、核对标签与 `package.json` 版本一致，然后构建并发布到 npm，最后刷新 jsDelivr 上 `@latest` 和主版本别名的缓存。环境 `npm` 只允许 `v*` 标签部署。发布通过 npm [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) 完成，无需在仓库中保存 npm 令牌，并自动附带来源证明（provenance）。

首次发布及发布配置（仅维护者需要一次）：

1. 以 npm 组织 `qdu` 成员身份执行 `npm login` 和 `npm publish` 发布首个版本。包名为 `@qdu/gongwen-css`，`publishConfig.access` 已设为 `public`，否则带作用域的包默认按私有包发布。
2. 在 GitHub 仓库 **Settings → Environments** 中创建环境 `npm`，**Deployment branches and tags** 选择 **Selected branches and tags** 并添加标签规则 `v*`。可选：添加 required reviewers，使每次发布须人工批准。
3. 登记 Trusted Publisher（会打开浏览器验证身份）：

   ```sh
   npm trust github @qdu/gongwen-css --repo QDU/gongwen-css --file publish.yml --env npm --allow-publish
   npm trust list @qdu/gongwen-css
   ```

   也可在 npmjs.com 的包页面 **Settings → Trusted Publisher** 中填写：组织 `QDU`、仓库 `gongwen-css`、工作流文件 `publish.yml`、环境 `npm`。仓库、工作流文件名和环境名须与工作流完全一致，否则发布会被拒绝。
4. 可选：在 **Settings → Publishing access** 中选择禁止使用令牌发布，使发布只能经由该工作流。

若发布工作流失败，通过 pull request 提交修正，再按上述步骤发布下一个修订号，跳过失败的版本号即可；已发布到 npm 的版本号不能重复使用，也不要改写已推送的标签。

### 分支保护

`main` 设有仓库规则集：禁止直接推送、强制推送和删除；所有改动须经 pull request 合并，且 CI 中的 `build` 检查须通过。规则对包括管理员在内的所有人生效。

### 参与贡献

欢迎提交 issue 和 pull request，流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)

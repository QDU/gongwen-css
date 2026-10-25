# 更新日志

## Unreleased

### 新增

- 可选脚本 `gongwen-xbs.js`：标题等小标宋节点优先用本地字体，否则按字加载远程 WOFF（共享 `GW XiaoBiaoSong` 族名与 `unicode-range`，并改写 name 表便于 PDF 识别），失败时恢复 `--gw-font-xbs-fallback`。
- 自定义属性 `--gw-font-xbs-fallback`，保留原先含宋体类的软回退栈。

### 变更

- `--gw-font-xbs` 收紧为仅小标宋字体名，去掉华文中宋 / 宋体等软回退。
- `gongwen-xbs.js` 列入 `sideEffects`；跳过标题内非小标宋后代（如 `strong`/`em`）；无 `document` 环境可安全调用。

## [0.1.2](https://github.com/QDU/gongwen-css/compare/v0.1.1...v0.1.2) - 2026-10-24

### 新增

- 提供由 Lightning CSS 构建的 `dist/gongwen.min.css`，并导出 `@qdu/gongwen-css/gongwen.min.css`。

### 修复

- 使用本地字体名称和 PostScript 名称匹配方正仿宋、黑体、楷体及小标宋，改善 macOS 上的字体加载。
- 修复 Chromium 打印分页时专栏底部边框被裁切的问题。
- 在 Firefox 和 Safari 中提示打印版式限制；打印时以浏览器要求提示替代公文，指引使用 Chrome 132+ 或 Edge 132+。
- 发布后等待新版本在 npm 上可见，再刷新 jsDelivr 版本别名缓存，避免重新缓存旧版。

## [0.1.1](https://github.com/QDU/gongwen-css/releases/tag/v0.1.1) - 2026-10-24

- 提供基于 GB/T 9704—2012 的公文样式，包括正文、标题编号、专栏、附件、表格、版记及打印页码。
- 提供 Less 源文件、编译后的 CSS、编写指南及 Markdown 示例构建。
- 按标准将公文文字和线条默认设为黑色。
- 配置 npm 发布、GitHub Pages 部署及 jsDelivr 样式引用。

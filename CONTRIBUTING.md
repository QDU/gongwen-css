# 参与贡献

感谢参与 gongwen-css。本项目为网页公文提供符合 [GB/T 9704—2012《党政机关公文格式》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=F3CC9BEF482524C895FDA7A08BB4A70E) 的样式表。提交前请先阅读：

- [README.md](README.md)：使用方法、HTML 约定和开发命令。
- [SPEC.md](SPEC.md)：每条样式规则的要求、对应的标准条款和已知差异。

## 报告问题

在 [GitHub Issues](https://github.com/QDU/gongwen-css/issues) 中提交，并尽量包括：

- 浏览器及版本、操作系统，以及是屏幕显示还是打印输出；
- 能重现问题的最小 HTML 或 Markdown 示例；
- 期望效果，与标准相关时注明条款号（如“第 7.4.1 条”）；
- 截图或打印输出，涉及尺寸时附上测量值。

## 开发环境

需要 Node.js 22+ 和 npm。

```sh
git clone https://github.com/QDU/gongwen-css.git
cd gongwen-css
npm ci
npm test
npm run build
python3 -m http.server 8000 --directory dist
```

打开 <http://localhost:8000/> 查看指南和示例。示例页面顶部的“调试视图”按钮可显示字距、行距网格和元素框。

## 项目结构

| 路径 | 内容 |
|---|---|
| `src/gongwen.less` | 样式表源文件。不要编辑生成的 `dist/gongwen.css`。 |
| `src/guide.html`、`src/guide.css` | 编写指南页面。 |
| `src/markdown-template.html` | Markdown 示例的页面模板。 |
| `samples/*.md` | Markdown 示例，构建为 `dist/samples/*.html`。 |
| `scripts/` | 构建脚本和 Markdown 渲染。 |
| `tests/` | `node --test` 测试。 |

## 提交 pull request

1. Fork 仓库并从 `main` 创建分支，分支名简要说明改动，如 `fix/page-number-indent`。
2. 一个 PR 只做一件事。较大的版式改动请先开 issue 讨论。
3. 修改样式时：
   - 改 `src/gongwen.less`，并同步更新 `SPEC.md` 中对应的规则、“标准条款对照”和“已知差异”；规范与实现必须一致。
   - 涉及标准的改动须注明条款号；标准未规定的数值请说明取值依据。
   - 若改变使用方式（HTML 约定、类钩子、参数），同步更新 `README.md` 和 `src/guide.html` 中的示例。
4. 修改构建或渲染脚本时，在 `tests/` 中补充测试。
5. 提交前运行：

   ```sh
   npm test
   npm run build
   ```

   并在 Chrome 中打印 `dist/samples/Protection_and_inheritance_of_intangible_cultural_heritage.html`（A4、100% 缩放、默认页边距、关闭页眉页脚），按 [SPEC.md 的“验证”](SPEC.md#验证)逐项检查。
6. PR 描述中说明改动内容、原因和验证方式；版式改动请附改动前后的截图或打印输出。
7. 不要在 PR 中修改 `package.json` 的版本号，发布由维护者负责（见 README 的“发布新版本”）。

CI（`.github/workflows/pages.yml`）会在每个 PR 上运行测试和构建，请确保全部通过。

## 编码约定

- 公文规则写在 `@layer gongwen` 和 `@scope (.gongwen) to (.gw-raw)` 内，不使用 `!important`，详见 SPEC 的“架构”。
- 缩进、间距以 `--gw-char`、`--gw-line` 为单位，不使用 `em`。
- 可调的数值放在 `src/gongwen.less` 顶部的 Less 变量中；需要运行时覆盖的使用 `--gw-*` 自定义属性。
- 注释简短，引用标准时写成 `§7.5` 的形式。
- 文档使用简体中文。

## 许可证

提交贡献即表示你同意以 [MIT 许可证](LICENSE)发布你的贡献。

import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import less from 'less';
import { transform } from 'lightningcss';
import { renderSample } from './render-sample.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(root, 'src/gongwen.less');
const { css } = await less.render(await readFile(source, 'utf8'), { filename: source, math: 'strict' });
// No browser targets: minify only, without lowering or dropping modern syntax such as @scope.
const { code: minified } = transform({ filename: 'gongwen.css', code: Buffer.from(css), minify: true });
const template = await readFile(resolve(root, 'src/markdown-template.html'), 'utf8');
const samples = resolve(root, 'samples');
const names = (await readdir(samples, { recursive: true })).filter(name => name.endsWith('.md')).sort();
const rendered = [];
for (const name of names) {
  const path = `samples/${name.replace(/\.md$/, '.html').split(sep).join('/')}`;
  const base = relative(dirname(path), '.').split(sep).join('/') + '/';
  const markdown = await readFile(resolve(samples, name), 'utf8');
  try {
    rendered.push({ path, ...renderSample(markdown, template, base) });
  } catch (error) {
    throw new Error(`${name}: ${error.message}`, { cause: error });
  }
}
if (rendered.some(sample => sample.path === 'samples/index.html')) throw new Error('samples/index.md is reserved for the generated sample list');

const output = resolve(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'samples'), { recursive: true });
await writeFile(resolve(output, 'gongwen.css'), css);
await writeFile(resolve(output, 'gongwen.min.css'), minified);
await copyFile(resolve(root, 'src/guide.html'), resolve(output, 'guide.html'));
await copyFile(resolve(root, 'src/guide.css'), resolve(output, 'guide.css'));
await copyFile(resolve(root, 'src/guide.html'), resolve(output, 'index.html'));
for (const sample of rendered) {
  const target = resolve(output, sample.path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, sample.html);
}
const links = rendered.map(sample => `<li><a href="${encodeURI(sample.path.slice('samples/'.length)).replaceAll('"', '%22').replaceAll('&', '&amp;')}">${sample.title}</a></li>`).join('\n');
await writeFile(resolve(output, 'samples/index.html'), `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>公文示例</title><link rel="stylesheet" href="../guide.css"></head>
<body><main class="guide"><h1>公文示例</h1><p><a href="../index.html">编写指南</a></p><ul>${links}</ul></main></body></html>`);
await writeFile(resolve(output, '.nojekyll'), '');
console.log(`Built dist/ with ${rendered.length} Markdown samples, guide, and compiled CSS.`);

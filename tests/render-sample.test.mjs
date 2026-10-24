import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSample } from '../scripts/render-sample.mjs';
const template = '<title>{{title}}</title><link href="{{base}}gongwen.css"><article>{{content}}{{banji}}</article>';
const sample = `---
title: '测试 <标题>'
banji:
  cc: [甲机关, 乙机关]
  issuer: 示例机关
  issued: "2026-09-01"
  proofread:
    initial: 张三
    final: 李四
---
## 正文标题

:::aside{title="专栏 <示例>"}
**黑体**：正文。

*楷体*：正文。
:::
`;
test('renders metadata, semantic columns and Markdown inside columns', () => {
  const { html } = renderSample(sample, template);
  assert.match(html, /<title>测试 &lt;标题&gt;<\/title>/);
  assert.match(html, /href="\.\.\/gongwen.css"/);
  assert.match(html, /<h2>正文标题<\/h2>/);
  assert.match(html, /<aside>\n<header>专栏 &lt;示例&gt;<\/header>/);
  assert.match(html, /<strong>黑体<\/strong>/);
  assert.match(html, /<em>楷体<\/em>/);
  assert.match(html, /<p>抄送：甲机关、乙机关。<\/p>/);
  assert.match(html, /<time datetime="2026-09-01">2026年9月1日印发<\/time>/);
  assert.match(html, /<small>初校：张三　　　终校：李四<\/small>/);
  assert(html.indexOf('</aside>') < html.indexOf('<footer>'));
  assert(html.indexOf('<p>抄送') < html.indexOf('<small>初校') && html.indexOf('<small>初校') < html.indexOf('<time'));
});
test('supports omitted footer and does not reprocess template syntax in content', () => {
  const { html } = renderSample('---\ntitle: 示例\n---\n{{title}}\n', template, './');
  assert.match(html, /<p>\{\{title\}\}<\/p>/);
  assert(!html.includes('<footer>'));
  assert.match(html, /href="\.\/gongwen.css"/);
});
test('rejects missing titles, malformed footer fields and invalid calendar dates', () => {
  assert.throws(() => renderSample('no front matter', template), /front matter/);
  assert.throws(() => renderSample('---\nfoo: bar\n---\n', template), /title/);
  assert.throws(() => renderSample(sample.replace('2026-09-01', '2026-02-30'), template), /valid date/);
  assert.throws(() => renderSample(sample.replace('[甲机关, 乙机关]', '甲机关'), template), /nonempty list/);
});

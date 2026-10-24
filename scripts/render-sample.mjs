import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import { parse } from 'yaml';

const md = new MarkdownIt({ html: true });
const escape = md.utils.escapeHtml;
const asidePattern = /^aside\{title="([^"\n]+)"\}$/;
md.use(container, 'aside', {
  validate: (info) => asidePattern.test(info.trim()),
  render(tokens, index) {
    if (tokens[index].nesting === -1) return '</aside>\n';
    const title = tokens[index].info.trim().match(asidePattern)[1];
    return `<aside>\n<header>${escape(title)}</header>\n`;
  },
});

function text(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a nonempty string`);
  return escape(value);
}

function renderBanji(banji) {
  if (banji === undefined) return '';
  if (!banji || typeof banji !== 'object' || Array.isArray(banji)) throw new Error('banji must be a mapping');
  const rows = [];
  if (banji.cc !== undefined) {
    if (!Array.isArray(banji.cc) || !banji.cc.length) throw new Error('banji.cc must be a nonempty list');
    rows.push(`<p>抄送：${banji.cc.map(value => text(value, 'banji.cc')).join('、')}。</p>`);
  }
  const issuer = text(banji.issuer, 'banji.issuer');
  const issued = text(banji.issued, 'banji.issued');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issued)) throw new Error('banji.issued must be YYYY-MM-DD');
  const date = new Date(`${issued}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== issued) throw new Error('banji.issued must be a valid date');
  if (banji.proofread !== undefined) {
    const initial = text(banji.proofread?.initial, 'banji.proofread.initial');
    const final = text(banji.proofread?.final, 'banji.proofread.final');
    rows.push(`<small>初校：${initial}　　　终校：${final}</small>`);
  }
  // GB/T 9704 §7.4.3: the issuer row sits directly on the last rule.
  const [year, month, day] = issued.split('-');
  rows.push(`<p><span>${issuer}</span><time datetime="${issued}">${year}年${Number(month)}月${Number(day)}日印发</time></p>`);
  return `<footer>\n${rows.join('\n')}\n</footer>`;
}

// Samples are trusted repository content; raw HTML supports specialized document elements.
export function renderSample(source, template, base = '../') {
  const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('Sample must start with YAML front matter');
  const metadata = parse(match[1]);
  const title = text(metadata?.title, 'title');
  const values = { title, base: escape(base), content: md.render(match[2]), banji: renderBanji(metadata.banji) };
  const html = template.replace(/\{\{(title|base|content|banji)\}\}/g, (_, key) => values[key]);
  return { title, html };
}

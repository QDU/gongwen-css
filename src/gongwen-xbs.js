/**
 * Optional XiaoBiaoSong helper for gongwen-css.
 *
 * Uses local 小标宋 when installed; otherwise loads per-glyph WOFFs from the
 * Founder shop CDN. On total load failure, restores --gw-font-xbs-fallback.
 *
 * Prefer a page-level Referrer-Policy of no-referrer (or equivalent meta) so
 * glyph requests are not blocked by CDN Referer ACL.
 */

const XBS_LOCAL_FAMILIES = [
  'GW XiaoBiaoSong',
  '方正小标宋_GBK',
  '方正小标宋简体',
  'FZXiaoBiaoSong-B05',
  'FZXiaoBiaoSong-B05S',
];

const GLYPH_BASE =
  'https://cdn1.foundertype.com/Public/shop1/Home/font/f219af0b538053a3b0254c8d1a19bcf0/FZXBSJW/';

const TARGET_SELECTOR = [
  '.gongwen > header > h1',
  '.gongwen > h1',
  '.gongwen section > header > h1',
  '.gongwen .gw-title',
  '.gongwen .gw-attachment-title',
].join(', ');

const faceCache = new Map();

export function glyphUrl(codePoint) {
  return `${GLYPH_BASE}${codePoint}.woff`;
}

export function glyphFamilyName(codePoint) {
  const name = `FZXBSJW_${codePoint}`;
  return /^[0-9]/.test(name) ? `fz${name}` : name;
}

function usesXiaoBiaoSong(el) {
  const family = getComputedStyle(el).fontFamily || '';
  return XBS_LOCAL_FAMILIES.some(name => family.includes(name));
}

/** Canvas probe: true when a named face changes metrics vs a monospace baseline. */
export function hasLocalXiaoBiaoSong(families = XBS_LOCAL_FAMILIES) {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const probe = '汉字HtmlWwＭ';
  const baseline = 'Courier New, monospace';
  ctx.font = `64px ${baseline}`;
  const baseWidth = ctx.measureText(probe).width;
  for (const family of families) {
    ctx.font = `64px "${family}", ${baseline}`;
    if (ctx.measureText(probe).width !== baseWidth) return true;
  }
  return false;
}

async function loadGlyphFace(codePoint) {
  const family = glyphFamilyName(codePoint);
  if (faceCache.has(family)) return faceCache.get(family);

  const pending = (async () => {
    const res = await fetch(glyphUrl(codePoint), {
      mode: 'cors',
      referrerPolicy: 'no-referrer',
    });
    if (!res.ok) throw new Error(`glyph ${codePoint}: HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const face = new FontFace(family, buffer);
    await face.load();
    document.fonts.add(face);
    return family;
  })();

  faceCache.set(family, pending);
  try {
    return await pending;
  } catch (error) {
    faceCache.delete(family);
    throw error;
  }
}

function collectTextNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !/[^\s]/.test(node.nodeValue)) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent || parent.closest('.gw-xbs-glyph, .gw-raw, script, style')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    nodes.push(node);
  }
  return nodes;
}

async function enhanceElement(el) {
  if (el.dataset.gwXbs) return el.dataset.gwXbs;

  if (hasLocalXiaoBiaoSong()) {
    el.dataset.gwXbs = 'local';
    return 'local';
  }

  // Soft Song stack while remote glyphs load or if they fail.
  el.style.fontFamily = 'var(--gw-font-xbs-fallback)';

  const textNodes = collectTextNodes(el);
  if (textNodes.length === 0) {
    el.dataset.gwXbs = 'fallback';
    return 'fallback';
  }

  const loads = [];

  for (const textNode of textNodes) {
    const text = textNode.nodeValue;
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      if (/\s/.test(ch)) {
        frag.appendChild(document.createTextNode(ch));
        continue;
      }
      const cp = ch.codePointAt(0);
      const span = document.createElement('span');
      span.className = 'gw-xbs-glyph';
      span.dataset.cp = String(cp);
      span.textContent = ch;
      frag.appendChild(span);
      loads.push(
        loadGlyphFace(cp).then(family => {
          span.style.fontFamily = `"${family}"`;
          return true;
        }).catch(() => false),
      );
    }
    textNode.parentNode.replaceChild(frag, textNode);
  }

  const results = await Promise.all(loads);
  const ok = results.some(Boolean);
  el.dataset.gwXbs = ok ? 'remote' : 'fallback';
  if (!ok) {
    el.style.fontFamily = 'var(--gw-font-xbs-fallback)';
  }
  return el.dataset.gwXbs;
}

export async function applyGongwenXbs(root = document) {
  if (typeof document === 'undefined') return [];
  await document.fonts.ready;
  const scope = root.querySelectorAll ? root : document;
  const targets = [...scope.querySelectorAll(TARGET_SELECTOR)].filter(usesXiaoBiaoSong);
  return Promise.all(targets.map(enhanceElement));
}

export const GongwenXbs = {
  apply: applyGongwenXbs,
  hasLocal: hasLocalXiaoBiaoSong,
  glyphUrl,
  glyphFamilyName,
  localFamilies: XBS_LOCAL_FAMILIES,
};

if (typeof window !== 'undefined') {
  window.GongwenXbs = GongwenXbs;
  const boot = () => {
    applyGongwenXbs().catch(error => console.warn('[gongwen-xbs]', error));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}

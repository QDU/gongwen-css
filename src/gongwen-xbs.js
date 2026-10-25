/**
 * Optional XiaoBiaoSong helper for gongwen-css.
 *
 * Uses local 小标宋 when installed; otherwise loads per-glyph WOFFs from the
 * Founder shop CDN under one shared family name (with unicode-range) so print
 * PDFs list a single recognizable face. On total load failure, restores
 * --gw-font-xbs-fallback.
 *
 * Prefer a page-level Referrer-Policy of no-referrer (or equivalent meta) so
 * glyph requests are not blocked by CDN Referer ACL.
 */

const XBS_LOCAL_FAMILIES = [
  'FZXiaoBiaoSong',
  '方正小标宋_GBK',
  '方正小标宋简体',
  'FZXiaoBiaoSong-B05',
  'FZXiaoBiaoSong-B05S',
];

/** CSS / PDF-facing family for all remote glyph faces. */
export const SHARED_FAMILY = 'FZXiaoBiaoSong';

/** PostScript name written into patched glyph files. */
export const SHARED_POSTSCRIPT = 'FZXiaoBiaoSong';

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

export function unicodeRangeFor(codePoint) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
}

/** @deprecated use SHARED_FAMILY; kept for callers/tests expecting a name helper. */
export function glyphFamilyName() {
  return SHARED_FAMILY;
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

function u32(view, offset, value) {
  view.setUint32(offset, value >>> 0);
}

function checksum(buf) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength - (buf.byteLength % 4));
  let sum = 0;
  for (let i = 0; i < view.byteLength; i += 4) {
    sum = (sum + view.getUint32(i)) >>> 0;
  }
  const rest = buf.byteLength % 4;
  if (rest) {
    let tail = 0;
    for (let i = 0; i < rest; i++) {
      tail = (tail << 8) | buf[buf.byteLength - rest + i];
    }
    tail <<= 8 * (4 - rest);
    sum = (sum + tail) >>> 0;
  }
  return sum;
}

async function woffToSfntAsync(woffBuffer) {
  const src = new DataView(woffBuffer);
  if (src.getUint32(0) !== 0x774f4646) throw new Error('not a WOFF font');
  const flavor = src.getUint32(4);
  const numTables = src.getUint16(12);
  const tables = [];
  let offset = 44;
  for (let i = 0; i < numTables; i++) {
    const tag = src.getUint32(offset);
    const tableOffset = src.getUint32(offset + 4);
    const compLength = src.getUint32(offset + 8);
    const origLength = src.getUint32(offset + 12);
    let data = new Uint8Array(woffBuffer, tableOffset, compLength);
    if (compLength < origLength) {
      if (typeof DecompressionStream === 'undefined') {
        throw new Error('WOFF inflate unsupported');
      }
      const ds = new DecompressionStream('deflate');
      const stream = new Blob([data]).stream().pipeThrough(ds);
      data = new Uint8Array(await new Response(stream).arrayBuffer());
      if (data.byteLength !== origLength) {
        throw new Error(`WOFF table inflate length mismatch (${data.byteLength} != ${origLength})`);
      }
    } else {
      data = data.slice();
    }
    tables.push({ tag, data });
    offset += 20;
  }
  return buildSfnt(flavor, tables);
}

function buildSfnt(flavor, tables) {
  tables = tables.slice().sort((a, b) => (a.tag >>> 0) - (b.tag >>> 0));
  const numTables = tables.length;
  const headerSize = 12 + numTables * 16;
  let dataSize = 0;
  for (const table of tables) {
    dataSize += (table.data.byteLength + 3) & ~3;
  }
  const out = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(out);
  const bytes = new Uint8Array(out);
  u32(view, 0, flavor);
  view.setUint16(4, numTables);
  // searchRange / entrySelector / rangeShift
  let sr = 1;
  let es = 0;
  while (sr * 2 <= numTables) {
    sr *= 2;
    es++;
  }
  view.setUint16(6, sr * 16);
  view.setUint16(8, es);
  view.setUint16(10, (numTables - sr) * 16);

  let dataOffset = headerSize;
  for (let i = 0; i < numTables; i++) {
    const table = tables[i];
    const dir = 12 + i * 16;
    u32(view, dir, table.tag);
    u32(view, dir + 4, table.origChecksum ?? checksum(table.data));
    u32(view, dir + 8, dataOffset);
    u32(view, dir + 12, table.data.byteLength);
    bytes.set(table.data, dataOffset);
    dataOffset += (table.data.byteLength + 3) & ~3;
  }
  return out;
}

function encodeUtf16BE(str) {
  const out = new Uint8Array(str.length * 2);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    out[i * 2] = c >> 8;
    out[i * 2 + 1] = c & 0xff;
  }
  return out;
}

function encodeLatin1(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
  return out;
}

/** Build a minimal Windows name table with a shared family / PostScript name. */
export function buildSharedNameTable(
  family = SHARED_FAMILY,
  postScript = SHARED_POSTSCRIPT,
) {
  const records = [
    { id: 1, data: encodeUtf16BE(family) },
    { id: 2, data: encodeUtf16BE('Regular') },
    { id: 4, data: encodeUtf16BE(family) },
    { id: 6, data: encodeUtf16BE(postScript) },
    // Mac Roman PostScript-ish fallback for picky consumers
    { id: 1, platform: 1, encoding: 0, lang: 0, data: encodeLatin1(family) },
    { id: 6, platform: 1, encoding: 0, lang: 0, data: encodeLatin1(postScript) },
  ];

  const count = records.length;
  const header = 6;
  const recordSize = 12;
  const stringOffset = header + count * recordSize;
  let stringsLen = 0;
  for (const r of records) stringsLen += r.data.byteLength;
  const buf = new Uint8Array(stringOffset + stringsLen);
  const view = new DataView(buf.buffer);
  view.setUint16(0, 0);
  view.setUint16(2, count);
  view.setUint16(4, stringOffset);
  let strOff = 0;
  for (let i = 0; i < count; i++) {
    const r = records[i];
    const base = header + i * recordSize;
    const platform = r.platform ?? 3;
    const encoding = r.encoding ?? 1;
    const lang = r.lang ?? 0x0409;
    view.setUint16(base, platform);
    view.setUint16(base + 2, encoding);
    view.setUint16(base + 4, lang);
    view.setUint16(base + 6, r.id);
    view.setUint16(base + 8, r.data.byteLength);
    view.setUint16(base + 10, strOff);
    buf.set(r.data, stringOffset + strOff);
    strOff += r.data.byteLength;
  }
  return buf;
}

const NAME_TAG = 0x6e616d65; // 'name'

/** Replace the SFNT name table so PDF embeds share one family label. */
export function patchSfntFamilyName(sfntBuffer, family = SHARED_FAMILY, postScript = SHARED_POSTSCRIPT) {
  const view = new DataView(sfntBuffer);
  const numTables = view.getUint16(4);
  const nameData = buildSharedNameTable(family, postScript);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const dir = 12 + i * 16;
    const tag = view.getUint32(dir);
    const offset = view.getUint32(dir + 8);
    const length = view.getUint32(dir + 12);
    const data = tag === NAME_TAG
      ? nameData
      : new Uint8Array(sfntBuffer, offset, length).slice();
    tables.push({ tag, data });
  }
  if (!tables.some(t => t.tag === NAME_TAG)) {
    tables.push({ tag: NAME_TAG, data: nameData });
  }
  return buildSfnt(view.getUint32(0), tables);
}

async function prepareGlyphFontData(woffBuffer) {
  try {
    const sfnt = await woffToSfntAsync(woffBuffer);
    return patchSfntFamilyName(sfnt);
  } catch {
    // Fall back to the original WOFF; CSS family is still shared.
    return woffBuffer;
  }
}

async function loadGlyphFace(codePoint) {
  const key = codePoint;
  if (faceCache.has(key)) return faceCache.get(key);

  const pending = (async () => {
    const res = await fetch(glyphUrl(codePoint), {
      mode: 'cors',
      referrerPolicy: 'no-referrer',
    });
    if (!res.ok) throw new Error(`glyph ${codePoint}: HTTP ${res.status}`);
    const woff = await res.arrayBuffer();
    const fontData = await prepareGlyphFontData(woff);
    const face = new FontFace(SHARED_FAMILY, fontData, {
      unicodeRange: unicodeRangeFor(codePoint),
    });
    await face.load();
    document.fonts.add(face);
    return SHARED_FAMILY;
  })();

  faceCache.set(key, pending);
  try {
    return await pending;
  } catch (error) {
    faceCache.delete(key);
    throw error;
  }
}

function collectCodePoints(root) {
  const cps = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !/[^\s]/.test(node.nodeValue)) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent || parent.closest('.gw-raw, script, style')) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip 黑体/楷体 descendants (strong/em) that are not XiaoBiaoSong.
      if (!usesXiaoBiaoSong(parent)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const ch of node.nodeValue) {
      if (!/\s/.test(ch)) cps.add(ch.codePointAt(0));
    }
  }
  return [...cps];
}

async function enhanceElement(el) {
  if (el.dataset.gwXbs) return el.dataset.gwXbs;

  if (hasLocalXiaoBiaoSong()) {
    el.dataset.gwXbs = 'local';
    return 'local';
  }

  const codePoints = collectCodePoints(el);
  if (codePoints.length === 0) {
    el.dataset.gwXbs = 'fallback';
    el.style.fontFamily = 'var(--gw-font-xbs-fallback)';
    return 'fallback';
  }

  // Soft Song stack while remote glyphs load or if they fail.
  el.style.fontFamily = 'var(--gw-font-xbs-fallback)';

  const results = await Promise.all(
    codePoints.map(cp => loadGlyphFace(cp).then(() => true).catch(() => false)),
  );
  const ok = results.some(Boolean);
  el.dataset.gwXbs = ok ? 'remote' : 'fallback';
  if (ok) {
    // Restore XiaoBiaoSong-first stack; loaded faces fill FZXiaoBiaoSong.
    el.style.fontFamily = '';
  } else {
    el.style.fontFamily = 'var(--gw-font-xbs-fallback)';
  }
  return el.dataset.gwXbs;
}

export async function applyGongwenXbs(root) {
  if (typeof document === 'undefined') return [];
  const scope = root ?? document;
  await document.fonts.ready;
  const targets = [...scope.querySelectorAll(TARGET_SELECTOR)].filter(usesXiaoBiaoSong);
  return Promise.all(targets.map(enhanceElement));
}

export const GongwenXbs = {
  apply: applyGongwenXbs,
  hasLocal: hasLocalXiaoBiaoSong,
  glyphUrl,
  glyphFamilyName,
  unicodeRangeFor,
  sharedFamily: SHARED_FAMILY,
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

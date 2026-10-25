import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHARED_FAMILY,
  SHARED_POSTSCRIPT,
  applyGongwenXbs,
  buildSharedNameTable,
  glyphFamilyName,
  glyphUrl,
  unicodeRangeFor,
} from '../src/gongwen-xbs.js';

test('glyphUrl uses shop CDN and decimal code points', () => {
  assert.equal(
    glyphUrl(26149),
    'https://cdn1.foundertype.com/Public/shop1/Home/font/f219af0b538053a3b0254c8d1a19bcf0/FZXBSJW/26149.woff',
  );
  assert.equal(glyphUrl('春'.codePointAt(0)), glyphUrl(26149));
});

test('remote glyphs share one family name and per-code unicode-range', () => {
  assert.equal(glyphFamilyName(), SHARED_FAMILY);
  assert.equal(glyphFamilyName(26149), SHARED_FAMILY);
  assert.equal(unicodeRangeFor(26149), 'U+6625');
  assert.equal(unicodeRangeFor(0x4e00), 'U+4E00');
});

test('shared name table encodes family and PostScript names', () => {
  const table = buildSharedNameTable();
  // UTF-16BE bytes: search BE pattern of the shared names.
  const beFamily = Buffer.from(SHARED_FAMILY, 'utf16le').swap16();
  const bePs = Buffer.from(SHARED_POSTSCRIPT, 'utf16le').swap16();
  assert(Buffer.from(table).includes(beFamily));
  assert(Buffer.from(table).includes(bePs));
});

test('applyGongwenXbs is safe without a document (SSR/Node)', async () => {
  assert.equal(typeof document, 'undefined');
  assert.deepEqual(await applyGongwenXbs(), []);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { glyphFamilyName, glyphUrl } from '../src/gongwen-xbs.js';

test('glyphUrl uses shop CDN and decimal code points', () => {
  assert.equal(
    glyphUrl(26149),
    'https://cdn1.foundertype.com/Public/shop1/Home/font/f219af0b538053a3b0254c8d1a19bcf0/FZXBSJW/26149.woff',
  );
  assert.equal(glyphUrl('春'.codePointAt(0)), glyphUrl(26149));
});

test('glyphFamilyName prefixes digit-leading names', () => {
  assert.equal(glyphFamilyName(26149), 'FZXBSJW_26149');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FINE_GLYPHS, SMALL_GLYPHS, FINE_ROWS, measure } from '../src/engine/font.js';

test('every glyph of the fine font is ten rows of one even width, twice its old size', () => {
  for (const [ch, rows] of Object.entries(FINE_GLYPHS)) {
    assert.equal(rows.length, FINE_ROWS, `'${ch}' has ${rows.length} rows`);
    const w = rows[0].length;
    assert.equal(w % 2, 0, `'${ch}' is ${w} wide`);
    for (const r of rows) {
      assert.equal(r.length, w, `'${ch}' row "${r}"`);
      assert.match(r, /^[.#]+$/, `'${ch}' row "${r}"`);
    }
    // the same advance as the lettering it replaced, so every layout still fits
    assert.equal(w, SMALL_GLYPHS[ch][0].length * 2, `'${ch}' width`);
  }
  assert.deepEqual(Object.keys(FINE_GLYPHS).sort(), Object.keys(SMALL_GLYPHS).sort());
});

test('text is measured in normal pixels, lowercase like uppercase', () => {
  assert.equal(measure('AB'), 3 + 1 + 3);
  assert.equal(measure('hello'), measure('HELLO'));
  assert.equal(measure('M'), 5);
  assert.equal(measure(''), 0);
});

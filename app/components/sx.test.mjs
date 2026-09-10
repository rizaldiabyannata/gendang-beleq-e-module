// Self-check for the CSS-string parser every inline style on the page flows
// through. Run: node app/components/sx.test.mjs
import assert from 'node:assert/strict';
import { sx } from './sx.js';
import { seededPerm, CMS_DEFAULTS } from './module-data.js';
const MAME_NINE = CMS_DEFAULTS.materi.mameNine;

assert.deepEqual(sx('flex:1'), { flex: '1' });
assert.deepEqual(sx('padding:0 0 8px;color:#e0a33f'), { padding: '0 0 8px', color: '#e0a33f' });

// kebab-case becomes camelCase, custom properties stay verbatim
assert.deepEqual(sx('background-image:none;--gb-x:2'), { backgroundImage: 'none', '--gb-x': '2' });

// a semicolon inside parentheses or quotes is part of the value, not a separator
assert.deepEqual(
  sx('background:url("a;b.png");color:red'),
  { background: 'url("a;b.png")', color: 'red' },
);

// the shapes the design actually ships: font shorthand, gradients, transitions
assert.deepEqual(
  sx("font:500 10px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.22em"),
  { font: '500 10px/1 var(--font-jetbrains),ui-monospace,monospace', letterSpacing: '.22em' },
);
assert.equal(
  sx('background:linear-gradient(90deg,#3d7d63,#e0a33f);border-radius:999px').background,
  'linear-gradient(90deg,#3d7d63,#e0a33f)',
);

assert.equal(sx(''), undefined);
assert.equal(sx(undefined), undefined);
assert.deepEqual(sx('color:red;;'), { color: 'red' });      // stray separators ignored
assert.equal(sx('flex:1'), sx('flex:1'));                   // cached, same object

// Matching questions are graded as perm[chosen] === row. Being a bijection is
// necessary but nowhere near sufficient: the previous implementation was a single
// FIXED bijection shared by every question, so the answer to all of them was the
// same letter sequence. These assertions pin the property that actually matters.
for (let n = 2; n <= 8; n++) {
  const perm = seededPerm(n, 'soal-' + n);
  assert.equal(new Set(perm).size, n, `seededPerm is not a bijection for n=${n}`);
  assert.deepEqual([...perm].sort((a, b) => a - b), [...Array(n).keys()], `seededPerm is not a permutation for n=${n}`);
}

// Same question text always shuffles the same way; different questions do not.
assert.deepEqual(seededPerm(4, 'apa itu amplitudo'), seededPerm(4, 'apa itu amplitudo'));

// No matching question in the shipped banks may share an answer with another, and
// none may come out in the identity order (which would need no thought at all).
const answerOf = (it) => {
  const perm = seededPerm(it.pairs.length, it.q);
  return it.pairs.map((_, row) => perm.indexOf(row)).join(',');
};
const cocok = CMS_DEFAULTS.banks.flatMap((b) => (b.items || []).filter((it) => it.type === 'cocok'));
assert.ok(cocok.length >= 4, 'expected the shipped banks to contain matching questions');
for (const it of cocok) {
  const perm = seededPerm(it.pairs.length, it.q);
  assert.ok(perm.some((v, i) => v !== i), `matching question is in identity order: ${it.q.slice(0, 40)}`);
}
assert.equal(new Set(cocok.map(answerOf)).size, cocok.length, 'two matching questions share the same answer sequence');

// Gendang Mame is the large, slack, low drum. The comparison table shipped with the
// Mame and Nine columns swapped, teaching the opposite of the lab audio and the quiz
// keys, so the real table is asserted here rather than a copy of it. It is teacher-
// editable content now, so this pins the shipped default, not what a teacher may set.
const row = (name) => MAME_NINE.find((r) => r[0] === name);
assert.equal(row('Frekuensi')[1], 'Rendah', 'Mame must be the low-frequency drum');
assert.equal(row('Frekuensi')[2], 'Tinggi', 'Nine must be the high-frequency drum');
assert.equal(row('Diameter membran')[1], 'Lebih besar', 'Mame must be the larger drum');
assert.equal(row('Karakter nada')[1], 'Bass');

console.log('ok');

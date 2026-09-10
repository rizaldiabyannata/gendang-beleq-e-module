// Self-check for the one module that decides whether a student got it right.
// Run: node app/components/grading.test.mjs
import assert from 'node:assert/strict';
import { grade, norm, numEq, stripKeys, validate } from '../../supabase/functions/_shared/grading.ts';
import { CMS_DEFAULTS } from '../../content/defaults.mjs';

// ── Normalisation ────────────────────────────────────────────────────────────
// A student writing the physically best answer must not be marked wrong over
// notation. These are the exact forms the shipped banks accept.
assert.ok(numEq('0.2', '0,2 W/m²'));
assert.ok(numEq('5x10^-3', '0,005 sekon'));
assert.ok(numEq('50', '50 Hz'));
assert.ok(!numEq('50', '150'));
assert.equal(norm('  Ultrasonik.  '), 'ultrasonik');
assert.equal(norm('2 × 10³'), '2 x 103');

// ── Per-type grading ─────────────────────────────────────────────────────────
assert.deepEqual(grade({ type: 'pg', key: 1 }, 1), { ok: true, ratio: 1 });
assert.deepEqual(grade({ type: 'pg', key: 1 }, 0), { ok: false, ratio: 0 });
assert.equal(grade({ type: 'pg', key: 1 }, undefined).ok, false);

// Order of a multi-select must not matter, but completeness must.
assert.equal(grade({ type: 'multi', keys: [0, 1, 3] }, [3, 1, 0]).ok, true);
assert.equal(grade({ type: 'multi', keys: [0, 1, 3] }, [0, 1]).ok, false);
assert.equal(grade({ type: 'multi', keys: [0, 1, 3] }, []).ok, false);

assert.equal(grade({ type: 'isian', accept: ['0.2'] }, '0,2 W/m²').ok, true);
assert.equal(grade({ type: 'isian', accept: ['ultrasonik'] }, 'Ultrasonik').ok, true);
assert.equal(grade({ type: 'isian', accept: ['ultrasonik'] }, 'infrasonik').ok, false);

// Matching is scored per pair, so a partly-right answer is not simply zero.
const cocok = { type: 'cocok', q: 'Pasangkan rumus.', pairs: [['a', '1'], ['b', '2'], ['c', '3']] };
const { seededPerm } = await import('../../supabase/functions/_shared/grading.ts');
const perm = seededPerm(3, cocok.q);
const allRight = {}; for (let i = 0; i < 3; i++) allRight[i] = perm.indexOf(i);
assert.deepEqual(grade(cocok, allRight), { ok: true, ratio: 1, hit: 3, n: 3 });
assert.equal(grade(cocok, {}).ratio, 0);

// An essay is never passed or failed on keyword count alone.
const esai = { type: 'esai', keywords: ['doppler', 'mendekat'] };
const g = grade(esai, 'Ketika sumber bunyi mendekat, frekuensi yang diterima naik. Ini efek Doppler.');
assert.equal(g.needsTeacher, true);
assert.equal(g.hit, 2);
assert.ok(g.ratio === 1);
assert.equal(grade(esai, 'doppler mendekat').ok, false, 'a bag of keywords is not a pass');

// ── Validation ───────────────────────────────────────────────────────────────
assert.ok(validate({ type: 'pg' }, undefined));
assert.equal(validate({ type: 'pg' }, 0), null, 'option A is a real answer, not a blank');
assert.ok(validate({ type: 'esai' }, 'terlalu pendek'));
assert.ok(validate({ type: 'cocok', pairs: [1, 2] }, { 0: 1 }));

// ── The rule the whole assessment rests on ───────────────────────────────────
// Nothing a student can read may contain an answer key. If this ever fails, every
// grade the system has produced is forgeable from devtools.
const stripped = JSON.stringify(stripKeys(CMS_DEFAULTS));
for (const secret of ['"key"', '"keys"', '"accept"', '"keywords"', '"model"', '"fb"']) {
  assert.equal(stripped.includes(secret), false, `stripKeys left ${secret} in the student copy`);
}
// …while leaving everything a student needs to answer.
const before = CMS_DEFAULTS.banks.reduce((a, b) => a + b.items.length, 0);
const after = stripKeys(CMS_DEFAULTS).banks.reduce((a, b) => a + b.items.length, 0);
assert.equal(after, before, 'stripKeys dropped questions, not just answers');
assert.ok(stripKeys(CMS_DEFAULTS).banks[0].items[0].q.length > 10);

// The generated public copy on disk is the stripped one, not a stale full copy.
const shipped = (await import('./content-public.js')).default;
assert.equal(JSON.stringify(shipped).includes('"accept"'), false,
  'content-public.js is stale — run `bun run content`');
// The discussion note explains the answer, so it arrives with the grade, not before it.
assert.equal(JSON.stringify(shipped).includes('"fb"'), false,
  'feedback text still ships to the browser and gives answers away');

console.log('ok');

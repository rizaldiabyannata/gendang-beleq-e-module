// Self-check for the shape of the progress payload that travels to the server.
// Run: node app/lib/progress.test.mjs
import assert from 'node:assert/strict';
import { PROGRESS_KEYS, pickProgress, hydrateProgress } from './progress.js';

// Only the five keys with no other home on the server may travel in this payload.
// Sending `answers` or `fields` here would let two rows disagree about one fact.
assert.deepEqual(PROGRESS_KEYS, ['xp', 'done', 'refleksi', 'videoUrl', 'draft']);

const state = {
  xp: 40, done: { lab: true }, refleksi: { a: 3 }, videoUrl: 'x', draft: { 'b:0': 'z' },
  answers: { 'b:0': {} }, fields: { f: 1 }, screen: 'home',
};
assert.deepEqual(pickProgress(state), {
  xp: 40, done: { lab: true }, refleksi: { a: 3 }, videoUrl: 'x', draft: { 'b:0': 'z' },
});

// A key the component has not set yet must not travel as undefined, because
// JSON.stringify drops it and the stored object would silently lose the key.
assert.deepEqual(pickProgress({ xp: 5 }), { xp: 5 });

// Rows that predate this column, and guests who never had a row at all, must
// hydrate to usable defaults rather than crashing the component on first render.
const empty = { xp: 0, done: {}, refleksi: {}, videoUrl: '', draft: {} };
assert.deepEqual(hydrateProgress(null), empty);
assert.deepEqual(hydrateProgress({}), empty);
assert.deepEqual(hydrateProgress('bukan objek'), empty);

// Corrupt or hand-edited values must not poison state either.
assert.deepEqual(hydrateProgress({ xp: 'banyak', done: 5, videoUrl: 9 }), empty);
assert.deepEqual(
  hydrateProgress({ xp: 12, done: { kuis: true }, refleksi: { a: 1 }, videoUrl: 'u', draft: { d: 1 } }),
  { xp: 12, done: { kuis: true }, refleksi: { a: 1 }, videoUrl: 'u', draft: { d: 1 } },
);

// An array is an object to typeof, and spreading one into component state would
// give `done` numeric keys the rest of the module never looks for.
assert.deepEqual(hydrateProgress({ done: ['lab'] }), empty);

console.log('progress: ok');

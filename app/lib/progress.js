'use client';

// The shape of the `students.progress` column, kept in one place so the component
// and the server row can never drift apart.
//
// Deliberately five keys and no more. `answers` lives in `submissions` and `fields`
// in `lkpd`; copying them here would give one fact two rows that can disagree.
export const PROGRESS_KEYS = ['xp', 'done', 'refleksi', 'videoUrl', 'draft'];

export function pickProgress(state) {
  const out = {};
  for (const k of PROGRESS_KEYS) if (state[k] !== undefined) out[k] = state[k];
  return out;
}

// Anything can come back from a jsonb column: an empty object from a row that
// predates this feature, or a value someone edited by hand. The component renders
// straight off these, so every one of them gets a type check rather than a cast.
// Arrays are excluded on purpose — typeof calls them objects, and one spread into
// state would give `done` numeric keys nothing in the module looks for.
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

export function hydrateProgress(row) {
  const p = obj(row);
  return {
    xp: typeof p.xp === 'number' && Number.isFinite(p.xp) ? p.xp : 0,
    done: obj(p.done),
    refleksi: obj(p.refleksi),
    videoUrl: typeof p.videoUrl === 'string' ? p.videoUrl : '',
    draft: obj(p.draft),
  };
}

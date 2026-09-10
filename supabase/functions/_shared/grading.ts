// The single source of truth for how an answer is scored.
//
// Both the Deno Edge Function and the Next app import this file, so a student can
// never be graded by one set of rules and shown feedback from another. The answer
// keys themselves never reach the browser — only this logic is shared.

import { type Siap } from './physics.ts';

export type ItemType = 'pg' | 'bs' | 'multi' | 'isian' | 'cocok' | 'esai' | 'dugaan';

export interface Item {
  type: ItemType;
  // A `dugaan` item carries the mission definition instead of a key; see physics.ts.
  sim?: 'drum' | 'doppler' | 'ansambel';
  amati?: 'nada' | 'keras' | 'didengar' | 'layangan';
  ubah?: string;
  arah?: 'naik' | 'turun' | 'acak';
  qNaik?: string;
  qTurun?: string;
  pos?: number;
  awal?: Record<string, unknown>;
  acak?: Record<string, number[] | string[]>;
  q?: string;
  key?: number | string;
  keys?: number[];
  accept?: string[];
  pairs?: [string, string][];
  keywords?: string[];
  model?: string;
  fb?: string;
}

export interface Grade {
  ok: boolean;
  ratio: number;
  hit?: number;
  n?: number;
  needsTeacher?: boolean;
}

export const TYPE_XP: Record<string, number> = {
  pg: 10, bs: 8, multi: 15, isian: 12, cocok: 20, esai: 25, dugaan: 12,
};

// A student who writes the physically best answer — 0,2 W/m² — used to be marked
// wrong against accept:['0.2','0.2 w/m2'], permanently and with no retry. Superscripts,
// the multiplication sign and spacing are folded before comparison.
const SUP: Record<string, string> = {
  '²': '2', '³': '3', '⁰': '0', '¹': '1', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};

// Teacher-authored fields carry markup now, so an answer key can arrive as
// 'W/m<sup>2</sup>' where it used to be 'W/m²'. Both have to reach the comparison
// as the same string, which is why inline tags vanish and block tags become a
// space: dropping <sup> keeps 'w/m2' together, while dropping </p><p> would weld
// two sentences into one word.
const BLOCK = /<\/?(?:p|div|br|li|ul|ol|h[1-6]|blockquote|pre|tr|td|th|table|hr)\b[^>]*>/gi;
const ENT: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&nbsp;': ' ',
};

export const teks = (s: unknown): string => String(s == null ? '' : s)
  .replace(BLOCK, ' ')
  .replace(/<[^>]*>/g, '')
  .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (e) => ENT[e] || e);

export const norm = (s: unknown): string => teks(s)
  .toLowerCase()
  .replace(/[²³⁰¹⁴-⁹⁻]/g, (c) => SUP[c] || c)
  .replace(/[×⋅]/g, 'x')
  .replace(/,/g, '.')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/[.!?]+$/, '');

// Short-answer items are physics answers, so compare them as numbers when both
// sides carry one. This accepts '0,2 W/m²', '5 x 10^-3' and '0,005 sekon' against
// accept-lists written as '0.2', '5x10^-3' and '0.005 s' without the teacher having
// to enumerate every spelling of every unit.
const numOf = (s: unknown): number => {
  const t = norm(s).replace(/\s+/g, '').replace(/\^/g, '').replace(/x10(-?\d+)/, 'e$1');
  const m = t.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
};

export const numEq = (a: unknown, b: unknown): boolean => {
  const x = numOf(a), y = numOf(b);
  return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= Math.max(1e-9, Math.abs(y) * 1e-6);
};

// Deterministic per-question shuffle of the right-hand column of a matching item.
// perm[slot] is the index of the pair whose definition is shown in that slot, so a
// row i is answered correctly when the student picks the slot where perm[slot] === i.
//
// Being seeded by the question text is what lets the server recompute the exact
// shuffle the student saw without the client sending it back.
export const seededPerm = (n: number, seed: unknown): number[] => {
  if (n < 2) return Array.from({ length: n }, (_, i) => i);
  let h = 2166136261;
  const key = String(seed == null ? '' : seed);
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h |= 0; return (h >>> 0) / 4294967296; };
  const a = Array.from({ length: n }, (_, i) => i);
  for (let pass = 0; pass < 8; pass++) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    if (a.some((v, i) => v !== i)) break;   // never hand back the identity ordering
  }
  return a;
};

export function grade(it: Item, v: unknown, siap?: Siap): Grade {
  // A lab guess has no key to compare against. The physics decides, from the
  // conditions and the direction this particular student was given. `siap` is built
  // by the caller from the student id, never taken from the request body — a browser
  // that could choose its own conditions could choose ones it already knows.
  if (it.type === 'dugaan') {
    if (!siap) throw new Error('Dugaan lab butuh kondisi simulasi');
    const ok = v === siap.benar;
    return { ok, ratio: ok ? 1 : 0 };
  }
  if (it.type === 'pg' || it.type === 'bs') {
    const ok = v === it.key;
    return { ok, ratio: ok ? 1 : 0 };
  }
  if (it.type === 'multi') {
    const want = (it.keys || []).slice().sort().join(',');
    const got = ((v as number[]) || []).slice().sort().join(',');
    const ok = want === got && want !== '';
    return { ok, ratio: ok ? 1 : 0 };
  }
  if (it.type === 'isian') {
    const ok = (it.accept || []).some((a) => norm(a) === norm(v) || numEq(a, v));
    return { ok, ratio: ok ? 1 : 0 };
  }
  if (it.type === 'cocok') {
    const n = (it.pairs || []).length;
    const perm = seededPerm(n, it.q);
    const picks = (v as Record<number, number>) || {};
    let hit = 0;
    for (let i = 0; i < n; i++) { const j = picks[i]; if (j !== undefined && perm[j] === i) hit++; }
    return { ok: hit === n, ratio: n ? hit / n : 0, hit, n };
  }
  if (it.type === 'esai') {
    const t = norm(v), kws = it.keywords || [];
    const hit = kws.filter((k) => t.indexOf(norm(k)) !== -1).length;
    const ratio = kws.length ? hit / kws.length : (t.length > 40 ? 1 : 0);
    // Keyword overlap cannot tell a correct causal chain from a bag of the right
    // nouns, so it is reported to the teacher as a hint and never used to pass
    // or fail the student on its own.
    return { ok: t.length >= 25, ratio, hit, n: kws.length, needsTeacher: true };
  }
  return { ok: false, ratio: 0 };
}

// Rejects an answer the student has not actually filled in. Returned message is
// shown as-is; null means the answer is ready to be graded.
export function validate(it: Item, v: unknown): string | null {
  if (it.type === 'dugaan' && v !== 'naik' && v !== 'turun' && v !== 'tetap') return 'Pilih dugaanmu dulu';
  if ((it.type === 'pg' || it.type === 'bs') && v === undefined) return 'Pilih jawabanmu dulu';
  if (it.type === 'isian' && !String(v || '').trim()) return 'Isi jawabanmu dulu ya';
  if (it.type === 'esai' && String(v || '').trim().length < 25) return 'Tulis jawaban yang lebih lengkap dulu';
  if (it.type === 'multi' && !((v as number[]) || []).length) return 'Pilih minimal satu jawaban';
  if (it.type === 'cocok' && Object.keys((v as object) || {}).length < (it.pairs || []).length) return 'Pasangkan semua istilah dulu';
  return null;
}

// What a student is allowed to see. Everything stripped here is an answer key, and
// shipping any of it to the browser would make every grade in the system forgeable.
//
// `fb` is on the list for a less obvious reason: a discussion note like "Di atas
// 20.000 Hz disebut ultrasonik" hands over the answer to the question it explains.
// The Edge Function returns it in the response once the answer is locked in, which
// is the moment it was always meant to be read.
const SECRET = ['key', 'keys', 'accept', 'keywords', 'model', 'fb'] as const;

export function stripKeys<T>(payload: T): T {
  const out = JSON.parse(JSON.stringify(payload));
  for (const b of out?.banks || []) {
    for (const it of b.items || []) for (const k of SECRET) delete it[k];
  }
  return out;
}

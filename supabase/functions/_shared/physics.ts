// The physics the lab simulations run on.
//
// Both the Deno Edge Function and the Next app import this file. A lab mission is
// marked by recomputing what the simulation would have done, so the formula a
// student hears and the formula the server grades against are the same lines —
// there is no answer key to write down, and therefore none that can be wrong.

export type Zone = 'tengah' | 'pinggir';
export type Medium = 'udara' | 'air' | 'padat';
export type Drum = 'mame' | 'nine';
export type Arah = 'naik' | 'turun' | 'tetap';
export type Amati = 'nada' | 'keras' | 'didengar' | 'layangan';
export type Knob = 'freq' | 'tension' | 'amp' | 'medium' | 'drum' | 'zone' | 'dopF' | 'dopV' | 'ansMame' | 'ansNine';

export interface Params {
  drum: Drum; freq: number; tension: number; amp: number;
  medium: Medium; zone: Zone;
  dopF: number; dopV: number;
  ansMame: number; ansNine: number;
}

// One mission. Written by the teacher, and note what is missing: there is no key.
//
// `arah: 'acak'` draws the direction from the student's own seed, so one student is
// asked what happens when the membrane is tightened while the next is asked what
// happens when it is loosened. The two answers are opposites, which is what stops a
// neighbour's answer from being worth copying. Such a mission needs both sentences
// written; `q` alone is only enough when the direction is fixed.
export interface Misi {
  type: 'dugaan';
  sim: 'drum' | 'doppler' | 'ansambel';
  q?: string;
  qNaik?: string;
  qTurun?: string;
  amati: Amati;
  ubah: Knob;
  arah: 'naik' | 'turun' | 'acak';
  pos?: number;                    // where along the pass a Doppler mission listens
  awal?: Partial<Params>;
  acak?: Record<string, number[] | string[]>;
  fb?: string;
}

export const SPEED: Record<string, number> = { udara: 343, air: 1500, padat: 5100 };

export const DEFAULTS: Params = {
  drum: 'mame', freq: 220, tension: 0.5, amp: 0.5, medium: 'udara', zone: 'tengah',
  dopF: 440, dopV: 8, ansMame: 160, ansNine: 164,
};

// ── The simulations ──────────────────────────────────────────────────────────

// The pitch the membrane actually produces. The readout, the oscilloscope, the
// drum sample's playback rate and every mission about pitch all read this one.
export function pitch(p: Params, zone: Zone = p.zone): number {
  const sizeK = p.drum === 'mame' ? 0.72 : 1.28;
  return Math.max(45, p.freq * sizeK * (0.65 + 0.7 * p.tension) * (zone === 'pinggir' ? 1.7 : 1));
}

// TI = 10 log(I/I0) and I goes as amplitude squared, so this is 20 log(A) plus a
// constant. Returned unrounded: the screen rounds it, the deadband must not.
//
// Note what is absent — freq, tension and drum. Loudness does not move with pitch,
// and a mission that changes tension while watching this is meant to come out
// 'tetap'. That is the misconception the whole lab exists to break.
export function dbLevel(p: Params, zone: Zone = p.zone): number {
  return 20 * Math.log10(Math.max(0.02, p.amp)) + 100
    + (zone === 'tengah' ? 3 : -3)
    + (p.medium === 'padat' ? -6 : p.medium === 'air' ? -3 : 0);
}

// The procession passes the listener at a distance rather than running them over,
// so only the component of its velocity along the line of sight shifts the pitch.
export const PASS_D = 0.45;

export function dopplerHeard(p: Params, pos: number): number {
  const v = 343;
  const radial = p.dopV * (-pos) / Math.hypot(pos, PASS_D);
  return p.dopF * v / (v - radial);
}

// Where the procession sits as heard, for the recording in public/doppler.wav:
// amplitude falls as 1/r (intensity as 1/r²), and the stereo pan follows the angle.
export function passMix(pos: number): { gain: number; pan: number } {
  const r = Math.hypot(pos, PASS_D);
  return { gain: PASS_D / r, pan: pos / r };
}

export function beat(f1: number, f2: number): number {
  return Math.abs(f1 - f2);
}

// ── The drum sample ──────────────────────────────────────────────────────────

// public/gendang.wav is 0,140 to 0,270 s of a real Gendang Mame strike, mono and
// normalised. Its fundamental is 79 Hz, far below the top of the frequency slider,
// so the sample carries the attack and the oscillator carries the pitch.
//
// Tracking the ratio by its square root rather than fully is the tuning knob: at
// full tracking a high note turns the strike into a featureless click.
export const SAMPLE_HZ = 79;
export const ATTACK_TRACK = 0.5;

export function sampleRate(p: Params, zone: Zone = p.zone): number {
  const r = Math.pow(pitch(p, zone) / SAMPLE_HZ, ATTACK_TRACK);
  return Math.min(6, Math.max(0.35, r));
}

// ── Missions ─────────────────────────────────────────────────────────────────

// Same xorshift as seededPerm() in grading.ts. Seeding on the student id is what
// lets the server rebuild the exact conditions a student saw without trusting the
// browser to send them back.
export function seeded(seed: unknown): () => number {
  let h = 2166136261;
  const key = String(seed == null ? '' : seed);
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h |= 0;
    return (h >>> 0) / 4294967296;
  };
}

// What 'naik' means for a knob that has no numbers.
const ORDER: Record<string, string[]> = {
  medium: ['udara', 'air', 'padat'],
  drum: ['nine', 'mame'],
  zone: ['tengah', 'pinggir'],
};

// How far a knob moves when a mission tests it. Big enough that the change is
// unmistakable on screen, because the student is asked for a direction and must
// not be defeated by a difference too small to see.
const STEP: Record<string, number> = {
  freq: 1.6, dopF: 1.4,
  tension: 0.35, amp: 0.35, dopV: 6, ansMame: 8, ansNine: 8,
};
const MUL = ['freq', 'dopF'];

const RANGE: Record<string, number[]> = {
  freq: [60, 900], tension: [0, 1], amp: [0.05, 1],
  dopF: [200, 900], dopV: [2, 20], ansMame: [120, 200], ansNine: [120, 200],
};

const clampTo = (knob: string, v: number): number => {
  const r = RANGE[knob];
  return r ? Math.min(r[1], Math.max(r[0], v)) : v;
};

const moved = (knob: string, v: number, arah: 'naik' | 'turun'): number => {
  const s = STEP[knob] ?? 0;
  if (MUL.indexOf(knob) !== -1) return arah === 'naik' ? v * s : v / s;
  return arah === 'naik' ? v + s : v - s;
};

// A knob already sitting at the end of its range cannot move, and the mission
// would silently grade as 'tetap' through no fault of the student. So the starting
// condition is pulled back far enough to leave room. Client and server both run
// this, so what the student sees on the sliders is what the server marks against.
const withRoom = (knob: string, base: number, arah: 'naik' | 'turun'): number => {
  const r = RANGE[knob];
  if (!r) return base;
  let v = clampTo(knob, base);
  const t = moved(knob, v, arah);
  if (t > r[1]) v = MUL.indexOf(knob) !== -1 ? r[1] / STEP[knob] : r[1] - STEP[knob];
  if (t < r[0]) v = MUL.indexOf(knob) !== -1 ? r[0] * STEP[knob] : r[0] + STEP[knob];
  return clampTo(knob, v);
};

// Which way the knob moves for this student. Drawn from a seed stream of its own so
// that adding the draw did not shift every starting condition already in the field.
export function arahUji(item: Misi, seed: unknown): 'naik' | 'turun' {
  if (item.arah !== 'acak') return item.arah;
  return seeded('arah|' + String(seed))() < 0.5 ? 'naik' : 'turun';
}

export function teksFor(item: Misi, arah: 'naik' | 'turun'): string {
  return (arah === 'naik' ? item.qNaik : item.qTurun) || item.q || '';
}

// The conditions one student sees for one mission. Deterministic in the seed, so
// two students get different numbers.
export function paramsFor(item: Misi, seed: unknown): Params {
  const p = Object.assign({}, DEFAULTS, item.awal || {}) as unknown as Record<string, unknown>;
  const rnd = seeded(seed);
  const acak = item.acak || {};
  // Sorted so the draw does not depend on the order keys happen to sit in the JSON.
  for (const k of Object.keys(acak).sort()) {
    const spec = acak[k] as unknown[];
    if (!Array.isArray(spec) || !spec.length) continue;
    if (typeof spec[0] === 'string') {
      p[k] = spec[Math.floor(rnd() * spec.length)];
      continue;
    }
    const lo = Number(spec[0]), hi = Number(spec[1]), step = Number(spec[2]) || 1;
    const n = Math.max(1, Math.floor((hi - lo) / step) + 1);
    p[k] = lo + Math.floor(rnd() * n) * step;
  }

  const knob = item.ubah;
  const arah = arahUji(item, seed);
  const order = ORDER[knob];
  if (order) {
    let i = order.indexOf(String(p[knob]));
    if (i < 0) i = 0;
    // At the far end in the direction under test there is nowhere to go, so start
    // one place short of it.
    if (arah === 'naik' && i === order.length - 1) i -= 1;
    if (arah === 'turun' && i === 0) i += 1;
    p[knob] = order[Math.min(order.length - 1, Math.max(0, i))];
  } else {
    p[knob] = withRoom(knob, Number(p[knob]), arah);
  }
  return p as unknown as Params;
}

export function nudge(p: Params, knob: Knob, arah: 'naik' | 'turun'): Params {
  const out = Object.assign({}, p) as unknown as Record<string, unknown>;
  const order = ORDER[knob];
  if (order) {
    const i = order.indexOf(String(out[knob]));
    const j = Math.min(order.length - 1, Math.max(0, (i < 0 ? 0 : i) + (arah === 'naik' ? 1 : -1)));
    out[knob] = order[j];
    return out as unknown as Params;
  }
  out[knob] = clampTo(knob, moved(knob, Number(out[knob]), arah));
  return out as unknown as Params;
}

export function observe(item: Misi, p: Params): number {
  if (item.amati === 'keras') return dbLevel(p, p.zone);
  if (item.amati === 'didengar') return dopplerHeard(p, typeof item.pos === 'number' ? item.pos : -0.5);
  if (item.amati === 'layangan') return beat(p.ansMame, p.ansNine);
  return pitch(p, p.zone);
}

// The smallest step each readout on screen can show: hertz for the three pitch
// readouts, a decibel for the loudness one.
export const UNIT: Record<string, number> = { nada: 1, keras: 1, didengar: 1, layangan: 1 };

// How many of those a change must cross before a student can honestly be asked to
// call its direction. A Doppler shift at walking pace is barely one percent of the
// heard frequency and still plainly visible as 448 becoming 454, which is why this
// is counted in readout steps and not in percent.
export const MIN_VISIBLE = 2;

export function selisih(item: Misi, p: Params, arah: 'naik' | 'turun'): number {
  return observe(item, nudge(p, item.ubah, arah)) - observe(item, p);
}

// 'tetap' means the quantity does not depend on the knob at all — the same
// arithmetic on the same inputs, so the difference is exactly zero. It is never a
// judgement about a change being small, which would make the third option a trap
// rather than a choice.
export function arahBenar(item: Misi, p: Params, arah: 'naik' | 'turun'): Arah {
  const d = selisih(item, p, arah);
  if (Math.abs(d) < 1e-9) return 'tetap';
  return d > 0 ? 'naik' : 'turun';
}

// Whether this mission is fair to ask: either nothing moves, or enough moves that
// the student can read it off the screen. Grading never consults this; the test
// over the shipped bank does, so an unanswerable mission cannot be published.
export function terlihat(item: Misi, p: Params, arah: 'naik' | 'turun'): boolean {
  const d = Math.abs(selisih(item, p, arah));
  return d < 1e-9 || d >= MIN_VISIBLE * (UNIT[item.amati] ?? 1);
}

// Everything one student needs for one mission, resolved from their seed in a single
// call. The browser uses it to set the bench and print the question; the Edge Function
// uses it to mark the answer. One function, so the two cannot drift apart.
export interface Siap {
  params: Params;
  arah: 'naik' | 'turun';
  q: string;
  benar: Arah;
}

export function siapkan(item: Misi, seed: unknown): Siap {
  const arah = arahUji(item, seed);
  const params = paramsFor(item, seed);
  return { params, arah, q: teksFor(item, arah), benar: arahBenar(item, params, arah) };
}

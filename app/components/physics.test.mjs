// Self-check for the module that decides whether a lab guess was right.
// Run: node app/components/physics.test.mjs
import assert from 'node:assert/strict';
import {
  DEFAULTS, MIN_VISIBLE, SAMPLE_HZ, UNIT, arahBenar, arahUji, beat, dbLevel, dopplerHeard,
  nudge, observe, paramsFor, passMix, pitch, sampleRate, seeded, selisih, siapkan, terlihat,
} from '../../supabase/functions/_shared/physics.ts';
import { CMS_DEFAULTS } from '../../content/defaults.mjs';

const P = (over) => Object.assign({}, DEFAULTS, over);

// ── The simulations ──────────────────────────────────────────────────────────

// Mame is the big drum, so it must sound lower than Nine at the same settings.
assert.ok(pitch(P({ drum: 'mame' })) < pitch(P({ drum: 'nine' })));
// Tighter membrane, faster vibration, higher note.
assert.ok(pitch(P({ tension: 0.2 })) < pitch(P({ tension: 0.9 })));
// The rim rings higher than the centre.
assert.ok(pitch(P({}), 'tengah') < pitch(P({}), 'pinggir'));
// The floor keeps the lowest possible setting audible rather than sub-sonic.
assert.equal(pitch(P({ freq: 60, drum: 'mame', tension: 0 }), 'tengah'), 45);

// Loudness moves with how hard it is struck, and with nothing else. A mission that
// changes tension while watching the decibel readout must come out 'tetap'.
assert.ok(dbLevel(P({ amp: 0.2 })) < dbLevel(P({ amp: 0.9 })));
assert.equal(dbLevel(P({ tension: 0.1 })), dbLevel(P({ tension: 0.9 })));
assert.equal(dbLevel(P({ freq: 60 })), dbLevel(P({ freq: 900 })));
assert.equal(dbLevel(P({ drum: 'mame' })), dbLevel(P({ drum: 'nine' })));
// A denser medium damps what reaches the listener.
assert.ok(dbLevel(P({ medium: 'padat' })) < dbLevel(P({ medium: 'udara' })));

// Approaching raises the heard frequency, receding lowers it, and the crossing is
// smooth rather than a step.
const dop = P({ dopF: 400, dopV: 12 });
assert.ok(dopplerHeard(dop, -0.5) > 400);
assert.ok(dopplerHeard(dop, 0.5) < 400);
assert.equal(Math.round(dopplerHeard(dop, 0)), 400);
// Faster procession, bigger shift.
assert.ok(dopplerHeard(P({ dopF: 400, dopV: 20 }), -0.5) > dopplerHeard(dop, -0.5));

// The recording is loudest as the procession passes and pans from left to right.
assert.equal(passMix(0).gain, 1);
assert.ok(passMix(-1).gain < 0.5 && passMix(1).gain < 0.5);
assert.ok(passMix(-1).pan < -0.9 && passMix(1).pan > 0.9);

assert.equal(beat(164, 160), 4);
assert.equal(beat(160, 164), 4);

// ── The drum sample ──────────────────────────────────────────────────────────

// At the recording's own pitch the sample plays untouched.
const atSample = P({ freq: SAMPLE_HZ / 0.72 / (0.65 + 0.7 * 0.5), drum: 'mame' });
assert.ok(Math.abs(sampleRate(atSample, 'tengah') - 1) < 1e-9);

// Across every setting the sliders can reach, the strike must stay a strike: never
// stretched into mud, never squeezed into a featureless click.
let lastRate = 0;
for (const drum of ['mame', 'nine']) {
  for (const zone of ['tengah', 'pinggir']) {
    for (let f = 60; f <= 900; f += 5) {
      for (const t of [0, 0.5, 1]) {
        const r = sampleRate(P({ freq: f, drum, tension: t }), zone);
        assert.ok(r >= 0.35 && r <= 6, `laju ${r} di luar batas pada ${f} Hz`);
        lastRate = r;
      }
    }
  }
}
assert.ok(lastRate > 0);
// Higher note, faster sample. Monotonic, so the strike never doubles back.
assert.ok(sampleRate(P({ freq: 100 })) < sampleRate(P({ freq: 400 })));

// ── Seeding ──────────────────────────────────────────────────────────────────

const rndA = seeded('siswa-1|lab1|0');
const rndB = seeded('siswa-1|lab1|0');
const rndC = seeded('siswa-2|lab1|0');
const drawA = [rndA(), rndA(), rndA()];
assert.deepEqual(drawA, [rndB(), rndB(), rndB()]);
assert.notDeepEqual(drawA, [rndC(), rndC(), rndC()]);
assert.ok(drawA.every((v) => v >= 0 && v < 1));

const misi = {
  type: 'dugaan', sim: 'drum', amati: 'nada', ubah: 'tension', arah: 'naik',
  awal: { drum: 'mame', medium: 'udara', zone: 'tengah', amp: 0.5 },
  acak: { freq: [120, 600, 20], drum: ['mame', 'nine'] },
};

// The same student opening the same mission twice must meet the same conditions.
assert.deepEqual(paramsFor(misi, 'a|lab1|0'), paramsFor(misi, 'a|lab1|0'));
// Two students must not, or copying an answer would work.
const spread = new Set();
for (let i = 0; i < 200; i++) spread.add(JSON.stringify(paramsFor(misi, 'siswa-' + i + '|lab1|0')));
assert.ok(spread.size > 20, `hanya ${spread.size} kondisi berbeda dari 200 benih`);
// Draws stay inside what the author asked for.
for (let i = 0; i < 200; i++) {
  const p = paramsFor(misi, 'siswa-' + i + '|lab1|0');
  assert.ok(p.freq >= 120 && p.freq <= 600 && (p.freq - 120) % 20 === 0);
  assert.ok(p.drum === 'mame' || p.drum === 'nine');
}

// ── The knob under test always has room to move ──────────────────────────────

// A knob pinned at the end of its range would grade every student 'tetap' through
// no fault of their own, so the starting condition is pulled back to leave room.
const knobs = [
  ['tension', 'nada'], ['amp', 'keras'], ['freq', 'nada'],
  ['medium', 'keras'], ['drum', 'nada'], ['zone', 'nada'],
  ['dopV', 'didengar'], ['dopF', 'didengar'], ['ansNine', 'layangan'],
];
for (const [ubah, amati] of knobs) {
  for (const arah of ['naik', 'turun']) {
    for (const extreme of [0, 1]) {
      const it = {
        type: 'dugaan', sim: 'drum', amati, ubah, arah,
        awal: {
          tension: extreme, amp: extreme ? 1 : 0.05, freq: extreme ? 900 : 60,
          dopV: extreme ? 20 : 2, dopF: extreme ? 900 : 200,
          ansNine: extreme ? 200 : 120,
          medium: extreme ? 'padat' : 'udara',
          drum: extreme ? 'mame' : 'nine',
          zone: extreme ? 'pinggir' : 'tengah',
        },
      };
      const p = paramsFor(it, 'x');
      const after = nudge(p, ubah, arah);
      assert.notEqual(p[ubah], after[ubah], `${ubah} ${arah} dari ujung ${extreme} tidak bergerak`);
      assert.notEqual(observe(it, p), observe(it, after), `${ubah}/${amati} ${arah} tidak mengubah apa pun`);
    }
  }
}

// ── Direction ────────────────────────────────────────────────────────────────

const dir = (over) => {
  const it = Object.assign({ type: 'dugaan', sim: 'drum' }, over);
  return arahBenar(it, paramsFor(it, 'benih'), it.arah);
};

assert.equal(dir({ amati: 'nada', ubah: 'tension', arah: 'naik' }), 'naik');
assert.equal(dir({ amati: 'nada', ubah: 'tension', arah: 'turun' }), 'turun');
assert.equal(dir({ amati: 'nada', ubah: 'freq', arah: 'naik' }), 'naik');
assert.equal(dir({ amati: 'nada', ubah: 'zone', arah: 'naik' }), 'naik');
// The big drum sounds lower, which is the trap worth setting.
assert.equal(dir({ amati: 'nada', ubah: 'drum', arah: 'naik' }), 'turun');
assert.equal(dir({ amati: 'keras', ubah: 'amp', arah: 'naik' }), 'naik');
assert.equal(dir({ amati: 'keras', ubah: 'medium', arah: 'naik' }), 'turun');
assert.equal(dir({ amati: 'didengar', ubah: 'dopV', arah: 'naik', pos: -0.5 }), 'naik');
// Receding, a faster procession drops the heard frequency further.
assert.equal(dir({ amati: 'didengar', ubah: 'dopV', arah: 'naik', pos: 0.5 }), 'turun');

// The third option has to be reachable, or it is a trap and not a choice.
assert.equal(dir({ amati: 'keras', ubah: 'tension', arah: 'naik' }), 'tetap');
assert.equal(dir({ amati: 'keras', ubah: 'freq', arah: 'naik' }), 'tetap');
assert.equal(dir({ amati: 'nada', ubah: 'amp', arah: 'naik' }), 'tetap');
assert.equal(dir({ amati: 'layangan', ubah: 'tension', arah: 'naik' }), 'tetap');

// 'tetap' is exact independence, not a small change rounded away. Loudness does
// not read tension at all, so the difference is literally zero.
const flat = { type: 'dugaan', sim: 'drum', amati: 'keras', ubah: 'tension', arah: 'naik' };
assert.equal(selisih(flat, paramsFor(flat, 'benih'), 'naik'), 0);

// A Doppler shift is barely one percent of the heard frequency and would have been
// swallowed by a percentage deadband, yet 448 becoming 454 is plain on screen.
const dopMisi = {
  type: 'dugaan', sim: 'doppler', amati: 'didengar', ubah: 'dopV', arah: 'naik', pos: -0.5,
  awal: { dopF: 440, dopV: 8 },
};
const dopP = paramsFor(dopMisi, 'benih');
assert.ok(Math.abs(selisih(dopMisi, dopP, 'naik')) / observe(dopMisi, dopP) < 0.02);
assert.equal(arahBenar(dopMisi, dopP, 'naik'), 'naik');
assert.ok(terlihat(dopMisi, dopP, 'naik'));

// A mission nothing moves in is fair; one that moves less than two readout steps
// is not, because the student cannot see what they are being asked to judge.
assert.ok(terlihat(flat, paramsFor(flat, 'benih'), 'naik'));
const nyaris = { type: 'dugaan', sim: 'doppler', amati: 'didengar', ubah: 'dopV', arah: 'naik', pos: -0.99 };
const nyarisP = Object.assign({}, DEFAULTS, { dopF: 220, dopV: 2 });
if (Math.abs(selisih(nyaris, nyarisP, 'naik')) < MIN_VISIBLE * UNIT.didengar) {
  assert.equal(terlihat(nyaris, nyarisP, 'naik'), false);
}

// ── Direction drawn per student ──────────────────────────────────────────────

// A fixed mission asks everyone the same thing.
const tetapArah = { type: 'dugaan', sim: 'drum', amati: 'nada', ubah: 'tension', arah: 'naik' };
for (let n = 0; n < 50; n++) assert.equal(arahUji(tetapArah, 'siswa-' + n), 'naik');

// A randomised one splits the class roughly in half, and each student's own draw is
// stable so reopening the mission never changes the question under them.
const acakArah = Object.assign({}, tetapArah, { arah: 'acak' });
let naikCount = 0;
for (let n = 0; n < 400; n++) {
  const a = arahUji(acakArah, 'siswa-' + n);
  assert.ok(a === 'naik' || a === 'turun');
  assert.equal(a, arahUji(acakArah, 'siswa-' + n));
  if (a === 'naik') naikCount++;
}
assert.ok(naikCount > 140 && naikCount < 260, `pembagian arah timpang: ${naikCount} dari 400`);

// ── Every shipped mission ────────────────────────────────────────────────────

// The two properties a published mission must have, checked against the real bank
// over many students' worth of random draws.
//
//   1. The right answer must not depend on which draw a student got. Otherwise the
//      one explanation written for the mission is wrong for some of the class.
//   2. The change must be readable on screen — either nothing moves at all, or it
//      moves by at least two steps of the readout the question asks about.
const bank = CMS_DEFAULTS.banks.find((b) => b.jenis === 'lab');
assert.ok(bank, 'bank dugaan lab tidak ada di konten bawaan');
assert.ok(bank.items.length >= 9, 'bank dugaan lab terlalu sedikit');

for (const [i, it] of bank.items.entries()) {
  assert.equal(it.type, 'dugaan');
  assert.ok((it.q || (it.qNaik && it.qTurun)) && it.fb, `misi ${i} tanpa pertanyaan atau pembahasan`);
  assert.ok(['drum', 'doppler', 'ansambel'].includes(it.sim), `misi ${i} tanpa simulasi`);

  // A mission whose direction is drawn must have both sentences written, or half the
  // class is asked one thing and shown the wording for the other.
  if (it.arah === 'acak') {
    assert.ok(it.qNaik && it.qTurun, `misi ${i} mengacak arah tanpa dua kalimat`);
    assert.notEqual(it.qNaik, it.qTurun, `misi ${i} punya dua kalimat yang sama`);
  }

  // The answer must be fixed for a given direction, so the one explanation written for
  // the mission is right for everyone who was asked that way. It is no longer fixed
  // across directions — that is exactly what makes a neighbour's answer worthless.
  const perArah = { naik: new Set(), turun: new Set() };
  const kondisi = new Set();
  for (let n = 0; n < 300; n++) {
    const seed = 'siswa-' + n + '|lab1|' + i;
    const s = siapkan(it, seed);
    perArah[s.arah].add(s.benar);
    kondisi.add(JSON.stringify(s.params));
    assert.ok(terlihat(it, s.params, s.arah), `misi ${i} tidak terbaca di layar untuk benih ${n}`);
    assert.equal(s.q, s.arah === 'naik' ? (it.qNaik || it.q) : (it.qTurun || it.q));
  }
  for (const a of ['naik', 'turun']) {
    assert.ok(perArah[a].size <= 1, `misi ${i} arah ${a} punya jawaban berbeda antar siswa: ${[...perArah[a]]}`);
  }
  if (it.acak && Object.keys(it.acak).length) {
    assert.ok(kondisi.size > 3, `misi ${i} nyaris tidak mengacak apa pun`);
  }

  // The point of the whole exercise: for a randomised mission the two directions must
  // lead to different answers, otherwise copying still works. Missions whose answer is
  // 'tetap' are exempt, because no direction of a knob the readout ignores changes it.
  if (it.arah === 'acak') {
    const [an, at] = [[...perArah.naik][0], [...perArah.turun][0]];
    assert.ok(an && at, `misi ${i} tidak menghasilkan kedua arah dalam 300 benih`);
    assert.ok(an !== at || an === 'tetap',
      `misi ${i} menjawab '${an}' ke dua arah, jadi jawaban teman masih bisa disalin`);
  }
}

// Between them the missions must cover all three answers, or students learn to
// pattern-match instead of reasoning.
const jawaban = new Set();
for (let n = 0; n < 60; n++) bank.items.forEach((it, i) => jawaban.add(siapkan(it, 'x' + n + '|lab1|' + i).benar));
assert.deepEqual([...jawaban].sort(), ['naik', 'tetap', 'turun']);

// How much of the bank a copied answer still works on, reported so the number cannot
// quietly drift. A 'tetap' mission is copyable by nature and there are three of them.
const bisaDisalin = bank.items.filter((it, i) => {
  const a = new Set();
  for (let n = 0; n < 120; n++) a.add(siapkan(it, 's' + n + '|lab1|' + i).benar);
  return a.size === 1;
});
assert.ok(bisaDisalin.length <= 3, `${bisaDisalin.length} misi masih bisa disalin utuh`);

console.log('physics: ok · ' + bank.items.length + ' misi terperiksa · '
  + bisaDisalin.length + ' masih bisa disalin');

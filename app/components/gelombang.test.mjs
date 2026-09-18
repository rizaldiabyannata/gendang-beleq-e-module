// Self-check for the drum-strike geometry and the sound-wave rings in the 3D lab.
// Run: node app/components/gelombang.test.mjs
import assert from 'node:assert/strict';
import {
  JUMLAH, KONTAK, PHI, R, R_KEPALA, R_MAKS, SELESAI, UJUNG, Y_MEMBRAN,
  cincin, genggam, pose, sudutAyun, titikTabuh, zonaDari,
} from './gelombang.js';

const dekat = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, a + ' != ' + b);

// ── Zona ─────────────────────────────────────────────────────────────────────
assert.equal(zonaDari(0), 'tengah');
assert.equal(zonaDari(0.3 * R), 'tengah');
assert.equal(zonaDari(0.5 * R), 'pinggir');
// Bibir rotan (rim_top) lebih lebar dari membran; tetap dihitung pinggir.
assert.equal(zonaDari(1.1 * R), 'pinggir');

// ── Titik tabuh ──────────────────────────────────────────────────────────────
assert.deepEqual(titikTabuh('tengah', 1.2), [0, 0]);
{
  const [x, z] = titikTabuh('pinggir', 0); dekat(x, 0.8 * R); dekat(z, 0);
  const [x2, z2] = titikTabuh('pinggir', Math.PI / 2); dekat(x2, 0); dekat(z2, 0.8 * R);
}

// ── Pemukul ──────────────────────────────────────────────────────────────────
// Pada sudut kontak, kepala pemukul duduk tepat di atas titik tabuh, menyentuh membran.
for (const t of [[0, 0], [0.8 * R, 0], [-0.05, 0.07]]) {
  const g = genggam(t);
  const k = pose(g, PHI.kontak);
  dekat(Math.hypot(...k.arah), 1);
  dekat(k.pos[0] + k.arah[0] * UJUNG, t[0]);
  dekat(k.pos[1] + k.arah[1] * UJUNG, Y_MEMBRAN + R_KEPALA);
  dekat(k.pos[2] + k.arah[2] * UJUNG, t[1]);
  // Saat istirahat kepala terangkat di atas membran.
  const s = pose(g, PHI.istirahat);
  assert.ok(s.pos[1] + s.arah[1] * UJUNG > Y_MEMBRAN + R_KEPALA);
}

// ── Ayunan ───────────────────────────────────────────────────────────────────
dekat(sudutAyun(0), PHI.istirahat);
dekat(sudutAyun(KONTAK), PHI.kontak);
dekat(sudutAyun(SELESAI + 1), PHI.istirahat);
// Diangkat dulu sebelum turun.
assert.ok(sudutAyun(0.1) < PHI.istirahat);
// Kepala tidak pernah menembus membran.
for (let t = 0; t < SELESAI + 0.05; t += 0.005) assert.ok(sudutAyun(t) <= PHI.kontak + 1e-12);

// ── Cincin gelombang ─────────────────────────────────────────────────────────
const dasar = { freq: 158, speed: 343, amp: 0.6 };
// Frekuensi naik → panjang gelombang pendek → cincin lebih rapat.
assert.ok(cincin({ ...dasar, freq: 600 }).jarak < cincin(dasar).jarak);
// Medium lebih cepat → cincin melebar lebih cepat: udara < air < padat.
assert.ok(cincin({ ...dasar, speed: 1500 }).laju > cincin(dasar).laju);
assert.ok(cincin({ ...dasar, speed: 5100 }).laju > cincin({ ...dasar, speed: 1500 }).laju);
// Amplitudo besar → cincin lebih terang dan tebal.
assert.ok(cincin({ ...dasar, amp: 1 }).opasitas > cincin({ ...dasar, amp: 0.05 }).opasitas);
assert.ok(cincin({ ...dasar, amp: 1 }).tebal > cincin({ ...dasar, amp: 0.05 }).tebal);
// Ujung-ujung rentang tuas tetap terbaca di skala gendang 0,27 m.
for (const f of [45, 2700]) for (const v of [343, 5100]) {
  const c = cincin({ freq: f, speed: v, amp: 0.5 });
  assert.ok(c.jarak >= 0.018 && c.jarak <= 0.14, 'jarak ' + c.jarak);
  assert.ok(c.umur > 0 && Number.isFinite(c.umur));
}
// Animasi berhenti tepat saat cincin terakhir keluar dari jangkauan.
{
  const c = cincin(dasar);
  dekat(c.laju * c.umur - (JUMLAH - 1) * c.jarak, R_MAKS);
}

console.log('gelombang.test: ok');

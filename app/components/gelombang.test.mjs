// Self-check for the drum-strike geometry and the sound-wave rings in the 3D lab.
// Run: node app/components/gelombang.test.mjs
import assert from 'node:assert/strict';
import {
  DURASI_JALAN, JANGKAU, JUMLAH, KONTAK, LAJU_ALAMI, LAJU_POS, PHI, R, R_KEPALA, R_MAKS,
  SELESAI, TABUH_T, UJUNG, X_JALUR, Y_MEMBRAN,
  cincin, durasiLintasan, genggam, lewatTabuh, pose, skalaJalan, sudutAyun, titikTabuh,
  uTKereta, xDari, zonaDari,
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

// ── Rombongan penabuh ────────────────────────────────────────────────────────
// Jalur simetris dan sumber tidak pernah lepas dari ujung jalan.
dekat(xDari(1), X_JALUR);
dekat(xDari(JANGKAU), JANGKAU * X_JALUR);
dekat(xDari(-JANGKAU - 5), -JANGKAU * X_JALUR);
dekat(xDari(0), 0);
// Durasi lahir dari panjang jalan, bukan dari laju: memperbesar JANGKAU
// memperpanjang lintasan tanpa mengubah laju geser sedikit pun.
dekat(durasiLintasan() * LAJU_POS, 2 * JANGKAU);
assert.ok(durasiLintasan() > 15 && durasiLintasan() < 20, 'durasi ' + durasiLintasan());

// Satu langkah frame melewati titik tabuh 0,4 → menyala sekali, tidak dua kali.
assert.ok(lewatTabuh(0.39, 0.41));
assert.ok(!lewatTabuh(0.41, 0.43));
// Titik tabuh kedua dan sambungan putaran klip juga terdeteksi.
assert.ok(lewatTabuh(0.99, 1.01));
assert.ok(lewatTabuh(1.19, 1.21 + TABUH_T[0]));
// Sepanjang satu putaran klip tepat dua tabuhan, tanpa bolong di sambungan.
{
  let n = 0;
  for (let t = 0; t < DURASI_JALAN - 1e-9; t += 0.004) if (lewatTabuh(t, t + 0.004)) n++;
  assert.equal(n, TABUH_T.length);
}

// Klip diputar sepas geseran di layar: laju kaki = laju sumber.
dekat(skalaJalan() * LAJU_ALAMI, LAJU_POS * X_JALUR);

// Kereta cincin: tabuhan pertama mulai dari nol, lalu geseran berhenti di JUMLAH-1.
const P = 0.6 / skalaJalan();
dekat(uTKereta(0, 1, P), 0);
dekat(uTKereta(0, 2, P), P);
assert.equal(uTKereta(0, 99, P), uTKereta(0, JUMLAH, P));
// Cincin tertua tepat mencapai R_MAKS saat tabuhan berikutnya lahir.
{
  const laju = R_MAKS / (JUMLAH * P);
  dekat(laju * uTKereta(P, JUMLAH, P), R_MAKS);
}

console.log('gelombang.test: ok');

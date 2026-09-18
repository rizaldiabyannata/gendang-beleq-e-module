// Geometri tabuhan pada model public/gendang-beleq.glb dan bentuk cincin gelombang
// yang keluar dari titik tabuh. Murni, tanpa three.js, supaya bisa diuji dengan
// node saja: node app/components/gelombang.test.mjs
//
// Semua ukuran dalam meter, di ruang lokal simpul `gendang_beleq` pada model.
// Kalau modelnya diganti, angka-angka di blok pertama inilah yang harus dicek ulang.

export const R = 0.135;          // jari-jari membran atas (mesh head_top)
export const Y_MEMBRAN = 0.230;  // permukaan membran atas: head_top y=0.224 + tebal 0.006
export const R_KEPALA = 0.028;   // jari-jari kepala pemukul (mesh stick_head)
export const GENGGAM = 0.12;     // pangkal simpul drumstick → titik genggam (ke arah -X)
export const UJUNG = 0.16;       // pangkal simpul drumstick → pusat kepala pemukul (+X)

const D = Math.PI / 180;
// Sudut batang terhadap bidang datar; positif berarti kepala di bawah genggam.
export const PHI = { istirahat: 5 * D, atas: -15 * D, kontak: 30 * D };
export const WAKTU = { naik: 0.1, turun: 0.08, balik: 0.18 };
export const KONTAK = WAKTU.naik + WAKTU.turun;
export const SELESAI = KONTAK + WAKTU.balik;

export const JUMLAH = 4;         // cincin per tabuhan
export const R_MAKS = 0.36;      // cincin padam setelah sejauh ini dari titik tabuh

export function zonaDari(r, jari = R) {
  return r < 0.5 * jari ? 'tengah' : 'pinggir';
}

export function titikTabuh(zona, sudut, jari = R) {
  if (zona === 'tengah') return [0, 0];
  return [0.8 * jari * Math.cos(sudut), 0.8 * jari * Math.sin(sudut)];
}

// Pemukul selalu datang dari sisi kamera (+z) dan menunjuk ke -z.
const arah = (phi) => [0, -Math.sin(phi), -Math.cos(phi)];

export function genggam([x, z]) {
  const d = arah(PHI.kontak), L = GENGGAM + UJUNG, y = Y_MEMBRAN + R_KEPALA;
  return [x - d[0] * L, y - d[1] * L, z - d[2] * L];
}

export function pose(g, phi) {
  const d = arah(phi);
  return { pos: [g[0] + d[0] * GENGGAM, g[1] + d[1] * GENGGAM, g[2] + d[2] * GENGGAM], arah: d };
}

const lerp = (a, b, u) => a + (b - a) * u;

// Angkat (melambat di puncak), ayun turun (makin cepat sampai kontak), lalu kembali.
export function sudutAyun(t) {
  if (t <= 0) return PHI.istirahat;
  if (t < WAKTU.naik) return lerp(PHI.istirahat, PHI.atas, Math.sin((t / WAKTU.naik) * Math.PI / 2));
  if (t < KONTAK) { const u = (t - WAKTU.naik) / WAKTU.turun; return lerp(PHI.atas, PHI.kontak, u * u); }
  if (t < SELESAI) { const u = (t - KONTAK) / WAKTU.balik; return lerp(PHI.kontak, PHI.istirahat, 1 - (1 - u) * (1 - u)); }
  return PHI.istirahat;
}

const ACUAN = 343 / 220;  // panjang gelombang acuan: udara, 220 Hz
const jepit = (v, a, b) => Math.min(b, Math.max(a, v));

// Jarak antar-cincin mengikuti λ = v/f dan lajunya mengikuti v. Bunyi sungguhan
// terlalu panjang gelombangnya (1,5 m di udara) dan terlalu cepat untuk gendang
// 0,27 m di layar, jadi keduanya dinormalkan ke udara lalu dimampatkan dengan akar.
// ponytail: 0.045 / 0.3 / akar adalah tuas kalibrasi visual, bukan fisika; ganti skala
// logaritmik kalau siswa perlu membandingkan rasio λ secara kuantitatif.
export function cincin({ freq, speed, amp }) {
  const a = jepit(amp, 0, 1);
  const jarak = jepit(0.045 * Math.sqrt(speed / freq / ACUAN), 0.018, 0.14);
  const laju = 0.3 * Math.sqrt(speed / 343);
  return {
    jarak, laju,
    opasitas: 0.25 + 0.75 * a,
    tebal: 0.004 + 0.008 * a,
    umur: (R_MAKS + (JUMLAH - 1) * jarak) / laju,
  };
}

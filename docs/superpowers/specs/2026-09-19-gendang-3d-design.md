# Desain: Lab "Tabuh & amati" — gendang beleq 3D + pemukul (React Three Fiber)

## Context
Panggung tabuh di Lab (`app/components/Lab.jsx:104-117`) sekarang hanya lingkaran CSS
(`drumOuterStyle/drumSkinStyle/drumCenterStyle/ringStyle`, `EModul.jsx:1618-1621`) dengan satu
cincin dari pusat drum apa pun zonanya. Pengguna ingin model asli `~/Downloads/gendang-beleq.glb`
dipakai dengan **React Three Fiber**: gendang dan pemukul sama-sama berfungsi, tabuhan di **tengah**
dan **pinggir** membran, dan tiap tabuhan memancarkan cincin gelombang bunyi yang **berpusat di titik
kontak kepala pemukul**.

Keputusan dari brainstorming (sudah dijawab pengguna):
- Cara tabuh: **klik/tap membran** → pemukul mengayun ke titik itu; tombol Tengah/Pinggir tetap ada.
- Titik pinggir: **pada sudut yang diklik** (radius 0,8R).
- Gelombang: **cincin datar melebar** di bidang membran, keluar melewati tepi gendang, memudar.
- Cincin **ikut tuas**: kecerahan/tebal ∝ amplitudo, jarak antar-cincin ∝ λ = v/f, laju ∝ cepat rambat medium.
- Library: **@react-three/fiber** (tanpa json-render); skill hyperframes tidak dipasang.

Isi GLB (sudah dicek; THREE.GLTFExporter r184, tanpa animasi, 1,1 MB, tekstur PNG tertanam):
root `gendang_beleq` (sumbu Y); `head_top` y=0.224 radius 0.135; `rim_top` radius 0.151;
grup `drumstick` di (0,-0.202,0.255), batang sepanjang X, ujung pukul `stick_head` di x=+0.16.

## Skills yang dipakai
| Tahap | Skill |
|---|---|
| Desain (sudah) | `superpowers:brainstorming` → tulis spec `docs/superpowers/specs/2026-09-19-gendang-3d-design.md` |
| Rencana rinci | `superpowers:writing-plans` (dari spec ini) |
| Eksekusi | `superpowers:subagent-driven-development` (atau `superpowers:executing-plans`) |
| Logika murni | `superpowers:test-driven-development` untuk `gelombang.js` (zona + parameter cincin) |
| Referensi R3F | skill proyek `react-three-fiber` (`.claude/skills/react-three-fiber/`): pola `<Canvas>` manual, lampu, model GLB. Paket `@json-render/*` **tidak** dipasang, hanya polanya |
| Cek akhir | `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `claude-in-chrome` (uji visual), `superpowers:finishing-a-development-branch` |

## Pendekatan
1. **Aset**: salin GLB → `public/gendang-beleq.glb` (`public/sw.js` tidak meng-cache; aman).
2. **Dependensi**: `bun add three @react-three/fiber` (fiber 9.7 → peer react `>=19 <19.3`, cocok
   dengan react 19.2.8; three 0.186). Tanpa drei: `useLoader(GLTFLoader, url)` bawaan R3F cukup.
3. **`app/components/gelombang.js`** (murni, dites dulu — TDD):
   - `zonaDari(r, R)` → `'tengah'` jika r < 0.5R, selain itu `'pinggir'`.
   - `titikTabuh(zona, sudut, R)` → [x, z] (tengah = [0,0]; pinggir = 0.8R pada sudut).
   - `cincin({ freq, speed, amp })` → `{ jarak, laju, opasitas, tebal }`; λ = v/f dinormalkan ke
     acuan (udara, 220 Hz) lalu dijepit agar tetap terbaca di skala gendang 0,27 m; laju memakai
     kompresi akar supaya air/padat terlihat lebih cepat tanpa langsung hilang dari layar.
     `ponytail:` konstanta skala = tuas kalibrasi visual.
   - Tes: `app/components/gelombang.test.mjs` (pola `assert` seperti `physics.test.mjs`), ditambah
     ke skrip `test` di `package.json`.
4. **`app/components/Drum3D.jsx`** (`'use client'`), dimuat lewat `next/dynamic` dengan
   `{ ssr: false }` (sesuai `node_modules/next/dist/docs/01-app/02-guides/single-page-applications.md`).
   Props: `{ drum, amp, freq, speed, onHit(zone) }`.
   - Bagian DOM: state `permintaan = { zona, sudut, n }`; dua `<button>` Tengah/Pinggir mengisinya.
   - `<Canvas frameloop="demand" dpr={[1,2]} camera={{ fov: 35, position: kamera miring ~35° }}>`,
     `gl={{ alpha: true }}` agar latar panel terlihat; hemisphereLight + directionalLight.
   - `<Suspense>` + `useLoader(GLTFLoader, '/gendang-beleq.glb')`; `<primitive object={scene} />`
     dengan skala 1 (Mame) / 0.8 (Nine). Ambil `head_top`, `drumstick` via `getObjectByName`.
   - **Klik**: `onPointerDown` pada mesh `head_top` → `e.point` ke ruang lokal → r & sudut →
     `zonaDari` → isi `permintaan`. Klik pemukul = tabuh tengah.
   - **Pemukul**: `useFrame` menganimasikan grup `drumstick` ~220 ms (angkat → ayun → kontak →
     kembali) sehingga ujung `stick_head` jatuh di `titikTabuh`. **Saat kontak**: `onHit(zona)`
     (bunyi/dB/osiloskop tetap di `EModul.hit()` yang ada), membran `head_top` memantul (∝ amp),
     cincin dimulai. `invalidate()` dipanggil tiap frame selama ada animasi saja (loop on-demand,
     sesuai prinsip `EModul.jsx:100-101`).
   - **Cincin**: pool 4 `<mesh>` `ringGeometry` + `meshBasicMaterial` aditif warna #d9962f,
     berpusat di titik kontak, datar di bidang membran; dimulai berselang, melebar dengan
     `cincin().laju`, jarak `cincin().jarak`, memudar ~1,2 s.
   - **Reduced motion** (`matchMedia('(prefers-reduced-motion: reduce)')`): tanpa ayunan,
     `onHit` langsung, cincin tetap tampil.
   - **Cadangan**: error boundary kecil di sekitar `<Canvas>`; jika WebGL/GLB gagal, kanvas
     disembunyikan dan tombol langsung memanggil `onHit` — lab tetap bisa dipakai.
5. **`Lab.jsx`**: ganti blok `.gb-drum` + tombol "Tabuh pinggir" (baris 105-116) dengan
   `<Drum3D drum amp freq speed onHit />`; label drum dan `hitLabel` tetap.
6. **`EModul.jsx`** (`renderVals`, sekitar baris 953 & 1615-1621): teruskan `drum: st.drum`,
   `amp: st.amp`, `freq: this.pitch('tengah')`, `speed: SPEED[st.medium]`, `hitZone: (z) => this.hit(z)`.
   Hapus `drumSize`, `pressed`, `drumOuterStyle`, `drumSkinStyle`, `drumCenterStyle`, `ringStyle`,
   `hitTengah`, `hitPinggir` (kode mati). `hit()` tidak diubah.
7. **`app/globals.css`** (`.gb-stage`, baris 155-163): tinggi kanvas `clamp(240px,32vw,340px)`,
   tombol di bawah kanvas pada <560px.

## File yang disentuh
- baru: `public/gendang-beleq.glb`, `app/components/Drum3D.jsx`, `app/components/gelombang.js`,
  `app/components/gelombang.test.mjs`, `docs/superpowers/specs/2026-09-19-gendang-3d-design.md`
- ubah: `app/components/Lab.jsx`, `app/components/EModul.jsx`, `app/globals.css`, `package.json`, `bun.lock`

## Verifikasi
- `bun run test` (termasuk `gelombang.test.mjs`; tes fisika/grading tetap lulus), `bun run lint`, `bun run build`.
- `bun run dev` + claude-in-chrome di Lab → Tabuh & amati:
  - klik tengah → pemukul ke tengah, cincin dari pusat, dB/osiloskop bergerak, label "titik tengah";
  - klik pinggir di 3 sudut → cincin dari tepi pada sudut itu, label "pinggir membran";
  - naikkan tegangan → cincin lebih rapat; ganti ke Air/Zat padat → cincin lebih cepat; amplitudo kecil → cincin redup;
  - tombol keyboard berfungsi; Mame/Nine mengubah skala; lebar 360px tanpa scroll horizontal;
  - console bebas error; rekam GIF singkat.

## Penyempurnaan saat menulis rencana implementasi
- `Drum3D.jsx` dibagi dua: `Drum3D.jsx` (ringan: tombol, state, error boundary) memuat
  `Panggung3D.jsx` (Canvas R3F, berat) lewat `next/dynamic` `ssr:false`. Tombol langsung bekerja
  sebelum model siap dan saat WebGL gagal.
- Props frekuensi menjadi `frek: { tengah, pinggir }` karena tabuhan pinggir bernada lebih tinggi
  (`pitch()` ×1,7), jadi jarak cincin mengikuti nada zona yang ditabuh.
- `gelombang.js` juga memuat pose dan ayunan pemukul (`genggam`, `pose`, `sudutAyun`) supaya
  titik kontak kepala pemukul bisa diuji tanpa WebGL.
- Semua cincin satu tabuhan digambar oleh satu bidang shader (ketebalan cincin tetap), bukan pool mesh.
- Rencana implementasi: `docs/superpowers/plans/2026-09-19-gendang-3d.md`.

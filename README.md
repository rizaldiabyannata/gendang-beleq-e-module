# E-Modul Gelombang Bunyi · Gendang Beleq

E-modul Fisika Fase F tentang gelombang bunyi, dibangun di atas kearifan lokal Gendang
Beleq Sasak. Sisi siswa berisi materi, lab simulasi audio, dua LKPD penyelidikan, dan
bank soal. Sisi guru berisi panel yang mengelola seluruh konten, kelas, dan daftar nilai.

Frontend-nya static export (`output: "export"`), jadi bisa ditaruh di hosting statis
mana pun. Penyimpanan nilai memakai Supabase, yang dipanggil langsung dari browser.

## Menjalankan

```bash
bun install
cp .env.local.example .env.local     # isi dari dashboard Supabase
bun run dev
```

| Perintah | Kegunaan |
|---|---|
| `bun run dev` | Server pengembangan |
| `bun run build` | Membangun ulang konten publik lalu `next build` |
| `bun run content` | Menghasilkan ulang konten tanpa kunci jawaban |
| `bun run test` | Pemeriksaan mandiri untuk parser gaya dan mesin penilaian |
| `bun run lint` | ESLint |
| `./scripts/setup-supabase.sh` | Wizard penyiapan Supabase, aman dijalankan ulang |

## Menyiapkan Supabase

Jalankan wizard-nya. Ia membuka setiap halaman dashboard yang kamu butuhkan,
memberi tahu persis apa yang harus diklik, menangkap nilai yang kamu salin, dan
menuliskannya ke tempat yang benar.

```bash
./scripts/setup-supabase.sh
```

Delapan tahap, sekitar sepuluh menit:

| Tahap | Yang terjadi |
|---|---|
| 1 · Prasyarat | Memeriksa perkakas yang ada di komputermu |
| 2 · Buat proyek | Menangkap Project URL dan anon key ke `.env.local` |
| 3 · Anonymous sign-in | Mengaktifkan cara siswa bergabung tanpa kata sandi |
| 4 · Migrasi skema | Menyalin `0001_init.sql` ke papan klip untuk SQL Editor |
| 5 · Konten bawaan | Mengisi draf guru berikut seluruh kunci jawaban |
| 6 · Akun guru | Mendaftarkan akun kamu di tabel `teachers` |
| 7 · Edge Function | Deploy `submit`, yang menilai jawaban siswa |
| 8 · Verifikasi | Menjalankan uji dan menunjukkan langkah terakhir |

Wizard aman dijalankan ulang: nilai yang sudah tersimpan di `.env.local` ditawarkan
sebagai bawaan, dan berhenti dengan Ctrl-C tidak merusak apa pun. Ia juga menolak
kunci `service_role` kalau tersalin keliru, karena kunci itu melewati seluruh aturan
keamanan baris dan tidak boleh sampai ke peramban siswa.

Setelah selesai: `bun run dev`, tekan **Panel Guru**, buat satu kelas di tab Kelas,
lalu tekan **Terbitkan** di tab Data agar konten sampai ke siswa.

<details>
<summary>Kalau ingin melakukannya sendiri tanpa wizard</summary>

1. Buat proyek Supabase, salin Project URL dan anon key ke `.env.local`
   (lihat `.env.local.example`).
2. Aktifkan **Allow anonymous sign-ins** di Authentication → Sign In / Providers.
3. Jalankan `supabase/migrations/0001_init.sql` lalu `0002_seed_content.sql` di SQL Editor.
4. Buat akun guru di Authentication → Users, salin UID-nya, lalu:

   ```sql
   insert into teachers (auth_uid, nama) values ('<uid>', 'Nama Guru');
   ```

5. `supabase functions deploy submit`

</details>

## Kunci jawaban tidak pernah sampai ke browser siswa

Ini aturan yang menahan seluruh sistem penilaian, dan dijaga di empat tempat.

- `content/defaults.mjs` adalah satu-satunya sumber konten yang memuat kunci jawaban.
  Berkas ini **tidak diimpor oleh kode apa pun di dalam `app/`**.
- `scripts/build-content.mjs` menghasilkan `app/components/content-public.js` tanpa
  `key`, `keys`, `accept`, `keywords`, `model`, dan `fb`, lalu menolak menulis kalau
  masih ada yang tersisa.
- Penilaian terjadi di Edge Function `submit`, memakai konten asli di server. Kunci
  baru dikirim balik ke siswa setelah jawabannya terkunci, sebagai pembahasan.
- `app/components/grading.test.mjs` menegakkan aturan itu sebagai uji.

Kalau suatu saat ada tipe soal baru dengan nama kolom kunci yang lain, tambahkan nama
kolom itu ke `SECRET` di `supabase/functions/_shared/grading.ts`.

## Struktur

| Berkas | Isi |
|---|---|
| `content/defaults.mjs` | Konten bawaan lengkap, satu-satunya tempat kunci jawaban ditulis |
| `supabase/functions/_shared/grading.ts` | Mesin penilaian, dipakai server dan klien |
| `supabase/functions/submit/index.ts` | Menilai dan menyimpan satu jawaban |
| `supabase/migrations/` | Skema, RLS, dan isi awal |
| `app/lib/` | Klien Supabase, sesi, dan data panel guru |
| `app/components/` | Seluruh antarmuka; `EModul.jsx` memegang state dan view-model |
| `scripts/setup-supabase.sh` | Wizard penyiapan, delapan tahap |

# Kontrol guru realtime dan modul full online

Tanggal: 2026-09-10
Status: disetujui, siap dibuatkan rencana implementasi

## Tujuan

Guru dapat memantau pekerjaan siswa secara langsung dari panel guru tanpa memuat
ulang halaman, dan modul dijalankan sebagai situs online di VPS milik sendiri,
bukan sebagai aplikasi yang bisa dipakai offline.

## Keputusan yang sudah diambil

| Pertanyaan | Keputusan |
|---|---|
| Arti "dikontrol guru" | Papan pantau langsung. Guru mengamati; layar siswa tidak disetir guru. |
| Tempat menjalankan | VPS sendiri, Supabase di-host sendiri dengan Docker. Domain sudah ada. |
| Batas "full online" | Mode offline dibuang. `output: "export"` tetap dipertahankan. |
| Pendekatan | Satu kolom `progress` jsonb di `students`, ditambah langganan Postgres Changes pada tabel yang sudah ada. |

Alasan pendekatan itu dipilih dibanding tabel progres terpisah dengan Broadcast:
seluruh kebijakan RLS di `0001_init.sql` langsung berlaku pada Postgres Changes
tanpa ditulis ulang, karena Supabase memeriksa setiap kejadian terhadap kebijakan
`select` milik pelanggan. Dokumentasi Supabase menyebut Broadcast baru diperlukan
di atas sekitar 3.000 pelanggan serentak pada perubahan yang sama; satu panel guru
jauh di bawah angka itu.

## Di luar lingkup

- Guru menyetir layar siswa (mengunci bank soal, mendorong kelas ke tahap tertentu).
- Membongkar `EModul.jsx` supaya tidak ada state yang hidup di memori komponen.
- Pindah ke server Next.js, Server Component, middleware, atau `@supabase/ssr`.
- Pipeline CI, lingkungan staging, dan kontainerisasi modulnya sendiri.

## Bagian 1: skema dan basis data

### Perpindahan state

| State sekarang di localStorage | Rumah barunya |
|---|---|
| `answers` | sudah ada di tabel `submissions` |
| `fields` | sudah ada di tabel `lkpd` |
| `xp`, `done`, `refleksi`, `videoUrl`, `draft` | kolom baru `students.progress` bertipe jsonb |

### Migrasi `supabase/migrations/0003_progress_realtime.sql`

Isi yang harus dihasilkan:

```sql
alter table students add column progress jsonb not null default '{}'::jsonb;

-- Siswa dan guru sama-sama memakai peran `authenticated`, jadi trik GRANT per kolom
-- yang dipakai tabel `submissions` tidak bisa memisahkan keduanya di sini. Memberi
-- siswa izin update ke barisnya sendiri berarti juga memberinya izin mengganti nama,
-- kelas, dan nomor absennya. Karena itu penulisan lewat fungsi, seperti `grade_lkpd`.
create or replace function save_progress(p jsonb) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'Belum masuk';
  end if;
  update students set progress = p where auth_uid = auth.uid();
end;
$$;

alter publication supabase_realtime add table students, submissions, lkpd;
```

Catatan keamanan: fungsi `security definer` di skema `public` dapat dipanggil oleh
`anon` dan `authenticated` tanpa GRANT tambahan, jadi pemeriksaan `auth.uid()` di
dalam badan fungsi itu wajib ada dan tidak boleh dilepas. Fungsi ini hanya menyentuh
baris milik pemanggil.

## Bagian 2: perubahan klien

### Panel guru jadi hidup

Fungsi baru `watchClass(classId, onChange)` di `app/lib/teacher.js`, mengembalikan
pemutus langganan:

- Berlangganan `postgres_changes` untuk `event: '*'` pada `students`, `submissions`,
  dan `lkpd`.
- `submissions` dan `lkpd` tidak punya kolom `class_id`, jadi penyaringan per kelas
  dilakukan di klien terhadap daftar `student_id` yang sudah dimuat, bukan lewat
  parameter `filter`.
- Setiap kejadian memanggil ulang `loadClassWork` dengan penahanan setengah detik,
  bukan menambal state per baris. Sedikit lebih boros, tapi tampilan guru tidak
  mungkin menyimpang dari isi basis data.
- `EModul.openPanel` memasang langganan; komponen melepasnya saat panel ditutup dan
  pada `componentWillUnmount`.

### Progres siswa pindah ke server

- `bootstrap()` di `app/lib/session.js` menambahkan kolom `progress` pada select
  baris siswa, sehingga progres ikut terbawa saat sesi dipulihkan.
- Fungsi baru `saveProgress(payload)` memanggil RPC `save_progress`, ditahan dua
  detik setelah aktivitas berhenti.
- `EModul.persist()` tidak lagi menulis ke localStorage; ia memanggil `saveProgress`.
  Tercatat ada enam pemanggil `this.persist()` dan satu titik hidrasi di
  `componentDidMount`, jadi permukaan perubahannya kecil.
- `persist()` melewatkan penulisan ke server kalau `state.role` bukan `'siswa'`.
  Tamu dan guru tidak punya baris di tabel `students`, dan tanpa penjagaan ini RPC-nya
  akan selalu gagal lalu menyalakan indikator `saveFailed` pada orang yang memang
  tidak punya apa-apa untuk disimpan.

### Mode offline dibuang

- `app/sw-register.tsx` dihapus, beserta pemanggilannya di `app/layout.tsx`.
- `public/manifest.webmanifest` dihapus, beserta tautannya di `layout.tsx`.
- Konstanta `KEY` dan `CMS_KEY` di `app/components/module-data.js` dihapus. Draf
  konten guru sudah tersimpan di tabel `content` lewat `saveDraft`, jadi salinan
  localStorage-nya duplikat.
- `public/sw.js` TIDAK dihapus. Isinya diganti dengan skrip yang mencabut dirinya
  sendiri lalu mengosongkan cache. Menghapus berkasnya tidak mencabut service worker
  yang sudah terpasang di perangkat, dan peramban akan terus menyajikan cache lama
  sehingga siswa tidak pernah melihat versi baru. Berkas itu baru boleh dibuang
  setelah semua perangkat dipastikan sudah melewatinya.

### Penanganan galat

- Gagal menulis progres memakai ulang indikator `saveFailed` yang sudah ada di
  komponen, sehingga siswa tahu pekerjaannya belum tersimpan.
- Kanal realtime yang putus disambung ulang sendiri oleh supabase-js. Sebagai jaring
  pengaman, panel guru memuat ulang tiap lima belas detik selama kanalnya belum
  berstatus tersambung.

### Perubahan perilaku yang disadari

Tamu, yaitu orang yang membuka modul tanpa memasukkan kode kelas, tidak punya baris
di tabel `students`. Setelah localStorage dibuang, progres tamu hanya hidup di memori
dan hilang saat halaman dimuat ulang. Modul mengarahkan mereka bergabung ke kelas
lebih dulu. Ini diterima, bukan cacat.

## Bagian 3: penyebaran ke VPS

### Nama host

Dua subdomain dari domain yang sudah ada, misalnya `modul.domainmu` untuk modul dan
`api.domainmu` untuk Supabase. Pemisahan ini membuat konfigurasi Kong tidak perlu
diubah, karena Kong sudah melayani `/rest`, `/auth`, `/realtime`, dan `/functions`
di akar host-nya sendiri.

### Caddy

Satu `Caddyfile` menangani sertifikat HTTPS otomatis untuk kedua host. Host modul
menyajikan isi `out/` sebagai berkas statis. Host api meneruskan ke Kong. Caddy
meneruskan websocket tanpa konfigurasi tambahan, dan itu yang dipakai realtime.

### Stack Supabase

Memakai berkas compose resmi dari direktori `docker` di repositori Supabase, bukan
`supabase start`. Yang terakhir itu alat pengembangan dan kuncinya adalah kunci demo
yang sama untuk semua orang. Skrip di repositori itu membangkitkan
`POSTGRES_PASSWORD`, `SECRET_KEY_BASE`, `VAULT_ENC_KEY`, `REALTIME_DB_ENC_KEY`,
kunci API, dan sandi Studio.

Syarat minimum menurut dokumentasi:

| Sumber daya | Minimum | Disarankan |
|---|---|---|
| RAM | 4 GB | 8 GB |
| CPU | 2 inti | 4 inti |
| Disk | 40 GB | 80 GB SSD |

### Tiga hal yang tidak terbawa sendiri dari Docker lokal

1. `supabase/config.toml` hanya dibaca CLI. Anonymous sign-in harus dinyalakan lagi
   lewat `GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED=true` pada `.env` stack self-host.
   Nama variabel itu diambil dari kontainer auth yang sedang berjalan di Docker lokal,
   bukan dari ingatan. Tanpa itu siswa tidak bisa bergabung sama sekali.
2. Edge Function pada stack self-host dipasang sebagai folder yang di-mount, bukan
   di-deploy lewat CLI. Isi `supabase/functions` disalin ke direktori fungsi milik
   stack.
3. Ketiga migrasi dijalankan sekali ke basis data itu, lalu akun guru dibuat dan
   didaftarkan ke tabel `teachers`.

### Alur rilis modul

Sebelum membangun, `.env.local` diarahkan ke stack produksi: `NEXT_PUBLIC_SUPABASE_URL`
menjadi `https://api.domainmu`, dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` diisi kunci
publishable yang dibangkitkan skrip stack self-host, bukan kunci demo Docker lokal.
Karena `output: "export"` menanam nilai itu ke dalam berkas hasil build, salah env
saat membangun berarti modul yang terbit menunjuk ke localhost.

Lalu `bun run build`, dan salin `out/` ke VPS dengan rsync. Tidak ada proses Node yang
perlu hidup di server untuk modulnya.

### Cadangan

Satu tugas cron harian menjalankan `pg_dump` ke penyimpanan di luar VPS. Tanpa ini,
satu disk rusak berarti nilai satu semester hilang.

## Pengujian

- Satu berkas uji baru bergaya `assert` seperti `app/components/grading.test.mjs` dan
  `app/components/sx.test.mjs`, untuk logika penggabungan dan penahanan progres.
  Itu satu-satunya bagian baru yang punya cabang.
- Sisanya diperiksa langsung terhadap stack Docker lokal: satu siswa mengerjakan,
  panel guru berubah tanpa dimuat ulang.
- `bun run test` harus tetap hijau.

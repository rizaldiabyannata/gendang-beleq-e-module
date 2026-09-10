# Menyebarkan e-modul ke VPS sendiri

Runbook ini menempatkan dua hal di satu VPS: stack Supabase yang di-host sendiri, dan
berkas statis hasil `next build`. Ganti `modul.contoh.id` dan `api.contoh.id` di setiap
langkah dengan domainmu sendiri.

Syarat minimum server menurut dokumentasi Supabase:

| Sumber daya | Minimum | Disarankan |
|---|---|---|
| RAM | 4 GB | 8 GB |
| CPU | 2 inti | 4 inti |
| Disk | 40 GB | 80 GB SSD |

Sebelum mulai, arahkan kedua nama host itu ke IP VPS lewat data A di panel DNS domainmu.
Caddy tidak bisa menerbitkan sertifikat sebelum keduanya menunjuk ke sana.

## 1. Stack Supabase

Jangan memakai `supabase start`. Itu alat pengembangan, dan kuncinya adalah kunci demo
yang sama untuk semua orang di dunia. Yang dipakai adalah berkas compose resmi.

```bash
git clone --depth 1 https://github.com/supabase/supabase /opt/supabase-src
mkdir -p /opt/supabase && cp -r /opt/supabase-src/docker/* /opt/supabase/
cd /opt/supabase && cp .env.example .env
```

Baca `README.md` di direktori itu untuk nama skrip pembangkit rahasianya pada versi yang
baru saja ditarik, lalu jalankan skrip tersebut. Dokumentasi Supabase juga menyediakan
jalur satu perintah, `curl -fsSL https://supabase.link/setup.sh | sh`.

Isi nilai berikut di `/opt/supabase/.env`:

| Variabel | Nilai |
|---|---|
| `SUPABASE_PUBLIC_URL` | `https://api.contoh.id` |
| `API_EXTERNAL_URL` | `https://api.contoh.id` |
| `SITE_URL` | `https://modul.contoh.id` |
| `POSTGRES_PASSWORD`, `SECRET_KEY_BASE`, `VAULT_ENC_KEY`, `REALTIME_DB_ENC_KEY`, `DASHBOARD_PASSWORD` | hasil skrip pembangkit, jangan nilai bawaan |

## 2. Nyalakan anonymous sign-in

Siswa masuk lewat kode kelas, bukan email. Di balik layar tiap perangkat tetap butuh
`auth.uid()` sungguhan supaya aturan keamanan baris punya sesuatu untuk diikat. **Tanpa
langkah ini siswa tidak bisa bergabung sama sekali.**

`supabase/config.toml` di repo hanya dibaca oleh CLI, jadi setelan itu tidak ikut ke sini.

```bash
cd /opt/supabase && grep -in "anonymous" .env.example docker-compose.yml
```

- Kalau ada variabel seperti `ENABLE_ANONYMOUS_USERS`, isi `true` di `.env`.
- Kalau tidak ada, tambahkan baris ini ke blok `environment` layanan `auth` di
  `docker-compose.yml`:

  ```yaml
        GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED: "true"
  ```

Setelah stack menyala, pastikan nilainya benar-benar sampai:

```bash
docker exec supabase-auth env | grep -i anonymous
```

Harus muncul `GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED=true`.

## 3. Pasang Edge Function `submit`

Fungsi inilah yang menilai jawaban siswa, dan satu-satunya tempat kunci jawaban dibaca.
Pada stack self-host fungsi tidak di-deploy lewat CLI, melainkan dipasang sebagai folder
yang di-mount. Salin dari repo:

```bash
rsync -a supabase/functions/submit  user@vps:/opt/supabase/volumes/functions/
rsync -a supabase/functions/_shared user@vps:/opt/supabase/volumes/functions/
```

Lalu jalankan ulang layanan fungsinya, dan periksa:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.contoh.id/functions/v1/submit \
  -H "Content-Type: application/json" -d '{}'
```

`401` berarti fungsinya hidup dan menolak permintaan tanpa sesi, seperti seharusnya.
`404` berarti foldernya belum terpasang di tempat yang benar.

## 4. Migrasi dan akun guru

Jalankan ketiga migrasi berurutan:

```bash
for f in 0001_init.sql 0002_seed_content.sql 0003_progress_realtime.sql; do
  docker exec -i supabase-db psql -U postgres -d postgres < "supabase/migrations/$f"
done
```

Buat akun guru lewat Studio atau admin API, salin UID-nya, lalu daftarkan. Hanya akun
yang ada di tabel `teachers` yang bisa membuka panel dan melihat nilai.

```sql
insert into teachers (auth_uid, nama) values ('<UID>', '<Nama Guru>');
```

## 5. Caddy

Salin `deploy/Caddyfile` ke `/etc/caddy/Caddyfile`, ganti kedua nama host, lalu muat ulang
Caddy. Berkas itu sudah memuat penanganan `try_files` untuk hasil export statis dan aturan
agar `/sw.js` tidak pernah disajikan dari cache.

## 6. Bangun dan kirim modulnya

`output: "export"` menanam URL Supabase ke dalam berkas hasil build. Membangun dengan env
Docker lokal berarti menerbitkan modul yang menunjuk ke `localhost`, dan tidak ada satu pun
perangkat siswa yang bisa memakainya. Jadi tukar dulu `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://api.contoh.id
NEXT_PUBLIC_SUPABASE_ANON_KEY=<kunci anon atau publishable dari /opt/supabase/.env>
```

```bash
bun run build
rsync -az --delete out/ user@vps:/srv/emodul/
```

Jangan pernah memakai kunci `service_role` atau `secret` di sini. Kunci itu melewati
seluruh aturan keamanan baris, dan setiap nilai `NEXT_PUBLIC_` ikut ke peramban siswa.

## 7. Cadangan harian

Tanpa ini, satu disk rusak berarti nilai satu semester hilang.

`/usr/local/bin/emodul-backup.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F)
OUT=/var/backups/emodul
mkdir -p "$OUT"
docker exec supabase-db pg_dump -U postgres -d postgres | gzip > "$OUT/emodul-$STAMP.sql.gz"
find "$OUT" -name 'emodul-*.sql.gz' -mtime +30 -delete
# Tambahkan satu baris rsync atau rclone ke sini. Cadangan yang duduk di disk yang sama
# dengan basis datanya bukan cadangan.
```

```bash
chmod +x /usr/local/bin/emodul-backup.sh
( crontab -l 2>/dev/null; echo "17 2 * * * /usr/local/bin/emodul-backup.sh" ) | crontab -
```

Jalankan sekali secara manual, lalu pastikan berkasnya ada dan ukurannya tidak nol.

## 8. Periksa dari perangkat lain

Dari ponsel di jaringan seluler, bukan Wi-Fi rumah:

1. Buka `https://modul.contoh.id`, materinya harus tampil.
2. Bergabung ke kelas dengan kode dari panel guru.
3. Jawab satu soal.
4. Tabel di panel guru yang terbuka di laptop harus bertambah tanpa disentuh.
5. Muat ulang halaman di ponsel, XP-nya harus kembali.

## Catatan

Nama kontainer `supabase-db` dan `supabase-auth` di atas mengikuti bawaan compose resmi.
Periksa dengan `docker ps` kalau di servermu berbeda.

Nilai rahasia tidak pernah ditulis ke repo ini. Semuanya hidup di `/opt/supabase/.env`
di server.

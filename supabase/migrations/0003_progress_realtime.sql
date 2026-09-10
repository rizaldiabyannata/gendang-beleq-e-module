-- Progres siswa yang tidak punya rumah lain di server.
--
-- Jawaban kuis hidup di `submissions` dan isian LKPD di `lkpd`. Lima hal sisanya —
-- xp, done, refleksi, videoUrl, dan draft — dulu hanya ada di localStorage, jadi
-- progres seorang siswa terikat pada satu peramban di satu perangkat dan tidak
-- pernah terlihat guru. Kolom ini yang memberi mereka rumah.
alter table students add column progress jsonb not null default '{}'::jsonb;

-- Siswa dan guru sama-sama memakai peran `authenticated`, jadi trik GRANT per kolom
-- yang dipakai tabel `submissions` tidak bisa memisahkan keduanya di sini. Memberi
-- siswa kebijakan update ke barisnya sendiri berarti juga memberinya izin mengganti
-- nama, kelas, dan nomor absennya. Karena itu penulisan lewat fungsi, sama seperti
-- `grade_lkpd`.
--
-- Fungsi `security definer` di skema public bisa dipanggil siapa pun tanpa GRANT
-- tambahan, jadi pemeriksaan auth.uid() di bawah ini yang menjadi satu-satunya
-- penjaga. Jangan dilepas.
create or replace function save_progress(p jsonb) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'Belum masuk';
  end if;
  if jsonb_typeof(p) is distinct from 'object' then
    raise exception 'Progres harus berupa objek';
  end if;
  update students set progress = p where auth_uid = auth.uid();
end;
$$;

-- Tanpa baris ini, langganan Postgres Changes tersambung tapi tidak pernah menerima
-- apa pun. RLS yang sudah ada di 0001 tetap berlaku: Supabase memeriksa tiap kejadian
-- terhadap kebijakan select milik pelanggan, jadi siswa tetap hanya melihat dirinya.
alter publication supabase_realtime add table students, submissions, lkpd;

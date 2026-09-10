-- E-Modul Gendang Beleq — skema penilaian
--
-- Satu guru, banyak kelas. Siswa masuk lewat kode kelas dan anonymous sign-in, jadi
-- setiap perangkat punya auth.uid() sungguhan yang bisa dipakai RLS, tanpa siswa
-- pernah membuat email atau kata sandi.

create extension if not exists pgcrypto;

-- ── Tabel ────────────────────────────────────────────────────────────────────

-- Daftar putih guru. Isi satu baris berisi auth uid akun guru Anda; siapa pun yang
-- tidak ada di sini adalah siswa, apa pun cara ia login.
create table teachers (
  auth_uid uuid primary key references auth.users(id) on delete cascade,
  nama     text not null default 'Guru'
);

create table classes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text not null unique,
  is_open    boolean not null default true,
  created_at timestamptz not null default now()
);

create table students (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  auth_uid   uuid not null unique references auth.users(id) on delete cascade,
  nama       text not null,
  kelas      text not null default '',
  absen      int,
  created_at timestamptz not null default now()
);
create index students_class_idx on students(class_id);

-- Dua baris, selamanya: 'draft' yang disunting guru dan 'published' yang dibaca siswa.
-- Bobot penilaian, KKM modul dan kunci tahapan ikut hidup di dalam payload.
create table content (
  id         text primary key check (id in ('draft', 'published')),
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);

create table submissions (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  bank_id       text not null,
  item_index    int  not null,
  answer        jsonb,
  auto_ok       boolean,
  auto_ratio    numeric,
  needs_teacher boolean not null default false,
  -- Kunci jawaban butir ini, disalin ke sini oleh Edge Function SETELAH jawaban
  -- terkunci. Siswa hanya punya satu kesempatan per butir, jadi menampilkan kunci
  -- sesudahnya adalah pembahasan, bukan kebocoran — dan menyimpannya di baris ini
  -- membuat pembahasan itu tetap ada saat halaman dimuat ulang.
  reveal        jsonb,
  teacher_score numeric check (teacher_score between 0 and 100),
  teacher_note  text,
  submitted_at  timestamptz not null default now(),
  -- Ini yang benar-benar menegakkan aturan satu kali jawab. Di klien aturan itu
  -- hanya sopan santun yang bisa dilewati siapa pun lewat devtools.
  unique (student_id, bank_id, item_index)
);
create index submissions_student_idx on submissions(student_id);

create table lkpd (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  sheet         text not null check (sheet in ('frekuensi', 'doppler')),
  fields        jsonb not null default '{}'::jsonb,
  rubric        jsonb,
  teacher_score numeric check (teacher_score between 0 and 100),
  teacher_note  text,
  updated_at    timestamptz not null default now(),
  submitted_at  timestamptz,
  unique (student_id, sheet)
);
create index lkpd_student_idx on lkpd(student_id);

-- ── Helper ───────────────────────────────────────────────────────────────────

create or replace function is_teacher() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from teachers where auth_uid = auth.uid());
$$;

-- Baris siswa milik pemanggil saat ini, atau null kalau ia bukan siswa.
create or replace function my_student_id() returns uuid
language sql stable security definer set search_path = public, auth as $$
  select id from students where auth_uid = auth.uid();
$$;

-- Bergabung ke kelas lewat kode. Dijalankan sebagai security definer supaya siswa
-- bisa mencocokkan kode tanpa pernah diberi izin membaca tabel classes secara umum —
-- kalau tidak, siapa pun bisa mengambil daftar kode seluruh kelas.
create or replace function join_class(p_code text, p_nama text, p_kelas text, p_absen int)
returns students
language plpgsql security definer set search_path = public, auth as $$
declare
  c classes%rowtype;
  s students%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Belum masuk sebagai siswa';
  end if;

  select * into c from classes where upper(code) = upper(trim(p_code));
  if not found then
    raise exception 'Kode kelas tidak ditemukan';
  end if;
  if not c.is_open then
    raise exception 'Kelas ini sedang ditutup guru';
  end if;
  if length(trim(coalesce(p_nama, ''))) = 0 then
    raise exception 'Nama tidak boleh kosong';
  end if;

  insert into students (class_id, auth_uid, nama, kelas, absen)
  values (c.id, auth.uid(), trim(p_nama), coalesce(trim(p_kelas), ''), p_absen)
  on conflict (auth_uid) do update
    set nama = excluded.nama, kelas = excluded.kelas,
        absen = excluded.absen, class_id = excluded.class_id
  returning * into s;

  return s;
end;
$$;

-- Menerbitkan: salin draft ke published. Ini satu-satunya jalan konten sampai ke siswa.
create or replace function publish_content() returns timestamptz
language plpgsql security definer set search_path = public, auth as $$
declare t timestamptz;
begin
  if not is_teacher() then
    raise exception 'Hanya guru yang bisa menerbitkan';
  end if;
  insert into content (id, payload, updated_at)
  select 'published', payload, now() from content where id = 'draft'
  on conflict (id) do update set payload = excluded.payload, updated_at = now()
  returning updated_at into t;
  return t;
end;
$$;

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table teachers    enable row level security;
alter table classes     enable row level security;
alter table students    enable row level security;
alter table content     enable row level security;
alter table submissions enable row level security;
alter table lkpd        enable row level security;

-- teachers: hanya guru yang boleh melihat daftarnya, dan tidak ada yang boleh menulis
-- lewat API. Menambah guru dilakukan dari dashboard Supabase.
create policy teachers_read on teachers for select to authenticated using (is_teacher());

-- classes: guru penuh. Siswa tidak diberi select sama sekali — join_class() yang
-- mencocokkan kode untuknya, jadi daftar kode tidak pernah bisa disedot.
create policy classes_teacher on classes for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy classes_own on classes for select to authenticated
  using (id = (select class_id from students where auth_uid = auth.uid()));

-- students: siswa hanya melihat dirinya sendiri; guru melihat semua.
create policy students_own on students for select to authenticated
  using (auth_uid = auth.uid() or is_teacher());
create policy students_teacher_write on students for all to authenticated
  using (is_teacher()) with check (is_teacher());

-- content: siapa pun boleh membaca yang sudah terbit. Draft hanya guru.
create policy content_published on content for select to anon, authenticated
  using (id = 'published');
create policy content_draft_read on content for select to authenticated
  using (is_teacher());
-- Guru menulis ke draft saja. Baris published hanya bisa berubah lewat
-- publish_content(), sehingga menerbitkan selalu jadi tindakan yang disengaja.
create policy content_draft_write on content for all to authenticated
  using (is_teacher() and id = 'draft')
  with check (is_teacher() and id = 'draft');

-- submissions: siswa membaca miliknya sendiri dan tidak pernah menulis langsung.
-- Penulisan hanya lewat Edge Function yang memegang service role, karena hanya di
-- sanalah kunci jawaban boleh ada.
create policy submissions_own on submissions for select to authenticated
  using (student_id = my_student_id() or is_teacher());
create policy submissions_teacher_grade on submissions for update to authenticated
  using (is_teacher()) with check (is_teacher());

-- Guru boleh menilai, tapi tidak boleh menyunting jawaban siswa — bahkan tidak
-- sengaja. RLS tidak bisa membatasi kolom, jadi GRANT yang melakukannya.
revoke update on submissions from authenticated;
grant  update (teacher_score, teacher_note) on submissions to authenticated;

-- lkpd: siswa menyunting miliknya sendiri selama belum disetorkan.
create policy lkpd_read on lkpd for select to authenticated
  using (student_id = my_student_id() or is_teacher());
create policy lkpd_insert on lkpd for insert to authenticated
  with check (student_id = my_student_id());
create policy lkpd_update on lkpd for update to authenticated
  using (student_id = my_student_id() and submitted_at is null)
  with check (student_id = my_student_id());
-- Guru menilai LKPD lewat RPC, bukan update langsung. Siswa dan guru sama-sama
-- memakai role authenticated, jadi trik GRANT per kolom di atas tidak bisa
-- memisahkan keduanya di tabel ini.
create or replace function grade_lkpd(p_id uuid, p_score numeric, p_note text, p_rubric jsonb)
returns lkpd
language plpgsql security definer set search_path = public, auth as $$
declare r lkpd%rowtype;
begin
  if not is_teacher() then
    raise exception 'Hanya guru yang bisa menilai';
  end if;
  update lkpd set teacher_score = p_score, teacher_note = p_note,
                  rubric = coalesce(p_rubric, rubric)
  where id = p_id returning * into r;
  return r;
end;
$$;

-- ── Isi awal ─────────────────────────────────────────────────────────────────
-- Payload sebenarnya ditulis panel guru saat pertama kali dibuka; dua baris ini
-- hanya memastikan barisnya ada.
insert into content (id, payload) values ('draft', '{}'::jsonb), ('published', '{}'::jsonb)
on conflict (id) do nothing;

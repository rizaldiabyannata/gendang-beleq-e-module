-- Siswa tidak boleh menilai LKPD-nya sendiri.
--
-- Kebijakan lkpd_insert dan lkpd_update di 0001 hanya memeriksa BARIS mana yang
-- boleh disentuh siswa, bukan KOLOM mana. Akibatnya siswa bisa mengirim
-- teacher_score = 100 lewat devtools pada lembar miliknya sendiri, selama lembar itu
-- belum disetorkan — atau langsung saat baris pertama kali dibuat.
--
-- Komentar di 0001 menyebut GRANT per kolom tidak bisa dipakai di tabel ini karena
-- guru dan siswa berbagi peran `authenticated`. Itu benar hanya kalau guru menulis
-- langsung ke tabel. Guru menilai lewat grade_lkpd(), yang security definer dan
-- karena itu tidak terikat GRANT ini, jadi kolom nilai bisa ditutup untuk semua
-- penulisan langsung tanpa mengganggu penilaian.
--
-- Daftar kolomnya persis yang dikirim submitLkpd() dan saveLkpdDraft(). student_id
-- dan sheet ikut di daftar update karena upsert PostgREST menulis ulang setiap kolom
-- yang ada di badan permintaan, termasuk kolom konfliknya; RLS tetap memastikan
-- student_id itu milik pemanggil.
revoke insert, update on lkpd from authenticated;
grant insert (student_id, sheet, fields, updated_at, submitted_at) on lkpd to authenticated;
grant update (student_id, sheet, fields, updated_at, submitted_at) on lkpd to authenticated;

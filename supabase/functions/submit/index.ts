// Menilai satu jawaban siswa dan menyimpannya.
//
// Ini satu-satunya tempat kunci jawaban dibaca. Browser siswa menerima konten yang
// sudah dibuang kuncinya (lihat stripKeys di _shared/grading.ts), jadi nilai yang
// keluar dari sini tidak bisa dipalsukan dari devtools.
//
// Deploy: supabase functions deploy submit

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { grade, validate, TYPE_XP, type Item } from '../_shared/grading.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const auth = req.headers.get('Authorization') ?? '';

  // Dua klien: satu meminjam token siswa untuk menjawab "siapa ini", satu memakai
  // service role untuk membaca kunci jawaban dan menulis nilai. Yang kedua tidak
  // pernah menyentuh apa pun yang berasal dari badan permintaan tanpa dicek dulu.
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  });
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const { data: userRes } = await asUser.auth.getUser();
    if (!userRes?.user) return json({ error: 'Belum masuk' }, 401);

    const body = await req.json().catch(() => null);
    const bankId = String(body?.bankId ?? '');
    const itemIndex = Number(body?.itemIndex);
    const answer = body?.answer;
    if (!bankId || !Number.isInteger(itemIndex) || itemIndex < 0) {
      return json({ error: 'Permintaan tidak lengkap' }, 400);
    }

    const { data: student } = await admin
      .from('students').select('id, class_id').eq('auth_uid', userRes.user.id).maybeSingle();
    if (!student) return json({ error: 'Kamu belum bergabung ke kelas' }, 403);

    const { data: cls } = await admin
      .from('classes').select('is_open').eq('id', student.class_id).maybeSingle();
    if (!cls?.is_open) return json({ error: 'Kelas ini sedang ditutup guru' }, 403);

    const { data: row } = await admin
      .from('content').select('payload').eq('id', 'published').maybeSingle();
    const banks: { id: string; open?: boolean; items?: Item[] }[] = row?.payload?.banks ?? [];
    const bank = banks.find((b) => b.id === bankId);
    if (!bank) return json({ error: 'Bank soal tidak ditemukan' }, 404);
    if (bank.open === false) return json({ error: 'Bank soal ini belum dibuka guru' }, 403);

    const item = (bank.items ?? [])[itemIndex];
    if (!item) return json({ error: 'Soal tidak ditemukan' }, 404);

    const invalid = validate(item, answer);
    if (invalid) return json({ error: invalid }, 400);

    const g = grade(item, answer);

    // Dibuka setelah jawaban terkunci, bukan sebelumnya.
    const reveal: Record<string, unknown> = {};
    if (item.key !== undefined) reveal.key = item.key;
    if (item.keys) reveal.keys = item.keys;
    if (item.accept?.length) reveal.accept = item.accept[0];

    // Menjawab benar memberi XP penuh; menjawab dan meleset tetap memberi sedikit,
    // karena mencoba lalu membaca pembahasan adalah perilaku yang ingin didorong.
    const xp = g.ok ? (TYPE_XP[item.type] ?? 10) : 2;

    const { error } = await admin.from('submissions').insert({
      student_id: student.id,
      bank_id: bankId,
      item_index: itemIndex,
      answer,
      auto_ok: g.ok,
      auto_ratio: g.ratio,
      needs_teacher: !!g.needsTeacher,
      reveal,
    });
    // Constraint unik adalah yang benar-benar menegakkan satu kali jawab per butir.
    if (error) {
      if (error.code === '23505') return json({ error: 'Soal ini sudah pernah dijawab' }, 409);
      throw error;
    }

    return json({
      ok: g.ok,
      ratio: g.ratio,
      hit: g.hit ?? null,
      n: g.n ?? null,
      needsTeacher: !!g.needsTeacher,
      xp,
      // Pembahasan baru dikirim setelah jawaban terkunci, bukan sebelumnya.
      fb: item.fb ?? '',
      model: item.type === 'esai' ? (item.model ?? '') : '',
      reveal,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Gagal menyimpan jawaban' }, 500);
  }
});

'use client';

import { supabase, errText } from './supabase';

// Everything the teacher panel needs from the server, kept out of the component so
// the view-model stays a view-model.

const codeFrom = (name) => name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20)
  || 'KELAS-' + Math.random().toString(36).slice(2, 6).toUpperCase();

export async function listClasses() {
  const { data, error } = await supabase
    .from('classes').select('id, name, code, is_open, created_at, students(count)')
    .order('created_at', { ascending: true });
  if (error) throw new Error(errText(error));
  return (data || []).map((c) => ({ ...c, count: c.students?.[0]?.count ?? 0 }));
}

export async function createClass(name) {
  // A collision means two classes want the same name; the suffix keeps both usable.
  let code = codeFrom(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('classes').insert({ name: name.trim(), code }).select().single();
    if (!error) return data;
    if (error.code !== '23505') throw new Error(errText(error));
    code = codeFrom(name) + '-' + Math.random().toString(36).slice(2, 4).toUpperCase();
  }
  throw new Error('Gagal membuat kode kelas yang unik');
}

export async function updateClass(id, patch) {
  const { error } = await supabase.from('classes').update(patch).eq('id', id);
  if (error) throw new Error(errText(error));
}

// One round trip for the whole class: students, every mark, every worksheet.
export async function loadClassWork(classId) {
  const { data: students, error } = await supabase
    .from('students').select('id, nama, kelas, absen').eq('class_id', classId).order('absen', { nullsFirst: false });
  if (error) throw new Error(errText(error));
  const ids = (students || []).map((s) => s.id);
  if (!ids.length) return { students: [], subs: [], sheets: [] };

  const [{ data: subs }, { data: sheets }] = await Promise.all([
    supabase.from('submissions')
      .select('id, student_id, bank_id, item_index, answer, auto_ok, auto_ratio, needs_teacher, teacher_score, teacher_note')
      .in('student_id', ids),
    supabase.from('lkpd')
      .select('id, student_id, sheet, fields, rubric, teacher_score, teacher_note, submitted_at')
      .in('student_id', ids),
  ]);
  return { students: students || [], subs: subs || [], sheets: sheets || [] };
}

export async function gradeSubmission(id, score, note) {
  const { error } = await supabase.from('submissions')
    .update({ teacher_score: score, teacher_note: note || null }).eq('id', id);
  if (error) throw new Error(errText(error));
}

export async function gradeLkpd(id, score, note, rubric) {
  const { error } = await supabase.rpc('grade_lkpd', {
    p_id: id, p_score: score, p_note: note || null, p_rubric: rubric || null,
  });
  if (error) throw new Error(errText(error));
}

// The teacher panel used to load once and then sit still, so work a student handed
// in during the lesson only appeared if the teacher closed the panel and reopened it.
//
// No per-class filter: `submissions` and `lkpd` have no class_id column, and the
// reaction to any event is the same either way — refetch the class on screen. An
// event from another class costs one wasted refetch, which the caller's debounce
// already absorbs. RLS still applies to every event, so nothing arrives here that
// this teacher could not already read.
export function watchClass(onChange, onStatus) {
  const ch = supabase.channel('kelas-live');
  for (const table of ['students', 'submissions', 'lkpd']) {
    ch.on('postgres_changes', { event: '*', schema: 'public', table }, onChange);
  }
  ch.subscribe((status) => onStatus(status === 'SUBSCRIBED'));
  return () => { supabase.removeChannel(ch); };
}

// ── Marks ────────────────────────────────────────────────────────────────────

// A bank's mark is the share of its items the student got right, out of every item
// in the bank — not out of the ones they happened to attempt. Leaving questions
// blank is not the same as not sitting the test.
export function bankScore(items, subsForBank) {
  if (!items.length || !subsForBank.length) return null;
  const right = subsForBank.filter((s) => s.auto_ok).length;
  return right / items.length * 100;
}

// Essays are excluded from the bank average and carry their own weight, because a
// keyword count is not a mark and must never quietly become one.
export function essayScore(subs) {
  const graded = subs.filter((s) => s.needs_teacher && s.teacher_score != null);
  if (!graded.length) return null;
  return graded.reduce((a, s) => a + Number(s.teacher_score), 0) / graded.length;
}

// Weights are renormalised over the parts that actually have a mark, so a student
// who has not reached the worksheet yet is not shown a final grade dragged to zero
// by work that was never set.
export function finalScore(parts, bobot) {
  const w = [
    [parts.kuis, bobot.bobotKuis],
    [parts.lkpd, bobot.bobotLkpd],
    [parts.esai, bobot.bobotEsai],
    [parts.lab, bobot.bobotLab],
  ].filter(([v, b]) => v != null && b > 0);
  if (!w.length) return null;
  const total = w.reduce((a, [, b]) => a + b, 0);
  return w.reduce((a, [v, b]) => a + v * b, 0) / total;
}

export function toCsv(banks, rows) {
  const cell = (x) => {
    const s = x == null ? '' : String(x);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const head = ['Nama', 'Kelas', 'Absen', ...banks.map((b) => b.title), 'LKPD', 'Esai', 'Nilai akhir'];
  const body = rows.map((r) => [
    r.nama, r.kelas, r.absen,
    ...banks.map((b) => (r.banks[b.id] == null ? '' : Math.round(r.banks[b.id]))),
    r.lkpd == null ? '' : Math.round(r.lkpd),
    r.esai == null ? '' : Math.round(r.esai),
    r.akhir == null ? '' : Math.round(r.akhir),
  ]);
  // Semicolons: Excel in an Indonesian locale splits on those, not on commas.
  return [head, ...body].map((line) => line.map(cell).join(';')).join('\r\n');
}

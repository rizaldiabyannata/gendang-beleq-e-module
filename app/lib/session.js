'use client';

import { supabase, configured, errText } from './supabase';
import { stripKeys } from '../../supabase/functions/_shared/grading.ts';

// Who is holding this device, resolved once at boot.
//
//   { role: 'guru',  user }            — signed in with email and password
//   { role: 'siswa', user, student }   — anonymous session that has joined a class
//   { role: 'tamu',  user? }           — can read the module, cannot answer anything
export async function bootstrap() {
  if (!configured) return { role: 'tamu', offline: true };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { role: 'tamu' };

  const user = session.user;

  // A named account is a teacher candidate; the teachers table decides.
  if (!user.is_anonymous) {
    const { data } = await supabase.from('teachers').select('auth_uid, nama').eq('auth_uid', user.id).maybeSingle();
    if (data) return { role: 'guru', user, nama: data.nama };
    return { role: 'tamu', user, notTeacher: true };
  }

  const { data: student } = await supabase
    .from('students').select('id, class_id, nama, kelas, absen, progress').eq('auth_uid', user.id).maybeSingle();
  return student ? { role: 'siswa', user, student } : { role: 'tamu', user };
}

export async function teacherSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(errText(error));
  const { data: t } = await supabase.from('teachers').select('nama').eq('auth_uid', data.user.id).maybeSingle();
  if (!t) {
    await supabase.auth.signOut();
    throw new Error('Akun ini belum terdaftar sebagai guru');
  }
  return { role: 'guru', user: data.user, nama: t.nama };
}

// Students never type a password. An anonymous session gives the device a real
// auth.uid() so RLS has something to bind rows to, and join_class() matches the
// code server-side so the list of class codes is never readable.
export async function joinClass(code, nama, kelas, absen) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(errText(error));
  }
  const { data, error } = await supabase.rpc('join_class', {
    p_code: code, p_nama: nama, p_kelas: kelas,
    p_absen: absen === '' || absen == null ? null : Number(absen),
  });
  if (error) throw new Error(errText(error));
  return data;
}

export async function signOut() {
  if (configured) await supabase.auth.signOut();
}

// The content students see. Answer keys are stripped again here even though the
// server already withholds them, because a defence that only exists in one place
// is a defence that breaks silently the day someone edits the other place.
export async function fetchPublished() {
  if (!configured) return null;
  const { data, error } = await supabase.from('content').select('payload').eq('id', 'published').maybeSingle();
  if (error || !data?.payload?.banks) return null;
  return stripKeys(data.payload);
}

// The teacher's working copy, keys and all.
export async function fetchDraft() {
  const { data, error } = await supabase.from('content').select('payload, updated_at').eq('id', 'draft').maybeSingle();
  if (error) throw new Error(errText(error));
  return data;
}

export async function saveDraft(payload) {
  const { error } = await supabase.from('content')
    .upsert({ id: 'draft', payload, updated_at: new Date().toISOString() });
  if (error) throw new Error(errText(error));
}

export async function publish() {
  const { data, error } = await supabase.rpc('publish_content');
  if (error) throw new Error(errText(error));
  return data;
}

// The five progress keys that have no other home on the server. Written through a
// function rather than a direct update, because students and teachers share the
// `authenticated` role — see the comment on save_progress in 0003.
export async function saveProgress(payload) {
  const { error } = await supabase.rpc('save_progress', { p: payload });
  if (error) throw new Error(errText(error));
}

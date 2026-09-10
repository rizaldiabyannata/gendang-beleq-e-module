'use client';

import { createClient } from '@supabase/supabase-js';

// One client for the whole app. The anon key is meant to be public — every rule that
// protects a row lives in RLS on the server, not here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const configured = !!(url && key);

export const supabase = configured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Turns a Supabase error into something a teacher or a student can act on. Postgres
// raises our own `raise exception` text verbatim, so those messages are already
// written in Indonesian and pass through unchanged.
export function errText(e) {
  if (!e) return '';
  const m = String(e.message || e);
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Tidak ada koneksi internet';
  if (/Invalid login credentials/i.test(m)) return 'Email atau kata sandi salah';
  if (/Anonymous sign-ins are disabled/i.test(m)) return 'Anonymous sign-in belum diaktifkan di Supabase';
  if (/duplicate key|already exists/i.test(m)) return 'Soal ini sudah pernah dijawab';
  return m;
}

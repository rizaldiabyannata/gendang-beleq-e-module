// Answer-checking lives in supabase/functions/_shared/grading.ts so the Edge Function
// that grades and the client that renders can never disagree about a correct answer.
import { norm, numEq, seededPerm } from '../../supabase/functions/_shared/grading.ts';

// Content and question banks, lifted verbatim from the Claude Design source.
// The teacher panel edits a draft on the server; these are the fallback defaults.
const SPEED = { udara: 343, air: 1500, padat: 5100 };

// Konten bawaan tanpa kunci jawaban, dihasilkan dari content/defaults.mjs.
// Ini yang dipakai kalau modul belum terhubung ke Supabase, dan ini pula satu-satunya
// bentuk konten bawaan yang boleh ada di dalam bundel browser.
import CONTENT_PUBLIC from './content-public.js';

const CMS_DEFAULTS = CONTENT_PUBLIC;
const BANK_DEFAULTS = CONTENT_PUBLIC.banks;

const cloneCms = (o) => JSON.parse(JSON.stringify(o));

const TYPES = [
  ['pg', 'Pilihan ganda', 10],
  ['bs', 'Benar–Salah', 8],
  ['multi', 'Jawaban ganda', 15],
  ['isian', 'Isian singkat', 12],
  ['cocok', 'Pencocokan', 20],
  ['esai', 'Esai', 25]
];
const TYPE_LABEL = {}; const TYPE_XP = {};
TYPES.forEach(([k, l, x]) => { TYPE_LABEL[k] = l; TYPE_XP[k] = x; });
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export { SPEED, CMS_DEFAULTS, BANK_DEFAULTS, cloneCms, TYPES, TYPE_LABEL, TYPE_XP, LETTERS, norm, numEq, seededPerm };

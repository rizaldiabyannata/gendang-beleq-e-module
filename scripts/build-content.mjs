// Membelah konten bawaan menjadi dua: salinan tanpa kunci untuk browser siswa, dan
// SQL lengkap untuk mengisi draf guru. Jalankan setiap kali content/defaults.mjs
// disunting:  bun run content
import { writeFileSync } from 'node:fs';
import { CMS_DEFAULTS } from '../content/defaults.mjs';
import { stripKeys } from '../supabase/functions/_shared/grading.ts';

const publicCopy = stripKeys(CMS_DEFAULTS);

// Sabuk pengaman: kalau suatu hari ada tipe soal baru dengan nama kolom kunci yang
// lain, build harus berhenti di sini, bukan diam-diam mengirimkan kuncinya.
const leaked = JSON.stringify(publicCopy).match(/"(key|keys|accept|keywords|model|fb)"/g);
if (leaked) throw new Error('Kunci jawaban masih tersisa di salinan publik: ' + leaked.join(', '));

// Ditulis sebagai modul ES, bukan JSON, supaya Node dan bundler membacanya sama
// persis tanpa import attribute.
writeFileSync('app/components/content-public.js',
  '// Dihasilkan oleh scripts/build-content.mjs \u2014 jangan disunting langsung.\n'
  + '// Sunting content/defaults.mjs lalu jalankan: bun run content\n'
  + 'const CONTENT = ' + JSON.stringify(publicCopy, null, 2) + ';\nexport default CONTENT;\n');

const sql = `-- Dihasilkan oleh scripts/build-content.mjs — jangan disunting langsung.
-- Mengisi draf guru dengan konten bawaan, lengkap dengan kunci jawaban. Baris
-- published tetap kosong sampai guru menekan Terbitkan.
insert into content (id, payload) values ('draft', $seed$${JSON.stringify(CMS_DEFAULTS)}$seed$::jsonb)
on conflict (id) do update set payload = excluded.payload, updated_at = now();
`;
writeFileSync('supabase/migrations/0002_seed_content.sql', sql);

const n = (CMS_DEFAULTS.banks || []).reduce((a, b) => a + (b.items || []).length, 0);
console.log(`ok · ${CMS_DEFAULTS.banks.length} bank soal · ${n} butir · kunci dibuang dari salinan publik`);

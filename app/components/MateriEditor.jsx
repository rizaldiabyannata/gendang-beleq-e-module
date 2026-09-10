import React from 'react';
import RichText from './RichText';

// One editor for every section of the module.
//
// The alternative was eighteen bespoke forms, one per content key, each of which
// would need editing again the day a section grows a field. This walks the shape it
// is given instead: strings become fields, lists become repeatable rows, and a new
// key in content/defaults.mjs turns up here without anyone touching this file.

const LABELS = {
  konsep: 'Peta konsep', mersenne: 'Hukum Mersenne', pelayangan: 'Pelayangan',
  mameNine: 'Perbandingan Mame & Nine', resonansiSteps: 'Tahapan resonansi',
  mediumRows: 'Cepat rambat per medium', dopplerVars: 'Lambang rumus Doppler',
  tahukahResonansi: 'Tahukah kamu · resonansi', tahukahKulit: 'Tahukah kamu · kulit gendang',
  pemantikResonansi: 'Pertanyaan pemantik · resonansi', pemantikDoppler: 'Pertanyaan pemantik · Doppler',
  instrumen: 'Daftar instrumen ansambel', komponen: 'Komponen gelombang',
  klasifikasi: 'Klasifikasi frekuensi', langkahSolusi: 'Contoh langkah penyelesaian',
  sifat: 'Sifat gelombang bunyi', syarat: 'Syarat terdengarnya bunyi', pustaka: 'Daftar pustaka',
  judul: 'Judul', rumus: 'Rumus', vars: 'Lambang', body: 'Isi', title: 'Judul',
  tag: 'Penanda', text: 'Teks', step: 'Langkah', name: 'Nama', range: 'Rentang',
  medium: 'Medium', v: 'Nilai', note: 'Catatan', sym: 'Lambang', def: 'Keterangan',
  local: 'Kaitan dengan gendang beleq', catatan: 'Catatan', n: 'Nomor',
};
const label = (k) => LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1));

// Long prose gets the full editor; a tag, a symbol or a formula gets the inline one.
// Formulas are why the inline editor still carries superscript and subscript: this
// is where v = λ·f and f₁ are actually typed.
const Text = ({ name, onChange, value }) => {
  const long = String(value ?? '').length > 90;
  return <RichText simple={!long} value={value ?? ''} onChange={onChange} label={name} minHeight={long ? '130px' : undefined} />;
};

function Node({ name, onChange, value }) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <label className="gb-field">
        <span>{label(name)}</span>
        <Text name={label(name)} value={value} onChange={onChange} />
      </label>
    );
  }

  if (Array.isArray(value)) {
    const blank = () => {
      const first = value[0];
      if (Array.isArray(first)) return first.map(() => '');
      if (first && typeof first === 'object') return Object.fromEntries(Object.keys(first).map((k) => [k, '']));
      return '';
    };
    return (
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 22px' }}>
        <legend className="gb-eyebrow" style={{ padding: 0, marginBottom: 10 }}>{label(name)}</legend>
        {value.length === 0 ? (
          <div className="gb-empty" style={{ padding: '26px 20px', marginBottom: 10 }}>
            <strong>Bagian ini kosong</strong>
            <p>Siswa tidak akan melihat apa pun di sini sampai kamu menambahkan isinya.</p>
          </div>
        ) : null}
        {value.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Node
                name={typeof row === 'string' ? String(i + 1) : name}
                value={row}
                onChange={(nv) => { const c = value.slice(); c[i] = nv; onChange(c); }}
              />
            </div>
            <button
              type="button" className="gb-btn gb-btn-sm gb-btn-danger"
              aria-label={'Hapus ' + label(name) + ' baris ' + (i + 1)}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >×</button>
          </div>
        ))}
        <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" onClick={() => onChange(value.concat([blank()]))}>
          + Tambah
        </button>
      </fieldset>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <div style={{ border: '1px solid var(--rule)', borderRadius: 'var(--r-l)', padding: 14, marginBottom: 14 }}>
        {name ? <div className="gb-eyebrow" style={{ marginBottom: 12 }}>{label(name)}</div> : null}
        {Object.keys(value).map((k) => (
          <Node
            key={k} name={k} value={value[k]}
            onChange={(nv) => onChange(Object.assign({}, value, { [k]: nv }))}
          />
        ))}
      </div>
    );
  }
  return null;
}

export default function MateriEditor({ materi, onSection, onSet, section }) {
  const keys = Object.keys(materi || {});
  return (
    <div>
      <p className="gb-note" style={{ marginBottom: 18, maxWidth: '64ch' }}>
        Setiap bagian di bawah ini muncul apa adanya di sisi siswa. Kosongkan sebuah
        daftar dan bagian itu hilang dari modul.
      </p>
      <div className="gb-chips" style={{ marginBottom: 20 }}>
        {keys.map((k) => (
          <button
            key={k} type="button"
            className={'gb-chip' + (section === k ? ' gb-chip-on' : '')}
            style={{ cursor: 'pointer', border: 'none' }}
            onClick={() => onSection(section === k ? null : k)}
          >{label(k)}</button>
        ))}
      </div>
      {keys.filter((k) => !section || section === k).map((k) => (
        <Node key={k} name={k} value={materi[k]} onChange={(nv) => onSet(k, nv)} />
      ))}
    </div>
  );
}

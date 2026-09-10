import React from 'react';

// The worksheet is marked against the four things it actually asks a student to do,
// so a mark can be justified aspect by aspect instead of being one number the teacher
// has to defend from memory.
export const ASPEK = [
  ['rumusan', 'Rumusan masalah', 'Pertanyaan yang bisa diuji, bukan pernyataan.'],
  ['hipotesis', 'Hipotesis', 'Dugaan yang menyebut arah hubungan antar variabel.'],
  ['data', 'Tabel pengamatan', 'Data terisi lengkap dan masuk akal secara fisika.'],
  ['kesimpulan', 'Kesimpulan', 'Menjawab rumusan masalah dan didukung datanya.'],
];

export default function GradeLkpd({ busy, index, item, note, onBack, onNote, onRubric, onSave, onSkip, rubric, total }) {
  if (!item) {
    return (
      <div className="gb-empty">
        <strong>Tidak ada LKPD yang menunggu</strong>
        <p>Semua lembar kerja yang disetorkan di kelas ini sudah kamu nilai.</p>
        <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" style={{ marginTop: 16 }} onClick={onBack}>
          Kembali ke daftar nilai
        </button>
      </div>
    );
  }

  const total4 = ASPEK.reduce((a, [k]) => a + (Number(rubric[k]) || 0), 0);
  const nilai = Math.round(total4 / (ASPEK.length * 4) * 100);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" onClick={onBack}>‹ Daftar nilai</button>
        <span className="gb-eyebrow">LKPD {index + 1} dari {total}</span>
      </div>

      <div className="gb-mark">
        <div>
          <div className="gb-eyebrow">
            {item.nama}{item.absen ? ' · absen ' + item.absen : ''} · LKPD {item.sheet === 'frekuensi' ? '1 Frekuensi' : '2 Doppler'}
          </div>
          {item.entries.map((e) => (
            <div key={e.label} style={{ marginTop: 18 }}>
              <div className="gb-eyebrow" style={{ marginBottom: 7 }}>{e.label}</div>
              <blockquote className="gb-quote">{e.value || '— tidak diisi —'}</blockquote>
            </div>
          ))}
        </div>

        <div>
          <div className="gb-eyebrow" style={{ marginBottom: 10 }}>Rubrik · 0 sampai 4 tiap aspek</div>
          {ASPEK.map(([k, name, how]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <div style={{ font: '600 15px/1.3 var(--font-outfit),sans-serif' }}>{name}</div>
              <div className="gb-note" style={{ margin: '3px 0 8px' }}>{how}</div>
              <div className="gb-scores">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n} type="button" aria-pressed={Number(rubric[k]) === n}
                    aria-label={name + ' nilai ' + n}
                    onClick={() => onRubric(k, n)}
                  >{n}</button>
                ))}
              </div>
            </div>
          ))}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '13px 15px', borderRadius: 'var(--r-m)', background: 'var(--raised)',
            border: '1px solid var(--rule)', margin: '4px 0 18px',
          }}>
            <span style={{ font: '600 15px/1 var(--font-outfit),sans-serif' }}>Nilai LKPD</span>
            <span style={{ font: '500 22px/1 var(--font-jetbrains),ui-monospace,monospace', color: 'var(--gold-ink)' }}>
              {nilai}
            </span>
          </div>

          <label className="gb-field">
            <span>Komentar untuk siswa</span>
            <textarea value={note} onChange={onNote} />
          </label>

          <button type="button" className="gb-btn" onClick={() => onSave(nilai)} disabled={busy}>
            {busy ? 'Menyimpan…' : 'Simpan & lanjut'}
          </button>
          <button type="button" className="gb-btn gb-btn-2" style={{ marginTop: 10 }} onClick={onSkip}>
            Lewati dulu
          </button>
        </div>
      </div>
    </div>
  );
}

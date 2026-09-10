import React from 'react';

// A queue, not a list. Thirty essays is an hour of a teacher's evening, so the screen
// shows exactly one at a time and the whole scoring action sits under the hand:
// keys 0-9 set a mark, Enter saves and advances.
export default function GradeEssay({ busy, index, item, note, onBack, onNote, onSave, onSkip, score, setScore, total }) {
  if (!item) {
    return (
      <div className="gb-empty">
        <strong>Tidak ada esai yang menunggu</strong>
        <p>Semua jawaban esai di kelas ini sudah kamu nilai. Nilai akhirnya sudah lengkap.</p>
        <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" style={{ marginTop: 16 }} onClick={onBack}>
          Kembali ke daftar nilai
        </button>
      </div>
    );
  }

  const onKey = (e) => {
    if (e.target.tagName === 'TEXTAREA' && e.key !== 'Enter') return;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || e.target.tagName !== 'TEXTAREA')) {
      e.preventDefault(); onSave(); return;
    }
    if (/^[0-9]$/.test(e.key) && e.target.tagName !== 'TEXTAREA') setScore(e.key === '0' ? 100 : Number(e.key) * 10);
  };

  return (
    <div onKeyDown={onKey}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" onClick={onBack}>‹ Daftar nilai</button>
        <span className="gb-eyebrow">Esai {index + 1} dari {total}</span>
        <span className="gb-note" style={{ marginLeft: 'auto' }}>
          Tekan 1–9 untuk memberi nilai, 0 untuk 100, Enter untuk menyimpan.
        </span>
      </div>

      <div className="gb-mark">
        <div>
          <div className="gb-eyebrow">{item.nama}{item.absen ? ' · absen ' + item.absen : ''}</div>
          <h3 style={{ font: '400 22px/1.3 var(--font-instrument),serif', margin: '10px 0 16px', textWrap: 'pretty' }}>
            {item.q}
          </h3>
          <blockquote className="gb-quote">{item.answer}</blockquote>

          {item.keywords && item.keywords.length ? (
            <>
              <div className="gb-eyebrow" style={{ margin: '20px 0 8px' }}>Kata kunci · bantuan saja</div>
              <div className="gb-chips">
                {item.keywords.map((k) => (
                  <span key={k.word} className={'gb-chip' + (k.hit ? ' gb-chip-on' : '')}>
                    {k.hit ? '✓ ' : ''}{k.word}
                  </span>
                ))}
              </div>
              <p className="gb-note" style={{ marginTop: 8 }}>
                Hitungan kata kunci tidak bisa membedakan penalaran yang benar dari
                kumpulan kata yang tepat. Nilaimu yang menentukan.
              </p>
            </>
          ) : null}
        </div>

        <div>
          {item.model ? (
            <>
              <div className="gb-eyebrow" style={{ marginBottom: 8 }}>Contoh jawaban ideal</div>
              <blockquote className="gb-quote" style={{ borderLeftColor: 'var(--ok)', font: '400 15px/1.65 var(--font-outfit),sans-serif' }}>
                {item.model}
              </blockquote>
            </>
          ) : null}

          <div className="gb-eyebrow" style={{ margin: '22px 0 8px' }}>Nilai</div>
          <div className="gb-scores">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => (
              <button key={n} type="button" aria-pressed={score === n} onClick={() => setScore(n)}>{n}</button>
            ))}
          </div>

          <label className="gb-field" style={{ marginTop: 18 }}>
            <span>Komentar untuk siswa</span>
            <textarea value={note} onChange={onNote} placeholder="Apa yang sudah tepat, dan apa yang perlu diperbaiki." />
          </label>

          <button type="button" className="gb-btn" onClick={onSave} disabled={busy || score == null}>
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

import React from 'react';

// The screen the whole rebuild exists for.
//
// One row per student, one column per question bank, plus the two worksheets and the
// weighted final mark. Everything a teacher needs to fill in a report card, on one
// screen, sorted so the students who need attention are easy to find.
export default function Gradebook({ banks, classes, classId, loading, onClass, onExport, onMarkEssays, onMarkLkpd, onRefresh, pending, rows }) {
  const mark = (n, kkm) => {
    if (n == null) return <span className="gb-pending">—</span>;
    return <span className={n >= kkm ? 'gb-pass' : 'gb-fail'}>{Math.round(n)}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 18 }}>
        <label className="gb-field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
          <span>Kelas</span>
          <select value={classId || ''} onChange={onClass}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" onClick={onRefresh}>Muat ulang</button>
        <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" onClick={onExport} disabled={!rows.length}>
          Unduh CSV
        </button>
      </div>

      {pending.esai || pending.lkpd ? (
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 18,
            padding: '13px 15px', borderRadius: 'var(--r-m)',
            background: 'var(--warn-bg)', border: '1px solid var(--warn-rule)', color: 'var(--warn)',
          }}
        >
          <span style={{ flex: '1 1 240px', font: '500 15px/1.5 var(--font-outfit),sans-serif' }}>
            Ada pekerjaan yang menunggu penilaianmu. Nilai akhir belum lengkap sampai
            semuanya dinilai.
          </span>
          {pending.esai ? (
            <button type="button" className="gb-btn gb-btn-sm" onClick={onMarkEssays}>
              Nilai {pending.esai} esai
            </button>
          ) : null}
          {pending.lkpd ? (
            <button type="button" className="gb-btn gb-btn-sm" onClick={onMarkLkpd}>
              Nilai {pending.lkpd} LKPD
            </button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="gb-empty"><strong>Memuat nilai…</strong><p>Mengambil jawaban siswa dari server.</p></div>
      ) : !rows.length ? (
        <div className="gb-empty">
          <strong>Belum ada siswa di kelas ini</strong>
          <p>
            Nilai muncul di sini begitu siswa bergabung dengan kode kelas dan
            mengerjakan bank soal yang sudah kamu buka.
          </p>
        </div>
      ) : (
        <div className="gb-tablewrap">
          <table className="gb-table">
            <thead>
              <tr>
                <th className="gb-sticky">Nama</th>
                <th className="gb-num">Absen</th>
                {banks.map((b) => (
                  <th key={b.id} className="gb-num" title={b.title}>
                    {b.title.length > 22 ? b.title.slice(0, 20) + '…' : b.title}
                  </th>
                ))}
                <th className="gb-num">LKPD</th>
                <th className="gb-num">Esai</th>
                <th className="gb-num">Nilai akhir</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="gb-sticky">{r.nama}</td>
                  <td className="gb-num">{r.absen ?? '—'}</td>
                  {banks.map((b) => (
                    <td key={b.id} className="gb-num">{mark(r.banks[b.id], b.kkm || 70)}</td>
                  ))}
                  <td className="gb-num">{mark(r.lkpd, r.kkmModul)}</td>
                  <td className="gb-num">{mark(r.esai, r.kkmModul)}</td>
                  <td className="gb-num" style={{ fontWeight: 700 }}>{mark(r.akhir, r.kkmModul)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="gb-note" style={{ marginTop: 14 }}>
        Angka hijau sudah melewati KKM, merah belum, dan tanda hubung berarti belum
        dikerjakan. Esai dan LKPD memakai nilai yang kamu berikan sendiri, bukan
        hitungan kata kunci.
      </p>
    </div>
  );
}

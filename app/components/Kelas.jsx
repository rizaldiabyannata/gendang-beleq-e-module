import React from 'react';

// A class is a code and a switch. The code is what a student types to join; the
// switch is what stops them joining, or answering, once the lesson is over.
export default function Kelas({ busy, classes, newName, onCreate, onNewName, onRename, onToggle }) {
  return (
    <div>
      <form
        onSubmit={(e) => { e.preventDefault(); onCreate(); }}
        style={{ border: '1px solid var(--rule)', borderRadius: 'var(--r-l)', padding: 16, marginBottom: 20 }}
      >
        <div className="gb-eyebrow" style={{ marginBottom: 12 }}>Buat kelas baru</div>
        <label className="gb-field">
          <span>Nama rombongan belajar</span>
          <input value={newName} onChange={onNewName} placeholder="XI IPA 1" required />
        </label>
        <button className="gb-btn" type="submit" disabled={busy}>
          {busy ? 'Membuat…' : 'Buat kelas'}
        </button>
        <p className="gb-note" style={{ marginTop: 10 }}>
          Kode kelas dibuat otomatis dari namanya. Bagikan kode itu ke siswa.
        </p>
      </form>

      {classes.length === 0 ? (
        <div className="gb-empty">
          <strong>Belum ada kelas</strong>
          <p>
            Siswa butuh kode kelas sebelum jawabannya bisa dinilai. Buat satu kelas di
            atas, lalu tuliskan kodenya di papan tulis.
          </p>
        </div>
      ) : (
        <div className="gb-tablewrap">
          <table className="gb-table">
            <thead>
              <tr>
                <th className="gb-sticky">Kelas</th>
                <th>Kode</th>
                <th className="gb-num">Siswa</th>
                <th>Status</th>
                <th aria-label="Tindakan"></th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="gb-sticky">
                    <input
                      value={c.name} aria-label={'Nama kelas ' + c.name}
                      onChange={(e) => onRename(c.id, e.target.value)}
                      style={{
                        width: 180, minHeight: 40, padding: '0 10px', color: 'var(--ink)',
                        background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--r-s)',
                        font: '600 15px/1 var(--font-outfit),sans-serif',
                      }}
                    />
                  </td>
                  <td style={{ font: '600 15px/1 var(--font-jetbrains),ui-monospace,monospace', letterSpacing: '.1em', color: 'var(--gold-ink)' }}>
                    {c.code}
                  </td>
                  <td className="gb-num">{c.count}</td>
                  <td className={c.is_open ? 'gb-pass' : 'gb-pending'}>
                    {c.is_open ? 'Terbuka' : 'Ditutup'}
                  </td>
                  <td>
                    <button type="button" className="gb-btn gb-btn-2 gb-btn-sm" onClick={() => onToggle(c)}>
                      {c.is_open ? 'Tutup' : 'Buka'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="gb-note" style={{ marginTop: 14 }}>
        Menutup kelas menghentikan siswa mengirim jawaban baru, tapi nilai yang sudah
        masuk tetap utuh. Pakai ini saat asesmen selesai.
      </p>
    </div>
  );
}

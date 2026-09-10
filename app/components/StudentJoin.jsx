import React from 'react';

// Everything a student's marks will be filed under, asked once. Before this the
// name and class were retyped inside the LKPD and bound to nothing, so no answer
// in the system could be attributed to a person.
export default function StudentJoin({ absen, busy, code, error, kelas, nama, onAbsen, onBack, onCode, onKelas, onNama, onSubmit }) {
  return (
    <div className="gb-teacher gb-gate">
      <form
        className="gb-gate-card"
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      >
        <div className="gb-eyebrow">Gabung kelas</div>
        <h1>Kenalan dulu, yuk</h1>
        <p>
          Masukkan kode kelas dari gurumu, lalu tulis namamu. Ini dipakai supaya
          jawaban dan nilaimu tercatat atas namamu sendiri.
        </p>

        {error ? <div className="gb-error" role="alert">{error}</div> : null}

        <label className="gb-field">
          <span>Kode kelas</span>
          <input
            value={code} onChange={onCode} required
            autoCapitalize="characters" autoComplete="off" spellCheck="false"
            placeholder="Contoh: XI-IPA-1"
            style={{ letterSpacing: '.12em', textTransform: 'uppercase' }}
          />
        </label>

        <label className="gb-field">
          <span>Nama lengkap</span>
          <input value={nama} onChange={onNama} required autoComplete="name" placeholder="Nama sesuai absen" />
        </label>

        <div className="gb-row">
          <label className="gb-field">
            <span>Kelas</span>
            <input value={kelas} onChange={onKelas} placeholder="XI IPA 1" />
          </label>
          <label className="gb-field">
            <span>No. absen</span>
            <input value={absen} onChange={onAbsen} type="number" inputMode="numeric" min="1" placeholder="12" />
          </label>
        </div>

        <button className="gb-btn" type="submit" disabled={busy}>
          {busy ? 'Menghubungkan…' : 'Mulai belajar'}
        </button>

        <button className="gb-btn gb-btn-2" type="button" onClick={onBack} style={{ marginTop: 10 }}>
          Lihat-lihat dulu
        </button>

        <p className="gb-note" style={{ marginTop: 16 }}>
          Belum punya kode? Tanyakan ke gurumu. Tanpa kode kamu masih bisa membaca
          materi dan mencoba lab, tapi jawabanmu tidak akan dinilai.
        </p>
      </form>
    </div>
  );
}

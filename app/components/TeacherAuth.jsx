import React from 'react';

// Replaces the PIN screen. The old gate compared against a constant that shipped
// inside the JavaScript bundle, so anyone who opened devtools was a teacher.
export default function TeacherAuth({ busy, email, error, onBack, onEmail, onPassword, onSubmit, password }) {
  return (
    <div className="gb-teacher gb-gate">
      <form
        className="gb-gate-card"
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      >
        <div className="gb-eyebrow">Area terbatas</div>
        <h1>Panel Guru</h1>
        <p>
          Masuk untuk mengelola materi, bank soal, kelas, dan daftar nilai siswa.
          Akun ini dibuat sekali oleh pengelola modul.
        </p>

        {error ? <div className="gb-error" role="alert">{error}</div> : null}

        <label className="gb-field">
          <span>Email</span>
          <input
            type="email" value={email} onChange={onEmail} required
            autoComplete="username" autoCapitalize="none" spellCheck="false"
            placeholder="guru@sekolah.sch.id"
          />
        </label>

        <label className="gb-field">
          <span>Kata sandi</span>
          <input
            type="password" value={password} onChange={onPassword} required
            autoComplete="current-password"
          />
        </label>

        <button className="gb-btn" type="submit" disabled={busy}>
          {busy ? 'Memeriksa…' : 'Masuk'}
        </button>

        <button className="gb-btn gb-btn-2" type="button" onClick={onBack} style={{ marginTop: 10 }}>
          Kembali ke modul
        </button>
      </form>
    </div>
  );
}

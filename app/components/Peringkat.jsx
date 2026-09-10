import React from 'react';
import { sx } from './sx';

// Not a leaderboard, and still not one. This is the student's own six steps, the
// marks their own work earned, and the certificate that unlocks at 70%. No other
// student's results are readable from here — RLS sees to that, not this component.
export default function Peringkat({ v }) {
  const { badgeCards, capaian, goAdmin, goJoin, joinLabel, nilaiAkhir, nilaiRows, rankLabel, sertifikatNama, sertifikatStyle, sertifikatTeks, showXp, xpLabel } = v;
  return (
    <div className="gb-pad" style={sx("padding-top:32px;padding-bottom:12px")}>
      <h2 style={sx("font-family:var(--font-instrument),serif;font-size:32px;line-height:1.06;margin:0;font-weight:400")}>Capaian belajar</h2>
      <div style={sx("display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-top:12px")}>
        <span style={sx("font:400 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2)")}>{rankLabel}</span>
        {showXp ? <span style={sx("font:500 16px/1.2 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{xpLabel} XP</span> : null}
      </div>

      {(nilaiRows || []).length ? (
        <section style={sx("margin-top:36px;padding:22px;border:1px solid var(--rule);border-radius:var(--r-l);background:var(--raised);max-width:640px")}>
          <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap")}>
            <h3 style={sx("font-family:var(--font-instrument),serif;font-size:22px;margin:0;font-weight:400")}>Nilaimu</h3>
            {nilaiAkhir ? (
              <div style={sx("text-align:right")}>
                <div style={sx("font:500 11px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)")}>Nilai akhir</div>
                <div style={sx("font:500 32px/1.1 var(--font-jetbrains),ui-monospace,monospace;margin-top:5px;color:" + (nilaiAkhir.value >= nilaiAkhir.kkm ? "var(--ok)" : "var(--warn)"))}>{nilaiAkhir.value}</div>
              </div>
            ) : null}
          </div>
          <div style={sx("margin-top:16px")}>
            {nilaiRows.map((r, rI) => (
              <div key={rI} style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:11px 0;border-top:1px solid var(--rule)")}>
                <span style={sx("flex:1;min-width:0;font:400 15px/1.45 var(--font-outfit),sans-serif;color:var(--ink-2)")}>{r.label}</span>
                <span style={sx("flex:none;font:500 16px/1 var(--font-jetbrains),ui-monospace,monospace;color:" + (r.value == null ? "var(--ink-3)" : r.value >= r.kkm ? "var(--ok)" : "var(--warn)"))}>
                  {r.value == null ? "menunggu guru" : r.value}
                </span>
              </div>
            ))}
          </div>
          <p style={sx("margin:14px 0 0;font:400 14.5px/1.6 var(--font-outfit),sans-serif;color:var(--ink-3);text-wrap:pretty")}>
            Esai dan LKPD dinilai langsung oleh gurumu, bukan oleh aplikasi. Angkanya
            muncul di sini begitu gurumu selesai membacanya.
          </p>
        </section>
      ) : null}

      <div className="gb-cols-wide" style={sx("margin-top:32px;align-items:start")}>
      <div>
        {(capaian || []).map((l, lI) => (
          <div key={lI} style={sx(l.rowStyle)}>
            <span style={sx(l.numStyle)}>{l.num}</span>
            <span style={sx("flex:1;min-width:0")}>
              <span style={sx("display:block;font:600 16px/1.3 var(--font-outfit),sans-serif")}>{l.name}</span>
              <span style={sx("display:block;font:400 15px/1.5 var(--font-outfit),sans-serif;color:var(--ink-2);margin-top:3px")}>{l.detail}</span>
            </span>
            <span style={sx(l.xpStyle)}>{l.xp}</span>
          </div>
        ))}
      </div>

      <div>
      <section>
        <h3 style={sx("font-family:var(--font-instrument),serif;font-size:22px;margin:0 0 4px;font-weight:400")}>Lencana budaya Sasak</h3>
        <p style={sx("margin:0 0 8px;max-width:62ch;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2)")}>Terbuka sendiri saat kamu melakukan hal yang disebutkan, bukan saat kamu mengumpulkan poin.</p>
        {(badgeCards || []).map((b, bI) => (
          <div key={bI} style={sx(b.style)}>
            <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px")}>
              <span style={sx("font:600 16px/1.3 var(--font-outfit),sans-serif")}>{b.name}</span>
              <span style={sx(b.statusStyle)}>{b.status}</span>
            </div>
            <div style={sx("font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2);margin-top:4px;text-wrap:pretty")}>{b.how}</div>
          </div>
        ))}
      </section>

      <section style={sx(sertifikatStyle)}>
        <div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)")}>Sertifikat penyelesaian</div>
        <div style={sx("font-family:var(--font-instrument),serif;font-size:28px;line-height:1.15;margin:14px 0 10px;color:var(--ink)")}>{sertifikatNama}</div>
        <p style={sx("font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);max-width:44ch;margin:0 auto;text-wrap:pretty")}>{sertifikatTeks}</p>
        <div aria-hidden="true" style={sx("margin-top:20px;display:flex;justify-content:center;gap:8px")}>
          <div style={sx("height:4px;width:52px;background:var(--gold);border-radius:var(--r-full)")}></div>
          <div style={sx("height:4px;width:24px;background:var(--rule-2);border-radius:var(--r-full)")}></div>
          <div style={sx("height:4px;width:12px;background:var(--rule-2);border-radius:var(--r-full)")}></div>
        </div>
      </section>

      </div>
      </div>

      <div style={sx("margin-top:44px;padding-top:24px;border-top:1px solid var(--rule);max-width:520px")}>
        {joinLabel ? (
          <>
            <button onClick={goJoin} style={sx("width:100%;min-height:48px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>{joinLabel}</button>
            <p style={sx("margin:10px 0 22px;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-3);text-wrap:pretty")}>Kamu sedang membaca modul tanpa bergabung ke kelas. Jawabanmu belum tercatat dan belum dinilai gurumu.</p>
          </>
        ) : null}
        <button onClick={goAdmin} style={sx("width:100%;min-height:48px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink-2);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Panel Guru</button>
        <p style={sx("margin:10px 0 0;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-3);text-wrap:pretty")}>Untuk guru: mengelola materi, bank soal, kelas, dan daftar nilai siswa. Butuh akun guru.</p>
      </div>
    </div>
  );
}

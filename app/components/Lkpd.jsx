import React from 'react';
import { sx } from './sx';

const SEC = "margin-top:36px;padding-top:24px;border-top:1px solid var(--rule)";
const H = "margin:0 0 14px;font:600 13px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;color:var(--ink-3);text-transform:uppercase";
const AREA = "width:100%;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:14px;font:400 16px/1.7 var(--font-outfit),sans-serif;background:var(--paper);color:var(--ink)";
const IDENT = "flex:1 1 180px;min-width:0;min-height:48px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 14px;font:400 16px/1 var(--font-outfit),sans-serif;background:var(--paper);color:var(--ink)";

export default function Lkpd({ v }) {
  const { kirimLkpd, literasiSoal, literasiTeks, lkpdAlat, lkpdBtnLabel, lkpdFenomena, lkpdFixed, lkpdH, lkpdLangkah, lkpdNote, lkpdPemantik, lkpdSent, lkpdSoal, lkpdTabs, lkpdTitle, lkpdV, tableHint, tableRows } = v;
  return (
    <div className="gb-pad" style={sx("padding-top:32px;padding-bottom:12px")}>
      <div role="tablist" aria-label="Pilih LKPD" style={sx("display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px")}>
        {(lkpdTabs || []).map((t, tI) => (
          <button key={tI} role="tab" aria-selected={!!t.active} onClick={t.onClick} style={sx(t.style)}>{t.label}</button>
        ))}
      </div>

      <h2 style={sx("font-family:var(--font-instrument),serif;font-size:32px;line-height:1.06;margin:0;font-weight:400")}>{lkpdTitle}</h2>
      <p style={sx("margin:12px 0 24px;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2)")}>Lembar kerja peserta didik · Gelombang bunyi lewat etnosains Gendang Beleq</p>

      <div className="gb-split">
      <div className="gb-rail">
      <div style={sx("display:flex;gap:10px;flex-wrap:wrap")}>
        <input value={lkpdV.nama} onChange={lkpdH.nama} readOnly={lkpdFixed.nama} placeholder="Nama" aria-label="Nama" style={sx(IDENT)} />
        <input value={lkpdV.kelas} onChange={lkpdH.kelas} readOnly={lkpdFixed.kelas} placeholder="Kelas" aria-label="Kelas" style={sx(IDENT + ";flex:0 0 88px")} />
        <input value={lkpdV.kelompok} onChange={lkpdH.kelompok} placeholder="Kelompok" aria-label="Kelompok" style={sx(IDENT + ";flex:0 0 116px")} />
      </div>
      <section style={sx(SEC)}>
        <h3 style={sx(H)}>1 · Fenomena dan tujuan</h3>
        <p style={sx("margin:0;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>{lkpdFenomena}</p>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>2 · Pertanyaan pemantik</h3>
        <p style={sx("margin:0;max-width:62ch;font:500 18px/1.6 var(--font-instrument),serif;color:var(--ink);text-wrap:pretty")}>{lkpdPemantik}</p>
      </section>

      </div>

      <div>
      <section style={sx(SEC)}>
        <h3 style={sx(H)}>3 · Rumusan masalah</h3>
        <textarea value={lkpdV.rumusan} onChange={lkpdH.rumusan} rows="3" placeholder="Tulis rumusan masalahmu…" aria-label="Rumusan masalah" style={sx(AREA)}></textarea>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>4 · Hipotesis</h3>
        <textarea value={lkpdV.hipotesis} onChange={lkpdH.hipotesis} rows="3" placeholder="Dugaanku adalah…" aria-label="Hipotesis" style={sx(AREA)}></textarea>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>5 · Alat dan bahan</h3>
        <ul style={sx("margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px")}>
          {(lkpdAlat || []).map((a, aI) => (
            <li key={aI} style={sx("display:flex;gap:12px;font:400 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink)")}>
              <span aria-hidden="true" style={sx("flex:none;color:var(--gold-ink)")}>·</span>{a}
            </li>
          ))}
        </ul>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>6 · Kegiatan penyelidikan</h3>
        <div style={sx("display:flex;flex-direction:column;gap:14px")}>
          {(lkpdLangkah || []).map((l, lI) => (
            <div key={lI} style={sx("display:flex;gap:16px;align-items:flex-start")}>
              <span style={sx("flex:none;width:22px;font:500 15px/1.6 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{l.n}</span>
              <span style={sx("flex:1;font:400 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>{l.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>7 · Tabel pengamatan</h3>
        <div style={sx("display:flex;flex-direction:column;gap:14px")}>
          {(tableRows || []).map((r, rI) => (
            <div key={rI}>
              <div style={sx("display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:10px")}>
                <label style={sx("font:500 16px/1.4 var(--font-outfit),sans-serif;flex:1")}>{r.label}
                  <input value={r.val} onChange={r.onChange} placeholder="Hz" aria-label={"Frekuensi " + r.label + " dalam hertz"} inputMode="numeric" style={sx("width:92px;flex:none;min-height:48px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font:500 16px/1 var(--font-jetbrains),ui-monospace,monospace;text-align:center;background:var(--paper);color:var(--ink);margin-left:14px")} />
                </label>
              </div>
              <div aria-hidden="true" style={sx("height:6px;border-radius:var(--r-full);background:var(--rule);overflow:hidden")}><div style={sx(r.barStyle)}></div></div>
            </div>
          ))}
        </div>
        <p style={sx("margin:14px 0 0;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2)")}>{tableHint}</p>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>8 · Pertanyaan</h3>
        <div style={sx("display:flex;flex-direction:column;gap:20px")}>
          {(lkpdSoal || []).map((s, sI) => (
            <label key={sI} style={sx("display:block;font:500 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>{s.q}
              <textarea value={s.val} onChange={s.onChange} rows="3" placeholder="Jawabanmu…" style={sx(AREA + ";margin-top:10px")}></textarea>
            </label>
          ))}
        </div>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>9 · Literasi sains</h3>
        <p style={sx("margin:0 0 20px;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>{literasiTeks}</p>
        <div style={sx("display:flex;flex-direction:column;gap:20px")}>
          {(literasiSoal || []).map((s, sI) => (
            <div key={sI}>
              <label style={sx("display:block;font:500 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>{s.q}
                <textarea value={s.val} onChange={s.onChange} rows="3" placeholder="Jawabanmu…" style={sx(AREA + ";margin-top:10px")}></textarea>
              </label>
              <div style={sx("margin-top:8px;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-3)")}>Rubrik: {s.rubrik}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={sx(SEC)}>
        <h3 style={sx(H)}>10 · Kesimpulan</h3>
        <textarea value={lkpdV.kesimpulan} onChange={lkpdH.kesimpulan} rows="4" placeholder="Berdasarkan data yang kami peroleh…" aria-label="Kesimpulan" style={sx(AREA)}></textarea>
      </section>

      </div>
      </div>

      <div style={sx("margin-top:36px")}>
        <button onClick={kirimLkpd} disabled={lkpdSent} style={sx("width:100%;min-height:56px;border:none;border-radius:var(--r-m);background:" + (lkpdSent ? "var(--paper-2)" : "var(--panel)") + ";color:" + (lkpdSent ? "var(--ink-3)" : "var(--panel-ink)") + ";font:600 16px/1 var(--font-outfit),sans-serif;cursor:" + (lkpdSent ? "default" : "pointer"))}>{lkpdBtnLabel}</button>
        {lkpdNote ? (
          <div style={sx("margin-top:14px;padding:14px 16px;border-radius:var(--r-m);background:var(--ok-bg);border:1px solid var(--ok-rule)")}>
            <div style={sx("font:600 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--ok)")}>Catatan gurumu</div>
            <p style={sx("margin:8px 0 0;font:400 15px/1.65 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>{lkpdNote}</p>
          </div>
        ) : null}
        <p style={sx("margin:14px 0 0;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>Jawabanmu tersimpan di perangkat ini saja. Unduh berkasnya agar tidak hilang saat riwayat peramban dihapus atau kamu ganti HP.</p>
      </div>
    </div>
  );
}

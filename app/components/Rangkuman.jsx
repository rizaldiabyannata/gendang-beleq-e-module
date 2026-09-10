import React from 'react';
import { sx } from './sx';
import Rich from './Rich';

export default function Rangkuman({ v }) {
  const { lkpdH, lkpdV, rangkuman, refleksiBtnLabel, refleksiSkala, selesaiRefleksi } = v;
  return (
    <div className="gb-pad gb-split" style={sx("padding-top:32px;padding-bottom:12px")}>
      <section className="gb-rail">
        <h3 style={sx("font-family:var(--font-instrument),serif;font-size:24px;margin:0;font-weight:400")}>Rangkuman</h3>
        <div style={sx("margin-top:20px")}>
          {(rangkuman || []).map((r, rI) => (
            <div key={rI} style={sx("display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-top:1px solid var(--rule)")}>
              <span style={sx("flex:none;width:24px;font:500 15px/1.7 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{r.n}</span>
              <Rich tag="span" html={r.text} style={sx("flex:1;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 style={sx("font-family:var(--font-instrument),serif;font-size:24px;margin:0;font-weight:400")}>Refleksi diri</h3>
        <p style={sx("margin:8px 0 24px;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2)")}>Jujur saja — ini untukmu sendiri. 1 berarti belum paham, 5 berarti sudah yakin.</p>
        <div style={sx("display:flex;flex-direction:column;gap:24px")}>
          {(refleksiSkala || []).map((r, rI) => (
            <div key={rI}>
              <div style={sx("font:500 16px/1.5 var(--font-outfit),sans-serif;color:var(--ink);margin-bottom:10px;text-wrap:pretty")}>{r.q}</div>
              <div style={sx("display:flex;gap:8px")}>
                {(r.opts || []).map((o, oI) => (
                  <button key={oI} onClick={o.onClick} aria-pressed={!!o.active} aria-label={"Nilai " + o.label + " dari 5"} style={sx(o.style)}>{o.label}</button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label style={sx("display:block;font:500 16px/1.5 var(--font-outfit),sans-serif;color:var(--ink);margin-bottom:10px")}>
              Satu hal yang masih ingin kupelajari
              <textarea value={lkpdV.refleksi} onChange={lkpdH.refleksi} rows="3" placeholder="Tulis di sini…" style={sx("display:block;width:100%;margin-top:10px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:14px;font:400 16px/1.7 var(--font-outfit),sans-serif;background:var(--paper);color:var(--ink)")}></textarea>
            </label>
          </div>
          <button onClick={selesaiRefleksi} style={sx("width:100%;min-height:52px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>{refleksiBtnLabel}</button>
        </div>
      </section>
    </div>
  );
}

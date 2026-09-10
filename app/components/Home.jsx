import React from 'react';
import { sx } from './sx';

export default function Home({ v }) {
  const { continueKicker, continueLabel, goGlosarium, goLab, goPeringkat, heroFacts, onContinue, phases, progressLabel } = v;
  return (
    <div style={sx("padding-bottom:12px")}>

      {/* The one dark plate outside the lab: a cover, not a reading surface. */}
      <section className="gb-rise" style={sx("position:relative;background:var(--panel);color:var(--panel-ink);overflow:hidden")}>
        <div aria-hidden="true" style={sx("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(120% 80% at 25% 0%,rgba(217,150,47,.18),transparent 62%),repeating-linear-gradient(135deg,rgba(217,150,47,.07) 0 2px,transparent 2px 16px)")}></div>
        <div className="gb-pad" style={sx("position:relative;padding-top:clamp(44px,7vw,88px);padding-bottom:clamp(36px,5vw,72px)")}>
          <div className="gb-cols-wide" style={sx("align-items:end")}>
          <div>
          <div style={sx("font:500 13px/1.5 var(--font-outfit),sans-serif;color:var(--gold)")}>Problem based learning · Etnosains Sasak</div>
          <h1 style={sx("font-family:var(--font-instrument),serif;font-size:clamp(42px,13vw,62px);line-height:.92;margin:20px 0 0;font-weight:400;letter-spacing:-.015em")}>Gelombang<br />Bunyi</h1>
          <div style={sx("font-family:var(--font-instrument),serif;font-style:italic;font-size:clamp(23px,7vw,32px);line-height:1.1;color:var(--gold);margin-top:10px")}>lewat tabuhan Gendang Beleq</div>
          <p style={sx("margin:24px 0 0;max-width:38ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--panel-ink-2);text-wrap:pretty")}>Kamu tidak akan disuruh menghafal rumus dulu. Kamu menabuh gendangnya, mengubah tegangan membrannya, mencatat apa yang terdengar — lalu rumusnya masuk sendiri.</p>
          </div>

          <div>
          <div style={sx("display:flex;flex-wrap:wrap;gap:0;margin:0 0 28px;border-top:1px solid var(--panel-rule)")}>
            {(heroFacts || []).map((f, fI) => (
              <div key={fI} style={sx("flex:1 1 30%;min-width:100px;padding:16px 12px 0 0")}>
                <div style={sx("font:500 24px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--panel-ink)")}>{f.n}</div>
                <div style={sx("font:500 13px/1.4 var(--font-outfit),sans-serif;color:var(--panel-ink-2);margin-top:8px")}>{f.label}</div>
              </div>
            ))}
          </div>

          <button onClick={onContinue} style={sx("width:100%;min-height:64px;border:none;border-radius:var(--r-m);background:var(--gold);color:var(--panel);cursor:pointer;display:flex;align-items:center;gap:16px;padding:12px 20px;text-align:left")}>
            <span style={sx("flex:1")}>
              <span style={sx("display:block;font:500 12px/1 var(--font-outfit),sans-serif;color:rgba(22,19,46,.7)")}>{continueKicker}</span>
              <span style={sx("display:block;font:600 18px/1.2 var(--font-outfit),sans-serif;margin-top:6px")}>{continueLabel}</span>
            </span>
            <span aria-hidden="true" style={sx("flex:none;font:400 24px/1 var(--font-instrument),serif")}>→</span>
          </button>

          <div style={sx("margin-top:12px;display:flex;flex-wrap:wrap;gap:8px 24px;font:500 15px/1 var(--font-outfit),sans-serif")}>
            <button onClick={goLab} style={sx("border:none;background:none;padding:12px 0;min-height:44px;color:var(--panel-ink);cursor:pointer;font:inherit")}><span style={sx("border-bottom:1px solid var(--gold);padding-bottom:4px")}>Langsung ke lab simulasi</span></button>
            <button onClick={goGlosarium} style={sx("border:none;background:none;padding:12px 0;min-height:44px;color:var(--panel-ink-2);cursor:pointer;font:inherit")}><span style={sx("border-bottom:1px solid var(--panel-rule);padding-bottom:4px")}>Glosarium</span></button>
          </div>
          </div>
          </div>
        </div>
      </section>

      <div className="gb-pad" style={sx("padding-top:clamp(44px,5vw,72px)")}>
        <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px")}>
          <h2 style={sx("font-family:var(--font-instrument),serif;font-size:32px;margin:0;font-weight:400;line-height:1.06")}>Alur belajar</h2>
          <div style={sx("flex:none;font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{progressLabel}</div>
        </div>
        <p style={sx("margin:16px 0 0;max-width:68ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>Urutannya bukan hiasan. <strong style={sx("font-weight:600;color:var(--ink)")}>Orientasi</strong> menyiapkan targetmu, <strong style={sx("font-weight:600;color:var(--ink)")}>eksplorasi</strong> memberi bukti dari tanganmu sendiri, <strong style={sx("font-weight:600;color:var(--ink)")}>penguatan</strong> memastikan konsepnya menempel. Boleh dibuka bebas, tapi ikuti nomornya kalau ingin paling cepat paham.</p>
      </div>

      <div className="gb-pad gb-cols gb-cols-3" style={sx("padding-top:36px;align-items:start")}>
        {(phases || []).map((ph, phI) => (
          <section key={phI}>
            <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:0 0 10px;font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase")}>
              <span style={sx("color:var(--ink)")}>Fase {ph.name}</span>
              <span style={sx("color:var(--ink-3)")}>{ph.count}</span>
            </div>
            {(ph.steps || []).map((s, sI) => (
              <button key={sI} onClick={s.onOpen} style={sx(s.cardStyle)}>
                <span style={sx(s.numStyle)}>{s.num}</span>
                <span style={sx("flex:1;min-width:0")}>
                  <span style={sx("display:block;font:600 18px/1.3 var(--font-outfit),sans-serif")}>{s.title}</span>
                  <span style={sx("display:block;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2);margin-top:4px;text-wrap:pretty")}>{s.sub}</span>
                </span>
                <span style={sx(s.chipStyle)}>{s.chip}</span>
              </button>
            ))}
          </section>
        ))}
      </div>

      <div className="gb-pad" style={sx("padding-top:36px;display:flex;gap:12px;flex-wrap:wrap")}>
        <button onClick={goGlosarium} style={sx("flex:1;min-width:150px;min-height:50px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink);font:500 15px/1.3 var(--font-outfit),sans-serif;cursor:pointer")}>Glosarium &amp; Pustaka</button>
        <button onClick={goPeringkat} style={sx("flex:1;min-width:150px;min-height:50px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink);font:500 15px/1.3 var(--font-outfit),sans-serif;cursor:pointer")}>Capaian &amp; Sertifikat</button>
      </div>

      <aside className="gb-pad" style={sx("margin-top:44px;padding-top:24px;border-top:1px solid var(--rule-2)")}>
        <h3 style={sx("margin:0 0 10px;font-family:var(--font-instrument),serif;font-size:22px;font-weight:400")}>Fakta sains</h3>
        <p style={sx("margin:0;max-width:68ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>Saat kulit gendang beleq dipukul, membran bergetar dan menekan udara di sekitarnya. Bentuk bulat gendang membuat resonansi bunyi jadi optimal — makin besar dan makin tebal bahannya, makin rendah nada yang keluar.</p>
      </aside>
    </div>
  );
}

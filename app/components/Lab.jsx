import React from 'react';
import { sx } from './sx';

const PANEL = "background:var(--panel);border-radius:var(--r-l);padding:22px;color:var(--panel-ink)";
const READOUT = "font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold)";

export default function Lab({ v }) {
  const { labAnsambel, ansSliders, ansBeat, ansBeatLabel, ansPulseStyle, ansBtnLabel, ansPlay, ansHint, dopSourceRef, dopWaveRef, dopHeardRef, dbValue, dopBtnLabel, dopHeard, dopReset, dopSliders, dopSourceStyle, dopStatus, dopStatusColor, dopToggle, dopWaveStyle, drumCenterStyle, drumLabel, drumOpts, drumOuterStyle, drumSkinStyle, hitLabel, hitPinggir, hitTengah, labDoneLabel, labDoppler, labDrum, labTabs, mediumInfo, mediumOpts, ringStyle, selesaiLab, sliders, temuan, waveInfo, waveRef } = v;

  const slider = (s, sI, accent) => (
    <div key={sI}>
      <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px")}>
        <span style={sx("font:500 15px/1.3 var(--font-outfit),sans-serif;color:" + (accent === 'dark' ? 'var(--panel-ink)' : 'var(--ink)'))}>{s.label}</span>
        <span style={sx("font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:" + (accent === 'dark' ? 'var(--gold)' : 'var(--gold-ink)'))}>{s.value}</span>
      </div>
      <input type="range" aria-label={s.label} aria-valuetext={s.valueText || s.value} min={s.min} max={s.max} step={s.step} value={s.raw} onChange={s.onInput} style={sx("width:100%;height:44px;accent-color:" + (accent === 'dark' ? '#d9962f' : '#16132e') + ";background:transparent;cursor:pointer")} />
      {s.hint ? <div style={sx("font:400 15px/1.5 var(--font-outfit),sans-serif;color:" + (accent === 'dark' ? 'var(--panel-ink-2)' : 'var(--ink-2)'))}>{s.hint}</div> : null}
    </div>
  );

  return (
    <div className="gb-pad" style={sx("padding-top:32px;padding-bottom:12px")}>
      <div role="tablist" aria-label="Mode lab" style={sx("display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px")}>
        {(labTabs || []).map((t, tI) => (
          <button key={tI} role="tab" aria-selected={!!t.active} onClick={t.onClick} style={sx(t.style)}>{t.label}</button>
        ))}
      </div>

      {labDrum ? (
        <>
          <div style={sx(PANEL + ";background-image:radial-gradient(100% 80% at 50% 0%,rgba(168,83,47,.34) 0%,transparent 66%)")}>
            <h3 style={sx("font-family:var(--font-instrument),serif;font-size:24px;line-height:1.1;margin:0 0 20px;font-weight:400")}>Tabuh &amp; amati</h3>

            <div className="gb-bench">
            <div>
            <div style={sx("display:flex;align-items:baseline;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--panel-rule)")}>
              <span style={sx("font:500 30px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold)")}>{dbValue}</span>
              <span style={sx("font:500 13px/1.3 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>dB · taraf intensitas</span>
            </div>
            <div style={sx("position:relative;display:flex;justify-content:center;align-items:center;height:clamp(224px,26vw,300px);margin-bottom:10px")}>
              <div aria-hidden="true" style={sx(ringStyle)}></div>
              <button onClick={hitTengah} aria-label={"Tabuh " + drumLabel + " di titik tengah"} style={sx(drumOuterStyle)}>
                <span style={sx(drumSkinStyle)}>
                  <span style={sx(drumCenterStyle)}>
                    <span style={sx("font:500 12px/1 var(--font-outfit),sans-serif;color:rgba(22,19,46,.6);text-align:center;pointer-events:none")}>Tengah</span>
                  </span>
                </span>
              </button>
              <button onClick={hitPinggir} style={sx("position:absolute;right:0;bottom:10px;min-height:44px;padding:0 16px;border:1px solid var(--panel-rule);border-radius:var(--r-m);background:transparent;color:var(--panel-ink);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Tabuh pinggir</button>
              <div style={sx("position:absolute;left:0;bottom:10px;font:400 13px/1.5 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>{drumLabel}<br />{hitLabel}</div>
            </div>

            <div style={sx("background:var(--panel-2);border-radius:var(--r-m);padding:14px 16px 8px;margin-bottom:20px")}>
              <div style={sx("display:flex;justify-content:space-between;gap:12px;font:500 13px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2);margin-bottom:10px")}><span>Osiloskop</span><span style={sx(READOUT)}>{waveInfo}</span></div>
              <canvas ref={waveRef} role="img" aria-label={"Osiloskop bentuk gelombang: " + waveInfo} width="760" height="240" style={sx("width:100%;height:clamp(124px,14vw,168px);display:block")}></canvas>
            </div>
            </div>

            <div>

            <div style={sx("display:flex;flex-direction:column;gap:18px")}>
              {(sliders || []).map((s, sI) => slider(s, sI, 'dark'))}
            </div>

            <div style={sx("margin-top:24px;display:flex;flex-direction:column;gap:18px")}>
              <div>
                <div style={sx("font:500 13px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2);margin-bottom:9px")}>Ukuran gendang</div>
                <div style={sx("display:flex;gap:9px")}>
                  {(drumOpts || []).map((d, dI) => <button key={dI} onClick={d.onClick} aria-pressed={!!d.active} style={sx(d.style)}>{d.label}</button>)}
                </div>
              </div>
              <div>
                <div style={sx("font:500 13px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2);margin-bottom:9px")}>Medium perambatan</div>
                <div style={sx("display:flex;gap:9px")}>
                  {(mediumOpts || []).map((m, mI) => <button key={mI} onClick={m.onClick} aria-pressed={!!m.active} style={sx(m.style)}>{m.label}</button>)}
                </div>
                <div style={sx("margin-top:10px;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>{mediumInfo}</div>
              </div>
            </div>
            </div>
            </div>
          </div>

          <section style={sx("margin-top:36px;padding-top:24px;border-top:1px solid var(--rule-2)")}>
            <h3 style={sx("font-family:var(--font-instrument),serif;font-size:22px;margin:0 0 16px;font-weight:400")}>Apa yang kamu temukan?</h3>
            <ul className="gb-cols gb-cols-3" style={sx("margin:0;padding:0;list-style:none;align-items:start")}>
              {(temuan || []).map((t, tI) => (
                <li key={tI} style={sx("display:flex;gap:14px;align-items:flex-start;font:400 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>
                  <span aria-hidden="true" style={sx("flex:none;color:var(--gold-ink)")}>·</span>{t}
                </li>
              ))}
            </ul>
            <button onClick={selesaiLab} style={sx("width:100%;min-height:52px;margin-top:24px;border:none;border-radius:var(--r-m);background:var(--gold);color:var(--panel);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>{labDoneLabel}</button>
          </section>
        </>
      ) : null}

      {labDoppler ? (
        <>
          <h3 style={sx("font-family:var(--font-instrument),serif;font-size:26px;line-height:1.1;margin:0 0 12px;font-weight:400")}>Rombongan nyongkolan melintas</h3>
          <p style={sx("margin:0 0 24px;max-width:68ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>Kamu berdiri di pinggir jalan. Jalankan rombongan gendang beleq, lalu perhatikan frekuensi yang kamu dengar saat mereka mendekat dan menjauh.</p>

          <div className="gb-bench">
          <div style={sx("border-radius:var(--r-l);overflow:hidden;background:var(--panel)")}>
            <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:16px 18px")}>
              <div style={sx("font:500 24px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--panel-ink)")}><span ref={dopHeardRef}>{dopHeard}</span> <span style={sx("font:500 13px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>Hz didengar</span></div>
              <div style={sx("font:500 13px/1.4 var(--font-outfit),sans-serif;text-align:right;color:" + dopStatusColor)}>{dopStatus}</div>
            </div>
            <div style={sx("position:relative;height:clamp(158px,20vw,240px);background:var(--panel-2);overflow:hidden;background-image:repeating-linear-gradient(90deg,rgba(217,150,47,.1) 0 2px,transparent 2px 18px)")}>
              <div aria-hidden="true" style={sx("position:absolute;left:0;right:0;top:52%;height:1px;background:var(--panel-rule)")}></div>
              <div style={sx("position:absolute;left:50%;bottom:10px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px")}>
                <div aria-hidden="true" style={sx("width:24px;height:24px;border-radius:50%;background:var(--panel-ink)")}></div>
                <div style={sx("font:500 12px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>Kamu</div>
              </div>
              <div ref={dopSourceRef} style={sx(dopSourceStyle)}>
                <div aria-hidden="true" style={sx("width:36px;height:36px;border-radius:var(--r-s);background:var(--gold)")}></div>
                <div style={sx("font:500 12px/1 var(--font-outfit),sans-serif;color:var(--gold);white-space:nowrap")}>Rombongan</div>
              </div>
              <div aria-hidden="true" ref={dopWaveRef} style={sx(dopWaveStyle)}></div>
            </div>
          </div>

          <div>
          <div style={sx("display:flex;gap:10px;margin:0 0 24px")}>
            <button onClick={dopToggle} style={sx("flex:1;min-height:52px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>{dopBtnLabel}</button>
            <button onClick={dopReset} style={sx("flex:none;min-height:52px;padding:0 20px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink);font:500 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Ulang</button>
          </div>

          <div style={sx("display:flex;flex-direction:column;gap:18px")}>
            {(dopSliders || []).map((s, sI) => slider(s, sI, 'light'))}
          </div>
          </div>
          </div>

          <section style={sx("margin-top:32px;padding-top:24px;border-top:1px solid var(--rule)")}>
            <h4 style={sx("margin:0 0 12px;font:600 13px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;color:var(--ink-3);text-transform:uppercase")}>Rumus</h4>
            <div style={sx("font:500 20px/1.5 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink)")}>f′ = f · v / (v ∓ v<sub>s</sub>)</div>
            <p style={sx("margin:12px 0 0;max-width:68ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>Tanda minus dipakai saat sumber mendekat, jadi frekuensi terdengar naik. Tanda plus dipakai saat sumber menjauh, jadi frekuensi terdengar turun. Nilai v adalah cepat rambat bunyi di udara, sekitar 343 m/s.</p>
          </section>
        </>
      ) : null}

      {labAnsambel ? (
        <div style={sx(PANEL)}>
          <h3 style={sx("font-family:var(--font-instrument),serif;font-size:26px;line-height:1.1;margin:0 0 12px;font-weight:400")}>Mame &amp; Nine ditabuh bersama</h3>
          <p style={sx("margin:0 0 24px;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--panel-ink-2);text-wrap:pretty")}>{ansHint}</p>
          <div style={sx("padding:16px 0 8px")}>
            <div aria-hidden="true" style={sx(ansPulseStyle)}></div>
            <div style={sx("text-align:center;margin-top:18px;font-family:var(--font-instrument),serif;font-size:36px;line-height:1;color:var(--gold)")}>{ansBeat} Hz</div>
            <div style={sx("text-align:center;margin-top:10px;font:400 15px/1.5 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>{ansBeatLabel}</div>
          </div>
          <div style={sx("display:flex;flex-direction:column;gap:18px;margin:24px 0")}>
            {(ansSliders || []).map((s, sI) => slider(s, sI, 'dark'))}
          </div>
          <button onClick={ansPlay} style={sx("width:100%;min-height:54px;border:none;border-radius:var(--r-m);background:var(--gold);color:var(--panel);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>{ansBtnLabel}</button>
        </div>
      ) : null}
    </div>
  );
}

import React from 'react';
import { sx } from './sx';
import Rich from './Rich';
import Drum3D from './Drum3D';

const PANEL = "background:var(--panel);border-radius:var(--r-l);padding:22px;color:var(--panel-ink)";
const READOUT = "font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold);white-space:nowrap";

// The mission list that sits beside each simulation. A student picks a mission, the
// bench jumps to its conditions, and the one knob under test freezes until the guess
// is sent. Everything else on the bench keeps working, so free play is never blocked.
function Misi({ misi, misiLabel, dark }) {
  if (!misi || !misi.length) return null;
  const ink = dark ? 'var(--panel-ink)' : 'var(--ink)';
  const ink2 = dark ? 'var(--panel-ink-2)' : 'var(--ink-2)';
  const rule = dark ? 'var(--panel-rule)' : 'var(--rule)';
  const box = dark ? 'var(--panel-2)' : 'var(--raised)';
  return (
    <section style={sx("margin-top:26px;padding-top:20px;border-top:1px solid " + rule)}>
      <h4 style={sx("margin:0 0 4px;font:600 13px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:" + ink2)}>Dugaan</h4>
      <p style={sx("margin:0 0 4px;font:400 15px/1.6 var(--font-outfit),sans-serif;text-wrap:pretty;color:" + ink2)}>
        Tebak dulu apa yang akan terjadi, baru geser tuasnya. Satu kesempatan tiap dugaan. {misiLabel}
      </p>

      {misi.map((m, mI) => (
        <div key={mI}>
          <button onClick={m.onToggle} aria-expanded={!!m.open}
            style={sx(m.rowStyle + 'border-top:1px solid ' + rule + ';color:' + ink)}>
            <span aria-hidden="true" style={sx("flex:none;width:26px;padding-top:2px;font:500 14px/1.35 var(--font-jetbrains),ui-monospace,monospace;color:" + ink2)}>{m.n}</span>
            <span style={sx("flex:1;min-width:0")}>
              <Rich tag="span" html={m.q} style={sx("display:block;font:500 15px/1.45 var(--font-outfit),sans-serif;text-wrap:pretty")} />
              <span style={sx("display:block;margin-top:4px;" + m.statusStyle)}>{m.status}</span>
            </span>
          </button>

          {m.open && !m.done ? (
            <div style={sx("padding:4px 0 16px")}>
              <div style={sx("display:flex;gap:9px;margin-bottom:12px")}>
                {m.opts.map((o, oI) => (
                  <button key={oI} onClick={o.onClick} aria-pressed={!!o.active} style={sx(o.style)}>{o.label}</button>
                ))}
              </div>
              <button onClick={m.kirim} disabled={m.sending}
                style={sx("width:100%;min-height:50px;border:none;border-radius:var(--r-m);background:var(--gold);color:var(--panel);font:600 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>
                {m.sending ? 'Mengirim…' : 'Kirim dugaan'}
              </button>
            </div>
          ) : null}

          {m.open && m.done ? (
            <div style={sx("padding:14px 16px 16px;margin:0 0 16px;border-radius:var(--r-m);background:" + box)}>
              <div style={sx("display:flex;gap:20px;flex-wrap:wrap;padding-bottom:10px;border-bottom:1px solid " + rule)}>
                <span>
                  <span style={sx("display:block;font:500 11px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:" + ink2)}>Dugaanmu</span>
                  <span style={sx("display:block;margin-top:5px;font:600 17px/1 var(--font-outfit),sans-serif;color:" + (m.ok ? 'var(--ok)' : 'var(--warn)'))}>{m.pilihanmu}</span>
                </span>
                <span>
                  <span style={sx("display:block;font:500 11px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:" + ink2)}>Yang terjadi</span>
                  <span style={sx("display:block;margin-top:5px;font:600 17px/1 var(--font-outfit),sans-serif;color:" + ink)}>{m.jawaban}</span>
                </span>
              </div>
              {m.fb ? <Rich block tag="div" html={m.fb} style={sx("margin:12px 0 0;font:400 15px/1.65 var(--font-outfit),sans-serif;text-wrap:pretty;color:" + ink2)} /> : null}
              <p style={sx("margin:12px 0 0;font:400 14.5px/1.6 var(--font-outfit),sans-serif;color:" + ink2)}>Tuasnya sudah terbuka. Coba sendiri sekarang.</p>
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export default function Lab({ v }) {
  const { labAnsambel, ansSliders, ansBeat, ansBeatLabel, ansPulseStyle, ansBtnLabel, ansPlay, ansHint, dopSourceRef, dopWaveRef, dopHeardRef, dbValue, dopBtnLabel, dopHeard, dopReset, dopSliders, dopSourceStyle, dopStatus, dopStatusColor, dopToggle, dopWaveStyle, drum3d, drumLabel, drumOpts, hitLabel, labDoppler, labDrum, labTabs, mediumInfo, mediumOpts, misi, misiLabel, sliders, temuan, temuanLabel, waveInfo, waveRef } = v;

  const slider = (s, sI, accent) => (
    <div key={sI} style={sx(s.locked ? "opacity:.5" : "")}>
      <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px")}>
        <span style={sx("font:500 15px/1.3 var(--font-outfit),sans-serif;color:" + (accent === 'dark' ? 'var(--panel-ink)' : 'var(--ink)'))}>{s.label}</span>
        <span style={sx("font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:" + (accent === 'dark' ? 'var(--gold)' : 'var(--gold-ink)'))}>{s.value}</span>
      </div>
      <input type="range" aria-label={s.label} aria-valuetext={s.valueText || s.value} disabled={!!s.locked} min={s.min} max={s.max} step={s.step} value={s.raw} onChange={s.onInput} style={sx("width:100%;height:44px;accent-color:" + (accent === 'dark' ? '#d9962f' : '#16132e') + ";background:transparent;cursor:" + (s.locked ? 'not-allowed' : 'pointer'))} />
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
            <div className="gb-stage">
              <Drum3D {...drum3d} />
              <div className="gb-stage-note" style={sx("font:400 13px/1.5 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>{drumLabel}<br />{hitLabel}</div>
            </div>

            <div style={sx("background:var(--panel-2);border-radius:var(--r-m);padding:14px 16px 8px;margin-bottom:20px")}>
              <div style={sx("display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 12px;font:500 13px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2);margin-bottom:10px")}><span>Osiloskop</span><span style={sx(READOUT)}>{waveInfo}</span></div>
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
                  {(drumOpts || []).map((d, dI) => <button key={dI} onClick={d.onClick} disabled={!!d.disabled} aria-pressed={!!d.active} style={sx(d.style + (d.disabled ? ';opacity:.5;cursor:not-allowed' : ''))}>{d.label}</button>)}
                </div>
              </div>
              <div>
                <div style={sx("font:500 13px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2);margin-bottom:9px")}>Medium perambatan</div>
                <div style={sx("display:flex;gap:9px")}>
                  {(mediumOpts || []).map((m, mI) => <button key={mI} onClick={m.onClick} disabled={!!m.disabled} aria-pressed={!!m.active} style={sx(m.style + (m.disabled ? ';opacity:.5;cursor:not-allowed' : ''))}>{m.label}</button>)}
                </div>
                <div style={sx("margin-top:10px;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>{mediumInfo}</div>
              </div>
            </div>

            <Misi misi={misi} misiLabel={misiLabel} dark />
            </div>
            </div>
          </div>

          <section style={sx("margin-top:36px;padding-top:24px;border-top:1px solid var(--rule-2)")}>
            <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:16px")}>
              <h3 style={sx("font-family:var(--font-instrument),serif;font-size:22px;margin:0;font-weight:400")}>Apa yang kamu temukan?</h3>
              <span style={sx("font:500 13px/1.2 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3)")}>{temuanLabel}</span>
            </div>
            <ul className="gb-cols gb-cols-3" style={sx("margin:0;padding:0;list-style:none;align-items:start")}>
              {(temuan || []).map((t, tI) => (
                <li key={tI} style={sx(t.style)}>
                  <span aria-hidden="true" style={sx("flex:none;color:" + (t.open ? 'var(--gold-ink)' : 'var(--ink-3)'))}>{t.open ? '·' : '×'}</span>{t.text}
                </li>
              ))}
            </ul>
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

          <Misi misi={misi} misiLabel={misiLabel} />
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

          <Misi misi={misi} misiLabel={misiLabel} dark />
        </div>
      ) : null}
    </div>
  );
}

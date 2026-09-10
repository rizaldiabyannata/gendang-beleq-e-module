import React from 'react';
import { sx } from './sx';
import Rich from './Rich';

export default function Kuis({ v }) {
  const { backToBanks, bankBarStyle, bankCards, bankKkmLabel, bankScoreLabel, bankScoreStyle, bankTitle, kuisSkorLabel, kuisSoal, openBankCount, resetKuis, showBank, showBankList, showBankLocked } = v;
  return (
    <>
      {showBankList ? (
        <div className="gb-pad" style={sx("padding-top:32px;padding-bottom:12px")}>
          {showBankLocked ? (
            <div role="alert" style={sx("padding:16px;border-radius:var(--r-m);background:var(--warn-bg);border:1px solid var(--warn-rule);color:var(--warn);font:400 15px/1.65 var(--font-outfit),sans-serif;margin-bottom:28px;text-wrap:pretty")}>Bank soal yang kamu buka baru saja dikunci gurumu. Jawabanmu tetap tersimpan — pilih bank lain di bawah ini dulu.</div>
          ) : null}
          <h2 style={sx("font-family:var(--font-instrument),serif;font-size:32px;line-height:1.06;margin:0;font-weight:400")}>Pilih bank soal</h2>
          <p style={sx("margin:16px 0 8px;max-width:68ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>Tiap bank punya tipe soal berbeda — pilihan ganda, benar–salah, jawaban ganda, isian singkat, pencocokan, sampai esai. Bank yang masih terkunci akan dibuka gurumu saat waktunya tiba.</p>
          <p style={sx("margin:0 0 28px;font:500 15px/1.6 var(--font-outfit),sans-serif;color:var(--gold-ink)")}>{openBankCount}</p>
          <div className="gb-cols" style={sx("align-items:start")}>
            {(bankCards || []).map((b, bI) => (
              <button key={bI} onClick={b.onOpen} style={sx(b.style)}>
                <span style={sx("display:flex;justify-content:space-between;align-items:flex-start;gap:12px;width:100%")}>
                  <Rich tag="span" html={b.title} style={sx("font:600 18px/1.3 var(--font-outfit),sans-serif;text-align:left;flex:1")} />
                  <span style={sx(b.statusStyle)}>{b.statusLabel}</span>
                </span>
                <span style={sx("font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2);text-align:left;text-wrap:pretty")}>{b.desc}</span>
                <span style={sx("display:flex;flex-wrap:wrap;gap:6px;width:100%")}>
                  {(b.typeChips || []).map((c, cI) => (
                    <span key={cI} style={sx("font:500 12px/1 var(--font-outfit),sans-serif;padding:6px 10px;border-radius:var(--r-full);background:var(--paper-2);color:var(--ink-2)")}>{c.label}</span>
                  ))}
                </span>
                <span style={sx("font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3)")}>{b.meta}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showBank ? (
        <div className="gb-pad" style={sx("padding-top:28px;padding-bottom:12px")}>
          <button onClick={backToBanks} style={sx("min-height:44px;padding:0 15px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink-2);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer;margin-bottom:24px")}>‹ Semua bank soal</button>

          <div className="gb-split">
          <div className="gb-rail">
          <div style={sx("display:flex;gap:20px;align-items:flex-end;justify-content:space-between;padding-bottom:20px;border-bottom:1px solid var(--rule-2)")}>
            <div style={sx("flex:1;min-width:0")}>
              <div style={sx("font:500 13px/1 var(--font-outfit),sans-serif;color:var(--gold-ink)")}>{bankKkmLabel}</div>
              <Rich tag="h2" html={bankTitle} style={sx("font-family:var(--font-instrument),serif;font-size:28px;line-height:1.1;margin:10px 0 12px;font-weight:400")} />
              <div style={sx("font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-2)")}>{kuisSkorLabel}</div>
              <div style={sx("height:4px;border-radius:var(--r-full);background:var(--rule);overflow:hidden;margin-top:12px")}><div style={sx(bankBarStyle)}></div></div>
            </div>
            <div style={sx("flex:none;text-align:right")}>
              <div style={sx(bankScoreStyle)}>{bankScoreLabel}</div>
              <div style={sx("font:500 13px/1 var(--font-outfit),sans-serif;color:var(--ink-3);margin-top:6px")}>Nilai</div>
            </div>
          </div>

          <button onClick={resetKuis} style={sx("width:100%;min-height:48px;margin-top:20px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink-2);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Ulangi bank soal ini dari awal</button>
          </div>

          <div style={sx("display:flex;flex-direction:column;gap:16px")}>
            {(kuisSoal || []).map((q, qI) => (
              <div key={qI} style={sx(q.cardStyle)}>
                <div style={sx("display:flex;align-items:center;gap:12px;margin-bottom:16px")}>
                  <div style={sx("flex:none;font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{q.n}</div>
                  <div style={sx(q.typeChipStyle)}>{q.typeLabel}</div>
                  <div style={sx("flex:1")}></div>
                  <div style={sx("font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3)")}>{q.xpLabel}</div>
                </div>
                <Rich block tag="div" html={q.text} style={sx("font:500 17px/1.6 var(--font-outfit),sans-serif;color:var(--ink);margin-bottom:18px;text-wrap:pretty")} />

                {q.isPg || q.isMulti ? (
                  <>
                    {q.isMulti ? <div style={sx("font:500 15px/1.5 var(--font-outfit),sans-serif;color:var(--gold-ink);margin-bottom:12px")}>{q.hint}</div> : null}
                    <div style={sx("display:flex;flex-direction:column;gap:9px")}>
                      {(q.options || []).map((o, oI) => (
                        <button key={oI} onClick={o.onPick} aria-pressed={!!o.selected} style={sx(o.style)}>
                          <span style={sx(o.letterStyle)}>{o.letter}</span>
                          <Rich tag="span" html={o.text} style={sx("flex:1;text-align:left;font:400 16px/1.6 var(--font-outfit),sans-serif;text-wrap:pretty")} />
                          {o.mark ? <span aria-hidden="true" style={sx("flex:none;font:600 17px/1.5 var(--font-outfit),sans-serif")}>{o.mark}</span> : null}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {q.isBs ? (
                  <div style={sx("display:flex;gap:10px")}>
                    {(q.options || []).map((o, oI) => (
                      <button key={oI} onClick={o.onPick} aria-pressed={!!o.selected} style={sx(o.style)}>
                        <span aria-hidden="true" style={sx(o.letterStyle)}>{o.letter}</span>
                        <span style={sx("font:600 16px/1 var(--font-outfit),sans-serif")}><Rich tag="span" html={o.text} />{o.mark ? ' ' + o.mark : ''}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {q.isIsian ? (
                  <input value={q.inputVal} onChange={q.onInput} onKeyDown={q.onIsianKey} disabled={q.inputDisabled} placeholder="Ketik jawabanmu…" aria-label="Ketik jawabanmu" style={sx(q.inputStyle)} />
                ) : null}

                {q.isCocok ? (
                  <>
                    <div style={sx("padding:16px;border-radius:var(--r-m);background:var(--paper-2);margin-bottom:14px;display:flex;flex-direction:column;gap:10px")}>
                      {(q.rights || []).map((r, rI) => (
                        <div key={rI} style={sx("display:flex;gap:12px;align-items:flex-start")}>
                          <span style={sx("flex:none;width:24px;height:24px;border-radius:var(--r-s);background:var(--panel);color:var(--panel-ink);font:500 12px/24px var(--font-jetbrains),ui-monospace,monospace;text-align:center")}>{r.letter}</span>
                          <Rich tag="span" html={r.text} style={sx("flex:1;font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")} />
                        </div>
                      ))}
                    </div>
                    <div style={sx("display:flex;flex-direction:column;gap:10px")}>
                      {(q.lefts || []).map((l, lI) => (
                        <div key={lI} style={sx(l.rowStyle)}>
                          <Rich tag="div" html={l.text} style={sx("font:500 16px/1.5 var(--font-outfit),sans-serif;color:var(--ink)")} />
                          <div style={sx("display:flex;gap:7px")}>
                            {(l.picks || []).map((p, pI) => (
                              <button key={pI} onClick={p.onPick} aria-label={"Pasangkan dengan pilihan " + p.letter} style={sx(p.style)}>{p.letter}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {q.isEsai ? (
                  <>
                    <textarea value={q.inputVal} onChange={q.onInput} disabled={q.inputDisabled} rows="6" placeholder="Tulis jawaban lengkapmu di sini…" aria-label="Tulis jawaban lengkapmu" style={sx(q.inputStyle)}></textarea>
                    <div style={sx("font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2);margin-top:10px")}>{q.hint}</div>
                  </>
                ) : null}

                {q.showAction ? (
                  <button onClick={q.onAction} style={sx("width:100%;min-height:52px;margin-top:18px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>{q.actionLabel}</button>
                ) : null}
                {q.showFeedback ? <Rich block tag="div" html={q.feedback} style={sx(q.feedbackStyle)} /> : null}
                {q.showKunci ? <Rich tag="div" html={q.kunci} style={sx("margin-top:12px;font:500 15px/1.6 var(--font-outfit),sans-serif;color:var(--ok)")} /> : null}
                {q.showModel ? (
                  <div style={sx("margin-top:16px;padding:18px;border-radius:var(--r-m);background:var(--paper-2)")}>
                    <div style={sx("font:500 13px/1.4 var(--font-outfit),sans-serif;color:var(--gold-ink)")}>Contoh jawaban ideal · {q.modelLabel}</div>
                    <Rich block tag="div" html={q.model} style={sx("font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);margin-top:10px;text-wrap:pretty")} />
                  </div>
                ) : null}
                {q.teacherNote ? (
                  <div style={sx("margin-top:12px;padding:16px 18px;border-radius:var(--r-m);background:var(--ok-bg);border:1px solid var(--ok-rule)")}>
                    <div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--ok)")}>Catatan gurumu</div>
                    <div style={sx("font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);margin-top:9px;text-wrap:pretty")}>{q.teacherNote}</div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

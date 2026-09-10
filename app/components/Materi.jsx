import React from 'react';
import { sx } from './sx';
import Rich from './Rich';

const SEC = "margin-top:36px;padding-top:28px;border-top:1px solid var(--rule)";
const H2 = "font-family:var(--font-instrument),serif;font-size:28px;line-height:1.1;margin:0 0 16px;font-weight:400;text-wrap:balance";
const H3 = "font-family:var(--font-instrument),serif;font-size:22px;line-height:1.15;margin:0 0 14px;font-weight:400";
const BODY = "margin:0 0 16px;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty";
const SOFT = "margin:0 0 16px;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty";
// Formulas are reading material, not instruments, so they stay on paper. Only
// the lab goes dark.
const FORMULA = "padding:26px 0 4px;border-top:1px solid var(--rule-2);margin:4px 0 28px";
const NOTE = "padding:18px;background:var(--paper-2);border-radius:var(--r-m);font:400 15px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty";
const LABEL = "margin:0 0 10px;font:600 13px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;color:var(--ink-3);text-transform:uppercase";

function Pemantik({ items, title }) {
  return (
    <section style={sx(SEC)}>
      <Rich tag="h3" html={title} style={sx(H3)} />
      <ol style={sx("margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:16px")}>
        {(items || []).map((q, qI) => (
          <li key={qI} style={sx("display:flex;gap:16px;align-items:flex-start")}>
            <span style={sx("flex:none;width:22px;font:500 15px/1.7 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{qI + 1}</span>
            <Rich tag="span" html={q} style={sx("flex:1;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Materi({ v }) {
  const { mersenne, pelayangan, dopplerVars, glosarium, goDoppler, instrumen, klasifikasi, komponen, langkahSolusi, mameNina, matDoppler, matGlosarium, matKesCatatan, matKesJudul, matKesP1, matKesP2, matKesenian, matKonsep, matPendJudul, matPendPemantik, matPendTeks, matPendahuluan, matResonansi, matSifat, materiTabs, mediumRows, pemantikDoppler, pemantikResonansi, pustaka, resonansiSteps, showSolusi, sifat, solusiLabel, syarat, tahukahKulit, tahukahResonansi, toggleSolusi } = v;
  return (
    <div className="gb-pad gb-split" style={sx("padding-top:32px;padding-bottom:12px")}>
      {/* A contents list that wraps instead of scrolling sideways. The old row
          hid four of its seven sections off the edge with no scroll cue. */}
      <nav role="tablist" aria-label="Bagian materi" className="gb-rail gb-railnav">
        {(materiTabs || []).map((t, tI) => (
          <button key={tI} role="tab" aria-selected={!!t.active} onClick={t.onClick} style={sx(t.style)}>{t.label}</button>
        ))}
      </nav>

      <div>

      {matPendahuluan ? (
        <>
          <Rich tag="h2" html={matPendJudul} style={sx(H2)} />
          <Rich block tag="div" html={matPendTeks} style={sx(BODY)} />
          <section style={sx(SEC)}>
            <h3 style={sx(LABEL)}>Pertanyaan pemantik</h3>
            <Rich block tag="div" html={matPendPemantik} style={sx("margin:0;max-width:62ch;font:400 18px/1.6 var(--font-instrument),serif;color:var(--ink);text-wrap:pretty")} />
          </section>
        </>
      ) : null}

      {matKesenian ? (
        <>
          <Rich tag="h2" html={matKesJudul} style={sx(H2)} />
          <Rich block tag="div" html={matKesP1} style={sx(BODY)} />
          <Rich block tag="div" html={matKesP2} style={sx(BODY)} />
          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Instrumen dalam ansambel</h3>
            <div style={sx("display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px")}>
              {(instrumen || []).map((i, iI) => (
                <Rich tag="span" html={i} key={iI} style={sx("background:var(--paper-2);border-radius:var(--r-full);padding:9px 14px;font:500 15px/1 var(--font-outfit),sans-serif;color:var(--ink)")} />
              ))}
            </div>
            <Rich block tag="div" html={matKesCatatan} style={sx(NOTE)} />
          </section>
        </>
      ) : null}

      {matKonsep ? (
        <>
          <h2 style={sx(H2)}>Pengertian dan komponen</h2>
          <p style={sx(BODY)}>Sumber gelombang bunyi adalah benda yang bergetar: getaran dawai (gitar, piano), getaran kolom udara (seruling, organa), atau getaran membran (kendang, drum, gendang beleq). Dalam keadaan bergetar, membran memampatkan dan merenggangkan udara di sekitarnya. Bunyi adalah gelombang mekanik — ia butuh medium untuk merambat.</p>
          {(komponen || []).map((k, kI) => (
            <div key={kI} style={sx("padding:20px 0;border-top:1px solid var(--rule)")}>
              <div style={sx("display:flex;align-items:baseline;gap:14px;margin-bottom:8px")}>
                <Rich tag="span" html={k.tag} style={sx("flex:none;width:22px;font:500 17px/1.3 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")} />
                <Rich tag="span" html={k.title} style={sx("font:600 18px/1.3 var(--font-outfit),sans-serif")} />
              </div>
              <Rich block tag="div" html={k.body} style={sx("margin:0 0 8px 36px;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")} />
              <Rich tag="div" html={k.rumus} style={sx("margin-left:36px;font:500 15px/1.5 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")} />
            </div>
          ))}

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Klasifikasi bunyi menurut frekuensi</h3>
            <div style={sx("display:flex;flex-direction:column;gap:10px")}>
              {(klasifikasi || []).map((c, cI) => (
                <div key={cI} style={sx(c.style)}>
                  <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px")}>
                    <Rich tag="span" html={c.name} style={sx("font:600 17px/1.2 var(--font-outfit),sans-serif")} />
                    <Rich tag="span" html={c.range} style={sx("font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace")} />
                  </div>
                  <Rich block tag="div" html={c.body} style={sx("margin:0;max-width:62ch;font:400 15px/1.65 var(--font-outfit),sans-serif;opacity:.86;text-wrap:pretty")} />
                </div>
              ))}
            </div>
          </section>

          <section style={sx(SEC)}>
            <div style={sx("display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:14px")}>
              <h3 style={sx(H3 + ";margin:0")}>Contoh soal</h3>
              <button onClick={toggleSolusi} aria-expanded={!!showSolusi} style={sx("flex:none;min-height:44px;padding:0 16px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>{solusiLabel}</button>
            </div>
            <p style={sx(BODY)}>Sebuah sumber bunyi bergetar dengan frekuensi tetap 243 Hz. Tentukan besar periode getarannya.</p>
            {showSolusi ? (
              <div style={sx("display:flex;flex-direction:column;gap:14px")}>
                {(langkahSolusi || []).map((s, sI) => (
                  <div key={sI}>
                    <Rich tag="div" html={s.step} style={sx(LABEL + ";margin-bottom:6px")} />
                    <Rich block tag="div" html={s.text} style={sx("font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink)")} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {matSifat ? (
        <>
          <h2 style={sx(H2)}>Sifat-sifat gelombang bunyi</h2>
          <p style={sx(BODY)}>Bunyi merambat sebagai pola rapatan dan renggangan partikel medium. Karena itu bunyi tidak dapat merambat di ruang hampa — tidak ada partikel yang bisa digetarkan.</p>
          {(sifat || []).map((s, sI) => (
            <div key={sI} style={sx("padding:20px 0;border-top:1px solid var(--rule)")}>
              <Rich tag="h3" html={s.title} style={sx("font:600 18px/1.3 var(--font-outfit),sans-serif;margin:0 0 8px")} />
              <Rich block tag="div" html={s.body} style={sx(SOFT)} />
              <div style={sx(NOTE)}><strong style={sx("font-weight:600")}>Di gendang beleq: </strong><Rich tag="span" html={s.local} /></div>
            </div>
          ))}

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Syarat terjadinya bunyi</h3>
            <ol style={sx("margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px")}>
              {(syarat || []).map((s, sI) => (
                <li key={sI} style={sx("display:flex;gap:16px;align-items:flex-start")}>
                  <span style={sx("flex:none;width:22px;font:500 15px/1.7 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{s.n}</span>
                  <Rich tag="span" html={s.text} style={sx("flex:1;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink)")} />
                </li>
              ))}
            </ol>
          </section>

          <section style={sx(SEC)}>
            <Rich tag="h3" html={pelayangan.judul} style={sx(H3)} />
            <Rich tag="div" html={pelayangan.rumus} style={sx(FORMULA + ";text-align:center;font-family:var(--font-instrument),serif;font-size:26px;color:var(--ink)")} />
            <Rich block tag="div" html={pelayangan.teks} style={sx(BODY)} />
            <Rich block tag="div" html={pelayangan.contoh} style={sx(BODY)} />
            <div style={sx(NOTE)}><strong style={sx("font-weight:600")}>Di gendang beleq: </strong><Rich tag="span" html={pelayangan.local} /></div>
          </section>
        </>
      ) : null}

      {matResonansi ? (
        <>
          <h2 style={sx(H2)}>Kenapa gendang beleq terdengar menggema?</h2>
          <p style={sx(BODY)}>Kalau hanya membran kulit yang bergetar tanpa tabung berongga, suaranya sangat pelan. Rongga kayu di badan gendang bertindak sebagai ruang resonansi akustik: udara di dalamnya ikut bergetar harmonis saat kulit dipukul, lalu memperkuat bunyi asli.</p>
          {(resonansiSteps || []).map((r, rI) => (
            <div key={rI} style={sx("display:flex;gap:16px;padding:20px 0;border-top:1px solid var(--rule)")}>
              <Rich tag="span" html={r.tag} style={sx("flex:none;width:22px;font:500 15px/1.6 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")} />
              <span style={sx("flex:1")}>
                <Rich tag="span" html={r.title} style={sx("display:block;font:600 17px/1.3 var(--font-outfit),sans-serif;margin-bottom:6px")} />
                <Rich tag="span" html={r.body} style={sx("display:block;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")} />
              </span>
            </div>
          ))}

          <section style={sx(SEC)}>
            <h3 style={sx(LABEL)}>Resonansi kolom udara</h3>
            <div style={sx(FORMULA)}>
              <div style={sx("font-family:var(--font-instrument),serif;font-size:30px;color:var(--ink);margin-bottom:12px")}>L = n · λ / 2</div>
              <div style={sx("font:400 15px/1.8 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-2)")}>L = panjang kolom udara (m)<br />λ = panjang gelombang (m)<br />n = orde resonansi (1, 2, 3, …)</div>
            </div>
          </section>

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Gendang Mame &amp; Gendang Nine</h3>
            <div style={sx("overflow-x:auto")}>
              <table style={sx("width:100%;min-width:340px;border-collapse:collapse;font:400 15px/1.5 var(--font-outfit),sans-serif")}>
                <thead>
                  <tr>
                    <th scope="col" style={sx("text-align:left;padding:10px 10px 12px 0;border-bottom:2px solid var(--ink);font:600 15px/1.3 var(--font-outfit),sans-serif;color:var(--ink-3)")}>Aspek</th>
                    <th scope="col" style={sx("text-align:left;padding:10px 10px 12px;border-bottom:2px solid var(--ink);font:600 15px/1.3 var(--font-outfit),sans-serif;color:var(--ink)")}>Mame</th>
                    <th scope="col" style={sx("text-align:left;padding:10px 0 12px 10px;border-bottom:2px solid var(--ink);font:600 15px/1.3 var(--font-outfit),sans-serif;color:var(--gold-ink)")}>Nine</th>
                  </tr>
                </thead>
                <tbody>
                  {(mameNina || []).map((m, mI) => (
                    <tr key={mI}>
                      <Rich tag="th" html={m.aspek} scope="row" style={sx("text-align:left;padding:14px 10px 14px 0;border-bottom:1px solid var(--rule);font:400 15px/1.5 var(--font-outfit),sans-serif;color:var(--ink-2)")} />
                      <Rich tag="td" html={m.mame} style={sx("padding:14px 10px;border-bottom:1px solid var(--rule);font-weight:500")} />
                      <Rich tag="td" html={m.nine} style={sx("padding:14px 0 14px 10px;border-bottom:1px solid var(--rule);font-weight:500;color:var(--gold-ink)")} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={sx(NOTE + ";margin-top:24px")}><strong style={sx("font-weight:600")}>Tahukah kamu. </strong><Rich tag="span" html={tahukahResonansi} /></div>
            <div style={sx(NOTE + ";margin-top:12px")}><strong style={sx("font-weight:600")}>Tahukah kamu. </strong><Rich tag="span" html={tahukahKulit} /></div>
          </section>

          <section style={sx(SEC)}>
            <Rich tag="h3" html={mersenne.judul} style={sx(H3)} />
            <Rich tag="div" html={mersenne.rumus} style={sx(FORMULA + ";text-align:center;font-family:var(--font-instrument),serif;font-size:28px;color:var(--ink)")} />
            <dl style={sx("margin:0 0 20px;display:flex;flex-direction:column;gap:10px")}>
              {(mersenne.vars || []).map((x, xI) => (
                <div key={xI} style={sx("display:flex;gap:14px;align-items:baseline")}>
                  <Rich tag="dt" html={x.sym} style={sx("flex:none;width:28px;font-family:var(--font-instrument),serif;font-size:18px;color:var(--gold-ink)")} />
                  <Rich tag="dd" html={x.def} style={sx("flex:1;margin:0;font:400 15px/1.65 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")} />
                </div>
              ))}
            </dl>
            <Rich block tag="div" html={mersenne.teks} style={sx(BODY)} />
            <div style={sx(NOTE)}><strong style={sx("font-weight:600")}>Uji sendiri. </strong><Rich tag="span" html={mersenne.cek} /></div>
          </section>

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Yang menentukan bukan frekuensinya</h3>
            <p style={sx(BODY)}>Cepat rambat bunyi ditentukan oleh medium dan suhunya, bukan oleh frekuensi sumber. Makin rapat dan elastis mediumnya, makin cepat bunyi merambat. Karena itu bunyi merambat lebih cepat pada siang yang panas dibanding malam yang dingin.</p>
            <div style={sx(FORMULA)}>
              <div style={sx("font-family:var(--font-instrument),serif;font-size:30px;color:var(--ink)")}>v = λ · f</div>
              <div style={sx("font:400 15px/1.8 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-2);margin-top:10px")}>v = cepat rambat (m/s) · λ = panjang gelombang (m) · f = frekuensi (Hz)</div>
            </div>
            {(mediumRows || []).map((m, mI) => (
              <div key={mI} style={sx("padding:16px 0;border-top:1px solid var(--rule)")}>
                <div style={sx("display:flex;align-items:baseline;gap:14px")}>
                  <Rich tag="span" html={m.medium} style={sx("flex:1;font:600 16px/1.3 var(--font-outfit),sans-serif")} />
                  <Rich tag="span" html={m.v} style={sx("flex:none;font:500 16px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")} />
                </div>
                <Rich tag="div" html={m.note} style={sx("font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ink-2);margin-top:6px")} />
              </div>
            ))}
          </section>

          <Pemantik items={pemantikResonansi} title="Pertanyaan pemantik untuk didiskusikan" />
        </>
      ) : null}

      {matDoppler ? (
        <>
          <h2 style={sx(H2)}>Nada yang berubah saat rombongan lewat</h2>
          <p style={sx(BODY)}>Pada tradisi Nyongkolan, rombongan penabuh berjalan menyusuri jalan desa menuju rumah pengantin wanita, sementara penonton berdiri di tepi jalan. Karena sumber bunyi bergerak, frekuensi yang diterima penonton berubah — inilah efek Doppler.</p>
          <div style={sx("display:flex;flex-direction:column;gap:12px;margin-bottom:24px")}>
            <div style={sx("padding:16px;border-radius:var(--r-m);background:var(--gold-soft);font:400 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>Rombongan <strong style={sx("font-weight:600")}>mendekat</strong>: gelombang termampatkan, nada terdengar <strong style={sx("font-weight:600")}>lebih tinggi</strong> (fₚ &gt; fₛ)</div>
            <div style={sx("padding:16px;border-radius:var(--r-m);background:var(--paper-2);font:400 16px/1.6 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>Rombongan <strong style={sx("font-weight:600")}>menjauh</strong>: gelombang merenggang, nada terdengar <strong style={sx("font-weight:600")}>lebih rendah</strong> (fₚ &lt; fₛ)</div>
          </div>
          <div style={sx(FORMULA)}>
            <div style={sx("font-family:var(--font-instrument),serif;font-size:28px;color:var(--ink);margin-bottom:14px")}>fₚ = ( v ± vₚ ) / ( v ∓ vₛ ) · fₛ</div>
            <dl style={sx("margin:0;display:flex;flex-direction:column;gap:8px")}>
              {(dopplerVars || []).map((d, dI) => (
                <div key={dI} style={sx("display:flex;gap:12px;font:400 15px/1.6 var(--font-outfit),sans-serif")}>
                  <Rich tag="dt" html={d.sym} style={sx("flex:none;width:36px;font-family:var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")} />
                  <Rich tag="dd" html={d.def} style={sx("flex:1;margin:0;color:var(--ink-2)")} />
                </div>
              ))}
            </dl>
          </div>
          <button onClick={goDoppler} style={sx("width:100%;min-height:54px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Buktikan di simulasi Doppler →</button>

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Seberapa keras, dalam angka</h3>
            <p style={sx(BODY)}>Intensitas bunyi adalah daya bunyi yang menembus tiap satuan luas permukaan secara tegak lurus. Karena telinga manusia menanggapi bunyi secara logaritmik, kekerasannya diukur sebagai taraf intensitas dalam desibel, dengan sound level meter.</p>
            <div style={sx(FORMULA)}>
              <div style={sx("font-family:var(--font-instrument),serif;font-size:28px;color:var(--ink)")}>I = P / A</div>
              <div style={sx("font:400 15px/1.8 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-2);margin-top:10px")}>I = intensitas (W/m²) · P = daya bunyi (W) · A = luas bidang (m²)</div>
            </div>
            <div style={sx(FORMULA)}>
              <div style={sx("font-family:var(--font-instrument),serif;font-size:28px;color:var(--ink)")}>TI = 10 log ( I / I₀ )</div>
              <div style={sx("font:400 15px/1.8 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-2);margin-top:10px")}>TI = taraf intensitas (dB) · I₀ = 10⁻¹² W/m² (ambang pendengaran)</div>
            </div>
            <div style={sx(NOTE)}><strong style={sx("font-weight:600")}>Jangan tertukar. </strong>Memukul gendang lebih kuat menambah amplitudo sehingga intensitasnya naik, jadi bunyi terdengar lebih keras. Nadanya tidak ikut naik; nada hanya berubah kalau frekuensi getar membran berubah.</div>
          </section>

          <Pemantik items={pemantikDoppler} title="Pertanyaan pemantik untuk didiskusikan" />
        </>
      ) : null}

      {matGlosarium ? (
        <>
          <h2 style={sx(H2)}>Glosarium</h2>
          <p style={sx(SOFT)}>Ketuk istilah untuk melihat definisinya.</p>
          <div style={sx("display:flex;flex-wrap:wrap;gap:9px")}>
            {(glosarium || []).map((g, gI) => (
              <button key={gI} onClick={g.onClick} style={sx("min-height:44px;padding:0 16px;border:1px solid var(--rule-2);border-radius:var(--r-full);background:transparent;color:var(--ink);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}><Rich tag="span" html={g.term} /></button>
            ))}
          </div>
          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Daftar pustaka</h3>
            <div style={sx("display:flex;flex-direction:column;gap:14px")}>
              {(pustaka || []).map((p, pI) => (
                <Rich tag="div" html={p} key={pI} style={sx("font:400 15px/1.65 var(--font-outfit),sans-serif;color:var(--ink-2);padding-left:18px;text-indent:-18px;text-wrap:pretty")} />
              ))}
            </div>
          </section>
        </>
      ) : null}
      </div>
    </div>
  );
}

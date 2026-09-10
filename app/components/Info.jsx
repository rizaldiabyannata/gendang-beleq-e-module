import React from 'react';
import { sx } from './sx';

const SEC = "margin-top:36px;padding-top:28px;border-top:1px solid var(--rule)";
const H2 = "font-family:var(--font-instrument),serif;font-size:28px;line-height:1.1;margin:0 0 16px;font-weight:400;text-wrap:balance";
const H3 = "font-family:var(--font-instrument),serif;font-size:22px;line-height:1.15;margin:0 0 14px;font-weight:400";
const BODY = "margin:0 0 16px;max-width:62ch;font:400 16px/1.75 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty";
const SOFT = "margin:0 0 20px;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty";
const NOTE = "padding:18px;background:var(--paper-2);border-radius:var(--r-m);font:400 15px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty";

function Bullets({ items }) {
  return (
    <ul style={sx("margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px")}>
      {(items || []).map((p, pI) => (
        <li key={pI} style={sx("display:flex;gap:14px;align-items:flex-start;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>
          <span aria-hidden="true" style={sx("flex:none;color:var(--gold-ink)")}>·</span>{p}
        </li>
      ))}
    </ul>
  );
}

export default function Info({ v }) {
  const { hasVideo, identRows, infoIdentitas, infoPengantar, infoPeta, infoPetunjuk, infoTabs, infoVideo, keselamatan, konsepAktif, konsepNodes, noVideo, onVideoLoad, onVideoUrl, pancasila, videoFromTeacher, petunjukGuru, petunjukSiswa, tujuan, videoEmbed, videoUrl } = v;
  return (
    <div className="gb-pad gb-split" style={sx("padding-top:32px;padding-bottom:12px")}>
      <nav role="tablist" aria-label="Bagian info" className="gb-rail gb-railnav">
        {(infoTabs || []).map((t, tI) => (
          <button key={tI} role="tab" aria-selected={!!t.active} onClick={t.onClick} style={sx(t.style)}>{t.label}</button>
        ))}
      </nav>

      <div>

      {infoPengantar ? (
        <>
          <h2 style={sx(H2)}>Fisika tidak harus terpenjara di ruang kelas</h2>
          <p style={sx(BODY)}>E-modul ini disusun sebagai bahan ajar Fisika untuk peserta didik SMA/MA kelas XI (Fase F) pada materi gelombang bunyi. Modelnya <em>problem based learning</em>, dan konteksnya adalah etnosains Gendang Beleq — kearifan lokal masyarakat Sasak di Lombok.</p>
          <p style={sx(BODY)}>Tujuannya bukan hanya agar kamu paham rumus, tetapi agar kamu menemukan keterkaitan fisika dengan fenomena budaya di sekitarmu. Setiap sub-materi dilengkapi uraian, contoh soal, LKPD, evaluasi, dan rangkuman — supaya kamu terbiasa mengamati fenomena, bertanya, menyusun hipotesis, menyelidiki, menganalisis data, menyimpulkan, lalu mengomunikasikan hasilnya.</p>
          <div style={sx("margin-top:28px;padding-top:20px;border-top:1px solid var(--rule);text-align:right")}>
            <div style={sx("font:500 15px/1.5 var(--font-outfit),sans-serif;color:var(--ink-2)")}>Mataram, 2026</div>
            <div style={sx("font-family:var(--font-instrument),serif;font-style:italic;font-size:22px;color:var(--ink);margin-top:6px")}>Melani Aulia Khatami</div>
          </div>
          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Deskripsi e-modul</h3>
            <p style={sx(SOFT)}>Fisika adalah upaya memahami perilaku alam semesta dan membingkainya menjadi cara berpikir yang logis, dan fisika ada di mana-mana, bukan hanya di laboratorium. E-modul ini mengkaji materi gelombang bunyi lewat kearifan lokal yang hidup di Lombok. Dengan mempelajarinya, kamu tidak hanya mendapat pengetahuan, tetapi juga mengenali budaya di lingkunganmu sendiri agar tidak dilupakan.</p>
          </section>
        </>
      ) : null}

      {infoIdentitas ? (
        <>
          <h2 style={sx(H2)}>Identitas e-modul</h2>
          <dl style={sx("margin:0;display:grid;grid-template-columns:auto 1fr;gap:0 20px")}>
            {(identRows || []).map((r, rI) => (
              <React.Fragment key={rI}>
                <dt style={sx("padding:14px 0;border-top:1px solid var(--rule);font:400 15px/1.5 var(--font-outfit),sans-serif;color:var(--ink-2)")}>{r.label}</dt>
                <dd style={sx("margin:0;padding:14px 0;border-top:1px solid var(--rule);font:500 15px/1.5 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>{r.val}</dd>
              </React.Fragment>
            ))}
          </dl>

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Capaian pembelajaran</h3>
            <p style={sx(SOFT)}>Peserta didik mampu menerapkan konsep dan prinsip vektor ke dalam kinematika gerak partikel, usaha dan energi, fluida dinamis, getaran harmonis, gelombang bunyi, dan gelombang cahaya untuk menyelesaikan masalah, serta menerapkan prinsip energi kalor dan termodinamika pada mesin kalor.</p>
          </section>

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Tujuan pembelajaran</h3>
            <ol style={sx("margin:0;padding:0;list-style:none")}>
              {(tujuan || []).map((t, tI) => (
                <li key={tI} style={sx("display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-top:1px solid var(--rule)")}>
                  <span style={sx("flex:none;width:22px;font:500 15px/1.7 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{t.n}</span>
                  <span style={sx("flex:1;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink);text-wrap:pretty")}>{t.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Profil pelajar Pancasila</h3>
            <div style={sx("display:flex;flex-wrap:wrap;gap:9px")}>
              {(pancasila || []).map((p, pI) => (
                <span key={pI} style={sx("background:var(--paper-2);border-radius:var(--r-full);padding:10px 16px;font:500 15px/1.3 var(--font-outfit),sans-serif;color:var(--ink)")}>{p}</span>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {infoPetunjuk ? (
        <>
          <h2 style={sx(H2)}>Cara memakai modul ini</h2>
          <h3 style={sx(H3)}>Untuk siswa</h3>
          <Bullets items={petunjukSiswa} />
          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Untuk guru</h3>
            <Bullets items={petunjukGuru} />
          </section>
          <section style={sx(SEC)}>
            <h3 style={sx(H3)}>Keselamatan belajar</h3>
            <div style={sx("padding:20px;border-radius:var(--r-m);background:var(--warn-bg)")}>
              <ul style={sx("margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px")}>
                {(keselamatan || []).map((k, kI) => (
                  <li key={kI} style={sx("font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--warn);text-wrap:pretty")}>{k}</li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : null}

      {infoPeta ? (
        <>
          <h2 style={sx(H2)}>Peta konsep</h2>
          <p style={sx(SOFT)}>Ketuk tiap simpul untuk melihat isinya.</p>
          <div style={sx("display:flex;justify-content:center;margin-bottom:12px")}>
            <span style={sx("background:var(--panel);color:var(--panel-ink);border-radius:var(--r-m);padding:12px 22px;font:600 16px/1 var(--font-outfit),sans-serif")}>Gelombang Bunyi</span>
          </div>
          <div aria-hidden="true" style={sx("height:20px;width:1px;background:var(--rule-2);margin:0 auto 12px")}></div>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px")}>
            {(konsepNodes || []).map((n, nI) => (
              <button key={nI} onClick={n.onClick} aria-pressed={!!n.active} style={sx(n.style)}>{n.label}</button>
            ))}
          </div>
          <div style={sx("margin-top:20px;padding:22px;border-radius:var(--r-m);background:var(--paper-2)")}>
            <div style={sx("font:600 17px/1.3 var(--font-outfit),sans-serif;color:var(--ink);margin-bottom:8px")}>{konsepAktif.label}</div>
            <p style={sx("margin:0;max-width:62ch;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty")}>{konsepAktif.desc}</p>
          </div>
        </>
      ) : null}

      {infoVideo ? (
        <>
          <h2 style={sx(H2)}>Video pendukung</h2>
          <p style={sx(SOFT)}>Tempel tautan YouTube pertunjukan gendang beleq, atau rekaman kelasmu sendiri.</p>
          <div style={sx("display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap")}>
            <input value={videoUrl} onChange={onVideoUrl} readOnly={videoFromTeacher} placeholder="https://youtu.be/…" aria-label="Tautan video YouTube" style={sx("flex:1;min-width:180px;min-height:48px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 14px;font:400 16px/1 var(--font-outfit),sans-serif;background:var(--paper);color:var(--ink)")} />
            <button onClick={onVideoLoad} style={sx("flex:none;min-height:48px;padding:0 22px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Muat</button>
          </div>
          {hasVideo ? (
            <div style={sx("border-radius:var(--r-m);overflow:hidden;background:var(--panel);aspect-ratio:16/9")}>
              <iframe src={videoEmbed} title="Video gendang beleq" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope" allowFullScreen={true} style={sx("width:100%;height:100%;border:0;display:block")}></iframe>
            </div>
          ) : null}
          {noVideo ? (
            <div style={sx("aspect-ratio:16/9;border-radius:var(--r-m);border:1px dashed var(--rule-2);display:flex;align-items:center;justify-content:center;padding:24px")}>
              <p style={sx("margin:0;max-width:34ch;text-align:center;font:400 15px/1.7 var(--font-outfit),sans-serif;color:var(--ink-3);text-wrap:pretty")}>Belum ada video. Tempel tautan di atas, lalu tekan Muat.</p>
            </div>
          ) : null}
          <div style={sx(NOTE + ";margin-top:20px")}>Rekam sendiri saat gendang ditabuh, lalu bandingkan bentuk gelombangnya dengan Lab Simulasi.</div>
        </>
      ) : null}
      </div>
    </div>
  );
}

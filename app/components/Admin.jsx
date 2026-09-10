import React from 'react';
import { sx } from './sx';
import MateriEditor from './MateriEditor';
import Kelas from './Kelas';
import Gradebook from './Gradebook';
import GradeEssay from './GradeEssay';
import GradeLkpd from './GradeLkpd';

export default function Admin({ v }) {
  const { adBankList, adBankMeta, adBankOpen, adBankSummary, adBankTitle, adTabBagian, adTabData, adTabGlos, adTabIdent, adTabKelas, adTabMateri, adTabNilai, adTabSoal, addBank, addGlos, addItem, addTujuan, adminBankRows, adminItems, adminOpen, adminTabs, adminVideoUrl, backToBankList, glosRows, goHome, identFields, lockAllBanks, materiFields, onAdminLock, onAdminVideo, onExportCms, onImportCms, onResetCms, onResetProgress, openAllBanks, teacherNama, tujuanRows } = v;
  const t = v;   // the teacher tabs below read straight from the view-model
  return (
    <>
<div className="gb-pad" style={sx("padding-top:32px;padding-bottom:12px")}>
{adminOpen ? <>
<div style={sx("display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px")}>
<div>
<div style={sx("font:600 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;color:var(--gold-ink);text-transform:uppercase")}>Panel Guru{teacherNama ? " · " + teacherNama : ""}</div>
<div style={sx("font-family:var(--font-instrument),serif;font-size:24px;line-height:1.1;margin-top:4px")}>Kelola Identitas, Tujuan, Glosarium &amp; Bank Soal</div>
</div>
<button onClick={onAdminLock} style={sx("flex:none;min-height:44px;padding:0 14px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);background:var(--paper);color:var(--ink-2);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Keluar</button>
</div>
<div style={sx("padding:11px 13px;border-radius:var(--r-m);background:var(--ok-bg);border:1px solid var(--ok-rule);font-size:15px;line-height:1.55;color:var(--ok);margin-bottom:14px;text-wrap:pretty")}>Suntingan tersimpan sebagai <b>draf</b>. Siswa tetap melihat versi lama sampai kamu menekan <b>Terbitkan</b> di tab Data, jadi kelas yang sedang berjalan tidak pernah berubah di tengah jalan.</div>
<div role="tablist" aria-label="Bagian panel guru" style={sx("display:flex;gap:8px;flex-wrap:wrap;padding-bottom:20px")}>
{(adminTabs || []).map((t, tI) => <React.Fragment key={tI}>
<button role="tab" aria-selected={!!t.active} onClick={t.onClick} style={sx(t.style)}>{t.label}</button>
</React.Fragment>)}
</div>
{adTabMateri ? <>
<div className="gb-cols" style={sx("align-items:start")}>
{(materiFields || []).map((f, fI) => <React.Fragment key={fI}>
<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:13px")}>
<div style={sx("font:600 12px/1 var(--font-outfit),sans-serif;color:var(--ink-2);margin-bottom:8px")}>{f.label}</div>
{f.isInput ? <>
<input value={f.val} onChange={f.onChange} aria-label={f.label} style={sx("width:100%;min-height:46px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font-size:15px;background:var(--paper);color:var(--ink)")} />
</> : null}
{f.isArea ? <>
<textarea value={f.val} onChange={f.onChange} aria-label={f.label} rows={"4"} style={sx("width:100%;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:10px 12px;font-size:15px;line-height:1.6;background:var(--paper);color:var(--ink)")}></textarea>
</> : null}
</div>
</React.Fragment>)}
<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:13px")}>
<div style={sx("font:600 12px/1 var(--font-outfit),sans-serif;color:var(--ink-2);margin-bottom:8px")}>Tautan video pendukung (YouTube)</div>
<input value={adminVideoUrl} onChange={onAdminVideo} placeholder={"https://youtu.be/..."} aria-label={"https://youtu.be/..."} style={sx("width:100%;min-height:46px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font-size:15px;background:var(--paper);color:var(--ink)")} />
</div>
</div>
</> : null}
{adTabSoal ? <>
{adBankList ? <>
<div style={sx("padding:12px 13px;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);margin-bottom:14px")}>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;color:var(--gold);text-transform:uppercase")}>Kontrol akses</div>
<div style={sx("font-size:15px;line-height:1.6;margin-top:8px;text-wrap:pretty")}>{adBankSummary}. Bank yang dikunci tetap terlihat siswa tapi tidak bisa dibuka.</div>
<div style={sx("display:flex;gap:8px;margin-top:12px")}>
<button onClick={openAllBanks} style={sx("flex:1;min-height:44px;border:none;border-radius:var(--r-s);background:var(--ok);color:var(--panel-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Buka semua</button>
<button onClick={lockAllBanks} style={sx("flex:1;min-height:44px;border:1px solid rgba(247,240,226,.3);border-radius:var(--r-s);background:transparent;color:rgba(247,240,226,.85);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Kunci semua</button>
</div>
</div>
<div style={sx("display:flex;flex-direction:column;gap:11px")}>
{(adminBankRows || []).map((b, bI) => <React.Fragment key={bI}>
<div style={sx(b.cardStyle)}>
<input value={b.title} onChange={b.onTitle} aria-label={"Judul bank soal"} style={sx("width:100%;min-height:46px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font:600 15px/1 var(--font-outfit),sans-serif;background:var(--paper);color:var(--ink)")} />
<input value={b.desc} onChange={b.onDesc} placeholder={"Deskripsi singkat"} aria-label={"Deskripsi singkat"} style={sx("width:100%;min-height:44px;margin-top:8px;border:1px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font-size:15px;background:var(--paper);color:var(--ink-2)")} />
<div style={sx("display:flex;gap:8px;align-items:center;margin-top:10px")}>
<div style={sx("flex:none;font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3)")}>{b.count}</div>
<div style={sx("flex:none;font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3)")}>KKM</div>
<input value={b.kkm} onChange={b.onKkm} type={"number"} aria-label={"KKM bank soal"} style={sx("flex:none;width:64px;min-height:44px;border:1px solid var(--rule-2);border-radius:var(--r-s);padding:0 9px;font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;background:var(--paper);color:var(--ink)")} />
</div>
<div style={sx("display:flex;gap:8px;margin-top:10px")}>
<button onClick={b.onToggle} style={sx(b.toggleStyle)}>{b.openLabel}</button>
<button onClick={b.onManage} style={sx("flex:1;min-height:44px;border:1px solid var(--panel);border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Kelola soal ›</button>
<button onClick={b.onDelete} style={sx("flex:none;min-height:44px;padding:0 12px;border:1px solid var(--warn-rule);border-radius:var(--r-m);background:var(--warn-bg);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Hapus</button>
</div>
</div>
</React.Fragment>)}
</div>
<button onClick={addBank} style={sx("width:100%;min-height:50px;margin-top:14px;border:1.5px dashed var(--rule-2);border-radius:var(--r-m);background:var(--paper-2);color:var(--panel);font:600 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>+ Buat bank soal baru</button>
</> : null}
{adBankOpen ? <>
<button onClick={backToBankList} style={sx("min-height:44px;padding:0 13px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:var(--paper);color:var(--ink-2);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer;margin-bottom:12px")}>‹ Semua bank soal</button>
<div style={sx("font-family:var(--font-instrument),serif;font-size:24px;line-height:1.1")}>{adBankTitle}</div>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3);margin:7px 0 14px")}>{adBankMeta}</div>
<div style={sx("display:flex;flex-direction:column;gap:14px")}>
{(adminItems || []).map((s, sI) => <React.Fragment key={sI}>
<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:14px")}>
<div style={sx("display:flex;justify-content:space-between;align-items:center;margin-bottom:10px")}>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--panel);text-transform:uppercase")}>{s.n}</div>
<button onClick={s.onDelete} style={sx("min-height:44px;padding:0 11px;border:1px solid var(--warn-rule);border-radius:var(--r-s);background:var(--warn-bg);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Hapus</button>
</div>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin-bottom:8px")}>Tipe soal</div>
<div style={sx("display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px")}>
{(s.typeBtns || []).map((t, tI) => <React.Fragment key={tI}>
<button onClick={t.onPick} style={sx(t.style)}>{t.label}</button>
</React.Fragment>)}
</div>
<textarea value={s.q} onChange={s.onQ} aria-label={"Pertanyaan " + s.n} rows={"3"} style={sx("width:100%;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:10px 12px;font-size:15px;line-height:1.6;background:var(--paper);color:var(--ink)")}></textarea>
{s.isChoice ? <>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin:12px 0 8px")}>{s.keyHint}</div>
<div style={sx("display:flex;flex-direction:column;gap:7px")}>
{(s.opts || []).map((o, oI) => <React.Fragment key={oI}>
<div style={sx("display:flex;gap:8px;align-items:stretch")}>
<button onClick={o.onKey} style={sx(o.keyStyle)}>{o.letter}</button>
<input value={o.val} onChange={o.onChange} aria-label={"Opsi " + o.letter} style={sx("flex:1;min-width:0;min-height:44px;border:1px solid var(--rule-2);border-radius:var(--r-s);padding:0 11px;font-size:15px;background:var(--paper);color:var(--ink)")} />
</div>
</React.Fragment>)}
</div>
<button onClick={s.addOpt} style={sx("width:100%;min-height:44px;margin-top:8px;border:1px dashed var(--rule-2);border-radius:var(--r-s);background:transparent;color:var(--ink-3);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>+ Tambah opsi</button>
</> : null}
{s.isBs ? <>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin:12px 0 8px")}>Kunci jawaban</div>
<div style={sx("display:flex;gap:8px")}>
{(s.bsBtns || []).map((b, bI) => <React.Fragment key={bI}>
<button onClick={b.onPick} style={sx(b.style)}>{b.label}</button>
</React.Fragment>)}
</div>
</> : null}
{s.isIsian ? <>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin:12px 0 8px")}>Jawaban yang diterima · huruf besar-kecil diabaikan</div>
<div style={sx("display:flex;flex-direction:column;gap:7px")}>
{(s.accepts || []).map((a, aI) => <React.Fragment key={aI}>
<div style={sx("display:flex;gap:8px")}>
<input value={a.val} onChange={a.onChange} aria-label={"Jawaban yang diterima"} style={sx("flex:1;min-width:0;min-height:44px;border:1px solid var(--rule-2);border-radius:var(--r-s);padding:0 11px;font-size:15px;background:var(--paper);color:var(--ink)")} />
<button onClick={a.onDelete} style={sx("flex:none;min-height:44px;padding:0 11px;border:1px solid var(--warn-rule);border-radius:var(--r-s);background:var(--warn-bg);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>×</button>
</div>
</React.Fragment>)}
</div>
<button onClick={s.addAccept} style={sx("width:100%;min-height:44px;margin-top:8px;border:1px dashed var(--rule-2);border-radius:var(--r-s);background:transparent;color:var(--ink-3);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>+ Tambah variasi jawaban</button>
</> : null}
{s.isCocok ? <>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin:12px 0 8px")}>Pasangan · kiri ditampilkan berurutan, kanan diacak</div>
<div style={sx("display:flex;flex-direction:column;gap:8px")}>
{(s.pairs || []).map((p, pI) => <React.Fragment key={pI}>
<div style={sx("display:flex;gap:7px;align-items:stretch")}>
<input value={p.left} onChange={p.onLeft} aria-label={"Istilah pasangan"} style={sx("flex:1;min-width:0;min-height:44px;border:1px solid var(--rule-2);border-radius:var(--r-s);padding:0 10px;font:600 13px/1 var(--font-outfit),sans-serif;background:var(--paper);color:var(--ink)")} />
<input value={p.right} onChange={p.onRight} aria-label={"Definisi pasangan"} style={sx("flex:1.3;min-width:0;min-height:44px;border:1px solid var(--rule-2);border-radius:var(--r-s);padding:0 10px;font-size:15px;background:var(--paper);color:var(--ink)")} />
<button onClick={p.onDelete} style={sx("flex:none;min-height:44px;padding:0 10px;border:1px solid var(--warn-rule);border-radius:var(--r-s);background:var(--warn-bg);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>×</button>
</div>
</React.Fragment>)}
</div>
<button onClick={s.addPair} style={sx("width:100%;min-height:44px;margin-top:8px;border:1px dashed var(--rule-2);border-radius:var(--r-s);background:transparent;color:var(--ink-3);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>+ Tambah pasangan</button>
</> : null}
{s.isEsai ? <>
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin:12px 0 8px")}>Kata kunci penilaian · pisahkan dengan koma</div>
<input value={s.keywords} onChange={s.onKeywords} aria-label={"Kata kunci penilaian esai"} style={sx("width:100%;min-height:44px;border:1px solid var(--rule-2);border-radius:var(--r-s);padding:0 11px;font-size:15px;background:var(--paper);color:var(--ink)")} />
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin:12px 0 8px")}>Contoh jawaban ideal</div>
<textarea value={s.model} onChange={s.onModel} aria-label={"Contoh jawaban ideal"} rows={"4"} style={sx("width:100%;border:1px solid var(--rule-2);border-radius:var(--r-s);padding:10px 11px;font-size:15px;line-height:1.6;background:var(--paper);color:var(--ink)")}></textarea>
</> : null}
<div style={sx("font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--ink-3);text-transform:uppercase;margin:12px 0 7px")}>Umpan balik / pembahasan</div>
<input value={s.fb} onChange={s.onFb} aria-label={"Umpan balik"} style={sx("width:100%;min-height:44px;border:1px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font-size:15px;background:var(--paper);color:var(--ink)")} />
</div>
</React.Fragment>)}
</div>
<button onClick={addItem} style={sx("width:100%;min-height:50px;margin-top:14px;border:1.5px dashed var(--rule-2);border-radius:var(--r-m);background:var(--paper-2);color:var(--panel);font:600 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>+ Tambah soal</button>
</> : null}
</> : null}
{adTabGlos ? <>
<div style={sx("display:flex;flex-direction:column;gap:11px")}>
{(glosRows || []).map((g, gI) => <React.Fragment key={gI}>
<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:13px")}>
<div style={sx("display:flex;gap:8px;margin-bottom:8px")}>
<input value={g.term} onChange={g.onTerm} aria-label={"Istilah glosarium"} style={sx("flex:1;min-width:0;min-height:44px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font:600 15px/1 var(--font-outfit),sans-serif;background:var(--paper);color:var(--ink)")} />
<button onClick={g.onDelete} style={sx("flex:none;min-height:44px;padding:0 12px;border:1.5px solid var(--warn-rule);border-radius:var(--r-m);background:var(--warn-bg);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Hapus</button>
</div>
<textarea value={g.def} onChange={g.onDef} aria-label={"Definisi glosarium"} rows={"3"} style={sx("width:100%;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:10px 12px;font-size:15px;line-height:1.6;background:var(--paper);color:var(--ink)")}></textarea>
</div>
</React.Fragment>)}
</div>
<button onClick={addGlos} style={sx("width:100%;min-height:50px;margin-top:14px;border:1.5px dashed var(--rule-2);border-radius:var(--r-m);background:var(--paper-2);color:var(--panel);font:600 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>+ Tambah istilah</button>
</> : null}
{adTabIdent ? <>
<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:14px;display:flex;flex-direction:column;gap:11px")}>
{(identFields || []).map((f, fI) => <React.Fragment key={fI}>
<div>
<div style={sx("font:600 12px/1 var(--font-outfit),sans-serif;color:var(--ink-2);margin-bottom:7px")}>{f.label}</div>
<input value={f.val} onChange={f.onChange} style={sx("width:100%;min-height:46px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 12px;font-size:15px;background:var(--paper);color:var(--ink)")} />
</div>
</React.Fragment>)}
</div>
<div style={sx("margin-top:14px;background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:14px")}>
<div style={sx("font:600 15px/1 var(--font-outfit),sans-serif;margin-bottom:11px")}>Tujuan Pembelajaran</div>
<div style={sx("display:flex;flex-direction:column;gap:9px")}>
{(tujuanRows || []).map((t, tI) => <React.Fragment key={tI}>
<div style={sx("display:flex;gap:8px;align-items:flex-start")}>
<div style={sx("flex:none;width:26px;height:44px;font:600 12px/44px var(--font-outfit),sans-serif;color:var(--ink-3);text-align:center")}>{t.n}</div>
<textarea value={t.val} onChange={t.onChange} aria-label={"Tujuan pembelajaran " + t.n} rows={"2"} style={sx("flex:1;min-width:0;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:9px 11px;font-size:15px;line-height:1.55;background:var(--paper);color:var(--ink)")}></textarea>
<button onClick={t.onDelete} style={sx("flex:none;min-height:44px;padding:0 10px;border:1.5px solid var(--warn-rule);border-radius:var(--r-m);background:var(--warn-bg);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>×</button>
</div>
</React.Fragment>)}
</div>
<button onClick={addTujuan} style={sx("width:100%;min-height:46px;margin-top:12px;border:1.5px dashed var(--rule-2);border-radius:var(--r-m);background:var(--paper-2);color:var(--panel);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>+ Tambah tujuan</button>
</div>
</> : null}
{adTabBagian ? <>
<MateriEditor materi={t.materiTree} section={t.matSection} onSection={t.onMatSection} onSet={t.onMatSet} />
</> : null}
{adTabKelas ? <>
<Kelas classes={t.classes} newName={t.newClassName} busy={t.classBusy} onNewName={t.onNewClassName} onCreate={t.onCreateClass} onToggle={t.onToggleClass} onRename={t.onRenameClass} />
</> : null}
{adTabNilai ? <>
{t.markMode === 'esai' ? (
  <GradeEssay item={t.markItem} index={t.markIdx} total={t.markTotal} busy={t.markBusy}
    score={t.markScore} setScore={t.onMarkScore} note={t.markNote} onNote={t.onMarkNote}
    onSave={t.onMarkSave} onSkip={t.onMarkSkip} onBack={t.onMarkBack} />
) : t.markMode === 'lkpd' ? (
  <GradeLkpd item={t.markItem} index={t.markIdx} total={t.markTotal} busy={t.markBusy}
    rubric={t.markRubric} onRubric={t.onMarkRubric} note={t.markNote} onNote={t.onMarkNote}
    onSave={t.onMarkSave} onSkip={t.onMarkSkip} onBack={t.onMarkBack} />
) : (
  <Gradebook banks={t.gbBanks} rows={t.gbRows} classes={t.classes} classId={t.gbClassId}
    loading={t.gbLoading} pending={t.gbPending} onClass={t.onGbClass} onRefresh={t.onGbRefresh}
    onExport={t.onExportCsv} onMarkEssays={t.onMarkEssays} onMarkLkpd={t.onMarkLkpd} />
)}
</> : null}
{adTabData ? <>
<div style={sx("background:var(--raised);border:1.5px solid var(--gold);border-radius:var(--r-l);padding:16px;margin-bottom:14px")}>
<div style={sx("font:600 15px/1 var(--font-outfit),sans-serif;margin-bottom:6px")}>Terbitkan ke siswa</div>
<p style={sx("margin:0 0 12px;font-size:15px;line-height:1.6;color:var(--ink-2);text-wrap:pretty")}>Semua suntinganmu tersimpan sebagai draf dan belum terlihat siswa. Menerbitkan menyalin draf itu menjadi versi yang dibaca seluruh kelas.</p>
<button onClick={t.onPublish} className="gb-btn">Terbitkan sekarang</button>
<p className="gb-note" style={sx("margin-top:10px")}>{t.draftLabel}</p>
</div>

<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:16px;margin-bottom:14px")}>
<div style={sx("font:600 15px/1 var(--font-outfit),sans-serif;margin-bottom:6px")}>Bobot nilai akhir</div>
<p style={sx("margin:0 0 12px;font-size:15px;line-height:1.6;color:var(--ink-2);text-wrap:pretty")}>Bagian yang belum dikerjakan siswa tidak ikut dihitung, jadi nilai akhir tidak jatuh gara-gara pekerjaan yang memang belum ditugaskan.</p>
<div className="gb-row" style={sx("grid-template-columns:repeat(2,minmax(0,1fr))")}>
{(t.bobotFields || []).map((f, fI) => <React.Fragment key={fI}>
<label className="gb-field"><span>{f.label}</span><input value={f.val} onChange={f.onChange} type={"number"} min={"0"} max={"100"} /></label>
</React.Fragment>)}
</div>
<p className="gb-note">{t.bobotTotal === 100 ? "Total bobot 100%." : "Total bobot " + t.bobotTotal + "%. Boleh tidak seratus \u2014 bobot dihitung secara proporsional."}</p>
</div>

<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:16px;margin-bottom:14px")}>
<div style={sx("font:600 15px/1 var(--font-outfit),sans-serif;margin-bottom:6px")}>Tahapan yang terbuka</div>
<p style={sx("margin:0 0 12px;font-size:15px;line-height:1.6;color:var(--ink-2);text-wrap:pretty")}>Tahapan yang ditutup tetap terlihat siswa tapi tidak bisa dibuka. Berguna untuk melepas materi pertemuan demi pertemuan.</p>
<div style={sx("display:flex;flex-wrap:wrap;gap:8px")}>
{(t.langkahRows || []).map((l, lI) => <React.Fragment key={lI}>
<button onClick={l.onToggle} aria-pressed={l.on} className={"gb-chip" + (l.on ? " gb-chip-on" : "")} style={sx("cursor:pointer;border:none;min-height:44px;padding:0 14px")}>{l.on ? "\u2713 " : ""}{l.label}</button>
</React.Fragment>)}
</div>
</div>

<div style={sx("background:var(--raised);border:1px solid var(--rule);border-radius:var(--r-l);padding:16px")}>
<div style={sx("font:600 15px/1 var(--font-outfit),sans-serif;margin-bottom:6px")}>Cadangkan &amp; pindahkan konten</div>
<p style={sx("margin:0 0 12px;font-size:15px;line-height:1.6;color:var(--ink-2);text-wrap:pretty")}>Unduh seluruh draf sebagai satu berkas JSON untuk arsip, atau muat berkas dari modul lain. Memuat berkas hanya mengganti draf — siswa belum melihat apa pun sampai kamu menekan Terbitkan.</p>
<div style={sx("display:flex;flex-direction:column;gap:9px")}>
<button onClick={onExportCms} style={sx("width:100%;min-height:48px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Unduh berkas konten</button>
<label style={sx("width:100%;min-height:48px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);background:var(--paper);color:var(--panel);font:600 13px/48px var(--font-outfit),sans-serif;cursor:pointer;text-align:center;display:block")}>Muat berkas konten
<input type={"file"} accept={".json,application/json"} onChange={onImportCms} style={sx("display:none")} />
</label>
</div>
</div>
<div style={sx("margin-top:14px;background:var(--warn-bg);border:1px solid var(--warn-rule);border-radius:var(--r-l);padding:16px")}>
<div style={sx("font:600 15px/1 var(--font-outfit),sans-serif;color:var(--gold-ink);margin-bottom:6px")}>Tindakan berisiko</div>
<p style={sx("margin:0 0 12px;font-size:15px;line-height:1.6;color:var(--warn);text-wrap:pretty")}>Kembalikan draf ke versi bawaan modul, atau hapus progres yang tersimpan di perangkat ini. Nilai siswa di server tidak ikut terhapus.</p>
<div style={sx("display:flex;flex-direction:column;gap:9px")}>
<button onClick={onResetCms} style={sx("width:100%;min-height:46px;border:1.5px solid var(--warn-rule);border-radius:var(--r-m);background:var(--raised);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Kembalikan konten bawaan</button>
<button onClick={onResetProgress} style={sx("width:100%;min-height:46px;border:1.5px solid var(--warn-rule);border-radius:var(--r-m);background:var(--raised);color:var(--gold-ink);font:600 12px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Hapus progres siswa</button>
</div>
</div>
</> : null}
<button onClick={goHome} style={sx("width:100%;margin-top:18px;min-height:46px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink-2);font:600 13px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Kembali ke alur belajar siswa</button>
</> : null}
</div>
    </>
  );
}

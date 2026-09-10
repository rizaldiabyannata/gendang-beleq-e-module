import React from 'react';
import { sx } from './sx';
import MateriEditor from './MateriEditor';
import Kelas from './Kelas';
import Gradebook from './Gradebook';
import GradeEssay from './GradeEssay';
import GradeLkpd from './GradeLkpd';
import RichText from './RichText';

// The eight destinations, grouped by what the teacher came here to do. The order
// inside each group is the order of adminTabs, so the view-model stays the one
// place that names them.
const GROUPS = [
  ['Isi modul', [0, 1, 3, 4]],
  ['Penilaian', [2, 6]],
  ['Kelas & data', [5, 7]],
];

// Every field in the panel used to be an <input> or <textarea>, so the view-model
// hands back change handlers that expect a DOM event. The editor hands back a
// string. This is the adapter, kept in one place rather than reshaping two dozen
// handlers in a 1900-line component.
const ev = (fn) => (html) => fn({ target: { value: html } });

export default function Admin({ v }) {
  const { adBankList, adBankMeta, adBankOpen, adBankSummary, adBankTitle, adTabBagian, adTabData, adTabGlos, adTabIdent, adTabKelas, adTabMateri, adTabNilai, adTabSoal, addBank, addGlos, addItem, addTujuan, adminBankRows, adminItems, adminOpen, adminTabs, adminVideoUrl, backToBankList, glosRows, goHome, identFields, lockAllBanks, materiFields, onAdminLock, onAdminVideo, onExportCms, onImportCms, onResetCms, onResetProgress, openAllBanks, teacherNama, tujuanRows } = v;
  const t = v;   // the teacher tabs below read straight from the view-model

  const tabs = adminTabs || [];
  const pendek = (materiFields || []).filter((f) => f.isInput);
  const panjang = (materiFields || []).filter((f) => f.isArea);

  return (
    <>
<div className="gb-pad" style={sx("padding-top:32px;padding-bottom:12px")}>
{adminOpen ? <>
<div style={sx("display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px")}>
<div>
<div style={sx("font:600 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.12em;color:var(--gold-ink);text-transform:uppercase")}>Panel Guru{teacherNama ? " · " + teacherNama : ""}</div>
<div style={sx("font-family:var(--font-instrument),serif;font-size:28px;line-height:1.1;margin-top:6px")}>Kelola modul, kelas, dan nilai</div>
</div>
<button onClick={onAdminLock} className="gb-adm-ghost">Keluar</button>
</div>
<div style={sx("padding:13px 15px;border-radius:var(--r-m);background:var(--ok-bg);border:1px solid var(--ok-rule);font:400 15px/1.6 var(--font-outfit),sans-serif;color:var(--ok);margin-bottom:4px;text-wrap:pretty;max-width:78ch")}>Suntingan tersimpan sebagai <b>draf</b>. Siswa tetap melihat versi lama sampai kamu menekan <b>Terbitkan</b> di tab Data, jadi kelas yang sedang berjalan tidak pernah berubah di tengah jalan.</div>

<div className="gb-adm-bar">
<div className="gb-adm-groups" role="tablist" aria-label="Bagian panel guru">
{GROUPS.map(([nama, idx]) => (
  <div className="gb-adm-group" key={nama}>
    <span>{nama}</span>
    <div>
      {idx.filter((i) => tabs[i]).map((i) => (
        <button key={i} role="tab" aria-selected={!!tabs[i].active} onClick={tabs[i].onClick} style={sx(tabs[i].style)}>{tabs[i].label}</button>
      ))}
    </div>
  </div>
))}
</div>
</div>

{adTabMateri ? <>
<div className="gb-adm-card">
<h3>Judul dan kalimat pendek</h3>
<p>Satu baris masing-masing. Kolom panjangnya ada di bawah.</p>
<div className="gb-adm-short">
{pendek.map((f, fI) => (
  <div key={fI}>
    <span className="gb-adm-label">{f.label}</span>
    <RichText simple value={f.val} onChange={ev(f.onChange)} label={f.label} />
  </div>
))}
<div>
  <span className="gb-adm-label">Tautan video pendukung (YouTube)</span>
  <input value={adminVideoUrl} onChange={onAdminVideo} placeholder="https://youtu.be/..." aria-label="Tautan video pendukung" style={sx("width:100%;min-height:48px;border:1.5px solid var(--rule-2);border-radius:var(--r-m);padding:0 13px;font-size:15px;background:var(--paper);color:var(--ink)")} />
</div>
</div>
</div>

<div className="gb-adm-card">
<h3>Paragraf</h3>
<p>Kotaknya tumbuh mengikuti tulisanmu, jadi tidak ada lagi kalimat yang terpotong di luar layar.</p>
<div className="gb-adm-stack">
{panjang.map((f, fI) => (
  <div key={fI}>
    <span className="gb-adm-label">{f.label}</span>
    <RichText value={f.val} onChange={ev(f.onChange)} label={f.label} minHeight="150px" />
  </div>
))}
</div>
</div>
</> : null}

{adTabSoal ? <>
{adBankList ? <>
<div className="gb-adm-card" style={sx("border-color:var(--gold)")}>
<h3>Kontrol akses</h3>
<p>{adBankSummary}. Bank yang dikunci tetap terlihat siswa tapi tidak bisa dibuka.</p>
<div className="gb-adm-actions">
<button onClick={openAllBanks} className="gb-adm-btn">Buka semua</button>
<button onClick={lockAllBanks} className="gb-adm-ghost">Kunci semua</button>
</div>
</div>

<div className="gb-adm-stack" style={sx("margin-top:20px")}>
{(adminBankRows || []).map((b, bI) => (
<div className="gb-adm-card" key={bI}>
<span className="gb-adm-label">Judul bank soal</span>
<RichText simple value={b.title} onChange={ev(b.onTitle)} label="Judul bank soal" />
<span className="gb-adm-label" style={sx("margin-top:14px")}>Deskripsi singkat</span>
<RichText simple value={b.desc} onChange={ev(b.onDesc)} label="Deskripsi singkat" placeholder="Untuk apa bank soal ini" />
<div className="gb-adm-meta">
  <span>{b.count}</span>
  <label>KKM<input value={b.kkm} onChange={b.onKkm} type="number" aria-label="KKM bank soal" /></label>
</div>
<div className="gb-adm-actions">
<button onClick={b.onToggle} style={sx(b.toggleStyle)}>{b.openLabel}</button>
<button onClick={b.onManage} className="gb-adm-btn">Kelola soal ›</button>
<button onClick={b.onDelete} className="gb-adm-warn" style={sx("margin-left:auto")}>Hapus</button>
</div>
</div>
))}
</div>
<button onClick={addBank} className="gb-adm-add">+ Buat bank soal baru</button>
</> : null}

{adBankOpen ? <>
<button onClick={backToBankList} className="gb-adm-ghost" style={sx("margin-bottom:16px")}>‹ Semua bank soal</button>
<div style={sx("font-family:var(--font-instrument),serif;font-size:26px;line-height:1.1")}>{adBankTitle}</div>
<div style={sx("font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3);margin:8px 0 20px")}>{adBankMeta}</div>
<div className="gb-adm-stack">
{(adminItems || []).map((s, sI) => (
<div className="gb-adm-card" key={sI}>
<div style={sx("display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px")}>
<div style={sx("font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.1em;color:var(--gold-ink);text-transform:uppercase")}>{s.n}</div>
<button onClick={s.onDelete} className="gb-adm-warn">Hapus</button>
</div>
<span className="gb-adm-label">Tipe soal</span>
<div style={sx("display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px")}>
{(s.typeBtns || []).map((tb, tI) => <button key={tI} onClick={tb.onPick} style={sx(tb.style)}>{tb.label}</button>)}
</div>
<span className="gb-adm-label">Pertanyaan</span>
<RichText value={s.q} onChange={ev(s.onQ)} label={"Pertanyaan " + s.n} minHeight="110px" />

{s.isChoice ? <>
<span className="gb-adm-label" style={sx("margin-top:18px")}>{s.keyHint}</span>
<div style={sx("display:flex;flex-direction:column;gap:9px")}>
{(s.opts || []).map((o, oI) => (
<div key={oI} style={sx("display:flex;gap:9px;align-items:flex-start")}>
<button onClick={o.onKey} style={sx(o.keyStyle)}>{o.letter}</button>
<div style={sx("flex:1;min-width:0")}><RichText simple value={o.val} onChange={ev(o.onChange)} label={"Opsi " + o.letter} /></div>
</div>
))}
</div>
<button onClick={s.addOpt} className="gb-adm-add" style={sx("min-height:44px;margin-top:10px")}>+ Tambah opsi</button>
</> : null}

{s.isBs ? <>
<span className="gb-adm-label" style={sx("margin-top:18px")}>Kunci jawaban</span>
<div style={sx("display:flex;gap:9px")}>
{(s.bsBtns || []).map((b, bI) => <button key={bI} onClick={b.onPick} style={sx(b.style)}>{b.label}</button>)}
</div>
</> : null}

{s.isIsian ? <>
<span className="gb-adm-label" style={sx("margin-top:18px")}>Jawaban yang diterima · huruf besar-kecil dan format diabaikan saat menilai</span>
<div style={sx("display:flex;flex-direction:column;gap:9px")}>
{(s.accepts || []).map((a, aI) => (
<div key={aI} style={sx("display:flex;gap:9px;align-items:flex-start")}>
<div style={sx("flex:1;min-width:0")}><RichText simple value={a.val} onChange={ev(a.onChange)} label="Jawaban yang diterima" /></div>
<button onClick={a.onDelete} className="gb-adm-warn" style={sx("padding:0 14px")}>×</button>
</div>
))}
</div>
<button onClick={s.addAccept} className="gb-adm-add" style={sx("min-height:44px;margin-top:10px")}>+ Tambah variasi jawaban</button>
</> : null}

{s.isCocok ? <>
<span className="gb-adm-label" style={sx("margin-top:18px")}>Pasangan · kiri ditampilkan berurutan, kanan diacak</span>
<div style={sx("display:flex;flex-direction:column;gap:10px")}>
{(s.pairs || []).map((p, pI) => (
<div key={pI} style={sx("display:flex;gap:9px;align-items:flex-start;flex-wrap:wrap")}>
<div style={sx("flex:1 1 180px;min-width:0")}><RichText simple value={p.left} onChange={ev(p.onLeft)} label="Istilah pasangan" /></div>
<div style={sx("flex:1.3 1 220px;min-width:0")}><RichText simple value={p.right} onChange={ev(p.onRight)} label="Definisi pasangan" /></div>
<button onClick={p.onDelete} className="gb-adm-warn" style={sx("padding:0 14px")}>×</button>
</div>
))}
</div>
<button onClick={s.addPair} className="gb-adm-add" style={sx("min-height:44px;margin-top:10px")}>+ Tambah pasangan</button>
</> : null}

{s.isEsai ? <>
<span className="gb-adm-label" style={sx("margin-top:18px")}>Kata kunci penilaian · pisahkan dengan koma</span>
<RichText simple value={s.keywords} onChange={ev(s.onKeywords)} label="Kata kunci penilaian esai" />
<span className="gb-adm-label" style={sx("margin-top:18px")}>Contoh jawaban ideal</span>
<RichText value={s.model} onChange={ev(s.onModel)} label="Contoh jawaban ideal" minHeight="130px" />
</> : null}

<span className="gb-adm-label" style={sx("margin-top:18px")}>Umpan balik / pembahasan</span>
<RichText value={s.fb} onChange={ev(s.onFb)} label="Umpan balik" minHeight="90px" />
</div>
))}
</div>
<button onClick={addItem} className="gb-adm-add">+ Tambah soal</button>
</> : null}
</> : null}

{adTabGlos ? <>
<div className="gb-adm-stack">
{(glosRows || []).map((g, gI) => (
<div className="gb-adm-card" key={gI}>
<div style={sx("display:flex;gap:9px;align-items:flex-start")}>
<div style={sx("flex:1;min-width:0")}>
<span className="gb-adm-label">Istilah</span>
<RichText simple value={g.term} onChange={ev(g.onTerm)} label="Istilah glosarium" />
</div>
<button onClick={g.onDelete} className="gb-adm-warn" style={sx("margin-top:26px")}>Hapus</button>
</div>
<span className="gb-adm-label" style={sx("margin-top:14px")}>Definisi</span>
<RichText value={g.def} onChange={ev(g.onDef)} label="Definisi glosarium" minHeight="110px" />
</div>
))}
</div>
<button onClick={addGlos} className="gb-adm-add">+ Tambah istilah</button>
</> : null}

{adTabIdent ? <>
<div className="gb-adm-card">
<h3>Identitas modul</h3>
<div className="gb-adm-short">
{(identFields || []).map((f, fI) => (
<div key={fI}>
<span className="gb-adm-label">{f.label}</span>
<RichText simple value={f.val} onChange={ev(f.onChange)} label={f.label} />
</div>
))}
</div>
</div>
<div className="gb-adm-card">
<h3>Tujuan Pembelajaran</h3>
<div className="gb-adm-stack" style={sx("gap:12px")}>
{(tujuanRows || []).map((tu, tI) => (
<div key={tI} style={sx("display:flex;gap:10px;align-items:flex-start")}>
<div style={sx("flex:none;width:28px;padding-top:14px;font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--ink-3);text-align:center")}>{tu.n}</div>
<div style={sx("flex:1;min-width:0")}><RichText simple value={tu.val} onChange={ev(tu.onChange)} label={"Tujuan pembelajaran " + tu.n} /></div>
<button onClick={tu.onDelete} className="gb-adm-warn" style={sx("padding:0 14px")}>×</button>
</div>
))}
</div>
<button onClick={addTujuan} className="gb-adm-add">+ Tambah tujuan</button>
</div>
</> : null}

{adTabBagian ? <MateriEditor materi={t.materiTree} section={t.matSection} onSection={t.onMatSection} onSet={t.onMatSet} /> : null}

{adTabKelas ? <Kelas classes={t.classes} newName={t.newClassName} busy={t.classBusy} onNewName={t.onNewClassName} onCreate={t.onCreateClass} onToggle={t.onToggleClass} onRename={t.onRenameClass} /> : null}

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
<div className="gb-adm-card" style={sx("border:1.5px solid var(--gold)")}>
<h3>Terbitkan ke siswa</h3>
<p>Semua suntinganmu tersimpan sebagai draf dan belum terlihat siswa. Menerbitkan menyalin draf itu menjadi versi yang dibaca seluruh kelas.</p>
<div className="gb-adm-actions">
<button onClick={t.onPublish} className="gb-adm-btn">Terbitkan sekarang</button>
<span style={sx("font:400 14.5px/1.5 var(--font-outfit),sans-serif;color:var(--ink-3)")}>{t.draftLabel}</span>
</div>
</div>

<div className="gb-adm-card">
<h3>Bobot nilai akhir</h3>
<p>Bagian yang belum dikerjakan siswa tidak ikut dihitung, jadi nilai akhir tidak jatuh gara-gara pekerjaan yang memang belum ditugaskan.</p>
<div className="gb-adm-short">
{(t.bobotFields || []).map((f, fI) => (
<label className="gb-field" key={fI} style={sx("margin:0")}><span>{f.label}</span><input value={f.val} onChange={f.onChange} type="number" min="0" max="100" /></label>
))}
</div>
<p className="gb-note" style={sx("margin:14px 0 0")}>{t.bobotTotal === 100 ? "Total bobot 100%." : "Total bobot " + t.bobotTotal + "%. Boleh tidak seratus — bobot dihitung secara proporsional."}</p>
</div>

<div className="gb-adm-card">
<h3>Tahapan yang terbuka</h3>
<p>Tahapan yang ditutup tetap terlihat siswa tapi tidak bisa dibuka. Berguna untuk melepas materi pertemuan demi pertemuan.</p>
<div style={sx("display:flex;flex-wrap:wrap;gap:8px")}>
{(t.langkahRows || []).map((l, lI) => (
<button key={lI} onClick={l.onToggle} aria-pressed={l.on} className={"gb-chip" + (l.on ? " gb-chip-on" : "")} style={sx("cursor:pointer;border:none;min-height:44px;padding:0 16px;font-size:15px")}>{l.on ? "✓ " : ""}{l.label}</button>
))}
</div>
</div>

<div className="gb-adm-card">
<h3>Cadangkan &amp; pindahkan konten</h3>
<p>Unduh seluruh draf sebagai satu berkas JSON untuk arsip, atau muat berkas dari modul lain. Memuat berkas hanya mengganti draf — siswa belum melihat apa pun sampai kamu menekan Terbitkan.</p>
<div className="gb-adm-actions">
<button onClick={onExportCms} className="gb-adm-btn">Unduh berkas konten</button>
<label className="gb-adm-ghost" style={sx("cursor:pointer")}>Muat berkas konten
<input type="file" accept=".json,application/json" onChange={onImportCms} style={sx("display:none")} />
</label>
</div>
</div>

<div className="gb-adm-card" style={sx("background:var(--warn-bg);border-color:var(--warn-rule)")}>
<h3 style={sx("color:var(--gold-ink)")}>Tindakan berisiko</h3>
<p style={sx("color:var(--warn)")}>Kembalikan draf ke versi bawaan modul, atau hapus progres yang tersimpan di perangkat ini. Nilai siswa di server tidak ikut terhapus.</p>
<div className="gb-adm-actions">
<button onClick={onResetCms} className="gb-adm-warn" style={sx("background:var(--raised)")}>Kembalikan konten bawaan</button>
<button onClick={onResetProgress} className="gb-adm-warn" style={sx("background:var(--raised)")}>Hapus progres siswa</button>
</div>
</div>
</> : null}

<button onClick={goHome} className="gb-adm-ghost" style={sx("width:100%;margin-top:24px")}>Kembali ke alur belajar siswa</button>
</> : null}
</div>
    </>
  );
}

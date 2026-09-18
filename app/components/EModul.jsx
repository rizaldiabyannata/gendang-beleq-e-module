'use client';

import React from 'react';
import { sx } from './sx';
import { configured, errText, supabase } from '../lib/supabase';
import { teks, validate } from '../../supabase/functions/_shared/grading.ts';
import {
  dbLevel, dopplerHeard as dopplerOf, passMix, pitch as pitchOf, sampleRate, siapkan,
} from '../../supabase/functions/_shared/physics.ts';
import { bootstrap, fetchDraft, fetchPublished, joinClass, publish, saveDraft, saveProgress, signOut, teacherSignIn } from '../lib/session';
import { hydrateProgress, pickProgress } from '../lib/progress';
import { bankScore, createClass, essayScore, finalScore, gradeLkpd, gradeSubmission, listClasses, loadClassWork, toCsv, updateClass, watchClass } from '../lib/teacher';
import {
  SPEED, CMS_DEFAULTS, cloneCms,
  TYPES, TYPE_LABEL, TYPE_XP, LETTERS, seededPerm,
} from './module-data';
import SideNav from './SideNav';
import Header from './Header';
import StepIntro from './StepIntro';
import Home from './Home';
import Info from './Info';
import Materi from './Materi';
import Lab from './Lab';
import Lkpd from './Lkpd';
import Kuis from './Kuis';
import Rangkuman from './Rangkuman';
import Peringkat from './Peringkat';
import Admin from './Admin';
import TeacherAuth from './TeacherAuth';
import StudentJoin from './StudentJoin';
import StepNav from './StepNav';
import GlosPopup from './GlosPopup';
import Toast from './Toast';
import BottomNav from './BottomNav';

export default class EModul extends React.Component {
  state = {
    screen: 'home', materiTab: 'pendahuluan', infoTab: 'identitas', labTab: 'drum',
    lkpdTab: 'frekuensi', kuisTab: 'latihan',
    xp: 0, done: {}, showSolusi: false,
    cms: cloneCms(CMS_DEFAULTS),
    adminTab: 'materi',
    // Who is holding the device. 'tamu' can read the module but nothing they type
    // is graded; the gate is what turns a guest into a student or a teacher.
    role: 'tamu', me: null, gate: null, authBusy: false, authError: '', sending: {}, sheets: {},
    // Teacher-side state. None of it is fetched until the panel is actually opened.
    classes: [], classId: null, work: null, gbLoading: false, newClassName: '',
    matSection: null, markMode: null, markIdx: 0, markScore: null, markNote: '', liveOk: false,
    markRubric: {}, markBusy: false, publishedAt: null, draftSaved: true,
    fEmail: '', fPass: '', fCode: '', fNama: '', fKelas: '', fAbsen: '',
    amp: 0.6, freq: 220, tension: 0.5, drum: 'mame', medium: 'udara', lastHit: '—',
    ansMame: 148, ansNine: 152, ansPlaying: false,
    db: 0, hits: 0,
    dopRunning: false, dopPos: -1, dopF: 500, dopV: 12, dopHeard: 500,
    // Misi yang sedang dibuka siswa: indeks butir di bank dugaan, atau null.
    // Selama sebuah misi terbuka, tuas yang sedang diuji terkunci.
    misi: null, misiPilih: null,
    konsep: 'komponen', glos: null, toast: '', saveFailed: false, muted: false,
    fields: {}, answers: {}, refleksi: {}, videoUrl: '', videoLoaded: '',
    bankId: null, draft: {}, adminBank: null
  };

  componentDidMount() {
    this.bootSession();
    this.env = 0; this.phase = 0; this.tPrev = performance.now();
    this.loop = (t) => {
      const dt = Math.min(0.05, (t - this.tPrev) / 1000); this.tPrev = t;
      this.env *= Math.pow(0.28, dt);
      this.phase += dt;
      this.drawWave();
      if (this.state.dopRunning) this.stepDoppler(dt);
      if (!(this.waveRef && this.waveRef.current) && !this.state.dopRunning) { this.raf = null; return; }
      this.raf = requestAnimationFrame(this.loop);
    };
    this.ensureLoop();
    this.loadSample('gendang.wav').then((b) => { this._drum = b; });
    this.loadSample('doppler.wav').then((b) => { this._dopBuf = b; });
  }

  // public/gendang.wav adalah 130 ms tabuhan Gendang Mame sungguhan, dipotong dari
  // 0,140 sampai 0,270 detik rekaman asli, mono dan dinormalkan. Frekuensi dasarnya
  // 79 Hz, jauh di bawah ujung atas slider, jadi sampel ini membawa serangan bunyi
  // sementara tinggi nadanya tetap dipegang osilator.
  //
  // Dibaca lewat OfflineAudioContext supaya tidak perlu menunggu sentuhan siswa dan
  // sudah siap sebelum tabuhan pertama. Kalau gagal, hit() tetap berbunyi tanpa ini.
  //
  // public/doppler.wav adalah 8 detik rekaman rombongan gendang (detik 76–84 rekaman
  // asli, mono). Itulah yang didengar saat rombongan melintas; kalau gagal dimuat,
  // simulasi Doppler kembali ke osilator.
  async loadSample(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const bytes = await res.arrayBuffer();
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      return await new OAC(1, 1, 44100).decodeAudioData(bytes);
    } catch { return null; }
  }
  // The loop only needs to run while the oscilloscope is on screen or the Doppler is
  // moving. It used to wake the main thread 60 times a second for the whole session.
  ensureLoop() {
    if (this.raf) return;
    this.tPrev = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }
  componentDidUpdate() {
    if ((this.waveRef && this.waveRef.current) || this.state.dopRunning) this.ensureLoop();
  }
  componentWillUnmount() {
    clearTimeout(this._draftT);
    clearTimeout(this._lkpdT);
    clearTimeout(this._progT);
    clearTimeout(this._tt);
    this.stopWatch();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.stopDop();
  }

  // Resolve who this is, then take the published content over the bundled defaults.
  // A failure here is never fatal: the module still reads, it just cannot grade.
  async bootSession() {
    if (!configured) { this.setState({ authReady: true }); return; }
    try {
      const sess = await bootstrap();
      this.setState({ role: sess.role, me: sess.student || null, teacherNama: sess.nama || '', authReady: true });
      if (sess.role === 'siswa') {
        this.setState(hydrateProgress(sess.student && sess.student.progress));
        this.loadMarks().catch(() => {});
        this.loadSheets().catch(() => {});
      }
    } catch { this.setState({ authReady: true }); }
    try {
      const published = await fetchPublished();
      if (published && Object.keys(published).length) {
        const merged = cloneCms(CMS_DEFAULTS);
        Object.keys(published).forEach(k => { if (published[k] != null) merged[k] = published[k]; });
        this.setState({ cms: merged });
      }
    } catch {}
  }

  // Anything that records a mark needs a name to record it against. Guests are
  // sent to the join screen at the moment they first try, not on arrival, so
  // browsing the module never demands a class code.
  // One answer, one round trip. The response carries the mark and the discussion
  // note together, because the note explains an answer the student has only just
  // committed to — sending it any earlier would give the answer away.
  async sendAnswer(b, i, k, v) {
    this.setState(s => ({ sending: Object.assign({}, s.sending, { [k]: true }) }));
    try {
      const { data, error } = await supabase.functions.invoke('submit', {
        body: { bankId: b.id, itemIndex: i, answer: v === undefined ? null : v },
      });
      const err = error ? errText(error) : data && data.error;
      if (err) { this.toast(err); return; }

      const answers = Object.assign({}, this.state.answers);
      answers[k] = { v, ok: data.ok, ratio: data.ratio, fb: data.fb, model: data.model,
                     hit: data.hit, n: data.n, needsTeacher: data.needsTeacher,
                     reveal: data.reveal || {} };
      this.setState({ answers, xp: this.state.xp + (data.xp || 0) }, () => {
        this.persist();
        let d = 0, r = 0;
        (b.items || []).forEach((x, ii) => {
          const rec = this.state.answers[b.id + ':' + ii];
          if (rec) { d++; if (rec.ok) r++; }
        });
        if (b.jenis === 'lab') this.cekMisi(b);
        else if (d === (b.items || []).length && (r / d * 100) >= (b.kkm || 70)) {
          this.award('kuis', 30, 'Nilai ' + Math.round(r / d * 100) + ' — ' + teks(b.title) + ' tuntas!');
        }
      });
      this.toast(b.jenis === 'lab'
        ? (data.ok ? 'Dugaanmu tepat! +' + (data.xp || 0) + ' XP' : 'Dugaanmu meleset — sekarang lihat sendiri buktinya')
        : '+' + (data.xp || 0) + ' XP · ' + (data.ok ? 'Jawaban tepat!' : 'Belum tepat, baca umpan baliknya'));
    } catch (e) {
      this.toast(errText(e));
    } finally {
      this.setState(s => { const n = Object.assign({}, s.sending); delete n[k]; return { sending: n }; });
    }
  }

  // Marks live on the server, so a student who opens the module on another phone
  // picks up exactly where they left off — and cannot answer anything twice.
  async loadMarks() {
    const { data } = await supabase
      .from('submissions')
      .select('bank_id, item_index, answer, auto_ok, auto_ratio, needs_teacher, reveal, teacher_score, teacher_note')
      .eq('student_id', this.state.me.id);
    if (!data) return;
    const answers = {};
    for (const r of data) {
      const rev = r.reveal || {};
      answers[r.bank_id + ':' + r.item_index] = {
        v: r.answer, ok: r.auto_ok, ratio: r.auto_ratio, needsTeacher: r.needs_teacher,
        // The Edge Function stores the discussion note alongside the key now, so it
        // survives a reload. It used to arrive once in the response and vanish.
        fb: rev.fb || '', reveal: rev, teacherScore: r.teacher_score, teacherNote: r.teacher_note,
      };
    }
    this.setState({ answers });
  }

  // The worksheet is the one thing a student edits over a whole lesson, so it saves
  // as a draft while they type and only locks when they choose to hand it in.
  async submitLkpd(sheet) {
    try {
      const { data, error } = await supabase.from('lkpd').upsert({
        student_id: this.state.me.id, sheet,
        fields: this.state.fields || {},
        updated_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'student_id,sheet' }).select().single();
      if (error) throw error;
      this.setState(st => ({ sheets: Object.assign({}, st.sheets, { [sheet]: data }) }));
      this.downloadLkpd();
      this.award('lkpd', 40, 'LKPD disetorkan ke gurumu!');
    } catch (e) { this.toast(errText(e)); }
  }

  // Autosave, so a phone that dies mid-lesson does not cost a student the sheet.
  saveLkpdDraft() {
    if (this.state.role !== 'siswa') return;
    const sheet = this.state.lkpdTab;
    if ((this.state.sheets || {})[sheet]) return;      // already handed in
    clearTimeout(this._lkpdT);
    this._lkpdT = setTimeout(() => {
      supabase.from('lkpd').upsert({
        student_id: this.state.me.id, sheet,
        fields: this.state.fields || {}, updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id,sheet' }).then(() => {});
    }, 1200);
  }

  async loadSheets() {
    const { data } = await supabase.from('lkpd')
      .select('id, sheet, fields, teacher_score, teacher_note, submitted_at')
      .eq('student_id', this.state.me.id);
    if (!data) return;
    const sheets = {}, fields = Object.assign({}, this.state.fields);
    for (const r of data) {
      if (r.submitted_at) sheets[r.sheet] = r;
      Object.assign(fields, r.fields || {});
    }
    this.setState({ sheets, fields });
  }

  requireStudent() {
    if (this.state.role === 'siswa') return true;
    if (!configured) { this.toast('Modul belum terhubung ke server penilaian'); return false; }
    this.setState({ gate: 'siswa', authError: '' });
    return false;
  }

  async doTeacherSignIn() {
    this.setState({ authBusy: true, authError: '' });
    try {
      const sess = await teacherSignIn(this.state.fEmail, this.state.fPass);
      this.setState({ role: 'guru', teacherNama: sess.nama, gate: null, fPass: '', authBusy: false },
        () => this.openPanel());
    } catch (e) {
      this.setState({ authError: e.message, authBusy: false, fPass: '' });
    }
  }

  async doJoin() {
    this.setState({ authBusy: true, authError: '' });
    try {
      const student = await joinClass(this.state.fCode, this.state.fNama, this.state.fKelas, this.state.fAbsen);
      // join_class returns the whole students row, so the progress column rides
      // along and a student rejoining on a new phone lands on their own progress.
      this.setState(Object.assign({ role: 'siswa', me: student, gate: null, authBusy: false },
        hydrateProgress(student.progress)),
        () => { this.loadMarks().catch(() => {}); this.loadSheets().catch(() => {}); });
      this.toast('Selamat datang, ' + student.nama.split(' ')[0] + '!');
    } catch (e) {
      this.setState({ authError: e.message, authBusy: false });
    }
  }

  async doSignOut() {
    this.stopWatch();
    await signOut();
    this.setState({ role: 'tamu', me: null, gate: null, screen: 'home' });
  }

  // A teacher's edits go to the server draft, not to this device. That is the whole
  // point: the old panel wrote to localStorage, so a teacher's work never left the
  // laptop it was typed on. Writes are debounced because this fires on every keypress.
  persistCms(cms) {
    if (this.state.role !== 'guru' || !configured) return;
    this.setState({ draftSaved: false });
    clearTimeout(this._draftT);
    this._draftT = setTimeout(() => {
      saveDraft(cms)
        .then(() => this.setState({ draftSaved: true }))
        .catch((e) => this.toast(e.message));
    }, 700);
  }

  // ── Teacher panel ──────────────────────────────────────────────────────────

  // Opening the panel swaps the published content for the draft, so the teacher is
  // always editing the version students have not seen yet.
  async openPanel() {
    this.go('admin');
    try {
      const row = await fetchDraft();
      if (row && row.payload && Object.keys(row.payload).length) {
        const merged = cloneCms(CMS_DEFAULTS);
        Object.keys(row.payload).forEach(k => { if (row.payload[k] != null) merged[k] = row.payload[k]; });
        this.setState({ cms: merged, draftSaved: true });
      }
    } catch (e) { this.toast(e.message); }
    this.refreshClasses();
    this.startWatch();
  }

  // Live updates for the panel. Every event triggers the same thing — refetch the
  // class on screen — so they are collapsed into one call rather than patched row
  // by row. The panel can then never disagree with the database.
  startWatch() {
    if (this._unwatch) return;
    this._unwatch = watchClass(
      () => {
        clearTimeout(this._liveT);
        this._liveT = setTimeout(() => this.loadWork(), 500);
      },
      (live) => this.setState({ liveOk: live }),
    );
    // Safety net for a dropped channel. supabase-js reconnects on its own, but until
    // it does the panel would quietly show stale marks, which is worse than a refetch.
    clearInterval(this._pollT);
    this._pollT = setInterval(() => { if (!this.state.liveOk) this.loadWork(); }, 15000);
  }

  stopWatch() {
    if (this._unwatch) { this._unwatch(); this._unwatch = null; }
    clearTimeout(this._liveT);
    clearInterval(this._pollT);
    this._pollT = null;
    if (this.state.liveOk) this.setState({ liveOk: false });
  }

  async refreshClasses() {
    try {
      const classes = await listClasses();
      this.setState(st => ({ classes, classId: st.classId || (classes[0] && classes[0].id) || null }),
        () => { if (this.state.classId) this.loadWork(); });
    } catch (e) { this.toast(e.message); }
  }

  async loadWork() {
    if (!this.state.classId) return;
    this.setState({ gbLoading: true });
    try {
      const work = await loadClassWork(this.state.classId);
      this.setState({ work, gbLoading: false });
    } catch (e) { this.setState({ gbLoading: false }); this.toast(e.message); }
  }

  async doPublish() {
    const n = (this.state.cms.banks || []).filter(b => b.open !== false).length;
    if (!window.confirm('Terbitkan konten ini ke semua siswa?\n\n' + n + ' bank soal akan terbuka. Siswa melihat perubahan ini saat memuat ulang modul.')) return;
    try {
      clearTimeout(this._draftT);
      await saveDraft(this.state.cms);
      const at = await publish();
      this.setState({ publishedAt: at, draftSaved: true });
      this.toast('Konten diterbitkan ke siswa');
    } catch (e) { this.toast(e.message); }
  }

  async saveMark(kind, id, score, note, rubric) {
    this.setState({ markBusy: true });
    try {
      if (kind === 'esai') await gradeSubmission(id, score, note);
      else await gradeLkpd(id, score, note, rubric);
      await this.loadWork();
      this.setState({ markBusy: false, markScore: null, markNote: '', markRubric: {} });
      this.toast('Nilai tersimpan');
    } catch (e) { this.setState({ markBusy: false }); this.toast(e.message); }
  }
  cmsSet(path, val) {
    const cms = cloneCms(this.state.cms);
    const parts = path.split('.');
    let node = cms;
    for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
    node[parts[parts.length - 1]] = val;
    this.setState({ cms }, () => this.persistCms(cms));
  }
  cmsMutate(fn, msg) {
    const cms = cloneCms(this.state.cms);
    fn(cms);
    this.setState({ cms }, () => this.persistCms(cms));
    if (msg) this.toast(msg);
  }

  // Progress lives on the server now, so a student who opens the module on another
  // phone picks up where they left off — and the teacher can see it. Debounced
  // because this fires on every keypress in the worksheet.
  //
  // Guests and teachers have no row in `students`. Without the guard below the RPC
  // would fail on every keystroke and raise the "not saved" warning at someone who
  // has nothing to save.
  persist() {
    if (this.state.role !== 'siswa') return;
    const payload = pickProgress(this.state);
    clearTimeout(this._progT);
    this._progT = setTimeout(() => {
      saveProgress(payload)
        .then(() => { if (this.state.saveFailed) this.setState({ saveFailed: false }); })
        .catch(() => { if (!this.state.saveFailed) this.setState({ saveFailed: true }); });
    }, 2000);
  }
  // The student's own copy of their worksheet. There is no server to submit to, so
  // this file is what actually gets handed in — and it is the only route by which a
  // student's work can leave the browser it was typed into.
  downloadLkpd() {
    const st = this.state;
    const f = Object.assign({}, st.fields, st.me ? { nama: st.me.nama, kelas: st.me.kelas } : null);
    const freq = st.lkpdTab === 'frekuensi';
    const val = (k) => String(f[k] || '').trim() || '—';
    const rows = freq
      ? [['Membran kendur', 'f1'], ['Membran sedang', 'f2'], ['Membran kencang', 'f3']]
      : [['Sumber diam', 'd1'], ['Sumber mendekati pendengar', 'd2'], ['Sumber menjauhi pendengar', 'd3']];
    const lines = [
      'LKPD ' + (freq ? '1 · Frekuensi Bunyi' : '2 · Efek Doppler'),
      'E-Modul Gelombang Bunyi · Gendang Beleq',
      '',
      'Nama     : ' + val('nama'),
      'Kelas    : ' + val('kelas'),
      'Kelompok : ' + val('kelompok'),
      'Diunduh  : ' + new Date().toLocaleString('id-ID'),
      '',
      '1. Rumusan masalah',
      val('rumusan'),
      '',
      '2. Hipotesis',
      val('hipotesis'),
      '',
      '3. Tabel pengamatan',
      ...rows.map(([label, k]) => '   ' + label.padEnd(30) + ': ' + val(k) + ' Hz'),
      '',
      '4. Pertanyaan',
      ...[0, 1, 2].map((i) => '   ' + (i + 1) + '. ' + val(st.lkpdTab + '_s' + i)),
      '',
      '5. Literasi sains',
      ...[0, 1, 2].map((i) => '   ' + (i + 1) + '. ' + val(st.lkpdTab + '_lit' + i)),
      '',
      '6. Kesimpulan',
      val('kesimpulan'),
      ''
    ];
    try {
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'LKPD-' + (freq ? '1-frekuensi' : '2-doppler') + '-' + (val('nama') === '—' ? 'siswa' : val('nama').replace(/\s+/g, '-')) + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { this.toast('Gagal mengunduh berkas LKPD'); }
  }

  // A badge for each simulation whose missions have all been answered, and one for
  // the lab as a whole. Answering is what earns it, not answering correctly: a
  // student who guesses wrong and then reads why has done exactly what the lab asks.
  cekMisi(b) {
    const items = b.items || [];
    const sudah = (it, i) => !!this.state.answers[b.id + ':' + i];
    const per = { drum: 'dugaanDrum', doppler: 'dugaanDoppler', ansambel: 'dugaanAnsambel' };
    const nama = { drum: 'Penabuh', doppler: 'Pengamat Doppler', ansambel: 'Pendengar Pelayangan' };
    Object.keys(per).forEach((sim) => {
      const punya = items.filter((it) => it.sim === sim);
      if (punya.length && punya.every((it) => sudah(it, items.indexOf(it)))) {
        this.award(per[sim], 15, nama[sim] + ' — semua dugaan terbukti!');
      }
    });
    if (items.length && items.every(sudah)) this.award('lab', 20, 'Seluruh dugaan lab tuntas!');
  }

  toast(text) {
    this.setState({ toast: text });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setState({ toast: '' }), 2200);
  }
  award(key, pts, msg) {
    const done = Object.assign({}, this.state.done);
    if (done[key]) { this.toast('Sudah tercatat — tapi boleh diulang!'); return; }
    done[key] = true;
    const xp = this.state.xp + pts;
    this.setState({ done, xp }, () => this.persist());
    this.toast('+' + pts + ' XP · ' + msg);
  }
  setField(k, v) {
    const fields = Object.assign({}, this.state.fields); fields[k] = v;
    this.setState({ fields }, () => this.saveLkpdDraft());
  }

  ac() {
    if (!this._ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      this._ac = new C();
      // Everything routes through one master gain, so the mute button silences the
      // drum and the Doppler recording alike — a classroom of thirty phones needs it.
      this._master = this._ac.createGain();
      this._master.gain.value = this.state.muted ? 0 : 1;
      this._master.connect(this._ac.destination);
    }
    if (this._ac.state === 'suspended') this._ac.resume();
    return this._ac;
  }
  out() { this.ac(); return this._master; }
  toggleMute() {
    const muted = !this.state.muted;
    this.setState({ muted });
    if (this._master) this._master.gain.value = muted ? 0 : 1;
  }
  // The formulas themselves live in supabase/functions/_shared/physics.ts, which the
  // Edge Function imports too. A lab mission is marked by recomputing the simulation,
  // so what a student hears here and what the server grades there cannot disagree.
  pitch(zone) { return pitchOf(this.state, zone); }

  hit(zone) {
    const st = this.state;
    const ctx = this.ac(); const t = ctx.currentTime;
    const base = this.pitch(zone);
    const damp = st.medium === 'air' ? 0.55 : st.medium === 'padat' ? 0.4 : 1;
    const g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = st.medium === 'air' ? 850 : st.medium === 'padat' ? 2200 : 6000;
    const osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(base * 2.1, t);
    osc.frequency.exponentialRampToValueAtTime(base, t + 0.08);
    const vol = (0.04 + 0.5 * st.amp) * (st.medium === 'padat' ? 0.5 : 1);
    const dur = (zone === 'pinggir' ? 0.35 : 0.95) * damp;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    // Envelope first, medium filter second. Both the oscillator and the recorded
    // strike pass through the one filter, so choosing Air or Zat padat muffles the
    // real gendang exactly as much as it muffles the synthesised tone.
    osc.connect(g); g.connect(f); f.connect(this.out());
    osc.start(t); osc.stop(t + dur + 0.1);

    // The recorded strike carries the character; the oscillator above carries the
    // pitch. It gets its own gain rather than sharing the envelope, because the
    // envelope's 10 ms ramp-in would soften the very attack this sample exists for.
    // The 0.8 is a mix balance, turn it down if the strike ever sounds harsh.
    if (this._drum) {
      const src = ctx.createBufferSource();
      src.buffer = this._drum;
      src.playbackRate.value = sampleRate(st, zone);
      const sg = ctx.createGain();
      sg.gain.value = vol * 0.8;
      src.connect(sg); sg.connect(f);
      src.start(t);
    }

    if (zone === 'pinggir') {
      const len = Math.floor(ctx.sampleRate * 0.12);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const ng = ctx.createGain(); ng.gain.value = vol * 0.5;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200;
      src.connect(hp); hp.connect(ng); ng.connect(this.out()); src.start(t);
    }
    this.env = 1;
    const hits = this.state.hits + 1;
    this.setState({
      db: Math.round(dbLevel(st, zone)), hits,
      lastHit: zone === 'tengah' ? 'titik tengah' : 'pinggir membran',
    });
  }

  // Mame and Nine sounded together. Two nearby frequencies beat against each other at
  // |f1 - f2| Hz — the acoustic meaning of "saling menutupi dan melengkapi", and the
  // one lesson that needs the ensemble rather than a single drum.
  playEnsemble() {
    if (this.state.ansPlaying) return;
    const ctx = this.ac(); const t = ctx.currentTime; const dur = 4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.28, t + 0.08);
    g.gain.setValueAtTime(0.28, t + dur - 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.out());
    [this.state.ansMame, this.state.ansNine].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
    this.setState({ ansPlaying: true });
    clearTimeout(this._ansT);
    this._ansT = setTimeout(() => {
      this.setState({ ansPlaying: false });
    }, dur * 1000);
  }

  drawWave() {
    const c = this.waveRef && this.waveRef.current; if (!c) return;
    const ctx = c.getContext('2d'); const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(247,240,226,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    const st = this.state;
    // lambda = v/f, so the number of wavelengths across the canvas scales with f/v.
    // Selecting Air or Zat padat now visibly stretches the wave, which is the
    // relationship v = lambda*f that the quiz grades.
    const cycles = Math.max(0.7, 1.2 + (this.pitch('tengah') / 440) * 7 * (343 / SPEED[st.medium]));
    const A = (h / 2) * 0.82 * st.amp * (0.18 + 0.82 * this.env);
    ctx.lineWidth = 3; ctx.strokeStyle = '#d9962f'; ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const p = x / w;
      const y = h / 2 - Math.sin((p * cycles * Math.PI * 2) - this.phase * 5) * A * (1 - p * 0.12);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(247,240,226,0.28)';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const p = x / w;
      const y = h / 2 - Math.sin((p * cycles * Math.PI * 2 * 2) - this.phase * 5) * A * 0.32;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // The recording plays at heard/dopF, so its pitch moves by exactly the Doppler
  // ratio the readout shows. The source slider only changes the number, not the
  // recording. Loudness and pan follow the procession's position.
  startDop() {
    this.stopDop();
    const ctx = this.ac();
    this._dg = ctx.createGain(); this._dg.gain.value = 0;
    this._dp = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (this._dopBuf) {
      this._do = ctx.createBufferSource(); this._do.buffer = this._dopBuf;
    } else {
      this._do = ctx.createOscillator(); this._do.type = 'triangle';
    }
    this._do.connect(this._dg);
    if (this._dp) { this._dg.connect(this._dp); this._dp.connect(this.out()); } else this._dg.connect(this.out());
    this.mixDop(-1);
    this._do.start();
  }
  mixDop(pos) {
    if (!this._do) return;
    const heard = dopplerOf(this.state, pos), mix = passMix(pos);
    if (this._do.playbackRate) this._do.playbackRate.value = heard / this.state.dopF;
    else this._do.frequency.value = heard;
    // 0.5 is the mix level for the recording; the oscillator is far harsher at 0.12.
    this._dg.gain.value = (this._dopBuf ? 0.5 : 0.12) * mix.gain;
    if (this._dp) this._dp.pan.value = mix.pan;
  }
  stopDop() {
    const o = this._do, g = this._dg;
    this._do = null; this._dg = null; this._dp = null;
    if (!o) return;
    // A 60 ms fade instead of a hard stop, which clicks on a recording mid-waveform.
    try {
      const t = o.context.currentTime;
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.06);
      o.stop(t + 0.07);
      o.onended = () => g.disconnect();
    } catch {}
  }
  dopplerHeard(pos) { return Math.round(dopplerOf(this.state, pos)); }

  stepDoppler(dt) {
    const pos = this._dopPos + dt * 0.34;
    const heard = this.dopplerHeard(pos);
    if (pos > 1) {
      this._dopPos = 1;
      this.setState({ dopRunning: false, dopPos: 1, dopHeard: heard });
      this.stopDop();
      return;
    }
    this._dopPos = pos;
    this.mixDop(pos);
    // Written straight to the DOM. Driving this through setState re-ran renderVals()
    // — the whole view model for all nine screens — 353 times per run.
    this.paintDoppler(pos, heard);
  }

  paintDoppler(pos, heard) {
    const left = (14 + (Math.max(-1, Math.min(1, pos)) + 1) / 2 * 72).toFixed(2) + '%';
    if (this.dopSourceRef.current) this.dopSourceRef.current.style.left = left;
    if (this.dopWaveRef.current) this.dopWaveRef.current.style.left = left;
    if (this.dopHeardRef.current) this.dopHeardRef.current.textContent = String(heard);
  }

  embed(url) {
    if (!url) return '';
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
    return m ? 'https://www.youtube.com/embed/' + m[1] : url;
  }

  // Radius and padding come from the parent rail so the same button reads as a
  // pill in a wrapping row and as a contents-list row in the desktop rail.
  tabStyle(active, dark) {
    return 'flex:none;min-height:44px;padding:var(--tab-pad,0 16px);border-radius:var(--tab-radius,var(--r-full));cursor:pointer;font:600 15px/1.35 var(--font-outfit),sans-serif;text-align:left;'
      + (active
        ? 'border:1px solid transparent;background:' + (dark ? 'var(--gold)' : 'var(--panel)') + ';color:' + (dark ? 'var(--panel)' : 'var(--panel-ink)') + ';'
        : 'border:1px solid ' + (dark ? 'var(--panel-rule)' : 'var(--rule-2)') + ';background:transparent;color:' + (dark ? 'var(--panel-ink-2)' : 'var(--ink-2)') + ';');
  }

  go(screen) {
    // Every screen change in this component routes through here, so one guard closes
    // every exit from the panel and the channel never outlives the view that uses it.
    if (this.state.screen === 'admin' && screen !== 'admin') this.stopWatch();
    this.setState({ screen: screen }, () => this.focusMain());
    window.scrollTo(0, 0);
  }
  focusMain() { if (this.mainRef && this.mainRef.current) this.mainRef.current.focus({ preventScroll: true }); }

  renderVals() {
    const st = this.state;
    // One vocabulary for every destination. The side nav, the bottom nav, the
    // step list and the header title all read from these names, so a screen is
    // never called two things in two places.
    const NAME = {
      home: 'Alur belajar', info: 'Info Awal', materi: 'Materi Bunyi', lab: 'Lab Simulasi',
      lkpd: 'LKPD', kuis: 'Latihan & Tes', rangkuman: 'Rangkuman & Refleksi',
      peringkat: 'Capaian', admin: 'Panel Guru'
    };
    const STEP_KEYS = ['info', 'materi', 'lab', 'lkpd', 'kuis', 'refleksi'];
    const total = STEP_KEYS.length;
    const doneCount = STEP_KEYS.filter(k => st.done[k]).length;
    const pct = Math.round(doneCount / total * 100);

    const mkTab = (cur, key, label, setter, dark) => ({ label, active: cur === key, style: this.tabStyle(cur === key, dark), onClick: () => this.setState(setter(key)) });

    const stepDefs = [
      ['info', 'Orientasi', NAME.info, 'Kenali tujuan belajar dan cara memakai modul', 'info',
        'Pahami capaian, tujuan pembelajaran, dan peta konsep sebelum mulai menyelidiki.'],
      ['materi', 'Eksplorasi', NAME.materi, 'Baca konsep bunyi lewat kisah Gendang Beleq', 'materi',
        'Bangun dasar konsep: komponen gelombang, cepat rambat, intensitas, dan Doppler.'],
      ['lab', 'Eksplorasi', NAME.lab, 'Tabuh gendang, jalankan Doppler, uji pelayangan', 'lab',
        'Buktikan sendiri apa yang berubah saat pukulan dikuatkan, membran dikencangkan, dan sumber bunyi bergerak.'],
      ['lkpd', 'Eksplorasi', NAME.lkpd, 'Catat data pengamatan dan tarik kesimpulan', 'lkpd',
        'Ubah data lab menjadi tabel, grafik, dan kesimpulan dengan kalimatmu sendiri.'],
      ['kuis', 'Penguatan', NAME.kuis, 'Uji pemahaman dengan umpan balik langsung', 'kuis',
        'Cek kekuatan konsepmu; setiap jawaban langsung diberi umpan balik.'],
      ['refleksi', 'Penguatan', NAME.rangkuman, 'Rangkum temuan lalu nilai diri sendiri', 'rangkuman',
        'Tutup pembelajaran: apa yang sudah dikuasai dan apa yang masih perlu dilatih?']
    ];
    const readSteps = { info: 10, materi: 15 };
    // A step the teacher has closed stays visible but will not open, the same way a
    // locked question bank does. Releasing material meeting by meeting is the point.
    const langkah = Object.assign({}, CMS_DEFAULTS.langkah, st.cms.langkah || {});
    const stepOpen = (screen) => langkah[screen === 'rangkuman' ? 'rangkuman' : screen] !== false;
    const openStep = (i) => {
      const d = stepDefs[i];
      if (!d) return;
      if (!stepOpen(d[4])) { this.toast('Tahapan ini belum dibuka guru'); return; }
      this.setState({ screen: d[4] }, () => this.focusMain());
      window.scrollTo(0, 0);
    };
    const firstOpen = stepDefs.findIndex(d => !st.done[d[0]]);
    const currentIdx = firstOpen === -1 ? stepDefs.length - 1 : firstOpen;

    // Resolved from the screen alone. It used to also match labTab, so opening
    // the lab on the ansambel tab erased the whole step header and left the
    // student with no idea where they were.
    let activeIdx = -1;
    stepDefs.forEach((d, i) => { if (d[4] === st.screen && activeIdx === -1) activeIdx = i; });

    const phases = [];
    stepDefs.forEach((d, i) => {
      const [key, phase, title, sub] = d;
      const isDone = !!st.done[key], isNow = i === currentIdx && !isDone;
      const locked = !stepOpen(d[4]);
      let ph = phases[phases.length - 1];
      if (!ph || ph.name !== phase) {
        ph = { name: phase, steps: [] };
        phases.push(ph);
      }
      ph.steps.push({
        num: String(i + 1).padStart(2, '0'), title, sub,
        chip: locked ? 'Dikunci guru' : isDone ? 'Selesai' : isNow ? 'Lanjut dari sini' : 'Belum dibuka',
        onOpen: () => openStep(i),
        cardStyle: 'display:flex;align-items:flex-start;gap:16px;width:100%;padding:18px 12px;border:none;border-top:1px solid var(--rule);cursor:pointer;text-align:left;font-family:inherit;color:var(--ink);'
          + (isNow ? 'background:var(--gold-soft);' : 'background:transparent;'),
        numStyle: 'flex:none;width:34px;padding-top:2px;font:500 15px/1.2 var(--font-jetbrains),ui-monospace,monospace;'
          + (isDone ? 'color:var(--ok)' : isNow ? 'color:var(--gold-ink)' : 'color:var(--ink-3)'),
        chipStyle: 'flex:none;font:600 12px/1.2 var(--font-outfit),sans-serif;padding-top:3px;'
          + (isDone ? 'color:var(--ok)' : isNow ? 'color:var(--gold-ink)' : 'color:var(--ink-3)')
      });
    });
    phases.forEach(p => {
      const d = p.steps.filter(s => s.chip === 'Selesai').length;
      p.count = d + ' dari ' + p.steps.length + ' selesai';
    });

    const cur = stepDefs[currentIdx];
    const allDone = firstOpen === -1;
    const act = activeIdx === -1 ? null : stepDefs[activeIdx];
    const nextIdx = activeIdx === -1 ? -1 : activeIdx + 1;
    const nextDef = nextIdx > -1 ? stepDefs[nextIdx] : null;

    // Every one of these asks the student to have understood something. The three
    // they replaced opened for striking a drum five times, for letting an animation
    // finish, and for letting a sound play to the end.
    const badgeDefs = [
      ['Penabuh', 'dugaanDrum', 'Buktikan semua dugaan di simulasi tabuh gendang'],
      ['Pengamat Doppler', 'dugaanDoppler', 'Buktikan semua dugaan di simulasi rombongan'],
      ['Pendengar Pelayangan', 'dugaanAnsambel', 'Buktikan semua dugaan di simulasi Mame & Nine'],
      ['Peneliti', 'lkpd', 'Simpan satu LKPD yang lengkap'],
      ['Tuntas KKM', 'kuis', 'Selesaikan satu bank soal di atas KKM']
    ];
    const badgeCards = badgeDefs.map(([name, key, how]) => ({
      name, how, open: !!st.done[key],
      status: st.done[key] ? 'Terbuka' : 'Belum terbuka',
      style: 'padding:16px 0;border-top:1px solid var(--rule);'
        + (st.done[key] ? 'color:var(--ink)' : 'color:var(--ink-3)'),
      statusStyle: 'font:600 12px/1.2 var(--font-outfit),sans-serif;'
        + (st.done[key] ? 'color:var(--ok)' : 'color:var(--ink-3)')
    }));

    const infoTabs = ['pengantar', 'identitas', 'petunjuk', 'peta', 'video'].map((k, i) =>
      mkTab(st.infoTab, k, (i + 1) + ' · ' + ['Pengantar', 'Identitas & tujuan', 'Petunjuk', 'Peta konsep', 'Video'][i], (key) => ({ infoTab: key })));

    // Everything under `materi` is content the teacher owns. CMS_DEFAULTS is the
    // floor so a half-filled draft can never blank a section out.
    const M = Object.assign({}, CMS_DEFAULTS.materi, st.cms.materi || {});
    const konsepData = M.konsep || {};
    const konsepNodes = Object.keys(konsepData).map(k => ({
      label: konsepData[k][0],
      active: st.konsep === k,
      onClick: () => this.setState({ konsep: k }),
      style: 'min-height:56px;padding:12px;border-radius:var(--r-m);cursor:pointer;font:600 15px/1.35 var(--font-outfit),sans-serif;text-align:left;'
        + (st.konsep === k ? 'border:1px solid transparent;background:var(--panel);color:var(--panel-ink)' : 'border:1px solid var(--rule-2);background:transparent;color:var(--ink)')
    }));

    const materiTabs = ['pendahuluan', 'kesenian', 'konsep', 'sifat', 'resonansi', 'doppler', 'glosarium'].map((k, i) =>
      mkTab(st.materiTab, k, (i + 1) + ' · ' + ['Pendahuluan', 'Gendang Beleq', 'Komponen', 'Sifat', 'Resonansi & cepat rambat', 'Doppler & intensitas', 'Glosarium'][i], (key) => ({ materiTab: key })));

    // The lab mission bank lives on the Lab screen, not in the question-bank list.
    // It is still a bank on the server — same table, same one-attempt constraint —
    // but a student meets it beside the simulation it belongs to.
    const semuaBank = st.cms.banks || [];
    const labBank = semuaBank.filter(b => b.jenis === 'lab')[0] || null;
    const allBanks = semuaBank.filter(b => b.jenis !== 'lab');

    const labTabs = ['drum', 'doppler', 'ansambel'].map((k, i) =>
      mkTab(st.labTab, k, (i + 1) + ' · ' + ['Tabuh gendang', 'Efek Doppler', 'Mame & Nine'][i], (key) => ({ labTab: key })));

    // ── Dugaan ────────────────────────────────────────────────────────────────
    // The seed is the student id, so two students meet different numbers for the
    // same mission and the Edge Function can rebuild exactly what this one saw
    // without trusting the browser to send it back. Guests get a stable seed of
    // their own; they can play, and the join gate stops them at submit.
    const misiSeed = (i) => (st.me ? st.me.id : 'tamu') + '|' + (labBank ? labBank.id : 'lab1') + '|' + i;
    const misiItems = labBank ? (labBank.items || []) : [];
    const misiRec = (i) => (labBank ? st.answers[labBank.id + ':' + i] : null);
    // One call resolves the conditions, the direction, the wording and the right
    // answer together. The Edge Function calls the same one, so the question printed
    // here and the answer marked there can never come from different draws.
    const misiSiap = (i) => siapkan(misiItems[i], misiSeed(i));
    const misiAktif = st.misi == null ? null : misiItems[st.misi];
    const misiParams = misiAktif ? misiSiap(st.misi).params : null;
    // A knob is frozen only while the mission that tests it is open and unanswered.
    // Everything else on the bench keeps working, so a student who just wants to
    // play with the drum is never stopped.
    const terkunci = misiAktif && !misiRec(st.misi) ? misiAktif.ubah : null;

    // Opening a mission sets the bench to the conditions it asks about.
    const bukaMisi = (i) => {
      if (st.misi === i) { this.setState({ misi: null, misiPilih: null }); return; }
      const it = misiItems[i];
      if (!it) return;
      const p = misiSiap(i).params;
      this.setState({
        misi: i, misiPilih: null, labTab: it.sim,
        drum: p.drum, freq: p.freq, tension: p.tension, amp: p.amp, medium: p.medium,
        dopF: p.dopF, dopV: p.dopV, ansMame: p.ansMame, ansNine: p.ansNine,
        dopRunning: false, dopPos: -1, dopHeard: Math.round(p.dopF),
      }, () => { this._dopPos = -1; this.stopDop(); });
    };

    const ARAH = [['naik', 'Naik'], ['tetap', 'Tetap'], ['turun', 'Turun']];
    const misiCards = misiItems.map((it, i) => {
      const rec = misiRec(i);
      const open = st.misi === i;
      const siap = misiSiap(i);
      const benar = rec ? siap.benar : null;
      return {
        n: String(i + 1).padStart(2, '0'),
        sim: it.sim, q: siap.q, open, done: !!rec, ok: !!(rec && rec.ok),
        onToggle: () => bukaMisi(i),
        status: rec ? (rec.ok ? 'Dugaanmu tepat' : 'Dugaanmu meleset') : open ? 'Sedang dikerjakan' : 'Belum ditebak',
        statusStyle: 'font:600 12px/1.2 var(--font-outfit),sans-serif;'
          + (rec ? (rec.ok ? 'color:var(--ok)' : 'color:var(--warn)') : 'color:var(--ink-3)'),
        rowStyle: 'width:100%;display:flex;gap:12px;align-items:flex-start;padding:14px 0;border:none;border-top:1px solid var(--rule);background:transparent;text-align:left;font-family:inherit;color:var(--ink);cursor:pointer;',
        // Answers stay visible after the fact: the guess the student made, and what
        // the simulation actually did. Both, because seeing only the right answer
        // teaches nothing about the wrong one.
        pilihanmu: rec ? (ARAH.filter(a => a[0] === rec.v)[0] || ['', '—'])[1] : '',
        jawaban: benar ? (ARAH.filter(a => a[0] === benar)[0] || ['', '—'])[1] : '',
        fb: rec ? (rec.fb || (rec.reveal || {}).fb || '') : '',
        opts: ARAH.map(([k, label]) => ({
          label, active: st.misiPilih === k,
          onClick: () => this.setState({ misiPilih: k }),
          style: 'flex:1;min-height:48px;border-radius:var(--r-m);cursor:pointer;font:600 15px/1 var(--font-outfit),sans-serif;'
            + (st.misiPilih === k
              ? 'border:1px solid transparent;background:var(--gold);color:var(--panel)'
              : 'border:1px solid var(--panel-rule);background:transparent;color:var(--panel-ink-2)'),
        })),
        sending: !!(labBank && st.sending[labBank.id + ':' + i]),
        kirim: () => {
          if (!labBank) return;
          if (!st.misiPilih) { this.toast('Pilih dugaanmu dulu'); return; }
          submit(labBank, i, it, st.misiPilih);
        },
      };
    });
    const misiSim = misiCards.filter(m => m.sim === st.labTab);
    const misiSelesai = misiCards.filter(m => m.done).length;

    const kunci = (key, s) => (terkunci === key
      ? Object.assign({}, s, { locked: true, hint: 'Terkunci sampai kamu mengirim dugaanmu.' })
      : s);

    const sliders = [
      { label: 'Amplitudo · kuat pukulan', value: Math.round(st.amp * 100) + '%', min: 5, max: 100, step: 1, raw: Math.round(st.amp * 100), hint: 'Makin besar amplitudo → bunyi makin keras (taraf intensitas naik).', onInput: e => this.setState({ amp: e.target.value / 100 }) },
      { label: 'Frekuensi dasar', value: Math.round(st.freq) + ' Hz', min: 60, max: 900, step: 5, raw: st.freq, hint: 'Makin tinggi frekuensi → nada makin tinggi (melengking).', onInput: e => this.setState({ freq: +e.target.value }) },
      { label: 'Ketegangan membran', value: st.tension < 0.34 ? 'Kendur' : st.tension > 0.66 ? 'Kencang' : 'Sedang', valueText: (st.tension < 0.34 ? 'Kendur' : st.tension > 0.66 ? 'Kencang' : 'Sedang'), min: 0, max: 100, step: 1, raw: Math.round(st.tension * 100), hint: 'Membran lebih kencang → getaran lebih cepat → nada lebih tinggi.', onInput: e => this.setState({ tension: e.target.value / 100 }) }
    ].map((s, i) => kunci(['amp', 'freq', 'tension'][i], s));

    const drumOpts = [['mame', 'Gendang Mame · besar'], ['nine', 'Gendang Nine · kecil']].map(([k, label]) => ({
      label, active: st.drum === k, disabled: terkunci === 'drum',
      onClick: () => { if (terkunci !== 'drum') this.setState({ drum: k }); },
      style: 'flex:1;min-height:48px;border-radius:var(--r-m);cursor:pointer;font:600 13px/1.3 var(--font-outfit),sans-serif;padding:6px 8px;'
        + (st.drum === k ? 'border:1px solid transparent;background:var(--gold);color:var(--panel)' : 'border:1px solid var(--panel-rule);background:transparent;color:var(--panel-ink-2)')
    }));
    const mediumOpts = [['udara', 'Udara'], ['air', 'Air'], ['padat', 'Zat padat']].map(([k, label]) => ({
      label, active: st.medium === k, disabled: terkunci === 'medium',
      onClick: () => { if (terkunci !== 'medium') this.setState({ medium: k }); },
      style: 'flex:1;min-height:46px;border-radius:var(--r-m);cursor:pointer;font:600 15px/1 var(--font-outfit),sans-serif;'
        + (st.medium === k ? 'border:1px solid transparent;background:var(--panel-ink);color:var(--panel)' : 'border:1px solid var(--panel-rule);background:transparent;color:var(--panel-ink-2)')
    }));

    const dbNow = Math.round(st.db * (0.35 + 0.65 * Math.min(1, this.env + 0.001)) || 0);

    const letters = LETTERS;
    const draft = st.draft || {};
    const bankKey = (b, i) => b.id + ':' + i;
    const bankStat = (b) => {
      const n = (b.items || []).length;
      let done = 0, right = 0;
      (b.items || []).forEach((it, i) => {
        const r = st.answers[bankKey(b, i)];
        if (r && typeof r === 'object') { done++; if (r.ok) right++; }
      });
      return { n, done, right, pct: n ? Math.round(right / n * 100) : 0, complete: n > 0 && done === n };
    };
    const setDraft = (k, fn) => this.setState(s => {
      const cur = s.draft || {};
      return { draft: Object.assign({}, cur, { [k]: typeof fn === 'function' ? fn(cur[k]) : fn }) };
    });

    // Grading happens on the server. The browser no longer holds a single answer
    // key, so there is nothing here for a student to read out of devtools — and
    // nothing that could disagree with the mark the teacher eventually sees.
    const submit = (b, i, it, v) => {
      const k = bankKey(b, i);
      if (this.state.answers[k] || this.state.sending[k]) return;
      const invalid = validate(it, v);
      if (invalid) { this.toast(invalid); return; }
      if (!this.requireStudent()) return;
      this.sendAnswer(b, i, k, v);
    };

    const curBank = allBanks.filter(b => b.id === st.bankId)[0] || null;
    const bankOpen = curBank && curBank.open !== false;

    const bankCards = allBanks.map(b => {
      const s = bankStat(b), locked = b.open === false;
      const types = [];
      (b.items || []).forEach(it => { if (types.indexOf(it.type) === -1) types.push(it.type); });
      return {
        title: b.title, desc: b.desc || '', locked,
        meta: s.n + ' soal · KKM ' + (b.kkm || 70),
        statusLabel: locked ? 'Dikunci guru' : s.complete ? 'Nilai ' + s.pct : s.done ? s.done + '/' + s.n + ' terjawab' : 'Belum dikerjakan',
        typeChips: types.map(t => ({ label: TYPE_LABEL[t] || t })),
        onOpen: () => { if (locked) { this.toast('Bank soal ini belum dibuka guru'); return; } this.setState({ bankId: b.id }); window.scrollTo(0, 0); },
        style: 'display:flex;flex-direction:column;gap:12px;width:100%;padding:20px;border-radius:var(--r-l);text-align:left;font-family:inherit;cursor:' + (locked ? 'not-allowed' : 'pointer') + ';'
          + (locked ? 'border:1px dashed var(--rule-2);background:transparent;color:var(--ink-3)'
            : 'border:1px solid var(--rule);background:var(--raised);color:var(--ink);box-shadow:var(--shadow)'),
        statusStyle: 'flex:none;font:600 12px/1 var(--font-outfit),sans-serif;padding:7px 11px;border-radius:var(--r-full);'
          + (locked ? 'background:var(--paper-2);color:var(--ink-3)' : s.complete ? (s.pct >= (b.kkm || 70) ? 'background:var(--ok-bg);color:var(--ok)' : 'background:var(--warn-bg);color:var(--warn)') : 'background:var(--panel);color:var(--panel-ink)')
      };
    });

    const bankStats = curBank ? bankStat(curBank) : { n: 0, done: 0, right: 0, pct: 0 };
    const kuisSoal = !curBank || !bankOpen ? [] : (curBank.items || []).map((it, qi) => {
      const k = bankKey(curBank, qi);
      const rec = st.answers[k];
      const dv = draft[k];
      const done = !!rec;
      const ok = done && rec.ok;
      // Everything that used to come from the item's answer key now comes from the
      // record the server wrote when this answer was locked in.
      const rv = (done && rec.reveal) || {};
      const optBase = 'display:flex;gap:13px;align-items:flex-start;width:100%;min-height:48px;padding:14px;border-radius:var(--r-m);cursor:pointer;font-family:inherit;text-align:left;';
      const idle = 'border:1px solid var(--rule);background:var(--paper);color:var(--ink);';
      const good = 'border:1.5px solid var(--ok);background:var(--ok-bg);color:var(--ok);';
      const bad = 'border:1.5px solid var(--warn);background:var(--warn-bg);color:var(--warn);';
      const sel = 'border:1.5px solid var(--panel);background:var(--paper-2);color:var(--ink);';
      const o = {
        n: String(qi + 1).padStart(2, '0'), text: it.q, typeLabel: TYPE_LABEL[it.type] || it.type,
        xpLabel: '+' + (TYPE_XP[it.type] || 10) + ' XP',
        isPg: it.type === 'pg', isBs: it.type === 'bs', isMulti: it.type === 'multi',
        isIsian: it.type === 'isian', isCocok: it.type === 'cocok', isEsai: it.type === 'esai',
        showFeedback: done,
        feedback: (ok ? (rec && rec.fb || 'Tepat!') : ('Belum tepat. ' + ((rec && rec.fb) || '').replace(/^(\s*(?:<p[^>]*>)?\s*)(?:Tepat|Benar)[!.]?\s*/i, '$1'))),
        feedbackStyle: 'margin-top:14px;padding:14px;border-radius:var(--r-m);font:400 15px/1.65 var(--font-outfit),sans-serif;text-wrap:pretty;'
          + (ok ? 'background:var(--ok-bg);color:var(--ok)' : 'background:var(--warn-bg);color:var(--warn)'),
        typeChipStyle: 'flex:none;font:600 12px/1 var(--font-outfit),sans-serif;padding:6px 10px;border-radius:var(--r-full);background:var(--paper-2);color:var(--ink-2)',
        showAction: !done,
        actionLabel: it.type === 'esai' ? 'Kirim jawaban' : 'Periksa jawaban',
        onAction: () => submit(curBank, qi, it, (this.state.draft || {})[k]),
        cardStyle: 'background:var(--raised);border:1px solid ' + (done ? (ok ? 'var(--ok-rule)' : 'var(--warn-rule)') : 'var(--rule)') + ';border-radius:var(--r-l);padding:20px;box-shadow:var(--shadow)'
      };

      if (it.type === 'pg' || it.type === 'multi') {
        const picked = it.type === 'multi' ? (done ? (rec.v || []) : (dv || [])) : (done ? rec.v : dv);
        o.options = (it.opts || []).map((text, oi) => {
          const isSel = it.type === 'multi' ? picked.indexOf(oi) !== -1 : picked === oi;
          const isKey = it.type === 'multi' ? (rv.keys || []).indexOf(oi) !== -1 : rv.key === oi;
          let s = idle;
          if (done) s = isKey ? good : (isSel ? bad : idle);
          else if (isSel) s = sel;
          return {
            text, letter: letters[oi], selected: isSel, isKey,
            // Colour alone carried correct/incorrect; these glyphs give it a second channel.
            mark: done ? (isKey ? '✓' : (isSel ? '✗' : '')) : '',
            style: optBase + s,
            letterStyle: 'flex:none;width:28px;height:28px;font:500 13px/28px var(--font-jetbrains),ui-monospace,monospace;text-align:center;'
              + (it.type === 'multi' ? 'border-radius:var(--r-s);' : 'border-radius:50%;')
              + (done ? (isKey ? 'background:var(--ok);color:var(--paper)' : isSel ? 'background:var(--warn);color:var(--paper)' : 'background:var(--paper-2);color:var(--ink-3)')
                : isSel ? 'background:var(--panel);color:var(--panel-ink)' : 'background:var(--paper-2);color:var(--ink-2)'),
            onPick: () => {
              if (done) return;
              if (it.type === 'pg') setDraft(k, oi);
              else setDraft(k, prev => {
                const arr = (prev || []).slice();
                const at = arr.indexOf(oi);
                if (at === -1) arr.push(oi); else arr.splice(at, 1);
                return arr;
              });
            }
          };
        });
        o.hint = it.type === 'multi' ? 'Boleh pilih lebih dari satu' : '';
      }

      if (it.type === 'bs') {
        o.options = [['Benar', 1], ['Salah', 0]].map(([text, val]) => {
          const isSel = done ? rec.v === val : dv === val, isKey = rv.key === val;
          let s = idle;
          if (done) s = isKey ? good : (isSel ? bad : idle);
          return {
            text, letter: val === 1 ? '✓' : '✕', selected: !!isSel, isKey,
            mark: done ? (isKey ? '✓' : (isSel ? '✗' : '')) : '',
            style: 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:80px;padding:14px;border-radius:var(--r-m);cursor:pointer;font-family:inherit;' + s,
            letterStyle: 'font:400 24px/1 var(--font-instrument),serif',
            onPick: () => { if (!done) setDraft(k, val); }
          };
        });
      }

      if (it.type === 'isian') {
        o.inputVal = done ? String(rec.v || '') : (dv || '');
        o.onInput = (e) => setDraft(k, e.target.value);
        o.onIsianKey = (e) => { if (e.key === 'Enter') submit(curBank, qi, it, (this.state.draft || {})[k]); };
        o.inputStyle = 'width:100%;min-height:54px;border:1.5px solid ' + (done ? (ok ? 'var(--ok)' : 'var(--warn)') : 'var(--rule-2)') + ';border-radius:var(--r-m);padding:0 15px;font:500 16px/1 var(--font-outfit),sans-serif;background:' + (done ? (ok ? 'var(--ok-bg)' : 'var(--warn-bg)') : 'var(--paper)') + ';color:var(--ink)';
        o.inputDisabled = done;
        o.showKunci = done && !ok;
        o.kunci = 'Jawaban benar: ' + (rv.accept || '—');
      }

      if (it.type === 'cocok') {
        const n = (it.pairs || []).length;
        const perm = seededPerm(n, it.q);
        const cur = done ? (rec.v || {}) : (dv || {});
        o.rights = (it.pairs || []).map((p, j) => ({ letter: letters[j], text: it.pairs[perm[j]][1] }));
        o.lefts = (it.pairs || []).map((p, i) => {
          const chosen = cur[i];
          const rowOk = chosen !== undefined && perm[chosen] === i;
          return {
            text: p[0],
            rowStyle: 'display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:var(--r-m);border:1px solid ' + (done ? (rowOk ? 'var(--ok-rule)' : 'var(--warn-rule)') : 'var(--rule)') + ';background:' + (done ? (rowOk ? 'var(--ok-bg)' : 'var(--warn-bg)') : 'var(--paper)'),
            picks: (it.pairs || []).map((q2, j) => {
              const isSel = chosen === j;
              return {
                letter: letters[j],
                style: 'flex:1;min-width:44px;min-height:44px;border-radius:var(--r-s);cursor:pointer;font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;'
                  + (isSel ? 'border:1px solid transparent;background:var(--panel);color:var(--panel-ink)' : 'border:1px solid var(--rule-2);background:transparent;color:var(--ink-2)'),
                onPick: () => { if (done) return; setDraft(k, prev => Object.assign({}, prev || {}, { [i]: j })); }
              };
            })
          };
        });
        o.showKunci = done && !ok;
        o.kunci = 'Benar ' + (done ? (rec.hit != null ? rec.hit : Math.round((rec.ratio || 0) * n)) : 0) + ' dari ' + n + ' pasangan.';
      }

      if (it.type === 'esai') {
        o.inputVal = done ? String(rec.v || '') : (dv || '');
        o.onInput = (e) => setDraft(k, e.target.value);
        o.inputDisabled = done;
        o.inputStyle = 'width:100%;border:1.5px solid ' + (done ? 'var(--rule-2)' : 'var(--rule-2)') + ';border-radius:var(--r-m);padding:15px;font:400 16px/1.7 var(--font-outfit),sans-serif;background:' + (done ? 'var(--paper-2)' : 'var(--paper)') + ';color:var(--ink)';
        o.hint = 'Jawaban esai dinilai gurumu. Tulis alasanmu selengkap mungkin.';
        o.showModel = done;
        o.modelLabel = !done ? ''
          : rec.teacherScore != null ? ('Sudah dinilai guru · ' + rec.teacherScore)
          : ('Menunggu penilaian guru' + (rec.n ? ' · kata kunci tersentuh ' + rec.hit + '/' + rec.n : ''));
        o.model = (rec && rec.model) || '';
        o.teacherNote = (rec && rec.teacherNote) || '';
      }
      return o;
    });

    const answered = bankStats.done, rightCount = bankStats.right;

    const lkpdIsFreq = st.lkpdTab === 'frekuensi';
    const rowDefs = lkpdIsFreq
      ? [['Membran kendur', 'f1'], ['Membran sedang', 'f2'], ['Membran kencang', 'f3']]
      : [['Sumber diam', 'd1'], ['Sumber mendekati pendengar', 'd2'], ['Sumber menjauhi pendengar', 'd3']];
    const vals = rowDefs.map(([, k]) => parseFloat(st.fields[k]) || 0);
    const maxV = Math.max(100, ...vals);
    const tableRows = rowDefs.map(([label, k], i) => ({
      label, val: st.fields[k] || '',
      onChange: e => this.setField(k, e.target.value),
      barStyle: 'height:100%;width:100%;transform-origin:left;transform:scaleX(' + (Math.min(100, vals[i] / maxV * 100) / 100).toFixed(4) + ');background:var(--gold);transition:transform .3s ease'
    }));

    const mkField = k => {
      if (st.me && (k === 'nama' || k === 'kelas')) {
        return { get: st.me[k] || '', set: () => {}, fixed: true };
      }
      return { get: st.fields[k] || '', set: e => this.setField(k, e.target.value) };
    };
    const fieldKeys = ['nama', 'kelas', 'kelompok', 'rumusan', 'hipotesis', 'kesimpulan', 'refleksi'];
    const lkpdV = {}, lkpdH = {};
    const lkpdFixed = {};
    fieldKeys.forEach(k => { const f = mkField(k); lkpdV[k] = f.get; lkpdH[k] = f.set; lkpdFixed[k] = !!f.fixed; });

    const soalDefs = lkpdIsFreq
      ? ['Bagian mana dari gendang yang menjadi sumber bunyi? Jelaskan buktinya.', 'Bagaimana pengaruh ketegangan membran terhadap tinggi rendahnya bunyi?', 'Mengapa Gendang Mame terdengar lebih rendah daripada Gendang Nine?']
      : ['Bagaimana frekuensi yang terdengar saat sumber bunyi mendekati pendengar?', 'Bagaimana frekuensi yang terdengar saat sumber bunyi menjauhi pendengar?', 'Mengapa frekuensi yang didengar dapat berubah walaupun frekuensi sumber tetap?'];
    const lkpdSoal = soalDefs.map((q, i) => {
      const k = st.lkpdTab + '_s' + i;
      return { q: (i + 1) + '. ' + q, val: st.fields[k] || '', onChange: e => this.setField(k, e.target.value) };
    });

    const litDefs = lkpdIsFreq
      ? [['Mengapa ukuran dan ketebalan kulit gendang memengaruhi nada yang dihasilkan?', 'menghubungkan ukuran/ketegangan dengan frekuensi'],
         ['Bagaimana kamu membedakan perubahan “tinggi nada” dari perubahan “kuat bunyi”?', 'membedakan frekuensi vs amplitudo/intensitas'],
         ['Apa nilai budaya yang kamu temukan dari cara ansambel gendang beleq dimainkan bersama?', 'mengaitkan sains dengan kearifan lokal']]
      : [['Bagaimana konsep efek Doppler membantu menjelaskan fenomena pawai nyongkolan?', 'menerapkan konsep pada konteks nyata'],
         ['Apakah perubahan bunyi yang terdengar selalu disebabkan efek Doppler? Jelaskan faktor lain.', 'menyebut faktor lain: jarak, intensitas, halangan'],
         ['Mengapa penting membedakan perubahan frekuensi dan perubahan intensitas bunyi?', 'ketepatan penggunaan istilah ilmiah']];
    const literasiSoal = litDefs.map(([q, rubrik], i) => {
      const k = st.lkpdTab + '_lit' + i;
      return { q: (i + 1) + '. ' + q, rubrik, val: st.fields[k] || '', onChange: e => this.setField(k, e.target.value) };
    });

    const refleksiSkala = [
      ['Seberapa paham kamu tentang komponen gelombang bunyi?', 'r1'],
      ['Seberapa yakin kamu menjelaskan efek Doppler pada nyongkolan?', 'r2'],
      ['Seberapa aktif kamu dalam kerja kelompok hari ini?', 'r3']
    ].map(([q, k]) => ({
      q,
      opts: ['1', '2', '3', '4', '5'].map(n => ({
        label: n, active: st.refleksi[k] === n,
        onClick: () => { const r = Object.assign({}, this.state.refleksi); r[k] = n; this.setState({ refleksi: r }, () => this.persist()); },
        style: 'flex:1;min-height:48px;border-radius:var(--r-m);cursor:pointer;font:600 16px/1 var(--font-jetbrains),ui-monospace,monospace;'
          + (st.refleksi[k] === n ? 'border:1px solid transparent;background:var(--panel);color:var(--panel-ink)' : 'border:1px solid var(--rule-2);background:transparent;color:var(--ink-2)')
      }))
    }));

    const glosLive = (st.cms.glosarium || []).map(g => [g.term, g.def]);
    const glosarium = glosLive.map(([term]) => ({ term, onClick: () => this.setState({ glos: term }) }));
    const glosFound = glosLive.find(g => g[0] === st.glos);

    // The six 'classmates' here were invented and never moved, so an honest student
    // opening this screen for the first time was ranked last behind people who do not
    // exist. This app has no class data and cannot have any (there is no server), so
    // it now reports the student's own journey instead of a fictional ranking.
    const stepXp = { info: 10, materi: 15, lab: 20, lkpd: 40, kuis: 30, refleksi: 15 };
    const capaian = STEP_KEYS.map((key, i) => {
      const finished = !!st.done[key];
      return {
        num: String(i + 1).padStart(2, '0'), name: stepDefs[i][2],
        xp: finished ? '+' + stepXp[key] + ' XP' : '—',
        detail: finished ? 'Selesai' : 'Belum dikerjakan',
        rowStyle: 'display:flex;align-items:baseline;gap:14px;padding:15px 0;border-top:1px solid var(--rule)',
        numStyle: 'flex:none;width:26px;font:500 15px/1.2 var(--font-jetbrains),ui-monospace,monospace;'
          + (finished ? 'color:var(--ok)' : 'color:var(--ink-3)'),
        xpStyle: 'flex:none;font:500 15px/1.2 var(--font-jetbrains),ui-monospace,monospace;'
          + (finished ? 'color:var(--gold-ink)' : 'color:var(--ink-3)')
      };
    });

    const navItems = [
      ['home', 'Alur'], ['materi', 'Materi'], ['lab', 'Lab'], ['lkpd', 'LKPD'], ['kuis', 'Latihan']
    ].map(([target, label]) => ({
      label, onClick: () => this.go(target),
      style: 'flex:1;min-height:48px;display:flex;align-items:center;justify-content:center;border:none;border-radius:var(--r-full);cursor:pointer;font:600 15px/1 var(--font-outfit),sans-serif;'
        + (st.screen === target ? 'background:var(--panel);color:var(--panel-ink)' : 'background:transparent;color:var(--ink-2)')
    }));

    const gamiOn = this.props.gamifikasiOn !== false;
    const dopClamped = Math.max(-1, Math.min(1, st.dopPos));
    const dopLeft = (14 + (dopClamped + 1) / 2 * 72).toFixed(2);


    const C = st.cms;
    const identFields = [
      ['penulis', 'Penulis'], ['instansi', 'Instansi'], ['fase', 'Fase / Kelas'], ['mapel', 'Mata Pelajaran'],
      ['pertemuan', 'Alokasi Pertemuan'], ['tahun', 'Tahun Ajaran'], ['kataKunci', 'Kata Kunci']
    ].map(([k, label]) => ({ label, val: (C.identitas || {})[k] || '', onChange: e => this.cmsSet('identitas.' + k, e.target.value) }));

    const tujuanRows = (C.tujuan || []).map((t, i) => ({
      n: i + 1, val: t,
      onChange: e => this.cmsSet('tujuan.' + i, e.target.value),
      onDelete: () => this.cmsMutate(c => c.tujuan.splice(i, 1), 'Tujuan dihapus')
    }));

    const materiFields = [
      ['pendahuluan.judul', 'Judul pendahuluan', 0], ['pendahuluan.teks', 'Paragraf pendahuluan', 1],
      ['pendahuluan.pemantik', 'Pertanyaan pemantik', 1], ['kesenian.judul', 'Judul bagian Gendang Beleq', 0],
      ['kesenian.p1', 'Paragraf 1 · gelombang akustik', 1], ['kesenian.p2', 'Paragraf 2 · konteks budaya', 1],
      ['kesenian.catatan', 'Catatan Mame & Nine', 1]
    ].map(([p, label, area]) => {
      const seg = p.split('.');
      return { label, isArea: !!area, isInput: !area, val: ((C[seg[0]] || {})[seg[1]]) || '', onChange: e => this.cmsSet(p, e.target.value) };
    });

    const glosRows = (C.glosarium || []).map((g, i) => ({
      term: g.term, def: g.def,
      onTerm: e => this.cmsSet('glosarium.' + i + '.term', e.target.value),
      onDef: e => this.cmsSet('glosarium.' + i + '.def', e.target.value),
      onDelete: () => this.cmsMutate(c => c.glosarium.splice(i, 1), 'Istilah dihapus')
    }));

    const banksAll = C.banks || [];
    let adBankIdx = -1;
    banksAll.forEach((b, i) => { if (b.id === st.adminBank) adBankIdx = i; });
    const adBank = adBankIdx === -1 ? null : banksAll[adBankIdx];
    const bp = 'banks.' + adBankIdx;

    const adminBankRows = banksAll.map((b, i) => {
      const open = b.open !== false;
      return {
        title: b.title, count: (b.items || []).length + ' soal', desc: b.desc || '', kkm: String(b.kkm || 70),
        onTitle: e => this.cmsSet('banks.' + i + '.title', e.target.value),
        onDesc: e => this.cmsSet('banks.' + i + '.desc', e.target.value),
        onKkm: e => this.cmsSet('banks.' + i + '.kkm', parseInt(e.target.value || '0', 10) || 0),
        openLabel: open ? '● Dibuka untuk siswa' : '○ Dikunci',
        onToggle: () => this.cmsMutate(c => { c.banks[i].open = !open; }, open ? 'Bank soal dikunci' : 'Bank soal dibuka untuk siswa'),
        toggleStyle: 'flex:1;min-height:46px;border-radius:var(--r-m);cursor:pointer;font:600 15px/1 var(--font-outfit),sans-serif;'
          + (open ? 'border:1px solid transparent;background:var(--ok);color:var(--paper)' : 'border:1px solid var(--rule-2);background:transparent;color:var(--ink-2)'),
        onManage: () => this.setState({ adminBank: b.id }),
        onDelete: () => {
          const n = (b.items || []).length;
          if (!window.confirm('Hapus bank soal "' + teks(b.title) + '"?\n\n' + n + ' soal di dalamnya ikut terhapus dan tidak bisa dikembalikan. Nilai yang sudah diperoleh siswa tetap tersimpan.')) return;
          this.cmsMutate(c => c.banks.splice(i, 1), 'Bank soal dihapus');
        },
        cardStyle: 'background:var(--raised);border:1px solid ' + (open ? 'var(--ok-rule)' : 'var(--rule)') + ';border-radius:var(--r-l);padding:18px'
      };
    });

    const adminItems = !adBank ? [] : (adBank.items || []).map((it, i) => {
      const ip = bp + '.items.' + i;
      const o = {
        n: 'Soal ' + (i + 1), q: it.q || '', fb: it.fb || '',
        onQ: e => this.cmsSet(ip + '.q', e.target.value),
        onFb: e => this.cmsSet(ip + '.fb', e.target.value),
        onDelete: () => {
          if (!window.confirm('Hapus soal nomor ' + (i + 1) + ' beserta kunci jawabannya?')) return;
          this.cmsMutate(c => c.banks[adBankIdx].items.splice(i, 1), 'Soal dihapus');
        },
        isPg: it.type === 'pg', isBs: it.type === 'bs', isMulti: it.type === 'multi',
        isIsian: it.type === 'isian', isCocok: it.type === 'cocok', isEsai: it.type === 'esai',
        isChoice: it.type === 'pg' || it.type === 'multi',
        typeBtns: TYPES.map(([k, l]) => ({
          label: l,
          onPick: () => this.cmsMutate(c => {
            const item = c.banks[adBankIdx].items[i];
            item.type = k;
            if ((k === 'pg' || k === 'multi') && !item.opts) item.opts = ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'];
            if (k === 'pg' && item.key === undefined) item.key = 0;
            if (k === 'bs' && (item.key === undefined || item.key > 1)) item.key = 1;
            if (k === 'multi' && !item.keys) item.keys = [0];
            if (k === 'isian' && !item.accept) item.accept = ['jawaban benar'];
            if (k === 'cocok' && !item.pairs) item.pairs = [['Istilah 1', 'Definisi 1'], ['Istilah 2', 'Definisi 2'], ['Istilah 3', 'Definisi 3'], ['Istilah 4', 'Definisi 4']];
            if (k === 'esai') { if (!item.keywords) item.keywords = ['kata kunci']; if (!item.model) item.model = 'Contoh jawaban ideal.'; }
          }),
          style: 'flex:none;min-height:44px;padding:0 14px;border-radius:var(--r-s);cursor:pointer;font:500 13px/1 var(--font-outfit),sans-serif;'
            + (it.type === k ? 'border:1px solid transparent;background:var(--panel);color:var(--panel-ink)' : 'border:1px solid var(--rule-2);background:transparent;color:var(--ink-2)')
        }))
      };
      if (it.type === 'pg' || it.type === 'multi') {
        const multi = it.type === 'multi';
        o.keyHint = multi ? 'Tekan huruf untuk menandai SEMUA jawaban benar' : 'Tekan huruf untuk menandai jawaban benar';
        o.opts = (it.opts || []).map((x, oi) => {
          const isKey = multi ? (it.keys || []).indexOf(oi) !== -1 : it.key === oi;
          return {
            letter: LETTERS[oi], val: x,
            onChange: e => this.cmsSet(ip + '.opts.' + oi, e.target.value),
            onKey: () => this.cmsMutate(c => {
              const item = c.banks[adBankIdx].items[i];
              if (!multi) item.key = oi;
              else { item.keys = item.keys || []; const at = item.keys.indexOf(oi); if (at === -1) item.keys.push(oi); else item.keys.splice(at, 1); }
            }),
            keyStyle: 'flex:none;width:44px;min-height:44px;border-radius:var(--r-s);cursor:pointer;font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;'
              + (isKey ? 'border:1px solid transparent;background:var(--ok);color:var(--paper)' : 'border:1px solid var(--rule-2);background:transparent;color:var(--ink-2)')
          };
        });
        o.addOpt = () => this.cmsMutate(c => c.banks[adBankIdx].items[i].opts.push('Opsi baru'));
      }
      if (it.type === 'bs') {
        o.bsBtns = [['Pernyataan BENAR', 1], ['Pernyataan SALAH', 0]].map(([l, v]) => ({
          label: l, onPick: () => this.cmsSet(ip + '.key', v),
          style: 'flex:1;min-height:46px;border-radius:var(--r-m);cursor:pointer;font:600 15px/1 var(--font-outfit),sans-serif;'
            + (it.key === v ? 'border:1px solid transparent;background:var(--ok);color:var(--paper)' : 'border:1px solid var(--rule-2);background:transparent;color:var(--ink-2)')
        }));
      }
      if (it.type === 'isian') {
        o.accepts = (it.accept || []).map((a, ai) => ({
          val: a, onChange: e => this.cmsSet(ip + '.accept.' + ai, e.target.value),
          onDelete: () => this.cmsMutate(c => c.banks[adBankIdx].items[i].accept.splice(ai, 1))
        }));
        o.addAccept = () => this.cmsMutate(c => c.banks[adBankIdx].items[i].accept.push(''));
      }
      if (it.type === 'cocok') {
        o.pairs = (it.pairs || []).map((p, pi) => ({
          left: p[0], right: p[1],
          onLeft: e => this.cmsSet(ip + '.pairs.' + pi + '.0', e.target.value),
          onRight: e => this.cmsSet(ip + '.pairs.' + pi + '.1', e.target.value),
          onDelete: () => this.cmsMutate(c => c.banks[adBankIdx].items[i].pairs.splice(pi, 1))
        }));
        o.addPair = () => this.cmsMutate(c => c.banks[adBankIdx].items[i].pairs.push(['Istilah baru', 'Definisi baru']));
      }
      if (it.type === 'esai') {
        o.keywords = (it.keywords || []).join(', ');
        o.onKeywords = e => this.cmsSet(ip + '.keywords', e.target.value.split(',').map(x => x.trim()).filter(Boolean));
        o.model = it.model || '';
        o.onModel = e => this.cmsSet(ip + '.model', e.target.value);
      }
      return o;
    });


    const adminTabs = ['materi', 'bagian', 'soal', 'glosarium', 'identitas', 'kelas', 'nilai', 'data'].map((k, i) =>
      mkTab(st.adminTab, k, ['Materi', 'Bagian modul', 'Bank soal', 'Glosarium', 'Identitas', 'Kelas', 'Nilai', 'Data'][i],
        (key) => ({ adminTab: key, markMode: null })));

    // ── Gradebook ─────────────────────────────────────────────────────────────
    // Built from one snapshot of the class so every column agrees with every other.
    const bobot = Object.assign({}, CMS_DEFAULTS.penilaian, st.cms.penilaian || {});
    const work = st.work || { students: [], subs: [], sheets: [] };
    const gradedBanks = (st.cms.banks || []).map(b => ({
      // The gradebook and the CSV are tables, not prose. A teacher can format a bank
      // title now, and a column header is not a place for it.
      id: b.id, title: teks(b.title), kkm: b.kkm || 70, jenis: b.jenis || 'kuis',
      // Essays carry their own weight, so they are not part of a bank's own mark.
      auto: (b.items || []).filter(it => it.type !== 'esai'),
    }));

    const gbRows = work.students.map(stu => {
      const mine = work.subs.filter(x => x.student_id === stu.id);
      const banksOut = {};
      let sum = 0, count = 0, labSum = 0, labCount = 0;
      gradedBanks.forEach(b => {
        const forBank = mine.filter(x => x.bank_id === b.id && !x.needs_teacher);
        const v = bankScore(b.auto, forBank);
        banksOut[b.id] = v;
        if (v == null) return;
        // Lab guesses are their own component of the final mark, so they must not be
        // averaged into the quiz figure as a fourth question bank.
        if (b.jenis === 'lab') { labSum += v; labCount++; } else { sum += v; count++; }
      });
      const sheets = work.sheets.filter(x => x.student_id === stu.id && x.teacher_score != null);
      const lkpdV = sheets.length ? sheets.reduce((a, x) => a + Number(x.teacher_score), 0) / sheets.length : null;
      const esaiV = essayScore(mine);
      const kuisV = count ? sum / count : null;
      const labV = labCount ? labSum / labCount : null;
      return {
        id: stu.id, nama: stu.nama, kelas: stu.kelas, absen: stu.absen,
        banks: banksOut, lkpd: lkpdV, esai: esaiV, lab: labV, kkmModul: bobot.kkmModul || 75,
        akhir: finalScore({ kuis: kuisV, lkpd: lkpdV, esai: esaiV, lab: labV }, bobot),
      };
    });

    const nameOf = (id) => (work.students.find(x => x.id === id) || {});
    const itemOf = (bankId, i) => {
      const b = (st.cms.banks || []).find(x => x.id === bankId);
      return b && (b.items || [])[i];
    };

    const essayQueue = work.subs
      .filter(x => x.needs_teacher && x.teacher_score == null)
      .map(x => {
        const it = itemOf(x.bank_id, x.item_index) || {};
        const who = nameOf(x.student_id);
        const text = String(x.answer || '').toLowerCase();
        return {
          id: x.id, nama: who.nama || '—', absen: who.absen,
          q: it.q || 'Soal tidak ditemukan', answer: String(x.answer || ''),
          model: it.model || '',
          keywords: (it.keywords || []).map(w => ({ word: w, hit: text.indexOf(String(w).toLowerCase()) !== -1 })),
        };
      });

    const lkpdQueue = work.sheets
      .filter(x => x.submitted_at && x.teacher_score == null)
      .map(x => {
        const who = nameOf(x.student_id);
        const f = x.fields || {};
        const rows = x.sheet === 'frekuensi'
          ? [['Membran kendur', 'f1'], ['Membran sedang', 'f2'], ['Membran kencang', 'f3']]
          : [['Sumber diam', 'd1'], ['Sumber mendekati', 'd2'], ['Sumber menjauhi', 'd3']];
        return {
          id: x.id, sheet: x.sheet, nama: who.nama || '—', absen: who.absen,
          entries: [
            { label: 'Rumusan masalah', value: f.rumusan },
            { label: 'Hipotesis', value: f.hipotesis },
            { label: 'Tabel pengamatan', value: rows.map(([l, k]) => l + ': ' + (f[k] || '—') + ' Hz').join('\n') },
            { label: 'Kesimpulan', value: f.kesimpulan },
          ],
        };
      });

    const queue = st.markMode === 'esai' ? essayQueue : lkpdQueue;
    const markItem = queue[st.markIdx] || null;

    const sideItems = [
      ['home', NAME.home, null, ''], ['info', NAME.info, 'info', '01'], ['materi', NAME.materi, 'materi', '02'],
      ['lab', NAME.lab, 'lab', '03'], ['lkpd', NAME.lkpd, 'lkpd', '04'], ['kuis', NAME.kuis, 'kuis', '05'],
      ['rangkuman', NAME.rangkuman, 'refleksi', '06'], ['peringkat', NAME.peringkat, null, '']
    ].map(([target, label, doneKey, no]) => {
      const active = st.screen === target, fin = doneKey && st.done[doneKey];
      return {
        label, no,
        onClick: () => { if (!stepOpen(target)) { this.toast('Tahapan ini belum dibuka guru'); return; } this.go(target); },
        style: 'display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:0 14px;border:none;border-radius:var(--r-m);cursor:pointer;font:500 16px/1.3 var(--font-outfit),sans-serif;text-align:left;font-family:inherit;'
          + (active ? 'background:var(--gold);color:var(--panel)' : 'background:transparent;color:var(--panel-ink-2)'),
        dotStyle: 'flex:none;width:7px;height:7px;border-radius:50%;background:' + (fin ? (active ? 'var(--panel)' : 'var(--gold)') : 'transparent')
      };
    });

    return {
      headerKicker: activeIdx === -1
        ? { home: 'Etnosains Sasak · Fisika Fase F', admin: 'Akses guru', peringkat: doneCount + ' dari ' + total + ' langkah selesai' }[st.screen] || ''
        : 'Langkah ' + (activeIdx + 1) + ' dari ' + total,
      headerTitle: st.screen === 'home' ? 'Gelombang Bunyi' : (NAME[st.screen] || 'E-Modul'),
      showBack: st.screen !== 'home',
      progressLabel: pct + '%',
      progressBarStyle: 'height:100%;width:100%;transform-origin:left;transform:scaleX(' + (Math.max(3, pct) / 100).toFixed(4) + ');background:var(--gold);transition:transform .4s ease',
      isHome: st.screen === 'home', isInfo: st.screen === 'info', isMateri: st.screen === 'materi',
      isLab: st.screen === 'lab', isLkpd: st.screen === 'lkpd', isKuis: st.screen === 'kuis',
      isRangkuman: st.screen === 'rangkuman', isPeringkat: st.screen === 'peringkat',
      goHome: () => this.go('home'), goLab: () => this.go('lab'), goMateri: () => this.go('materi'),
      phases, badgeCards, navItems,

      continueLabel: allDone ? 'Lihat capaian & sertifikat' : 'Lanjut ke ' + cur[2],
      continueKicker: allDone ? 'Semua langkah selesai' : 'Langkah ' + (currentIdx + 1) + ' dari ' + total,
      onContinue: () => { if (allDone) { this.go('peringkat'); } else { openStep(currentIdx); } },

      showStepNav: activeIdx !== -1,
      stepLabel: act ? 'Langkah ' + (activeIdx + 1) + ' dari ' + total : '',
      stepPhase: act ? 'Fase ' + act[1] : '',
      stepTitle: act ? act[2] : '',
      stepGoal: act ? act[5] : '',
      heroFacts: [
        { n: String(total), label: 'Langkah belajar' },
        { n: '2', label: 'LKPD penyelidikan' },
        { n: '3×3', label: 'JP pertemuan' }
      ],
      stepDots: stepDefs.map((d, i) => ({
        style: 'flex:1;height:4px;border-radius:var(--r-full);background:'
          + (st.done[d[0]] ? 'var(--ok)' : i === activeIdx ? 'var(--gold)' : 'var(--rule)')
      })),
      hasPrev: activeIdx > 0,
      prevStyle: 'flex:none;width:56px;min-height:56px;border-radius:var(--r-m);cursor:pointer;display:flex;align-items:center;justify-content:center;'
        + (activeIdx > 0 ? 'border:1px solid var(--rule-2);background:transparent;color:var(--ink)' : 'border:1px solid var(--rule);background:transparent;color:var(--ink-3);cursor:default'),
      onPrev: () => { if (activeIdx > 0) openStep(activeIdx - 1); },
      nextKicker: act ? (readSteps[act[0]] && !st.done[act[0]] ? 'Tandai selesai lalu lanjut' : nextDef ? 'Langkah ' + (nextIdx + 1) + ' dari ' + total : 'Akhir alur belajar') : '',
      nextLabel: nextDef ? nextDef[2] : 'Capaian & Sertifikat',
      onNext: () => {
        if (act && readSteps[act[0]] && !st.done[act[0]]) this.award(act[0], readSteps[act[0]], 'Bagian "' + act[2] + '" selesai dipelajari!');
        if (nextDef) openStep(nextIdx); else this.go('peringkat');
      },

      infoPengantar: st.infoTab === 'pengantar',
      goDoppler: () => { this.setState({ screen: 'lab', labTab: 'doppler' }); window.scrollTo(0, 0); },
      goGlosarium: () => { this.setState({ screen: 'materi', materiTab: 'glosarium' }); window.scrollTo(0, 0); },
      goPeringkat: () => this.go('peringkat'),

      infoTabs,
      infoIdentitas: st.infoTab === 'identitas', infoPetunjuk: st.infoTab === 'petunjuk',
      infoPeta: st.infoTab === 'peta', infoVideo: st.infoTab === 'video',
      tujuan: (C.tujuan || []).map((text, i) => ({ n: i + 1, text })),
      identRows: identFields.map(f => ({ label: f.label, val: f.val })),
      matPendJudul: (C.pendahuluan || {}).judul, matPendTeks: (C.pendahuluan || {}).teks,
      matPendPemantik: (C.pendahuluan || {}).pemantik,
      matKesJudul: (C.kesenian || {}).judul, matKesP1: (C.kesenian || {}).p1,
      matKesP2: (C.kesenian || {}).p2, matKesCatatan: (C.kesenian || {}).catatan,
      _tujuanLegacy: ['Menjelaskan bunyi sebagai gelombang longitudinal.',
        'Mengidentifikasi sumber bunyi pada gendang beleq melalui pengamatan getaran membran.',
        'Menjelaskan karakteristik gelombang bunyi: frekuensi, amplitudo, cepat rambat, tinggi-rendah, dan kuat-lemah bunyi.',
        'Membuat prediksi hubungan ukuran gendang, tegangan membran, dan kuat pukulan terhadap bunyi.',
        'Melakukan penyelidikan sederhana untuk membuktikan pengaruh faktor-faktor tersebut.',
        'Mengolah data penyelidikan dalam tabel/grafik dan menarik kesimpulan berbasis bukti.',
        'Mengomunikasikan hasil penyelidikan secara lisan maupun tertulis.'].map((text, i) => ({ n: i + 1, text })),
      pancasila: ['Beriman & berakhlak mulia', 'Mandiri', 'Bernalar kritis', 'Gotong royong'],
      petunjukSiswa: ['Baca Capaian Pembelajaran, tujuan, dan indikator sebelum memulai.',
        'Baca dan pahami materi tiap sub-bab.', 'Diskusikan dengan teman dan gurumu.',
        'Kerjakan LKPD, latihan soal, evaluasi, dan refleksi dengan jujur.',
        'Tuliskan data sesuai hasil pengamatan, bukan sesuai dugaan.',
        'Komunikasikan kesimpulan dengan bahasa ilmiah yang sederhana.'],
      petunjukGuru: ['Gunakan e-modul sebagai bahan ajar utama atau pendamping.',
        'Beri pertanyaan pemandu, fasilitasi diskusi, dan pastikan keselamatan penyelidikan.',
        'Sesuaikan alat dan waktu dengan kondisi sekolah.',
        'Gunakan rubrik penilaian untuk pengetahuan, keterampilan proses, sikap ilmiah, dan produk.'],
      keselamatan: ['Jangan menabuh sumber bunyi terlalu dekat dengan telinga.',
        'Hindari paparan bunyi keras dalam waktu lama.',
        'Gunakan smartphone dengan aman dan tidak mengganggu kegiatan belajar.',
        'Rapikan alat setelah percobaan.'],
      konsepNodes, konsepAktif: { label: (konsepData[st.konsep] || [])[0] || '', desc: (konsepData[st.konsep] || [])[1] || '' },
      videoUrl: st.cms.videoUrl || st.videoUrl,
      videoFromTeacher: !!st.cms.videoUrl,
      onVideoUrl: e => { const v = e.target.value; this.setState({ videoUrl: v }, () => this.persist()); },
      onVideoLoad: () => { this.setState({ videoLoaded: this.state.cms.videoUrl || this.state.videoUrl }); this.toast('Video dimuat'); },
      hasVideo: !!this.embed(st.videoLoaded || st.cms.videoUrl),
      noVideo: !this.embed(st.videoLoaded || st.cms.videoUrl),
      videoEmbed: this.embed(st.videoLoaded || st.cms.videoUrl),

      materiTabs,
      matPendahuluan: st.materiTab === 'pendahuluan', matKesenian: st.materiTab === 'kesenian',
      matKonsep: st.materiTab === 'konsep', matSifat: st.materiTab === 'sifat', matGlosarium: st.materiTab === 'glosarium',
      matResonansi: st.materiTab === 'resonansi', matDoppler: st.materiTab === 'doppler',

      mameNina: (M.mameNine || []).map(([aspek, mame, nine]) => ({ aspek, mame, nine })),
      mersenne: Object.assign({}, M.mersenne, { vars: ((M.mersenne || {}).vars || []).map(([sym, def]) => ({ sym, def })) }),
      pelayangan: M.pelayangan || {},

      resonansiSteps: M.resonansiSteps,

      mediumRows: M.mediumRows,

      dopplerVars: M.dopplerVars,

      tahukahResonansi: M.tahukahResonansi,
      tahukahKulit: M.tahukahKulit,
      pemantikResonansi: M.pemantikResonansi,
      pemantikDoppler: M.pemantikDoppler,
      instrumen: M.instrumen,
      komponen: M.komponen,
      klasifikasi: (M.klasifikasi || []).map((c, i) => Object.assign({}, c, {
        style: 'padding:18px;border-radius:var(--r-m);' + (i === 1
          ? 'background:var(--gold-soft);color:var(--ink);box-shadow:inset 3px 0 0 var(--gold)'
          : 'background:var(--paper-2);color:var(--ink)')
      })),
      showSolusi: st.showSolusi, solusiLabel: st.showSolusi ? 'Sembunyikan' : 'Lihat langkah',
      toggleSolusi: () => this.setState({ showSolusi: !st.showSolusi }),
      langkahSolusi: M.langkahSolusi,
      sifat: M.sifat,
      syarat: M.syarat,
      glosarium, showGlosPop: !!glosFound, glosAktif: { term: glosFound ? glosFound[0] : '', def: glosFound ? glosFound[1] : '' },
      closeGlos: () => this.setState({ glos: null }),
      pustaka: M.pustaka,

      labTabs, labDrum: st.labTab === 'drum', labDoppler: st.labTab === 'doppler',
      labAnsambel: st.labTab === 'ansambel',
      ansSliders: [
        { label: 'Gendang Mame (f\u2081)', value: st.ansMame + ' Hz', min: 120, max: 200, step: 1, raw: st.ansMame, onInput: e => this.setState({ ansMame: +e.target.value }) },
        { label: 'Gendang Nine (f\u2082)', value: st.ansNine + ' Hz', min: 120, max: 200, step: 1, raw: st.ansNine, onInput: e => this.setState({ ansNine: +e.target.value }) }
      ].map((sl, i) => kunci(['ansMame', 'ansNine'][i], sl)),
      ansBeat: Math.abs(st.ansNine - st.ansMame),
      ansBeatLabel: Math.abs(st.ansNine - st.ansMame) === 0
        ? 'Kedua gendang sefrekuensi \u2014 tidak ada pelayangan'
        : Math.abs(st.ansNine - st.ansMame) + ' denyut tiap detik',
      ansPulseStyle: 'width:78px;height:78px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#e7ae52,#a8641f);margin:0 auto;'
        + (st.ansPlaying && Math.abs(st.ansNine - st.ansMame) > 0
          ? 'animation:gbPulse ' + (1 / Math.abs(st.ansNine - st.ansMame)).toFixed(3) + 's ease-in-out infinite'
          : 'opacity:.45'),
      ansBtnLabel: st.ansPlaying ? 'Berbunyi\u2026' : 'Tabuh Mame & Nine bersamaan',
      ansPlay: () => this.playEnsemble(),
      ansHint: 'Selisih frekuensi kedua gendang menentukan berapa kali bunyi terdengar menguat tiap detik: f\u2097\u2090\u1d67\u2090\u2099\u1d67\u2090\u2099 = | f\u2081 \u2212 f\u2082 |. Coba samakan keduanya, lalu beri selisih 2 Hz dan 8 Hz.',
      waveRef: (this.waveRef = this.waveRef || React.createRef()),
      mainRef: (this.mainRef = this.mainRef || React.createRef()),
      dopSourceRef: (this.dopSourceRef = this.dopSourceRef || React.createRef()),
      dopWaveRef: (this.dopWaveRef = this.dopWaveRef || React.createRef()),
      dopHeardRef: (this.dopHeardRef = this.dopHeardRef || React.createRef()),
      sliders, drumOpts, mediumOpts,
      dbValue: dbNow > 0 ? dbNow : '—',
      drumLabel: st.drum === 'mame' ? 'GENDANG MAME' : 'GENDANG NINE',
      hitLabel: 'tabuhan: ' + st.lastHit,
      waveInfo: Math.round(this.pitch('tengah')) + ' Hz · A ' + Math.round(st.amp * 100) + '%',
      // The 3D drum calls hit() at the instant the stick head meets the membrane, so
      // the sound, the dB readout and the oscilloscope still come from one place.
      drum3d: {
        drum: st.drum, amp: st.amp, speed: SPEED[st.medium],
        frek: { tengah: this.pitch('tengah'), pinggir: this.pitch('pinggir') },
        onHit: (this.hitZone = this.hitZone || ((z) => this.hit(z))),
        // iOS Safari only unlocks audio inside the gesture handler itself; by the time
        // useFrame reaches onHit the tap has ended, so open the AudioContext right away.
        bangun: (this.bangunAudio = this.bangunAudio || (() => this.ac())),
      },
      mediumInfo: 'Cepat rambat ≈ ' + SPEED[st.medium] + ' m/s. ' + (st.medium === 'udara' ? 'Bunyi paling akrab kita dengar di udara.' : st.medium === 'air' ? 'Di air bunyi merambat lebih cepat, tapi warnanya terdengar lebih redup.' : 'Di zat padat bunyi paling cepat merambat karena partikelnya paling rapat.'),
      // The findings used to be printed here in full, which left a student nothing
      // to find. Each line is now the discussion note of the mission that proves it,
      // and stays hidden until that mission has been answered.
      temuan: misiCards.map(m => ({
        open: m.done,
        text: m.done ? m.fb : 'Terkunci sampai dugaan ' + m.n + ' kamu kirim.',
        style: 'display:flex;gap:14px;align-items:flex-start;font:400 16px/1.6 var(--font-outfit),sans-serif;text-wrap:pretty;'
          + (m.done ? 'color:var(--ink)' : 'color:var(--ink-3)'),
      })),
      temuanLabel: misiSelesai + ' dari ' + misiCards.length + ' temuan terbuka',

      misi: misiSim,
      misiAda: misiCards.length > 0,
      misiJudul: labBank ? labBank.title : 'Dugaan Lab',
      misiLabel: misiSim.filter(m => m.done).length + ' dari ' + misiSim.length + ' dugaan di simulasi ini sudah kamu kirim',
      misiParams,

      dopSourceStyle: 'position:absolute;top:18%;left:' + dopLeft + '%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;transition:left .05s linear',
      dopWaveStyle: 'position:absolute;top:18%;left:' + dopLeft + '%;transform:translate(-50%,-6px) scale(' + (st.dopRunning ? 1 : 0.6) + ');width:64px;height:64px;border-radius:50%;border:2px solid rgba(217,150,47,.55);opacity:' + (st.dopRunning ? 0.7 : 0.15) + ';animation:gbRing 1.1s linear infinite;pointer-events:none',
      dopHeard: st.dopHeard,
      dopStatus: st.dopRunning ? (st.dopPos < 0 ? 'MENDEKAT · frekuensi terdengar NAIK' : 'MENJAUH · frekuensi terdengar TURUN') : 'siap dijalankan',
      dopStatusColor: st.dopRunning ? (st.dopPos < 0 ? 'var(--gold)' : '#8fdcc7') : 'var(--panel-ink-2)',
      dopBtnLabel: st.dopRunning ? 'Hentikan' : 'Jalankan rombongan',
      dopToggle: () => {
        if (st.dopRunning) { this.stopDop(); this.setState({ dopRunning: false }); return; }
        this._dopPos = -1;
        this.setState({ dopRunning: true, dopPos: -1, dopHeard: st.dopF }, () => { this.startDop(); this.ensureLoop(); });
      },
      dopReset: () => { this.stopDop(); this._dopPos = -1; this.setState({ dopRunning: false, dopPos: -1, dopHeard: st.dopF }); },
      dopSliders: [
        { label: 'Frekuensi sumber (f)', value: st.dopF + ' Hz', min: 200, max: 900, step: 10, raw: st.dopF, onInput: e => this.setState({ dopF: +e.target.value }) },
        // Capped at 20 m/s (72 km/h). The old ceiling of 60 m/s described a wedding
        // procession moving at 216 km/h.
        { label: 'Kecepatan rombongan (vs)', value: st.dopV + ' m/s', min: 2, max: 20, step: 1, raw: st.dopV, onInput: e => this.setState({ dopV: +e.target.value }) }
      ].map((sl, i) => kunci(['dopF', 'dopV'][i], sl)),

      lkpdTabs: ['frekuensi', 'doppler'].map((k, i) => mkTab(st.lkpdTab, k, ['1 · Frekuensi bunyi', '2 · Efek Doppler'][i], (key) => ({ lkpdTab: key }))),
      lkpdTitle: lkpdIsFreq ? 'Frekuensi Bunyi' : 'Efek Doppler',
      lkpdV, lkpdH,
      lkpdFenomena: lkpdIsFreq
        ? 'Tujuan: mengidentifikasi sumber bunyi pada gendang beleq, menjelaskan hubungan getaran dan bunyi, mengetahui pengaruh ketegangan membran terhadap tinggi-rendah bunyi, merancang mini gendang sederhana, lalu mengolah dan mengomunikasikan datanya.'
        : 'Dalam acara nyongkolan yang dimeriahkan gendang beleq, pemain dapat bergerak mendekati atau menjauhi penonton. Ketika sumber bunyi bergerak, bunyi yang didengar penonton berubah. Fenomena ini disebut efek Doppler.',
      lkpdPemantik: lkpdIsFreq
        ? 'Mengapa dua gendang dengan ukuran berbeda menghasilkan nada yang berbeda meski ditabuh sama kuat?'
        : 'Mengapa bunyi dari sumber yang mendekati pendengar terdengar berbeda dibanding saat menjauhi pendengar?',
      lkpdAlat: lkpdIsFreq
        ? ['Kaleng/ember bekas', 'Balon atau plastik tebal', 'Karet gelang', 'Penggaris', 'Smartphone + aplikasi frequency analyzer']
        : ['Smartphone pemutar nada tetap', 'Aplikasi frequency analyzer di ponsel lain', 'Ruang/lapangan terbuka', 'Meteran', 'Alat tulis'],
      lkpdLangkah: (lkpdIsFreq
        ? ['Buat mini gendang: tutup mulut kaleng dengan balon, kencangkan dengan karet gelang.',
          'Tabuh membran dan dengarkan bunyinya. Catat frekuensi dari aplikasi analyzer.',
          'Ubah ketegangan membran (kendur → sedang → kencang), tabuh lagi tiap kondisi.',
          'Catat frekuensi tiap kondisi pada tabel pengamatan.',
          'Bandingkan hasilmu dengan Lab Simulasi pada modul ini.']
        : ['Putar bunyi berfrekuensi tetap dari smartphone, misalnya 500 Hz.',
          'Satu peserta membawa sumber bunyi dan berjalan mendekati pendengar.',
          'Pendengar memakai aplikasi frequency analyzer untuk mengamati frekuensi terdeteksi.',
          'Ulangi saat sumber bunyi menjauhi pendengar.',
          'Catat perubahan frekuensi pada tabel, lalu bandingkan dengan konsep efek Doppler.']).map((text, i) => ({ n: i + 1, text })),
      tableRows,
      tableHint: lkpdIsFreq ? 'Grafik batang terbentuk otomatis dari frekuensi yang kamu isi (Hz).' : 'Isi frekuensi yang terdengar (Hz) pada tiap kondisi sumber bunyi.',
      lkpdSoal, literasiSoal,
      literasiTeks: lkpdIsFreq
        ? 'Bacalah: sepasang gendang beleq dibuat dari kulit kambing yang direntangkan pada badan kayu berukuran berbeda. Pengrajin mengatur ketegangan kulit sampai bunyinya dianggap “pas” secara turun-temurun.'
        : 'Bacalah: saat rombongan gendang beleq bergerak dalam pawai, posisi pemain, penonton, dan arah gerak rombongan terus berubah. Karena itu bunyi yang diterima penonton tidak selalu sama.',
      // Handing in now means handing in: the sheet goes to the teacher's gradebook,
      // and the student keeps a downloaded copy of what they submitted. It refuses
      // to credit an empty sheet, and it locks once it has been sent.
      kirimLkpd: () => {
        const f = this.state.fields || {};
        const filled = (k) => String(f[k] || '').trim().length > 0;
        const tableKeys = st.lkpdTab === 'frekuensi' ? ['f1', 'f2', 'f3'] : ['d1', 'd2', 'd3'];
        if (!filled('rumusan') || !filled('kesimpulan')) { this.toast('Rumusan masalah dan kesimpulan belum diisi'); return; }
        if (!tableKeys.some(filled)) { this.toast('Isi minimal satu baris tabel pengamatan'); return; }
        if (!this.requireStudent()) return;
        if (!window.confirm('Setorkan LKPD ' + (st.lkpdTab === 'frekuensi' ? '1 Frekuensi' : '2 Doppler') + ' ke gurumu?\n\nSetelah disetorkan kamu tidak bisa mengubahnya lagi.')) return;
        this.submitLkpd(st.lkpdTab);
      },
      lkpdSent: !!(st.sheets || {})[st.lkpdTab],
      lkpdBtnLabel: (st.sheets || {})[st.lkpdTab]
        ? ((st.sheets || {})[st.lkpdTab].teacher_score != null
            ? 'Sudah dinilai guru · ' + (st.sheets || {})[st.lkpdTab].teacher_score
            : 'Sudah disetorkan · menunggu penilaian guru')
        : 'Setorkan LKPD ke guru (+40 XP)',

      bankCards,
      showBankList: !curBank || !bankOpen,
      showBank: !!curBank && bankOpen,
      showBankLocked: !!curBank && !bankOpen,
      bankTitle: curBank ? curBank.title : '',
      bankDesc: curBank ? (curBank.desc || '') : '',
      bankKkmLabel: curBank ? ('KKM ' + (curBank.kkm || 70)) : '',
      openBankCount: allBanks.filter(b => b.open !== false).length + ' dari ' + allBanks.length + ' bank soal dibuka guru',
      kuisSkorLabel: answered + '/' + bankStats.n + ' terjawab · ' + rightCount + ' benar',
      bankScoreLabel: bankStats.complete ? String(bankStats.pct) : '—',
      bankScoreStyle: 'font-family:var(--font-instrument),serif;font-size:48px;line-height:1;color:'
        + (bankStats.complete ? (bankStats.pct >= ((curBank && curBank.kkm) || 70) ? 'var(--ok)' : 'var(--warn)') : 'var(--ink-3)'),
      bankBarStyle: 'height:100%;width:100%;transform-origin:left;transform:scaleX(' + (Math.max(2, bankStats.n ? bankStats.done / bankStats.n * 100 : 0) / 100).toFixed(4) + ');background:var(--gold);transition:transform .35s ease',
      backToBanks: () => { this.setState({ bankId: null }); window.scrollTo(0, 0); },
      resetKuis: () => {
        if (!curBank) return;
        if (!window.confirm('Ulangi bank soal ini dari awal? Semua jawaban dan XP dari bank ini akan dihapus.')) return;
        const answers = Object.assign({}, st.answers), dr = Object.assign({}, st.draft);
        // Hand back the XP those answers earned. Without this, reset-and-resubmit
        // was an unbounded XP farm, and both the leaderboard and the 70% certificate
        // gate read that counter.
        let refund = 0;
        (curBank.items || []).forEach((it, i) => {
          const k = curBank.id + ':' + i;
          const rec = answers[k];
          if (rec) refund += rec.ok ? (TYPE_XP[it.type] || 10) : 2;
          delete answers[k]; delete dr[k];
        });
        this.setState({ answers, draft: dr, xp: Math.max(0, this.state.xp - refund) }, () => this.persist());
        this.toast('Bank soal diulang dari awal');
      },
      kuisSoal,

      rangkuman: ['Bunyi adalah gelombang mekanik longitudinal yang dihasilkan benda bergetar dan memerlukan medium untuk merambat.',
        'Komponen gelombang bunyi meliputi amplitudo, frekuensi, periode, panjang gelombang, dan cepat rambat.',
        'Amplitudo menentukan kuat-lemah bunyi; frekuensi menentukan tinggi-rendah nada.',
        'Berdasarkan frekuensinya bunyi dibedakan menjadi infrasonik, audiosonik, dan ultrasonik.',
        'Bunyi dapat mengalami pemantulan, difraksi, dan interferensi; cepat rambatnya ditentukan medium dan suhu (v = λ·f).',
        'Efek Doppler menjelaskan perubahan frekuensi yang terdengar akibat gerak relatif sumber dan pendengar — nyata pada pawai nyongkolan gendang beleq.'].map((text, i) => ({ n: i + 1, text })),
      refleksiSkala,
      selesaiRefleksi: () => {
        const scale = this.state.refleksi || {};
        if (!['r1', 'r2', 'r3'].every((k) => scale[k])) { this.toast('Isi ketiga skala refleksi dulu'); return; }
        if (!String((this.state.fields || {}).refleksi || '').trim()) { this.toast('Tulis catatan refleksimu dulu'); return; }
        this.award('refleksi', 15, 'Refleksi tersimpan!');
      },
      refleksiBtnLabel: st.done['refleksi'] ? 'Refleksi tersimpan ✓' : 'Simpan refleksi (+15 XP)',

      rankLabel: doneCount + ' dari ' + total + ' langkah selesai',
      xpLabel: gamiOn ? String(st.xp) : '',
      showXp: gamiOn,
      capaian,
      nilaiRows: (() => {
        if (st.role !== 'siswa') return [];
        const rows = [];
        (st.cms.banks || []).forEach(b => {
          const auto = (b.items || []).filter(it => it.type !== 'esai');
          if (!auto.length) return;
          let done = 0, right = 0;
          auto.forEach(it => {
            const rec = st.answers[b.id + ':' + (b.items || []).indexOf(it)];
            if (rec) { done++; if (rec.ok) right++; }
          });
          if (!done) return;
          const v = right / auto.length * 100;
          rows.push({
            label: b.jenis === 'lab' ? 'Dugaan Lab' : teks(b.title),
            value: Math.round(v), kkm: b.kkm || 70, kind: b.jenis === 'lab' ? 'lab' : 'kuis',
          });
        });
        Object.keys(st.sheets || {}).forEach(k => {
          const sh = st.sheets[k];
          rows.push({
            label: 'LKPD ' + (k === 'frekuensi' ? '1 · Frekuensi' : '2 · Doppler'),
            value: sh.teacher_score == null ? null : Math.round(sh.teacher_score),
            kkm: bobot.kkmModul, kind: 'lkpd',
          });
        });
        const esaiRecs = Object.keys(st.answers).map(k => st.answers[k]).filter(r => r && r.needsTeacher);
        if (esaiRecs.length) {
          const graded = esaiRecs.filter(r => r.teacherScore != null);
          rows.push({
            label: 'Esai', kkm: bobot.kkmModul, kind: 'esai',
            value: graded.length ? Math.round(graded.reduce((a, r) => a + Number(r.teacherScore), 0) / graded.length) : null,
          });
        }
        return rows;
      })(),
      nilaiAkhir: (() => {
        if (st.role !== 'siswa') return null;
        const kuis = [], lk = [], es = [], lab = [];
        (st.cms.banks || []).forEach(b => {
          const auto = (b.items || []).filter(it => it.type !== 'esai');
          if (!auto.length) return;
          let done = 0, right = 0;
          auto.forEach(it => {
            const rec = st.answers[b.id + ':' + (b.items || []).indexOf(it)];
            if (rec) { done++; if (rec.ok) right++; }
          });
          if (done) (b.jenis === 'lab' ? lab : kuis).push(right / auto.length * 100);
        });
        Object.keys(st.sheets || {}).forEach(k => {
          if (st.sheets[k].teacher_score != null) lk.push(Number(st.sheets[k].teacher_score));
        });
        Object.keys(st.answers).forEach(k => {
          const r = st.answers[k];
          if (r && r.needsTeacher && r.teacherScore != null) es.push(Number(r.teacherScore));
        });
        const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
        const v = finalScore({ kuis: avg(kuis), lkpd: avg(lk), esai: avg(es), lab: avg(lab) }, bobot);
        return v == null ? null : { value: Math.round(v), kkm: bobot.kkmModul };
      })(),
      sertifikatStyle: 'margin-top:32px;padding:32px 20px;text-align:center;border:1px solid ' + (pct >= 70 ? 'var(--gold)' : 'var(--rule)') + ';background:' + (pct >= 70 ? 'var(--raised)' : 'transparent'),
      sertifikatNama: pct >= 70 ? ((st.me && st.me.nama) || st.fields.nama || 'Gabung ke kelas dulu') : 'Belum terbuka',
      sertifikatTeks: pct >= 70
        ? 'telah menyelesaikan E-Modul Fisika Gelombang Bunyi terintegrasi kearifan lokal Gendang Beleq dengan ' + st.xp + ' XP. Mataram, 2026.'
        : 'Selesaikan minimal 70% aktivitas (' + pct + '% sekarang) untuk membuka sertifikatmu.',

      sideItems,
      joinLabel: st.role === 'siswa' || !configured ? '' : 'Gabung ke kelas',
      goJoin: () => this.setState({ gate: 'siswa', authError: '' }),
      // The panel is reachable only by an account listed in the teachers table.
      // Everyone else gets the sign-in screen, not a PIN prompt they can read out
      // of the bundle.
      goAdmin: () => {
        if (st.role === 'guru') { this.openPanel(); return; }
        if (!configured) { this.toast('Modul belum terhubung ke Supabase'); return; }
        this.setState({ gate: 'guru', authError: '' });
      },
      isAdmin: st.screen === 'admin' && st.role === 'guru',
      adminLocked: false, adminOpen: st.role === 'guru',
      teacherNama: st.teacherNama || '',
      onAdminLock: () => this.doSignOut(),
      adminTabs,
      adTabBagian: st.adminTab === 'bagian', adTabKelas: st.adminTab === 'kelas',
      adTabNilai: st.adminTab === 'nilai',

      // Bagian modul — one editor over every content section.
      materiTree: Object.assign({}, CMS_DEFAULTS.materi, st.cms.materi || {}),
      matSection: st.matSection,
      onMatSection: (k) => this.setState({ matSection: k }),
      onMatSet: (k, val) => this.cmsSet('materi.' + k, val),

      // Kelas
      classes: st.classes,
      newClassName: st.newClassName,
      onNewClassName: e => this.setState({ newClassName: e.target.value }),
      classBusy: st.authBusy,
      onCreateClass: async () => {
        const name = st.newClassName.trim();
        if (!name) return;
        this.setState({ authBusy: true });
        try {
          const c = await createClass(name);
          this.setState({ newClassName: '', authBusy: false });
          this.toast('Kelas dibuat · kode ' + c.code);
          this.refreshClasses();
        } catch (e) { this.setState({ authBusy: false }); this.toast(e.message); }
      },
      onToggleClass: async (c) => {
        try { await updateClass(c.id, { is_open: !c.is_open }); this.refreshClasses(); }
        catch (e) { this.toast(e.message); }
      },
      onRenameClass: (id, name) => {
        this.setState(s2 => ({ classes: s2.classes.map(c => c.id === id ? Object.assign({}, c, { name }) : c) }));
        clearTimeout(this._renT);
        this._renT = setTimeout(() => updateClass(id, { name }).catch(e => this.toast(e.message)), 600);
      },

      // Nilai
      gbBanks: gradedBanks, gbRows, gbLoading: st.gbLoading, gbClassId: st.classId,
      onGbClass: e => this.setState({ classId: e.target.value }, () => this.loadWork()),
      onGbRefresh: () => this.loadWork(),
      gbPending: { esai: essayQueue.length, lkpd: lkpdQueue.length },
      onMarkEssays: () => this.setState({ markMode: 'esai', markIdx: 0, markScore: null, markNote: '' }),
      onMarkLkpd: () => this.setState({ markMode: 'lkpd', markIdx: 0, markNote: '', markRubric: {} }),
      onExportCsv: () => {
        const cls = st.classes.find(c => c.id === st.classId);
        const name = (cls ? cls.name : 'kelas').replace(/\s+/g, '-').toLowerCase();
        try {
          // A BOM is what makes Excel read the accented names as UTF-8.
          const blob = new Blob(['\ufeff' + toCsv(gradedBanks, gbRows)], { type: 'text/csv;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'nilai-' + name + '-' + new Date().toISOString().slice(0, 10) + '.csv';
          a.click(); URL.revokeObjectURL(a.href);
          this.toast('Daftar nilai diunduh');
        } catch { this.toast('Gagal mengunduh'); }
      },

      // Penilaian manual
      markMode: st.markMode, markItem, markIdx: st.markIdx, markTotal: queue.length,
      markBusy: st.markBusy, markScore: st.markScore, markNote: st.markNote, markRubric: st.markRubric,
      onMarkBack: () => this.setState({ markMode: null }),
      onMarkNote: e => this.setState({ markNote: e.target.value }),
      onMarkScore: n => this.setState({ markScore: n }),
      onMarkRubric: (k, n) => this.setState(s2 => ({ markRubric: Object.assign({}, s2.markRubric, { [k]: n }) })),
      onMarkSkip: () => this.setState(s2 => ({
        markIdx: (s2.markIdx + 1) % Math.max(1, queue.length), markScore: null, markNote: '', markRubric: {},
      })),
      onMarkSave: (nilai) => {
        if (!markItem) return;
        if (st.markMode === 'esai') this.saveMark('esai', markItem.id, st.markScore, st.markNote);
        else this.saveMark('lkpd', markItem.id, nilai, st.markNote, st.markRubric);
      },

      // Penilaian & tahapan
      bobotFields: [
        ['bobotKuis', 'Bobot kuis (%)'], ['bobotLkpd', 'Bobot LKPD (%)'],
        ['bobotEsai', 'Bobot esai (%)'], ['bobotLab', 'Bobot dugaan lab (%)'],
        ['kkmModul', 'KKM modul'],
      ].map(([k, label]) => ({
        label, val: String(bobot[k]),
        onChange: e => this.cmsSet('penilaian.' + k, parseInt(e.target.value || '0', 10) || 0),
      })),
      bobotTotal: (bobot.bobotKuis || 0) + (bobot.bobotLkpd || 0) + (bobot.bobotEsai || 0) + (bobot.bobotLab || 0),
      langkahRows: [
        ['info', 'Pendahuluan'], ['materi', 'Eksplorasi materi'], ['lab', 'Lab simulasi'],
        ['lkpd', 'LKPD'], ['kuis', 'Kuis'], ['rangkuman', 'Refleksi'],
      ].map(([k, label]) => {
        const on = (Object.assign({}, CMS_DEFAULTS.langkah, st.cms.langkah || {}))[k] !== false;
        return { label, on, onToggle: () => this.cmsSet('langkah.' + k, !on) };
      }),

      // Terbitkan
      draftSaved: st.draftSaved,
      draftLabel: st.draftSaved ? 'Semua suntingan tersimpan sebagai draf' : 'Menyimpan draf…',
      onPublish: () => this.doPublish(),
      adTabMateri: st.adminTab === 'materi', adTabSoal: st.adminTab === 'soal',
      adTabGlos: st.adminTab === 'glosarium', adTabIdent: st.adminTab === 'identitas',
      adTabData: st.adminTab === 'data',
      identFields, tujuanRows, materiFields, glosRows,
      adminVideoUrl: C.videoUrl || '',
      onAdminVideo: e => this.cmsSet('videoUrl', e.target.value),
      addTujuan: () => this.cmsMutate(c => c.tujuan.push('Tujuan pembelajaran baru'), 'Tujuan ditambahkan'),
      addGlos: () => this.cmsMutate(c => c.glosarium.push({ term: 'Istilah baru', def: 'Definisi istilah.' }), 'Istilah ditambahkan'),

      adminBankRows, adminItems,
      adBankList: !adBank, adBankOpen: !!adBank,
      adBankTitle: adBank ? adBank.title : '',
      adBankMeta: adBank ? ((adBank.items || []).length + ' soal · KKM ' + (adBank.kkm || 70) + ' · ' + (adBank.open !== false ? 'dibuka' : 'dikunci')) : '',
      adBankSummary: banksAll.filter(b => b.open !== false).length + ' dari ' + banksAll.length + ' bank soal sedang dibuka untuk siswa',
      backToBankList: () => this.setState({ adminBank: null }),
      addBank: () => this.cmsMutate(c => {
        c.banks = c.banks || [];
        c.banks.push({ id: 'b' + Date.now().toString(36), title: 'Bank soal baru', desc: 'Deskripsi singkat bank soal.', open: false, kkm: 70, items: [] });
      }, 'Bank soal baru dibuat (masih dikunci)'),
      addItem: () => this.cmsMutate(c => {
        const base = { type: 'pg', q: 'Tulis pertanyaan di sini…', fb: 'Umpan balik jawaban benar.', opts: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'], key: 0 };
        c.banks[adBankIdx].items.push(base);
      }, 'Soal ditambahkan'),
      openAllBanks: () => this.cmsMutate(c => c.banks.forEach(b => { b.open = true; }), 'Semua bank soal dibuka'),
      lockAllBanks: () => this.cmsMutate(c => c.banks.forEach(b => { b.open = false; }), 'Semua bank soal dikunci'),
      onResetCms: () => {
        if (!window.confirm('Kembalikan seluruh draf ke konten bawaan modul?\n\nSemua suntinganmu pada materi, soal, dan glosarium akan hilang. Versi yang sudah diterbitkan ke siswa tidak berubah sampai kamu menerbitkan ulang.')) return;
        const d = cloneCms(CMS_DEFAULTS);
        this.setState({ cms: d }, () => this.persistCms(d));
        this.toast('Draf dikembalikan ke bawaan');
      },
      // Only the keys save_progress actually owns. Clearing `answers` and `fields`
      // here would empty the screen while `submissions` and `lkpd` kept every row,
      // so the panel would lie until the next reload.
      onResetProgress: () => {
        if (!window.confirm('Hapus seluruh progres belajarmu? XP, langkah yang sudah selesai, dan refleksi akan hilang dan tidak bisa dikembalikan.\n\nJawaban kuis dan LKPD yang sudah disetorkan tidak ikut terhapus.')) return;
        this.setState({ xp: 0, done: {}, refleksi: {}, videoUrl: '', draft: {} }, () => this.persist());
        this.toast('Progres belajarmu dihapus');
      },
      onExportCms: () => {
        try {
          const blob = new Blob([JSON.stringify(this.state.cms, null, 2)], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = 'konten-emodul-gendang-beleq.json';
          a.click(); this.toast('Berkas konten diunduh');
        } catch { this.toast('Gagal mengunduh'); }
      },
      onImportCms: (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          try {
            const inc = JSON.parse(r.result);
            const merged = cloneCms(CMS_DEFAULTS);
            Object.keys(inc || {}).forEach(k => { if (inc[k] != null) merged[k] = inc[k]; });
            this.setState({ cms: merged }, () => this.persistCms(merged));
            this.toast('Konten berhasil dimuat');
          } catch { this.toast('Berkas tidak valid'); }
        };
        r.readAsText(f);
      },

      muted: st.muted,
      muteLabel: st.muted ? 'Bunyikan audio modul' : 'Bisukan audio modul',
      muteGlyph: st.muted ? '🔇' : '🔊',
      onToggleMute: () => this.toggleMute(),
      saveFailed: st.saveFailed,
      lkpdFixed,
      onDownloadLkpd: () => this.downloadLkpd(),
      lkpdNote: (st.sheets || {})[st.lkpdTab] ? ((st.sheets || {})[st.lkpdTab].teacher_note || '') : '',
      showToast: !!st.toast, toastText: st.toast
    };
  }

  render() {
    const st = this.state;

    // A gate replaces the page rather than sitting on top of it. Both gates ask for
    // a few fields and nothing else, so there is nothing behind them worth seeing.
    if (st.gate === 'guru') {
      return (
        <TeacherAuth
          busy={st.authBusy} email={st.fEmail} error={st.authError} password={st.fPass}
          onEmail={(e) => this.setState({ fEmail: e.target.value })}
          onPassword={(e) => this.setState({ fPass: e.target.value })}
          onSubmit={() => this.doTeacherSignIn()}
          onBack={() => this.setState({ gate: null, authError: '' })}
        />
      );
    }
    if (st.gate === 'siswa') {
      return (
        <StudentJoin
          busy={st.authBusy} error={st.authError}
          code={st.fCode} nama={st.fNama} kelas={st.fKelas} absen={st.fAbsen}
          onCode={(e) => this.setState({ fCode: e.target.value })}
          onNama={(e) => this.setState({ fNama: e.target.value })}
          onKelas={(e) => this.setState({ fKelas: e.target.value })}
          onAbsen={(e) => this.setState({ fAbsen: e.target.value })}
          onSubmit={() => this.doJoin()}
          onBack={() => this.setState({ gate: null, authError: '' })}
        />
      );
    }

    const v = this.renderVals();
    return (
      <>
        <a className="gb-skip" href="#gb-main">Lewati ke konten</a>
        <div className="gb-grain" aria-hidden="true"></div>
        <div className="gb-page">
          <SideNav v={v} />
          <div className="gb-shell">
            <Header v={v} />
            <main id="gb-main" ref={v.mainRef} tabIndex={-1} aria-label={v.headerTitle} className="gb-doc" style={sx('outline:none')}>
              {v.saveFailed && (
                <div className="gb-pad" style={sx('padding-top:20px')}>
                  <div style={sx('padding:16px 18px;border-radius:var(--r-m);background:var(--warn-bg);border:1px solid var(--warn);color:var(--warn);font:500 15px/1.6 var(--font-outfit),sans-serif;text-wrap:pretty;max-width:68ch')}>
                    Perangkat ini menolak menyimpan jawabanmu. Unduh berkas LKPD sekarang sebelum menutup halaman.
                  </div>
                </div>
              )}
              <StepIntro v={v} />
              {v.isHome && <Home v={v} />}
              {v.isInfo && <Info v={v} />}
              {v.isMateri && <Materi v={v} />}
              {v.isLab && <Lab v={v} />}
              {v.isLkpd && <Lkpd v={v} />}
              {v.isKuis && <Kuis v={v} />}
              {v.isRangkuman && <Rangkuman v={v} />}
              {v.isPeringkat && <Peringkat v={v} />}
              {v.isAdmin && <div className="gb-teacher"><Admin v={v} /></div>}
              <StepNav v={v} />
            </main>
            <GlosPopup v={v} />
            <Toast v={v} />
            <BottomNav v={v} />
          </div>
        </div>
      </>
    );
  }
}

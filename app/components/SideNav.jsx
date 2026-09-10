import React from 'react';
import { sx } from './sx';

export default function SideNav({ v }) {
  const { goAdmin, sideItems } = v;
  return (
    <nav aria-label="Daftar isi modul" className="gb-sidenav" style={sx("flex:none;width:264px;align-self:flex-start;position:sticky;top:0;height:100dvh;background:var(--panel);background-image:radial-gradient(120% 60% at 20% 0%,rgba(217,150,47,.14),transparent 62%);padding:40px 18px 24px;flex-direction:column;gap:4px;overflow-y:auto")}>
      <div style={sx("padding:0 10px 28px")}>
        <div style={sx("font:500 13px/1.4 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>Fisika · Fase F · Kelas XI</div>
        <div style={sx("font-family:var(--font-instrument),serif;font-size:36px;line-height:1;color:var(--panel-ink);margin-top:14px")}>Gelombang<br />Bunyi</div>
        <div style={sx("font-family:var(--font-instrument),serif;font-style:italic;font-size:22px;line-height:1.2;color:var(--gold);margin-top:8px")}>Gendang Beleq</div>
        <div style={sx("height:1px;background:var(--panel-rule);margin-top:24px")}></div>
      </div>
      {(sideItems || []).map((s, sI) => (
        <button key={sI} onClick={s.onClick} style={sx(s.style)}>
          <span style={sx("flex:none;width:24px;font:500 13px/1 var(--font-jetbrains),ui-monospace,monospace;opacity:.7")}>{s.no}</span>
          <span style={sx("flex:1")}>{s.label}</span>
          <span style={sx(s.dotStyle)}></span>
        </button>
      ))}
      <div style={sx("flex:1;min-height:24px")}></div>
      <button onClick={goAdmin} style={sx("width:100%;min-height:48px;border:1px solid var(--panel-rule);border-radius:var(--r-m);background:transparent;color:var(--panel-ink-2);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Panel Guru</button>
    </nav>
  );
}

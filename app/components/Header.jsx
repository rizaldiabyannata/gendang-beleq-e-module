import React from 'react';
import { sx } from './sx';
import Icon from './Icon';

export default function Header({ v }) {
  const { muted, muteLabel, onToggleMute, goHome, showBack, headerKicker, headerTitle, progressLabel, progressBarStyle } = v;
  const ghost = "flex:none;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink-2);cursor:pointer";
  return (
    <header style={sx("position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--paper) 93%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--rule)")}>
      <div className="gb-doc gb-pad" style={sx("display:flex;align-items:center;gap:16px;padding-top:14px;padding-bottom:14px")}>
        {showBack ? (
          <button onClick={goHome} aria-label="Kembali ke alur belajar" title="Kembali ke alur belajar" style={sx(ghost + ";color:var(--ink)")}><Icon name="arrowLeft" /></button>
        ) : null}
        <div style={sx("flex:1;min-width:0")}>
          {headerKicker ? <div style={sx("font:500 12px/1 var(--font-outfit),sans-serif;color:var(--ink-3)")}>{headerKicker}</div> : null}
          <div style={sx("font-family:var(--font-instrument),serif;font-size:22px;line-height:1.15;color:var(--ink);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{headerTitle}</div>
        </div>
        <div style={sx("flex:none;display:flex;align-items:center;gap:12px")} title="Bagian modul yang sudah kamu selesaikan">
          <div aria-hidden="true" style={sx("width:64px;height:4px;border-radius:var(--r-full);background:var(--rule);overflow:hidden")}><div style={sx(progressBarStyle)}></div></div>
          <div style={sx("font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{progressLabel}</div>
        </div>
        <button onClick={onToggleMute} aria-pressed={muted} style={sx(ghost)} title={muteLabel} aria-label={muteLabel}>
          <Icon name={muted ? 'speakerOff' : 'speakerOn'} />
        </button>
      </div>
    </header>
  );
}

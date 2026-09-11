import React from 'react';
import { sx } from './sx';
import Icon from './Icon';

export default function Header({ v }) {
  const { muted, muteLabel, onToggleMute, goHome, showBack, headerKicker, headerTitle, progressLabel, progressBarStyle } = v;
  return (
    <header className="gb-head">
      <div className="gb-doc gb-pad gb-head-in">
        {showBack ? (
          <button onClick={goHome} aria-label="Kembali ke alur belajar" title="Kembali ke alur belajar" className="gb-head-btn" style={sx("color:var(--ink)")}><Icon name="arrowLeft" /></button>
        ) : null}
        <div className="gb-head-t">
          {headerKicker ? <div className="gb-head-k">{headerKicker}</div> : null}
          <div className="gb-head-h">{headerTitle}</div>
        </div>
        <div className="gb-head-p" title="Bagian modul yang sudah kamu selesaikan">
          <div aria-hidden="true" className="gb-head-bar"><div style={sx(progressBarStyle)}></div></div>
          <div style={sx("font:500 15px/1 var(--font-jetbrains),ui-monospace,monospace;color:var(--gold-ink)")}>{progressLabel}</div>
        </div>
        <button onClick={onToggleMute} aria-pressed={muted} className="gb-head-btn" title={muteLabel} aria-label={muteLabel}>
          <Icon name={muted ? 'speakerOff' : 'speakerOn'} />
        </button>
      </div>
    </header>
  );
}

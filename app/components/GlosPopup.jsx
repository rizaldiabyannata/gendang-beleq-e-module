import React from 'react';
import { sx } from './sx';
import Rich from './Rich';

export default function GlosPopup({ v }) {
  const { showGlosPop, glosAktif, closeGlos } = v;
  const sheetRef = React.useRef(null);
  const openerRef = React.useRef(null);

  React.useEffect(() => {
    if (!showGlosPop) return undefined;
    // Remember who opened the sheet so focus can go back there on close.
    openerRef.current = document.activeElement;
    if (sheetRef.current) sheetRef.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') closeGlos(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (openerRef.current && openerRef.current.focus) openerRef.current.focus();
    };
  }, [showGlosPop, closeGlos]);

  if (!showGlosPop) return null;

  return (
    <div
      onClick={closeGlos}
      className="gb-sheetwrap"
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={'Glosarium: ' + glosAktif.term}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="gb-sheet"
      >
        <div style={sx('width:44px;height:4px;border-radius:var(--r-full);background:var(--rule-2);margin:0 auto 20px')}></div>
        <div style={sx('font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;color:var(--gold-ink);text-transform:uppercase;margin-bottom:10px')}>Glosarium</div>
        <Rich tag="h2" html={glosAktif.term} style={sx('font-family:var(--font-instrument),serif;font-size:28px;line-height:1.1;margin:0 0 12px;font-weight:400')} />
        <Rich block tag="div" html={glosAktif.def} style={sx('margin:0;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty')} />
        <button
          onClick={closeGlos}
          style={sx('width:100%;min-height:52px;margin-top:24px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);font:600 16px/1 var(--font-outfit),sans-serif;cursor:pointer')}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

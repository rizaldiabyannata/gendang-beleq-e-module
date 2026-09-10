import React from 'react';
import { sx } from './sx';
import Icon from './Icon';

export default function StepNav({ v }) {
  const { goHome, nextKicker, nextLabel, onNext, onPrev, prevStyle, showStepNav } = v;
  if (!showStepNav) return null;
  return (
    <div className="gb-pad" style={sx("padding-top:48px;padding-bottom:16px")}>
      <div style={sx("height:1px;background:var(--rule-2);margin-bottom:24px")}></div>
      <div style={sx("display:flex;gap:12px;align-items:stretch;flex-wrap:wrap")}>
        <button onClick={onPrev} aria-label="Langkah sebelumnya" style={sx(prevStyle)}><Icon name="chevronLeft" size={22} /></button>
        <button onClick={onNext} style={sx("flex:1 1 260px;min-height:56px;border:none;border-radius:var(--r-m);background:var(--panel);color:var(--panel-ink);cursor:pointer;padding:10px 20px;display:flex;align-items:center;gap:16px;text-align:left")}>
          <span style={sx("flex:1")}>
            <span style={sx("display:block;font:500 12px/1 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>{nextKicker}</span>
            <span style={sx("display:block;font:600 17px/1.2 var(--font-outfit),sans-serif;margin-top:5px")}>{nextLabel}</span>
          </span>
          <Icon name="arrowRight" size={22} />
        </button>
        <button onClick={goHome} style={sx("flex:0 1 auto;min-height:56px;padding:0 22px;border:1px solid var(--rule-2);border-radius:var(--r-m);background:transparent;color:var(--ink-2);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer")}>Alur belajar</button>
      </div>
    </div>
  );
}

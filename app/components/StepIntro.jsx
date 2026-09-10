import React from 'react';
import { sx } from './sx';

export default function StepIntro({ v }) {
  const { showStepNav, stepDots, stepGoal, stepLabel, stepPhase, stepTitle } = v;
  if (!showStepNav) return null;
  return (
    <div className="gb-pad" style={sx("padding-top:36px")}>
      <div style={sx("display:flex;justify-content:space-between;align-items:baseline;gap:16px;font:500 12px/1 var(--font-jetbrains),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;max-width:640px")}>
        <span style={sx("color:var(--gold-ink)")}>{stepLabel}</span>
        <span style={sx("color:var(--ink-3)")}>{stepPhase}</span>
      </div>
      <div aria-hidden="true" style={sx("display:flex;gap:4px;margin:12px 0 24px;max-width:640px")}>
        {(stepDots || []).map((d, dI) => <div key={dI} style={sx(d.style)}></div>)}
      </div>
      <div className="gb-cols-wide">
        <h2 style={sx("font-family:var(--font-instrument),serif;font-size:clamp(30px,4.4vw,44px);line-height:1.04;margin:0;font-weight:400;text-wrap:balance")}>{stepTitle}</h2>
        <p style={sx("margin:0;align-self:end;font:400 16px/1.7 var(--font-outfit),sans-serif;color:var(--ink-2);text-wrap:pretty;max-width:52ch")}>{stepGoal}</p>
      </div>
      <div style={sx("height:1px;background:var(--rule-2);margin-top:32px")}></div>
    </div>
  );
}

import React from 'react';
import { sx } from './sx';

export default function Toast({ v }) {
  const { showToast, toastText } = v;
  if (!showToast) return null;
  return (
    <div role="status" aria-live="polite" aria-atomic="true" style={sx("position:fixed;bottom:104px;left:50%;transform:translateX(-50%);z-index:70;background:var(--panel);color:var(--panel-ink);padding:14px 20px;border-radius:var(--r-m);font:500 15px/1.4 var(--font-outfit),sans-serif;box-shadow:var(--shadow-panel);animation:gbPop .2s ease-out;max-width:calc(100vw - 40px);width:max-content;text-align:center;text-wrap:pretty")}>{toastText}</div>
  );
}

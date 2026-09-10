import React from 'react';
import { sx } from './sx';

export default function BottomNav({ v }) {
  const { navItems } = v;
  return (
    <nav aria-label="Navigasi utama" className="gb-bottomnav">
      {(navItems || []).map((n, nI) => (
        <button key={nI} onClick={n.onClick} style={sx(n.style)}>{n.label}</button>
      ))}
    </nav>
  );
}

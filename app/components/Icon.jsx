import React from 'react';

// One stroke weight, one grid, one join style. These replace the ← ‹ → ⌂ ✎
// characters the chrome used to borrow from whatever font happened to load.
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

const PATHS = {
  arrowLeft: <><path d="M19 12H5" {...P} /><path d="M11 6l-6 6 6 6" {...P} /></>,
  arrowRight: <><path d="M5 12h14" {...P} /><path d="M13 6l6 6-6 6" {...P} /></>,
  chevronLeft: <path d="M15 5l-7 7 7 7" {...P} />,
  speakerOn: <><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" {...P} /><path d="M15.8 9.2a4 4 0 0 1 0 5.6" {...P} /><path d="M18.4 6.8a7.5 7.5 0 0 1 0 10.4" {...P} /></>,
  speakerOff: <><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" {...P} /><path d="M16 9.5l4.5 5" {...P} /><path d="M20.5 9.5l-4.5 5" {...P} /></>,
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
      {PATHS[name]}
    </svg>
  );
}

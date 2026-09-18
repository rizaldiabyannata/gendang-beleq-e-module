'use client';
// The drum on the lab bench. The buttons are the keyboard and screen-reader way to
// strike, and they keep working while the 3D stage is still loading or if this
// device cannot draw it at all: until the stage reports ready, a press goes
// straight to onHit, exactly as the old CSS drum did.
import { Component, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { sx } from './sx';

const Panggung3D = dynamic(() => import('./Panggung3D'), { ssr: false });

const TOMBOL = "min-height:44px;padding:0 16px;border:1px solid var(--panel-rule);border-radius:var(--r-m);background:transparent;color:var(--panel-ink);font:500 15px/1 var(--font-outfit),sans-serif;cursor:pointer";

class Jaga extends Component {
  state = { rusak: false };
  static getDerivedStateFromError() { return { rusak: true }; }
  componentDidCatch() { this.props.onRusak(); }
  render() { return this.state.rusak ? null : this.props.children; }
}

export default function Drum3D({ drum, amp, frek, speed, onHit }) {
  const [minta, setMinta] = useState(null);
  const [siap, setSiap] = useState(false);
  const [rusak, setRusak] = useState(false);
  const lat = useRef(null);

  const tabuh = (zona, sudut) => {
    if (!siap || rusak) { onHit(zona); return; }
    setMinta((m) => ({ zona, sudut, n: m ? m.n + 1 : 1 }));
  };
  // The stage reads the latest knobs at the moment of contact, not the ones from
  // when the swing started.
  useEffect(() => { lat.current = { amp, frek, speed, onHit, onPilih: tabuh }; });
  const onSiap = useCallback(() => setSiap(true), []);

  return (
    <div className="gb-drum3d">
      {rusak ? (
        <p className="gb-kanvas" style={sx("display:grid;place-items:center;margin:0;padding:0 16px;text-align:center;font:400 15px/1.5 var(--font-outfit),sans-serif;color:var(--panel-ink-2)")}>
          Model 3D tidak dapat ditampilkan di perangkat ini. Tabuh lewat tombol di bawah.
        </p>
      ) : (
        <div className="gb-kanvas" role="img" aria-label="Model 3D Gendang Beleq dan pemukulnya. Klik atau ketuk bagian tengah atau pinggir membran untuk menabuh.">
          <Jaga onRusak={() => setRusak(true)}>
            <Panggung3D drum={drum} minta={minta} lat={lat} onSiap={onSiap} />
          </Jaga>
        </div>
      )}
      <div className="gb-stage-hit" style={sx("display:flex;gap:8px")}>
        <button onClick={() => tabuh('tengah', 0)} style={sx(TOMBOL)}>Tabuh tengah</button>
        <button onClick={() => tabuh('pinggir', 0)} style={sx(TOMBOL)}>Tabuh pinggir</button>
      </div>
    </div>
  );
}

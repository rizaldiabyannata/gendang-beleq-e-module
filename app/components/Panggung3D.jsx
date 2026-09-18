'use client';
// The 3D stage: public/gendang-beleq.glb, the stick that swings to where the
// student clicked, and the rings that leave the contact point. Loaded only in the
// browser through Drum3D, so three.js never reaches the server or the first bundle.
//
// frameloop="demand": nothing renders until a strike, and each animated frame asks
// for the next one only while the stick, the membrane or a ring is still moving.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  JUMLAH, KONTAK, PHI, R_MAKS, SELESAI, WAKTU, Y_MEMBRAN,
  cincin, genggam, pose, sudutAyun, titikTabuh, zonaDari,
} from './gelombang';

const MODEL = '/gendang-beleq.glb';
// Kamera, lampu dan skala Nine adalah tuas kalibrasi visual.
const KAMERA = { position: [0, 1.2, 0.95], fov: 35, near: 0.05, far: 10 };
const PANDANG = [0, 0.42, 0];
const SKALA = { mame: 1, nine: 0.8 };
const REDUP = typeof window !== 'undefined' && !!window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SUMBU_X = new THREE.Vector3(1, 0, 0);

// Every ring of one strike is drawn by one flat plane: ring k sits at radius
// laju·t − k·jarak, so the spacing between rings is the wavelength and every ring
// keeps the same thickness however far it has travelled.
const VERT = /* glsl */ `
varying vec2 vP;
void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = /* glsl */ `
uniform vec2 uPusat;
uniform float uT, uLaju, uJarak, uTebal, uOpasitas;
uniform vec3 uWarna;
varying vec2 vP;
void main() {
  float d = distance(vP, uPusat), a = 0.0;
  for (int k = 0; k < ${JUMLAH}; k++) {
    float r = uLaju * uT - float(k) * uJarak;
    if (r <= 0.0) continue;
    a = max(a, (1.0 - smoothstep(0.0, uTebal, abs(d - r))) * (1.0 - r / ${R_MAKS.toFixed(3)}));
  }
  if (a <= 0.0) discard;
  gl_FragColor = vec4(uWarna, a * uOpasitas);
}`;

function pasang(stick, g, phi) {
  const p = pose(g, phi);
  stick.position.set(p.pos[0], p.pos[1], p.pos[2]);
  stick.quaternion.setFromUnitVectors(SUMBU_X, new THREE.Vector3(p.arah[0], p.arah[1], p.arah[2]));
}

function Gendang({ drum, minta, lat, onSiap }) {
  const { scene } = useLoader(GLTFLoader, MODEL);
  const invalidate = useThree((s) => s.invalidate);
  const bag = useRef(null);        // simpul model yang dianimasikan
  const mat = useRef(null);        // shader cincin
  const gerak = useRef({ g: genggam([0, 0]), dari: null, ke: null, t0: -1, kena: true, zona: null, titik: null, gel: null, pantul: null });
  const rootY = scene.getObjectByName('gendang_beleq').position.y;
  const uniforms = useMemo(() => ({
    uPusat: { value: new THREE.Vector2() }, uT: { value: 0 }, uLaju: { value: 0 }, uJarak: { value: 0 },
    uTebal: { value: 0 }, uOpasitas: { value: 0 }, uWarna: { value: new THREE.Color('#d9962f') },
  }), []);

  useEffect(() => {
    const root = scene.getObjectByName('gendang_beleq');
    const head = root.getObjectByName('head_top');
    bag.current = { root, head, headY: head.position.y, stick: root.getObjectByName('drumstick') };
    pasang(bag.current.stick, gerak.current.g, PHI.istirahat);
    onSiap();
    invalidate();
  }, [scene, onSiap, invalidate]);

  useEffect(() => {
    if (!minta) return;
    const m = gerak.current;
    m.titik = titikTabuh(minta.zona, minta.sudut);
    m.zona = minta.zona;
    m.dari = m.g;
    m.ke = genggam(m.titik);
    m.kena = false;
    // Gerak dikurangi: tanpa ayunan, tabuhan langsung terjadi, cincin tetap muncul.
    m.t0 = performance.now() / 1000 - (REDUP ? KONTAK : 0);
    if (REDUP) m.g = m.ke;
    invalidate();
  }, [minta, invalidate]);

  useFrame(() => {
    const m = gerak.current, b = bag.current, u = mat.current && mat.current.uniforms;
    if (!b || !u) return;
    const now = performance.now() / 1000;
    let hidup = false;

    if (m.t0 >= 0) {
      const t = now - m.t0;
      if (!REDUP) {
        // Genggam berpindah ke atas titik baru selama pemukul diangkat.
        const k = Math.min(1, t / WAKTU.naik);
        m.g = m.dari.map((a, i) => a + (m.ke[i] - a) * k);
        pasang(b.stick, m.g, sudutAyun(t));
      }
      if (!m.kena && t >= KONTAK) {
        m.kena = true;
        const { amp, frek, speed, onHit } = lat.current;
        onHit(m.zona);
        const c = cincin({ freq: frek[m.zona], speed, amp });
        // Bidang cincin diputar -90° pada X: z dunia = -y lokal.
        u.uPusat.value.set(m.titik[0], -m.titik[1]);
        u.uLaju.value = c.laju; u.uJarak.value = c.jarak; u.uTebal.value = c.tebal; u.uOpasitas.value = c.opasitas;
        m.gel = { t0: now, umur: c.umur };
        m.pantul = { t0: now, amp };
      }
      if (t < SELESAI) hidup = true; else m.t0 = -1;
    }

    if (m.gel) {
      const t = now - m.gel.t0;
      u.uT.value = t;
      if (t < m.gel.umur) hidup = true; else { m.gel = null; u.uT.value = 0; }
    }

    // Membran melesak sesaat lalu bergetar teredam, sebanding dengan amplitudo.
    if (m.pantul) {
      const t = now - m.pantul.t0;
      b.head.position.y = b.headY - 0.004 * m.pantul.amp * Math.exp(-t * 14) * Math.cos(t * 70);
      if (t < 0.4) hidup = true; else { b.head.position.y = b.headY; m.pantul = null; }
    }

    if (hidup) invalidate();
  });

  const pilih = (e) => {
    const b = bag.current;
    if (!b) return;
    e.stopPropagation();
    const o = e.object;
    if (o.name === 'head_top' || o.name === 'rim_top') {
      const p = b.root.worldToLocal(e.point.clone());
      lat.current.onPilih(zonaDari(Math.hypot(p.x, p.z)), Math.atan2(p.z, p.x));
      return;
    }
    for (let n = o; n; n = n.parent) if (n === b.stick) { lat.current.onPilih('tengah', 0); return; }
  };

  const sisi = 2 * (R_MAKS + 0.15);
  return (
    <group scale={SKALA[drum] || 1}>
      <primitive object={scene} onPointerDown={pilih} />
      <mesh rotation-x={-Math.PI / 2} position={[0, rootY + Y_MEMBRAN + 0.002, 0]} raycast={() => null} renderOrder={1}>
        <planeGeometry args={[sisi, sisi]} />
        <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function Panggung3D({ drum, minta, lat, onSiap }) {
  return (
    <Canvas frameloop="demand" dpr={[1, 2]} camera={KAMERA} gl={{ alpha: true, antialias: true }}
      style={{ touchAction: 'pan-y', cursor: 'pointer' }}
      onCreated={({ camera }) => camera.lookAt(PANDANG[0], PANDANG[1], PANDANG[2])}>
      <hemisphereLight args={['#fff4e0', '#3a2a1a', 1.6]} />
      <directionalLight position={[0.6, 1.4, 0.8]} intensity={2.2} />
      <Suspense fallback={null}>
        <Gendang drum={drum} minta={minta} lat={lat} onSiap={onSiap} />
      </Suspense>
    </Canvas>
  );
}

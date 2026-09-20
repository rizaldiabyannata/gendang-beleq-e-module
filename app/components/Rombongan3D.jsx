'use client';
// The Doppler lab's 3D stage: three identical drummers (public/penabuh-gendang-
// beleq-animasi.glb) walk in lockstep along +X past a listener marker. The model
// has NO skin (plain TRS node hierarchy, see gelombang.js's header comment), so
// scene.clone() is enough and the clones still share geometries/materials — but
// each clone needs its OWN AnimationMixer, since a mixer binds clip tracks to one
// object graph by node name, not to the clip itself.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  CINCIN_FRAG, CINCIN_VERT, JARAK_BARIS, JUMLAH, R_MAKS, X_JALUR,
  cincin, lewatTabuh, skalaJalan, uTKereta, xDari,
} from './gelombang';

const MODEL = '/penabuh-gendang-beleq-animasi.glb';
// Diukur dari file (lihat Box3 pada seluruh simpul bermesh, pose istirahat):
// tinggi 1.86 m, lebar 0.98 m, dalam 1.24 m — sedikit lebih tinggi dari manusia
// panggung (~1.7 m), jadi SKALA menyusutkannya. Tuas kalibrasi visual.
const SKALA = 0.9;
const SKALA_CINCIN = 4;
const SISI_CINCIN = 2 * (R_MAKS + 0.15);
// Offset horizontal gendang terhadap titik asal karakter, diukur pada pose
// istirahat (drumPivot ≈ z=+0.28 pada sumbu lokal karakter menghadap +Z). Sesudah
// rotation-y=90° sumbu +Z lokal menjadi +X dunia, jadi gendang ada di +DRUM_X arah
// jalan. Cincin sengaja diletakkan dekat lantai, bukan setinggi gendang.
const DRUM_X = 0.28;
const RING_Y = 0.02;
// Kamera adalah tuas kalibrasi visual. Panggungnya sangat lebar dan pendek
// (~1090×240 px), jadi fov vertikal yang menentukan: pada jarak 5,4 m dan fov 30°
// tinggi pandang ≈ 2,9 m (penabuh 1,7 m mengisi sebagian besar kotak) dan lebarnya
// ikut nisbah layar, jauh melebihi lintasan x = ±X_JALUR sehingga ukuran penabuh
// tidak meledak saat mereka melewati kita. Digeser sedikit ke +x supaya terasa 3/4,
// bukan tampak samping datar.
const KAMERA = { position: [0.6, 1.6, 5.4], fov: 30, near: 0.1, far: 40 };
const PANDANG = [0, 0.85, 0];
const REDUP = typeof window !== 'undefined' && !!window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BARIS = [-JARAK_BARIS, 0, JARAK_BARIS];
const P_DASAR = 0.6; // jarak waktu asli (detik) antar pukulan pada timeScale 1

function Rombongan({ jalan, lat }) {
  const { scene, animations } = useLoader(GLTFLoader, MODEL);
  const invalidate = useThree((s) => s.invalidate);
  const grup = useRef(null);
  // waktu: waktu klip terurai tanpa dibungkus, dipakai lewatTabuh untuk deteksi
  // pukulan. sejak/n: waktu & hitungan sejak pukulan terakhir, dipakai cincin.
  const gerak = useRef({ waktu: 0, sejak: 0, n: 0, frek: null, corak: null, lebar: 0 });

  const orang = useMemo(() => BARIS.map(() => {
    const obj = scene.clone();
    const mixer = new THREE.AnimationMixer(obj);
    const cari = (nama) => animations.find((c) => c.name === nama);
    return {
      obj,
      mixer,
      jalan: mixer.clipAction(cari('BerjalanMenabuh'), obj),
      diam: mixer.clipAction(cari('Idle'), obj),
    };
  }), [scene, animations]);

  // Material dibagi oleh ketiga penabuh: dibangun sekali di efek mount (bukan
  // saat render, ESLint react-hooks/refs melarang itu) lalu ditempel manual ke
  // ketiga mesh cincin, supaya mutasi uniform tiap frame lewat mat.current tetap
  // sah — persis pola mat.current di Panggung3D.
  const mat = useRef(null);
  const cincinRef = useRef([]);

  useEffect(() => {
    if (!mat.current) {
      mat.current = new THREE.ShaderMaterial({
        vertexShader: CINCIN_VERT,
        fragmentShader: CINCIN_FRAG,
        uniforms: {
          uPusat: { value: new THREE.Vector2() }, uT: { value: 0 }, uLaju: { value: 0 },
          uJarak: { value: 0 }, uTebal: { value: 0 }, uOpasitas: { value: 0 },
          uWarna: { value: new THREE.Color('#d9962f') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
    }
    cincinRef.current.forEach((m) => { if (m) m.material = mat.current; });
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    if (jalan) {
      // REDUP: gerak dikurangi, pose Idle yang sudah diputar sejak mount dibiarkan
      // diam — hanya posisi & cincin yang tetap berjalan di useFrame.
      if (!REDUP) orang.forEach((o) => { o.diam.stop(); o.jalan.reset().play(); });
    } else {
      orang.forEach((o) => { o.jalan.stop(); o.diam.reset().play(); o.mixer.update(0); });
      const g = gerak.current;
      g.waktu = 0; g.sejak = 0; g.n = 0;
      if (mat.current) mat.current.uniforms.uOpasitas.value = 0;
    }
    invalidate();
  }, [jalan, orang, invalidate]);

  useFrame((st, delta) => {
    const l = lat.current;
    if (!grup.current || !l) return;
    // Kotaknya jauh lebih sempit di ponsel, dan lebar pandang lahir dari fov tegak
    // kali nisbah layar. Kamera mundur seperlunya supaya ujung lintasan (x =
    // ±X_JALUR) tetap masuk bingkai, tak pernah lebih dekat dari KAMERA.
    if (gerak.current.lebar !== st.size.width) {
      gerak.current.lebar = st.size.width;
      const nisbah = st.size.width / Math.max(1, st.size.height);
      // Marginnya menampung lebar barisan, geseran kamera ke +x, dan cincin terluar.
      const perlu = (X_JALUR + 1.6) / (nisbah * Math.tan((KAMERA.fov / 2) * Math.PI / 180));
      st.camera.position.z = Math.max(KAMERA.position[2], perlu);
      st.camera.lookAt(PANDANG[0], PANDANG[1], PANDANG[2]);
      st.camera.updateProjectionMatrix();
    }
    // Jalannya lebih panjang dari bingkai, jadi rombongan datang dan pergi dari
    // luar layar. Saat berhenti mereka diparkir di tepi bingkai supaya panggung
    // tidak tampak kosong sebelum tombol Jalankan ditekan.
    const x = xDari(l.ambilPos());
    grup.current.position.x = jalan ? x : Math.max(-X_JALUR, Math.min(X_JALUR, x));

    if (!mat.current) return;
    const u = mat.current.uniforms;
    if (!jalan) { u.uOpasitas.value = 0; return; }

    const laju = skalaJalan();
    if (!REDUP) orang.forEach((o) => { o.jalan.timeScale = laju; o.mixer.update(delta); });

    const g = gerak.current;
    const t0 = g.waktu, t1 = t0 + delta * laju;
    if (lewatTabuh(t0, t1)) { g.n += 1; g.sejak = 0; } else { g.sejak += delta; }
    g.waktu = t1;

    if (g.frek !== l.frek) {
      g.frek = l.frek;
      g.corak = cincin({ freq: l.frek, speed: 343, amp: 0.8 });
    }
    const P = P_DASAR / laju;
    u.uLaju.value = R_MAKS / (JUMLAH * P);
    u.uJarak.value = u.uLaju.value * P;
    u.uT.value = uTKereta(g.sejak, g.n, P);
    u.uTebal.value = g.corak.tebal;
    // Belum ada pukulan sejak mulai jalan: cincin belum boleh tampak.
    u.uOpasitas.value = g.n > 0 ? g.corak.opasitas : 0;
  });

  return (
    <group>
      <group ref={grup}>
      {orang.map((o, i) => (
        <group key={i} position={[0, 0, BARIS[i]]}>
          <primitive object={o.obj} rotation-y={Math.PI / 2} scale={SKALA} />
          {/* Bidang diskalakan, bukan hanya diperlebar: shader memakai R_MAKS pada
              satuan lokal, jadi jari-jari cincin ikut membesar bersama bidangnya. */}
          <mesh ref={(el) => { cincinRef.current[i] = el; }} position={[DRUM_X, RING_Y, 0]}
            scale={SKALA_CINCIN} rotation-x={-Math.PI / 2} raycast={() => null} renderOrder={1}>
            <planeGeometry args={[SISI_CINCIN, SISI_CINCIN]} />
          </mesh>
        </group>
      ))}
      </group>
      {/* Pendengar: berdiri di titik asal, sejajar tengah kotak dan label "Kamu". */}
      <mesh position={[0, 0.25, 1.1]}>
        <cylinderGeometry args={[0.09, 0.09, 0.5, 12]} />
        <meshStandardMaterial color="#cbbba0" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow={false}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#2b2318" />
      </mesh>
    </group>
  );
}

export default function Rombongan3D({ jalan, lat }) {
  return (
    <Canvas frameloop={jalan ? 'always' : 'demand'} dpr={[1, 1.5]} camera={KAMERA}
      gl={{ alpha: true, antialias: false }} style={{ touchAction: 'pan-y pinch-zoom' }}
      onCreated={({ camera }) => camera.lookAt(PANDANG[0], PANDANG[1], PANDANG[2])}>
      <hemisphereLight args={['#fff4e0', '#3a2a1a', 1.6]} />
      <directionalLight position={[0.6, 1.4, 0.8]} intensity={2.2} />
      <Suspense fallback={null}>
        <Rombongan jalan={jalan} lat={lat} />
      </Suspense>
    </Canvas>
  );
}

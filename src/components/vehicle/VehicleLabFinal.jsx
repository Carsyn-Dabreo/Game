import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL = '/models/motorbike.glb'
const VIEWS = {
  full: { position: [5.8, 3.1, 6.8], target: [0, 1.15, 0] },
  engine: { position: [2.0, 1.55, 2.15], target: [0, 0.95, 0] },
  front: { position: [2.8, 1.9, 3.6], target: [0, 1.0, 1.25] },
  rear: { position: [2.8, 1.55, -3.4], target: [0, 0.95, -1.2] },
}

function CameraRig({ view }) {
  const { camera } = useThree()
  const controls = useRef()
  useEffect(() => {
    camera.position.set(...view.position)
    if (controls.current) {
      controls.current.target.set(...view.target)
      controls.current.update()
    }
  }, [camera, view])
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} enablePan minDistance={0.7} maxDistance={12} rotateSpeed={0.8} zoomSpeed={0.9} />
}

function Bike({ onSelect, interactive = true, scaleOverride }) {
  const { scene } = useGLTF(MODEL)
  const clone = useMemo(() => scene.clone(true), [scene])
  const fit = useMemo(() => {
    clone.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    return { scale: 3.7 / Math.max(size.x, size.y, size.z), offset: new THREE.Vector3(-center.x, -box.min.y, -center.z) }
  }, [clone])
  useEffect(() => clone.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) o.material.side = THREE.DoubleSide } }), [clone])
  return <group scale={(scaleOverride || 1) * fit.scale}><primitive object={clone} position={fit.offset} rotation={[0, Math.PI, 0]} onClick={interactive ? (e) => { e.stopPropagation(); onSelect?.('FULL VEHICLE') } : undefined} /></group>
}
useGLTF.preload(MODEL)

function GarageEnvironment() {
  return <group>
    <mesh position={[0, -0.1, 0]} receiveShadow><boxGeometry args={[22, 0.2, 18]} /><meshStandardMaterial color="#111a20" metalness={0.35} roughness={0.6} /></mesh>
    <gridHelper args={[22, 44, '#164554', '#07151b']} position={[0, 0.01, 0]} />
    <mesh position={[0, 4.5, -8.7]}><boxGeometry args={[22, 9, 0.25]} /><meshStandardMaterial color="#071017" roughness={0.8} /></mesh>
    <mesh position={[-10.9, 3, 0]}><boxGeometry args={[0.25, 6, 18]} /><meshStandardMaterial color="#071017" roughness={0.8} /></mesh>
    <mesh position={[10.9, 3, 0]}><boxGeometry args={[0.25, 6, 18]} /><meshStandardMaterial color="#071017" roughness={0.8} /></mesh>
    <mesh position={[0, 0.12, 0]}><boxGeometry args={[7.4, 0.12, 5.8]} /><meshStandardMaterial color="#29333a" metalness={0.75} roughness={0.25} /></mesh>
    {[[-3.2, 0.7, -2.5], [3.2, 0.7, -2.5], [-3.2, 0.7, 2.5], [3.2, 0.7, 2.5]].map((p, i) => <mesh key={i} position={p}><boxGeometry args={[0.18, 1.4, 0.18]} /><meshStandardMaterial color="#65727b" metalness={0.85} /></mesh>)}
    <group position={[-7.5, 1.2, -6.7]}><mesh><boxGeometry args={[4.4, 2.4, 0.7]} /><meshStandardMaterial color="#172229" metalness={0.65} /></mesh>{[-0.6, 0, 0.6].map((y) => <mesh key={y} position={[0, y, 0.38]}><boxGeometry args={[3.7, 0.08, 0.5]} /><meshStandardMaterial color="#65727b" metalness={0.8} /></mesh>)}</group>
    <group position={[7.4, 1.0, -6.7]}><mesh><boxGeometry args={[4, 2, 0.8]} /><meshStandardMaterial color="#18242b" metalness={0.65} /></mesh><mesh position={[0, 1.05, 0]}><boxGeometry args={[4, 0.12, 0.8]} /><meshStandardMaterial color="#7c8991" metalness={0.85} /></mesh><mesh position={[0, 0.55, 0.42]}><boxGeometry args={[3.4, 0.8, 0.04]} /><meshStandardMaterial color="#071017" emissive="#00313b" /></mesh></group>
    <group position={[-7.4, 1.2, 2.7]}><mesh><boxGeometry args={[3.4, 2.4, 1]} /><meshStandardMaterial color="#1c2930" metalness={0.6} /></mesh>{[0.35, 0.8, 1.25].map((y) => <mesh key={y} position={[0, y - 1.2, 0.52]}><boxGeometry args={[2.7, 0.04, 0.03]} /><meshStandardMaterial color="#22d3ee" emissive="#084d59" /></mesh>)}</group>
    {[-6, 0, 6].map((x) => <group key={x} position={[x, 5.1, 0]}><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 5.2, 12]} /><meshStandardMaterial color="#3d4a52" metalness={0.8} /></mesh><pointLight position={[0, -0.2, 0]} intensity={13} distance={7} color="#d8faff" /></group>)}
  </group>
}

function Hotspot({ position, label, onClick }) {
  return <group position={position} onClick={(e) => { e.stopPropagation(); onClick() }}><mesh><sphereGeometry args={[0.16, 16, 16]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.15} depthWrite={false} /></mesh><mesh rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.13, 0.17, 24]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.9} depthWrite={false} /></mesh><Html center distanceFactor={5} style={{ pointerEvents: 'none' }}><div className="hotspot-label">{label}</div></Html></group>
}

function Bolt({ position, removed, onClick, index }) {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current && !removed) ref.current.rotation.y += delta * 5 })
  if (removed) return null
  return <mesh ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onClick(index) }}><cylinderGeometry args={[0.055, 0.055, 0.045, 6]} /><meshStandardMaterial color="#c9d3da" metalness={0.9} roughness={0.2} /></mesh>
}

function EngineInspection({ coverOpen, bolts, onBolt, onToggleCover, exploded }) {
  return <group>
    <mesh position={[0, 0.95, 0]}><boxGeometry args={[1.05, 0.78, 0.82]} /><meshStandardMaterial color="#242b31" metalness={0.82} roughness={0.28} /></mesh>
    {Array.from({ length: 8 }).map((_, i) => <mesh key={i} position={[0, 0.68 + i * 0.075, 0.03]}><boxGeometry args={[1.18, 0.035, 0.76]} /><meshStandardMaterial color="#68737c" metalness={0.85} roughness={0.25} /></mesh>)}
    {!coverOpen && <group position={[0, 1.28, -0.48]}><mesh onClick={(e) => { e.stopPropagation(); onToggleCover() }}><boxGeometry args={[0.82, 0.58, 0.1]} /><meshStandardMaterial color="#111820" metalness={0.8} roughness={0.22} /></mesh>{[[-0.31, 0.2, -0.07], [0.31, 0.2, -0.07], [-0.31, -0.2, -0.07], [0.31, -0.2, -0.07]].map((p, i) => <Bolt key={i} position={p} removed={bolts[i]} onClick={onBolt} index={i} />)}</group>}
    {coverOpen && <group position={[0, 1.28, -0.58]}><mesh position={[0, 0, exploded ? -0.55 : 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.29, 0.29, 0.12, 32]} /><meshStandardMaterial color="#c47a35" metalness={0.72} roughness={0.3} /></mesh><mesh position={[0, 0.3, exploded ? -0.45 : 0]}><boxGeometry args={[0.16, 0.5, 0.16]} /><meshStandardMaterial color="#a9b4bc" metalness={0.85} roughness={0.2} /></mesh><mesh position={[0, -0.3, exploded ? -0.45 : 0]}><boxGeometry args={[0.62, 0.1, 0.18]} /><meshStandardMaterial color="#9ba6ae" metalness={0.82} roughness={0.22} /></mesh><Html position={[0, 0, 0.25]} center><div className="hotspot-label">ENGINE INTERNALS</div></Html></group>}
  </group>
}

function WorkshopScene({ selected, onSelect, engineOpen, bolts, onBolt, exploded, onToggleCover }) {
  const view = selected === 'ENGINE ASSEMBLY' ? VIEWS.engine : selected === 'FRONT' ? VIEWS.front : selected === 'REAR' ? VIEWS.rear : VIEWS.full
  return <><color attach="background" args={['#02070b']} /><ambientLight intensity={1.2} /><directionalLight position={[5, 8, 4]} intensity={4} castShadow /><pointLight position={[-4, 4, 2]} intensity={18} distance={14} color="#00d9ff" /><pointLight position={[4, 3, -4]} intensity={14} distance={12} color="#8b5cf6" /><Environment preset="warehouse" /><GarageEnvironment /><Suspense fallback={<Html center><div className="loading-text">LOADING REAL MOTORCYCLE...</div></Html>}><Bike onSelect={onSelect} /></Suspense>{selected === 'FULL VEHICLE' && <><Hotspot position={[0, 0.98, 0]} label="ENGINE" onClick={() => onSelect('ENGINE ASSEMBLY')} /><Hotspot position={[0, 0.72, 1.42]} label="FRONT" onClick={() => onSelect('FRONT')} /><Hotspot position={[0, 0.68, -1.35]} label="REAR" onClick={() => onSelect('REAR')} /></>}{selected === 'ENGINE ASSEMBLY' && <EngineInspection coverOpen={engineOpen} bolts={bolts} onBolt={onBolt} onToggleCover={onToggleCover} exploded={exploded} />}<ContactShadows position={[0, 0.02, 0]} opacity={0.55} scale={16} blur={2.5} far={10} /><CameraRig view={view} /></>
}

function TrackEnvironment() {
  const segments = useMemo(() => Array.from({ length: 96 }, (_, i) => { const t = (i / 96) * Math.PI * 2; const x = Math.cos(t) * 22; const z = Math.sin(t) * 14; const tangent = Math.atan2(Math.cos(t), -Math.sin(t)); return { x, z, rot: tangent, ox: Math.cos(t) * 25, oz: Math.sin(t) * 17, ix: Math.cos(t) * 19, iz: Math.sin(t) * 11 } }), [])
  return <group>
    <mesh position={[0, -0.12, 0]} receiveShadow><boxGeometry args={[65, 0.18, 50]} /><meshStandardMaterial color="#071014" roughness={0.95} /></mesh>
    {segments.map((s, i) => <group key={i}><mesh position={[s.x, 0, s.z]} rotation={[0, s.rot, 0]} receiveShadow><boxGeometry args={[4.8, 0.08, 1.55]} /><meshStandardMaterial color="#171a1d" roughness={0.9} /></mesh><mesh position={[s.ox, 0.3, s.oz]} rotation={[0, s.rot, 0]}><boxGeometry args={[0.3, 0.55, 1.55]} /><meshStandardMaterial color={i % 2 ? '#f0f0f0' : '#d8343d'} /></mesh><mesh position={[s.ix, 0.3, s.iz]} rotation={[0, s.rot, 0]}><boxGeometry args={[0.3, 0.55, 1.55]} /><meshStandardMaterial color={i % 2 ? '#f0f0f0' : '#d8343d'} /></mesh></group>)}
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[11, 19, 64]} /><meshStandardMaterial color="#090d10" side={THREE.DoubleSide} /></mesh>
    <group position={[22, 0.06, 0]}>{Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[0, 0, -2.75 + i * 0.5]}><boxGeometry args={[4.6, 0.03, 0.25]} /><meshStandardMaterial color={i % 2 ? '#f4f4f4' : '#df343d'} /></mesh>)}</group>
    <mesh position={[0, 0.8, -18]}><boxGeometry args={[46, 1.6, 0.35]} /><meshStandardMaterial color="#111a20" metalness={0.7} /></mesh>
    <mesh position={[0, 0.8, 18]}><boxGeometry args={[46, 1.6, 0.35]} /><meshStandardMaterial color="#111a20" metalness={0.7} /></mesh>
    {[-20, -10, 0, 10, 20].map((x) => <group key={x} position={[x, 3.1, -18]}><mesh><boxGeometry args={[0.16, 4.6, 0.16]} /><meshStandardMaterial color="#3d4a52" metalness={0.8} /></mesh><pointLight position={[0, -1.5, 0]} intensity={10} distance={10} color="#c8faff" /></group>)}
    <Html position={[0, 2.2, 0]} center><div className="track-world-label">VEHICLE LAB CIRCUIT</div></Html>
  </group>
}

function RideBike({ stats, onExit }) {
  const { scene } = useGLTF(MODEL)
  const clone = useMemo(() => scene.clone(true), [scene])
  const bike = useRef(); const keys = useRef({}); const speed = useRef(0); const [telemetry, setTelemetry] = useState({ speed: 0, gear: 1 })
  const fit = useMemo(() => { clone.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(clone); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3()); return { scale: 3.7 / Math.max(size.x, size.y, size.z), offset: new THREE.Vector3(-center.x, -box.min.y, -center.z) } }, [clone])
  useEffect(() => { const down = (e) => { keys.current[e.key.toLowerCase()] = true; if (e.key === 'Escape') onExit(); if (e.key.toLowerCase() === 'r' && bike.current) { bike.current.position.set(22, 0.05, 0); bike.current.rotation.set(0, 0, 0); speed.current = 0 } }; const up = (e) => { keys.current[e.key.toLowerCase()] = false }; window.addEventListener('keydown', down); window.addEventListener('keyup', up); return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) } }, [onExit])
  useFrame((state, delta) => {
    if (!bike.current) return
    const accel = keys.current.w || keys.current.arrowup; const brake = keys.current.s || keys.current.arrowdown; const steer = (keys.current.a || keys.current.arrowleft ? 1 : 0) - (keys.current.d || keys.current.arrowright ? 1 : 0)
    speed.current = THREE.MathUtils.damp(speed.current, accel ? 15 + stats.power * 0.08 : brake ? 0 : 2.2, brake ? 8 : 2.5, delta)
    bike.current.rotation.y += steer * delta * Math.min(0.9, speed.current / 9)
    bike.current.position.z += Math.cos(bike.current.rotation.y) * speed.current * delta
    bike.current.position.x += Math.sin(bike.current.rotation.y) * speed.current * delta
    bike.current.position.x = THREE.MathUtils.clamp(bike.current.position.x, -29, 29); bike.current.position.z = THREE.MathUtils.clamp(bike.current.position.z, -21, 21)
    bike.current.rotation.z = THREE.MathUtils.damp(bike.current.rotation.z, -steer * 0.12, 5, delta)
    const kmh = Math.round(speed.current * 7.2); setTelemetry({ speed: kmh, gear: Math.max(1, Math.min(6, Math.floor(kmh / 32) + 1)) })
    state.camera.position.lerp(new THREE.Vector3(bike.current.position.x + Math.sin(bike.current.rotation.y) * 5.8, 3.0, bike.current.position.z - Math.cos(bike.current.rotation.y) * 6.4), 0.08)
    state.camera.lookAt(bike.current.position.x, 1.0, bike.current.position.z)
  })
  useEffect(() => clone.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } }), [clone])
  return <><group ref={bike} position={[22, 0.05, 0]}><group scale={fit.scale}><primitive object={clone} position={fit.offset} rotation={[0, Math.PI, 0]} /></group></group><Html fullscreen><div className="ride-hud"><div className="ride-top"><span>TEST RIDE // CIRCUIT 01</span><button onClick={onExit}>EXIT GARAGE</button></div><div className="ride-speed"><b>{telemetry.speed}</b><span>KM/H</span></div><div className="ride-metrics"><span>GEAR <b>{telemetry.gear}</b></span><span>POWER <b>{stats.power} HP</b></span><span>GRIP <b>{stats.grip}%</b></span><span>BRAKING <b>{stats.braking}%</b></span></div><div className="ride-controls"><b>W / ↑</b> ACCELERATE <b>S / ↓</b> BRAKE <b>A D / ← →</b> STEER <b>R</b> RESET <b>ESC</b> GARAGE</div></div></Html></>
}

export default function VehicleLabFinal() {
  const [mode, setMode] = useState('workshop'); const [selected, setSelected] = useState('FULL VEHICLE'); const [engineOpen, setEngineOpen] = useState(false); const [exploded, setExploded] = useState(false); const [bolts, setBolts] = useState([false, false, false, false]); const [message, setMessage] = useState('DRAG TO ORBIT · SCROLL TO ZOOM · CLICK A PART TO INSPECT')
  const stats = { power: 68, weight: 196, grip: 82, braking: 80, handling: 78 }
  const selectPart = (part) => { setSelected(part); if (part === 'ENGINE ASSEMBLY') setMessage('ENGINE SELECTED · REMOVE ALL 4 FASTENERS'); else if (part === 'FRONT') setMessage('FRONT ASSEMBLY · INSPECT FORKS, BRAKES AND WHEEL'); else if (part === 'REAR') setMessage('REAR ASSEMBLY · INSPECT CHAIN, SPROCKET AND WHEEL'); else setMessage('FULL VEHICLE · DRAG TO ORBIT · SCROLL TO ZOOM') }
  const removeBolt = (i) => { const next = bolts.map((v, n) => n === i ? true : v); setBolts(next); setMessage(next.every(Boolean) ? 'ALL 4 FASTENERS REMOVED · OPEN ENGINE COVER' : `FASTENER ${i + 1} REMOVED · ${next.filter(Boolean).length}/4`) }
  const toggleCover = () => { if (!bolts.every(Boolean)) { setMessage('CANNOT OPEN COVER · REMOVE ALL 4 FASTENERS FIRST'); return } setEngineOpen(true); setMessage('ENGINE COVER REMOVED · INTERNALS EXPOSED') }
  const reset = () => { setSelected('FULL VEHICLE'); setEngineOpen(false); setExploded(false); setBolts([false, false, false, false]); setMessage('BUILD RESET · DRAG TO ORBIT · SCROLL TO ZOOM') }
  const enterRide = () => setMode('ride')
  return <div className="vehicle-lab">
    <Canvas camera={{ position: VIEWS.full.position, fov: 42 }} shadows dpr={[1, 2]}>
      {mode === 'workshop' ? <WorkshopScene selected={selected} onSelect={selectPart} engineOpen={engineOpen} bolts={bolts} onBolt={removeBolt} exploded={exploded} onToggleCover={toggleCover} /> : <><color attach="background" args={['#05080a']} /><fog attach="fog" args={['#05080a', 18, 70]} /><ambientLight intensity={1.05} /><directionalLight position={[8, 12, 6]} intensity={3.5} castShadow /><pointLight position={[0, 5, 0]} intensity={18} distance={25} color="#00d9ff" /><TrackEnvironment /><RideBike stats={stats} onExit={() => setMode('workshop')} /></>}
    </Canvas>
    <div className="lab-topbar"><div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">REAL 3D VEHICLE WORKSHOP // GARAGE + CIRCUIT</div></div><div className="vehicle-name">KAWASAKI NINJA 650 <span>2021 // GLB</span></div><div className="top-actions"><button className={mode === 'workshop' ? 'active' : ''} onClick={() => setMode('workshop')}>WORKSHOP</button><button className={mode === 'ride' ? 'active ride' : 'ride'} onClick={enterRide}>TEST RIDE</button></div></div>
    {mode === 'workshop' && <><aside className="parts-panel glass"><div className="panel-title">VEHICLE INSPECTION</div><button className={selected === 'FULL VEHICLE' ? 'part selected' : 'part'} onClick={reset}><span><b>Complete Motorcycle</b><small>FREE 3D ORBIT</small></span><strong>3D</strong></button><button className={selected === 'ENGINE ASSEMBLY' ? 'part selected' : 'part'} onClick={() => selectPart('ENGINE ASSEMBLY')}><span><b>Engine Assembly</b><small>ZOOM / OPEN / DISASSEMBLE</small></span><strong>OPEN</strong></button><button className={selected === 'FRONT' ? 'part selected' : 'part'} onClick={() => selectPart('FRONT')}><span><b>Front Assembly</b><small>FORK / BRAKE / WHEEL</small></span><strong>ZOOM</strong></button><button className={selected === 'REAR' ? 'part selected' : 'part'} onClick={() => selectPart('REAR')}><span><b>Rear Assembly</b><small>CHAIN / SPROCKET / WHEEL</small></span><strong>ZOOM</strong></button><div className="tool-box"><div className="panel-title">GARAGE TOOLS</div><div className="tools"><span>🔩 CLICK FASTENERS</span><span>🔧 REMOVE COMPONENTS</span><span>⚙ EXPLODE ASSEMBLY</span><span>🏁 ENTER RACE TRACK</span></div></div></aside><section className="center-callout"><div className="reticle">◈</div><div>{message}</div></section><aside className="stats-panel glass"><div className="panel-title">LIVE WORKSHOP STATE</div><div className="selected-card"><b>{selected}</b><span>{engineOpen ? 'ENGINE COVER REMOVED' : 'INTERACTIVE 3D INSPECTION'}</span></div><div className="stat">MODEL <b>GLB</b></div><div className="stat">FASTENERS <b>{bolts.filter(Boolean).length}/4</b></div><div className="stat">COVER <b>{engineOpen ? 'OPEN' : 'CLOSED'}</b></div>{!engineOpen && selected === 'ENGINE ASSEMBLY' && <button className="primary" onClick={toggleCover}>OPEN ENGINE COVER</button>}{engineOpen && <button className="primary" onClick={() => { setExploded(!exploded); setMessage(exploded ? 'ASSEMBLY RESTORED' : 'EXPLODED VIEW ACTIVE') }}>{exploded ? 'RESTORE ASSEMBLY' : 'EXPLODE ASSEMBLY'}</button>}<button className="primary" onClick={reset}>RESET BUILD</button><button className="ride-launch" onClick={enterRide}>🏁 TEST RIDE ON CIRCUIT</button></aside></>}
  </div>
}

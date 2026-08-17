import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Grid, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const STOCK = { power: 68, weight: 196, grip: 82, braking: 80, handling: 78 }
const UPGRADES = [
  { id: 'fairing', name: 'Carbon Fairing Kit', category: 'BODY', weight: -2 },
  { id: 'exhaust', name: 'Titanium Full Exhaust', category: 'PERFORMANCE', weight: -4, power: 5 },
  { id: 'wheels', name: 'Forged Wheel Set', category: 'WHEELS', weight: -3, grip: 5 },
  { id: 'brakes', name: 'Race Brake Kit', category: 'BRAKES', braking: 12 },
  { id: 'suspension', name: 'Track Suspension', category: 'SUSPENSION', handling: 10 },
]
const CAMERA_TARGETS = {
  bike: { target: [0, 1.15, 0], camera: [4.8, 3.0, 5.2] },
  engine: { target: [0, 1.0, 0], camera: [2.9, 1.7, 2.7] },
  engineCover: { target: [0, 1.0, -0.65], camera: [1.65, 1.35, 1.0] },
  front: { target: [0, 1.05, 1.25], camera: [2.1, 1.55, 2.5] },
  rear: { target: [0, 0.95, -1.15], camera: [2.2, 1.35, -2.45] },
  brakes: { target: [0.2, 0.52, 1.35], camera: [1.5, 0.8, 1.8] },
  wheels: { target: [0, 0.55, 0], camera: [3.2, 1.4, 3.2] },
  exhaust: { target: [0.42, 0.82, -0.8], camera: [1.9, 1.15, -1.8] },
  suspension: { target: [0, 1.05, 1.1], camera: [1.7, 1.7, 2.4] },
  fairing: { target: [0, 1.55, 0.55], camera: [2.2, 1.9, 2.2] },
  seat: { target: [0, 1.35, -0.55], camera: [2.0, 1.8, -1.5] },
}

function Metal({ color = '#606a73', metalness = 0.9, roughness = 0.24, emissive = '#000000' }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} emissive={emissive} />
}
function Bolt({ position, rotation = [Math.PI / 2, 0, 0], size = 0.045, loose, onClick }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current || !loose) return
    ref.current.rotation.z += delta * 14
    ref.current.position.y += delta * 0.14
  })
  if (loose === 'removed') return null
  return <mesh ref={ref} position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick() }}>
    <cylinderGeometry args={[size, size, size * 0.55, 6]} /><Metal color={loose ? '#22d3ee' : '#b9c4cc'} />
  </mesh>
}
function Tube({ a, b, radius = 0.035, color = '#555f68', onClick }) {
  const start = new THREE.Vector3(...a); const end = new THREE.Vector3(...b); const mid = start.clone().add(end).multiplyScalar(0.5); const len = start.distanceTo(end)
  return <mesh position={mid} onClick={onClick} scale={[1, len, 1]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize())}>
    <cylinderGeometry args={[radius, radius, 1, 12]} /><Metal color={color} />
  </mesh>
}
function Disc({ z, front = false, selected, onClick }) {
  return <group onClick={(e) => { e.stopPropagation(); onClick() }}>
    <mesh position={[0.16, 0.48, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[front ? 0.32 : 0.27, front ? 0.32 : 0.27, 0.028, 48]} /><Metal color={selected ? '#22d3ee' : '#aeb6bd'} /></mesh>
    <mesh position={[0.16, 0.48, z]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[front ? 0.25 : 0.2, 0.018, 8, 36]} /><Metal color="#353b42" /></mesh>
    <mesh position={[0.28, 0.56, z]}><boxGeometry args={[0.12, 0.22, 0.12]} /><Metal color="#242a30" /></mesh>
  </group>
}
function Wheel({ z, front, hidden, selected, onSelect }) {
  const rim = front ? 0.43 : 0.42
  return <group position={[0, 0.48, z]} onClick={(e) => { e.stopPropagation(); onSelect('wheels') }}>
    <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.46, 0.105, 18, 48]} /><Metal color={hidden ? '#24292e' : '#11161b'} metalness={0.45} roughness={0.32} /></mesh>
    <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[rim, 0.035, 10, 48]} /><Metal color={selected ? '#22d3ee' : '#bfc7ce'} /></mesh>
    {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <Tube key={i} a={[0, 0, 0]} b={[Math.cos(a) * rim, Math.sin(a) * rim, 0]} radius={0.012} color="#9ba6af" /> })}
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.075, 0.075, 0.13, 24]} /><Metal color="#4d5861" /></mesh>
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.055, 0.055, 0.145, 20]} /><Metal color="#171c21" /></mesh>
    <Disc z={0} front={front} selected={selected} onClick={() => onSelect('brakes')} />
  </group>
}
function Engine({ open, selected, boltState, onBolt, onSelect }) {
  const fins = Array.from({ length: 7 }, (_, i) => i)
  return <group onClick={(e) => { e.stopPropagation(); onSelect('engine') }}>
    <mesh position={[0, 0.94, 0]}><boxGeometry args={[0.82, 0.78, 0.82]} /><Metal color="#252b31" /></mesh>
    {fins.map((i) => <mesh key={i} position={[0, 0.72 + i * 0.07, 0.02]}><boxGeometry args={[0.98, 0.035, 0.76]} /><Metal color="#3f474f" /></mesh>)}
    <mesh position={[0, 1.23, 0.02]} scale={[0.42, 0.2, 0.5]}><sphereGeometry args={[1, 24, 16]} /><Metal color="#171c21" /></mesh>
    <mesh position={[0, 1.28, -0.43]}><boxGeometry args={[0.66, 0.5, 0.08]} /><Metal color={open ? '#11171c' : selected === 'engineCover' ? '#22d3ee' : '#66717a'} /></mesh>
    {!open && [[-0.25, 1.49, -0.49], [0.25, 1.49, -0.49], [-0.25, 1.08, -0.49], [0.25, 1.08, -0.49]].map((p, i) => <Bolt key={i} position={p} loose={boltState[`engine-${i}`]} onClick={() => onBolt(`engine-${i}`)} />)}
    {open && <group>
      <mesh position={[0, 1.28, -0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.31, 0.31, 0.08, 32]} /><Metal color="#c57a39" metalness={0.65} /></mesh>
      <mesh position={[0, 1.55, -0.5]}><boxGeometry args={[0.16, 0.48, 0.15]} /><Metal color="#9aa6af" /></mesh>
      <mesh position={[0, 0.98, -0.5]}><boxGeometry args={[0.54, 0.1, 0.16]} /><Metal color="#9aa6af" /></mesh>
      <mesh position={[0.27, 1.27, -0.51]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.1, 0.025, 8, 20]} /><Metal color="#d49a52" /></mesh>
    </group>}
    <mesh position={[0.51, 0.9, -0.03]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.15, 0.52, 20]} /><Metal color="#353d44" /></mesh>
    <mesh position={[-0.51, 0.9, -0.03]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.15, 0.52, 20]} /><Metal color="#353d44" /></mesh>
  </group>
}
const BikeModel = forwardRef(function BikeModel({ hidden, selected, onSelect, boltState, onBolt, exploded }, ref) {
  const ex = exploded ? 0.22 : 0
  return <group ref={ref} position={[0, 0.04, 0]}>
    <group position={[0, 0, ex]}>
      <Wheel z={1.52} front hidden={hidden.wheels} selected={selected === 'wheels'} onSelect={onSelect} />
      <Wheel z={-1.52} hidden={hidden.wheels} selected={selected === 'wheels'} onSelect={onSelect} />
    </group>
    <group position={[0, 0, ex * 0.2]}>
      <Tube a={[0, 0.55, 1.45]} b={[0, 1.55, 0.35]} radius={0.055} color="#59636c" />
      <Tube a={[0, 0.55, -1.42]} b={[0, 1.28, -0.35]} radius={0.065} color="#59636c" />
      <Tube a={[0, 1.42, 0.35]} b={[0, 0.82, -1.12]} radius={0.055} color="#3c464e" />
      <Tube a={[-0.28, 0.82, -1.1]} b={[0.28, 0.82, -1.1]} radius={0.04} color="#3c464e" />
      <Tube a={[-0.32, 0.9, -0.3]} b={[0.32, 0.9, -0.3]} radius={0.04} color="#3c464e" />
      <Tube a={[0, 1.35, 0.45]} b={[0, 1.75, 1.42]} radius={0.055} color="#69747d" />
      <Tube a={[0, 1.75, 1.42]} b={[0, 1.62, 1.68]} radius={0.05} color="#69747d" />
      <Engine open={hidden.engineCover} selected={selected} boltState={boltState} onBolt={onBolt} onSelect={onSelect} />
      <mesh position={[0, 1.55, 0.38]} scale={[0.68, 0.33, 0.88]} onClick={(e) => { e.stopPropagation(); onSelect('fairing') }}><sphereGeometry args={[1, 32, 20]} /><Metal color={selected === 'fairing' ? '#22d3ee' : '#10161b'} metalness={0.68} roughness={0.2} emissive={selected === 'fairing' ? '#073c45' : '#000'} /></mesh>
      {!hidden.fairing && <group>
        <mesh position={[0, 1.18, 0.94]} scale={[0.52, 0.3, 0.62]}><sphereGeometry args={[1, 28, 16]} /><Metal color="#171d23" metalness={0.48} /></mesh>
        <mesh position={[0, 1.18, 1.02]} scale={[0.3, 0.16, 0.42]}><sphereGeometry args={[1, 24, 14]} /><meshStandardMaterial color="#0a0d10" roughness={0.35} /></mesh>
        <mesh position={[0, 1.1, -0.82]} scale={[0.55, 0.24, 0.65]}><boxGeometry args={[1, 1, 1]} /><Metal color="#0d1217" metalness={0.4} /></mesh>
        {[-0.3, 0.3].map((x) => <Bolt key={x} position={[x, 1.38, 0.47]} size={0.035} loose={boltState[`fairing-${x}`]} onClick={() => onBolt(`fairing-${x}`)} />)}
      </group>}
      <mesh position={[0, 1.38, -0.55]} scale={[0.45, 0.15, 0.9]} onClick={(e) => { e.stopPropagation(); onSelect('seat') }}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#080a0c" roughness={0.78} /></mesh>
      <mesh position={[0, 1.42, -0.98]} scale={[0.28, 0.16, 0.5]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#10151a" roughness={0.7} /></mesh>
      <Tube a={[0, 1.6, 0.9]} b={[0, 1.74, 1.52]} radius={0.035} color="#a5afb7" />
      <Tube a={[0, 1.74, 1.52]} b={[0, 1.9, 1.62]} radius={0.025} color="#a5afb7" />
      <Tube a={[-0.42, 1.75, 1.42]} b={[0.42, 1.75, 1.42]} radius={0.035} color="#252c32" />
      <mesh position={[0, 1.76, 1.42]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 0.32, 18]} /><Metal color="#69747d" /></mesh>
      <mesh position={[0.42, 1.76, 1.42]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 0.28, 16]} /><Metal color="#161b20" /></mesh>
      <mesh position={[-0.42, 1.76, 1.42]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 0.28, 16]} /><Metal color="#161b20" /></mesh>
      <Disc z={1.52} front selected={selected === 'brakes'} onClick={() => onSelect('brakes')} />
      <Tube a={[0.22, 0.54, 1.48]} b={[0.22, 1.5, 1.48]} radius={0.055} color={selected === 'suspension' ? '#22d3ee' : '#b9c0c6'} onClick={() => onSelect('suspension')} />
      <Tube a={[-0.22, 0.54, 1.48]} b={[-0.22, 1.5, 1.48]} radius={0.055} color="#b9c0c6" />
      <mesh position={[0.28, 0.92, -1.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 1.2, 16]} /><Metal color="#20262c" /></mesh>
      <mesh position={[0.39, 0.88, -0.98]} rotation={[Math.PI / 2, 0, 0]} onClick={(e) => { e.stopPropagation(); onSelect('exhaust') }}><cylinderGeometry args={[0.12, 0.16, 1.55, 24]} /><Metal color={selected === 'exhaust' ? '#d8f9ff' : '#909ba5'} metalness={1} roughness={0.18} emissive={selected === 'exhaust' ? '#103b44' : '#000'} /></mesh>
      {!hidden.exhaust && <group><Tube a={[0.28, 1.0, -0.2]} b={[0.4, 0.9, -0.9]} radius={0.04} color="#c5cdd3" /><Tube a={[0.28, 0.94, 0.05]} b={[0.4, 0.88, -0.9]} radius={0.04} color="#c5cdd3" /></group>}
      <group onClick={(e) => { e.stopPropagation(); onSelect('chain') }}>
        <mesh position={[0.34, 0.55, -0.88]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.018, 6, 32]} /><Metal color="#aab2b8" /></mesh>
        <mesh position={[0.34, 0.55, -0.88]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.27, 0.014, 6, 32]} /><Metal color="#555e65" /></mesh>
      </group>
      <mesh position={[0.28, 0.67, -0.4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 0.55, 16]} /><Metal color="#59636b" /></mesh>
      <mesh position={[-0.36, 0.62, -0.5]}><boxGeometry args={[0.1, 0.16, 0.42]} /><Metal color="#2d353c" /></mesh>
    </group>
    {hidden.fairing && <group position={[0, 0, 0.08]}><mesh position={[0.62, 1.2, 0.55]} scale={[0.08, 0.48, 0.72]}><boxGeometry args={[1, 1, 1]} /><Metal color="#0f161b" /></mesh><mesh position={[-0.62, 1.2, 0.55]} scale={[0.08, 0.48, 0.72]}><boxGeometry args={[1, 1, 1]} /><Metal color="#0f161b" /></mesh></group>}
  </group>
})

function Scene({ state, setMessage, onSelect }) {
  const bikeRef = useRef(); const controls = useRef(); const keys = useRef({}); const speed = useRef(0)
  useEffect(() => { const down = (e) => { keys.current[e.key.toLowerCase()] = true }; const up = (e) => { keys.current[e.key.toLowerCase()] = false }; window.addEventListener('keydown', down); window.addEventListener('keyup', up); return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) } }, [])
  useEffect(() => { if (!controls.current || state.mode === 'ride') return; const preset = CAMERA_TARGETS[state.selected] || CAMERA_TARGETS.bike; controls.current.target.set(...preset.target); controls.current.object.position.set(...preset.camera); controls.current.update() }, [state.selected, state.mode])
  useFrame((frame, delta) => {
    if (!bikeRef.current) return
    if (state.mode === 'ride') {
      const accel = keys.current.w || keys.current.arrowup; const brake = keys.current.s || keys.current.arrowdown
      const steer = (keys.current.a || keys.current.arrowleft ? 1 : 0) - (keys.current.d || keys.current.arrowright ? 1 : 0)
      speed.current = THREE.MathUtils.damp(speed.current, accel ? 17 + state.stats.power * 0.04 : brake ? 0 : 4, 3.5, delta)
      bikeRef.current.rotation.y += steer * delta * Math.min(0.9, speed.current / 12)
      bikeRef.current.position.z += Math.cos(bikeRef.current.rotation.y) * speed.current * delta
      bikeRef.current.position.x += Math.sin(bikeRef.current.rotation.y) * speed.current * delta
      frame.camera.position.lerp(new THREE.Vector3(bikeRef.current.position.x + Math.sin(bikeRef.current.rotation.y) * 4.8, 2.8, bikeRef.current.position.z - Math.cos(bikeRef.current.rotation.y) * 5.4), 0.08)
      frame.camera.lookAt(bikeRef.current.position.x, 1.05, bikeRef.current.position.z)
    }
  })
  return <>
    <color attach="background" args={['#02070b']} />
    <fog attach="fog" args={['#02070b', 10, 35]} />
    <ambientLight intensity={1.35} /><directionalLight position={[5, 8, 4]} intensity={3.2} castShadow shadow-mapSize={[2048, 2048]} />
    <pointLight position={[-5, 4, 2]} color="#00d9ff" intensity={20} distance={12} /><pointLight position={[5, 3, -4]} color="#8b5cf6" intensity={14} distance={11} />
    <Environment preset="warehouse" /><Grid args={[50, 50]} cellSize={0.5} cellThickness={0.6} cellColor="#124553" sectionSize={5} sectionThickness={1.2} sectionColor="#0c7487" fadeDistance={32} /><ContactShadows position={[0, 0, 0]} opacity={0.55} scale={30} blur={2.5} far={9} />
    <BikeModel ref={bikeRef} hidden={state.hidden} selected={state.selected} onSelect={onSelect} boltState={state.boltState} onBolt={state.onBolt} exploded={state.exploded} />
    {state.mode !== 'ride' ? <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={1.3} maxDistance={9} target={[0, 1.15, 0]} enableDamping dampingFactor={0.08} /> : <Html fullscreen><div className="ride-hint">WASD / ARROWS TO RIDE · ESC TO EXIT</div></Html>}
  </>
}

export default function VehicleLabV2() {
  const [mode, setMode] = useState('configure'); const [selected, setSelected] = useState('engineCover'); const [exploded, setExploded] = useState(false)
  const [hidden, setHidden] = useState({ fairing: false, exhaust: false, wheels: false, engineCover: false }); const [boltState, setBoltState] = useState({}); const [installed, setInstalled] = useState({}); const [message, setMessage] = useState('SELECT A COMPONENT — CAMERA WILL ZOOM TO IT')
  const stats = useMemo(() => { const s = { ...STOCK }; UPGRADES.forEach((p) => { if (installed[p.id]) Object.keys(s).forEach((k) => { s[k] += p[k] || 0 }) }); return s }, [installed])
  const select = (id) => { setSelected(id); setMessage(`${id.replace(/([A-Z])/g, ' $1').toUpperCase()} SELECTED — INSPECT THE ASSEMBLY`); if (id === 'fairing') setMessage('FAIRING SELECTED — REMOVE ITS FASTENERS TO EXPOSE THE FRAME') }
  const bolt = (id) => { if (boltState[id]) return; setBoltState((v) => ({ ...v, [id]: true })); setMessage(`FASTENER ${id.toUpperCase()} LOOSENED — REMOVE THE COMPONENT WHEN READY`); setTimeout(() => setBoltState((v) => ({ ...v, [id]: 'removed' })), 650) }
  const toggle = (id) => { if (id === 'engineCover') { const bolts = ['engine-0', 'engine-1', 'engine-2', 'engine-3']; const all = bolts.every((b) => boltState[b] === 'removed'); if (!all && !hidden.engineCover) { setMessage('REMOVE ALL 4 ENGINE COVER BOLTS FIRST'); return } } setHidden((v) => ({ ...v, [id]: !v[id] })); setMessage(hidden[id] ? `${id.toUpperCase()} REINSTALLED` : `${id.toUpperCase()} REMOVED — INTERNALS EXPOSED`) }
  const install = (id) => { setInstalled((v) => ({ ...v, [id]: !v[id] })); setMessage(`${id.toUpperCase()} ${installed[id] ? 'REMOVED' : 'UPGRADED'} — PERFORMANCE RECALCULATED`) }
  useEffect(() => { const onKey = (e) => { if (e.key === 'Escape' && mode === 'ride') setMode('configure') }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [mode])
  const selectedName = selected === 'engineCover' ? 'ENGINE COVER' : (UPGRADES.find((p) => p.id === selected)?.name || selected.replace(/([A-Z])/g, ' $1').toUpperCase())
  return <div className="vehicle-lab">
    <Canvas camera={{ position: [4.8, 3, 5.2], fov: 40 }} shadows dpr={[1, 2]}><Scene state={{ mode, selected, hidden, boltState, exploded, stats, onBolt: bolt }} onSelect={select} setMessage={setMessage} /></Canvas>
    <div className="lab-topbar"><div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">3D MECHANICAL SIMULATION // WORKSHOP BUILD 02</div></div><div className="vehicle-name">KAWASAKI // NINJA 650 <span>2021</span></div><div className="top-actions"><button onClick={() => setMode('configure')} className={mode === 'configure' ? 'active' : ''}>WORKSHOP</button><button onClick={() => setMode('ride')} className={mode === 'ride' ? 'active ride' : 'ride'}>TEST RIDE</button></div></div>
    {mode !== 'ride' && <>
      <aside className="parts-panel glass"><div className="panel-title">WORKSHOP COMPONENTS</div><div className="part-list">{UPGRADES.map((p) => <button key={p.id} className={selected === p.id ? 'part selected' : 'part'} onClick={() => select(p.id)}><span><b>{p.name}</b><small>{p.category}</small></span><strong onClick={(e) => { e.stopPropagation(); install(p.id) }}>{installed[p.id] ? 'INSTALLED' : 'STOCK'}</strong></button>)}<button className={selected === 'engineCover' ? 'part selected' : 'part'} onClick={() => select('engineCover')}><span><b>Engine Cover</b><small>ENGINE / 4 FASTENERS</small></span><strong>{hidden.engineCover ? 'OPEN' : 'CLOSED'}</strong></button><button className={selected === 'engine' ? 'part selected' : 'part'} onClick={() => select('engine')}><span><b>Engine Assembly</b><small>INTERNAL INSPECTION</small></span><strong>INSPECT</strong></button><button className={selected === 'brakes' ? 'part selected' : 'part'} onClick={() => select('brakes')}><span><b>Brake System</b><small>DISC / CALIPER</small></span><strong>INSPECT</strong></button><button className={selected === 'chain' ? 'part selected' : 'part'} onClick={() => select('chain')}><span><b>Final Drive</b><small>CHAIN / SPROCKET</small></span><strong>INSPECT</strong></button></div><div className="tool-box"><div className="panel-title">TOOLS</div><div className="tools"><span>🔧 SOCKET — FASTENERS</span><span>🪛 DRIVER — COVERS</span><span>⚙ TORQUE — ASSEMBLY</span><span>🔍 INSPECT — INTERNALS</span></div></div></aside>
      <section className="center-callout"><div className="reticle">◈</div><div>{message}</div></section>
      <aside className="stats-panel glass"><div className="panel-title">LIVE VEHICLE STATE</div>{Object.entries(stats).map(([k, v]) => <div className="stat" key={k}><span>{k.toUpperCase()}</span><b>{k === 'weight' ? `${v} KG` : k === 'power' ? `${v} HP` : `${Math.round(v)}%`}</b><i><em style={{ width: `${Math.min(100, Math.max(8, v))}%` }} /></i></div>)}<div className="divider" /><div className="panel-title">SELECTED PART</div><div className="selected-card"><b>{selectedName}</b><span>3D COMPONENT // PHYSICALLY INTERACTIVE</span></div>{selected === 'engineCover' && <button className="primary" onClick={() => toggle('engineCover')}>{hidden.engineCover ? 'REINSTALL ENGINE COVER' : 'REMOVE ENGINE COVER'}</button>}{['fairing', 'exhaust', 'wheels'].includes(selected) && <button className="primary" onClick={() => toggle(selected)}>{hidden[selected] ? `REINSTALL ${selected.toUpperCase()}` : `REMOVE ${selected.toUpperCase()}`}</button>}<button className="secondary" onClick={() => setExploded((v) => !v)}>{exploded ? 'CLOSE EXPLODED VIEW' : 'EXPLODE ASSEMBLY'}</button><button className="secondary" onClick={() => { setHidden({ fairing: false, exhaust: false, wheels: false, engineCover: false }); setBoltState({}); setInstalled({}); setExploded(false); setMessage('BUILD RESET — ALL COMPONENTS REINSTALLED') }}>RESET BUILD</button></aside>
    </>}
    <div className="bottom-hud"><span><b>DRAG</b> ORBIT CAMERA</span><span><b>SCROLL</b> ZOOM</span><span><b>CLICK</b> SELECT PART</span><span><b>CLICK BOLT</b> LOOSEN / REMOVE</span><span><b>EXPLODE</b> INSPECT ASSEMBLY</span></div>
  </div>
}

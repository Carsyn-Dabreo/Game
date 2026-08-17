import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Grid, Html, OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const PARTS = [
  { id: 'fairing', name: 'Carbon Fairing', category: 'BODY', weight: -2, power: 0 },
  { id: 'exhaust', name: 'Titanium Exhaust', category: 'PERFORMANCE', weight: -4, power: 5 },
  { id: 'wheels', name: 'Forged Wheels', category: 'WHEELS', weight: -3, grip: 5 },
  { id: 'brakes', name: 'Race Brakes', category: 'BRAKES', weight: 0, braking: 12 },
  { id: 'suspension', name: 'Track Suspension', category: 'SUSPENSION', weight: 0, handling: 10 },
]
const STOCK = { power: 68, weight: 196, grip: 82, braking: 80, handling: 78 }

function Screw({ position, removed, onClick }) {
  if (removed) return null
  return <mesh position={position} rotation={[Math.PI / 2, 0, 0]} onClick={(e) => { e.stopPropagation(); onClick() }}><cylinderGeometry args={[0.045, 0.045, 0.025, 12]} /><meshStandardMaterial color="#a9b4bf" metalness={0.9} roughness={0.25} /></mesh>
}

const BikeModel = forwardRef(function BikeModel({ hidden, selected, onSelect, removedScrews }, ref) {
  return <group ref={ref} position={[0, 0.05, 0]}>
    <group onClick={(e) => { e.stopPropagation(); onSelect('wheels') }}>
      <mesh position={[0, 0.45, 1.45]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.43, 0.43, 0.18, 32]} /><meshStandardMaterial color={hidden.wheels ? '#333' : '#151a20'} metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.45, -1.45]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.43, 0.43, 0.18, 32]} /><meshStandardMaterial color={hidden.wheels ? '#333' : '#151a20'} metalness={0.7} roughness={0.3} /></mesh>
      {[1.45, -1.45].map((z) => <mesh key={z} position={[0, 0.45, z]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.38, 0.055, 12, 32]} /><meshStandardMaterial color="#d7dde4" metalness={0.9} roughness={0.2} /></mesh>)}
    </group>
    <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.78, 0.08, 8, 4]} /><meshStandardMaterial color="#252b32" metalness={0.85} roughness={0.25} /></mesh>
    <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.14, 1.45, 0.14]} /><meshStandardMaterial color="#353b43" metalness={0.8} roughness={0.3} /></mesh>

    <group onClick={(e) => { e.stopPropagation(); onSelect('engine') }}>
      <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.65, 0.7, 0.8]} /><meshStandardMaterial color="#292f36" metalness={0.9} roughness={0.28} /></mesh>
      {!hidden.engineCover && <mesh position={[0, 0.88, -0.43]} onClick={(e) => { e.stopPropagation(); onSelect('engineCover') }}><boxGeometry args={[0.7, 0.55, 0.08]} /><meshStandardMaterial color={selected === 'engineCover' ? '#1de9ff' : '#56616c'} metalness={0.85} roughness={0.25} emissive={selected === 'engineCover' ? '#073a44' : '#000'} /></mesh>}
      {hidden.engineCover && <group><mesh position={[0, 0.88, -0.47]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.12, 16]} /><meshStandardMaterial color="#c87938" metalness={0.5} roughness={0.35} /></mesh><mesh position={[0, 1.15, -0.47]}><boxGeometry args={[0.12, 0.42, 0.12]} /><meshStandardMaterial color="#8d9aa7" metalness={0.8} roughness={0.3} /></mesh><mesh position={[0, 0.62, -0.47]}><boxGeometry args={[0.5, 0.08, 0.12]} /><meshStandardMaterial color="#8d9aa7" metalness={0.8} roughness={0.3} /></mesh></group>}
      {!hidden.engineCover && [[-0.26, 1.08, -0.49], [0.26, 1.08, -0.49], [-0.26, 0.68, -0.49], [0.26, 0.68, -0.49]].map((p, i) => <Screw key={i} position={p} removed={removedScrews.includes(`engine-${i}`)} onClick={() => onSelect(`screw:engine-${i}`)} />)}
    </group>

    <mesh position={[0, 1.55, 0.2]} scale={[0.58, 0.38, 0.9]} onClick={(e) => { e.stopPropagation(); onSelect('fairing') }}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={selected === 'fairing' ? '#22d3ee' : '#111820'} metalness={0.55} roughness={0.22} emissive={selected === 'fairing' ? '#063b43' : '#000'} /></mesh>
    {!hidden.fairing && <group><mesh position={[0, 1.18, 0.85]} scale={[0.5, 0.3, 0.6]}><sphereGeometry args={[1, 20, 12]} /><meshStandardMaterial color="#161b21" metalness={0.4} roughness={0.3} /></mesh><mesh position={[0, 1.08, -0.85]} scale={[0.46, 0.22, 0.65]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#0c1116" metalness={0.3} roughness={0.35} /></mesh></group>}
    <mesh position={[0, 1.0, 1.18]} rotation={[Math.PI / 2.3, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 1.35, 12]} /><meshStandardMaterial color="#bbc3ca" metalness={0.95} roughness={0.2} /></mesh>
    <mesh position={[0, 1.68, 1.05]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 1.15, 12]} /><meshStandardMaterial color="#1f252b" metalness={0.8} roughness={0.3} /></mesh>
    {!hidden.exhaust && <group onClick={(e) => { e.stopPropagation(); onSelect('exhaust') }}><mesh position={[0.34, 0.78, -0.75]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.11, 0.14, 1.35, 18]} /><meshStandardMaterial color={selected === 'exhaust' ? '#d7f7ff' : '#8f9aa4'} metalness={1} roughness={0.2} emissive={selected === 'exhaust' ? '#16444d' : '#000'} /></mesh></group>}
    {hidden.exhaust && <mesh position={[0.34, 0.78, -0.75]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.09, 0.85, 18]} /><meshStandardMaterial color="#b76d34" metalness={0.7} /></mesh>}
    <group onClick={(e) => { e.stopPropagation(); onSelect('brakes') }}><mesh position={[0.11, 0.45, 1.45]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.29, 0.29, 0.025, 32]} /><meshStandardMaterial color={selected === 'brakes' ? '#22d3ee' : '#d5d8dc'} metalness={0.9} roughness={0.25} /></mesh><mesh position={[0.11, 0.45, -1.45]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.24, 0.24, 0.025, 32]} /><meshStandardMaterial color="#d5d8dc" metalness={0.9} roughness={0.25} /></mesh></group>
    <mesh position={[0, 1.42, -0.75]} scale={[0.42, 0.16, 0.85]} onClick={(e) => { e.stopPropagation(); onSelect('seat') }}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#090b0d" roughness={0.75} /></mesh>
  </group>
})

function GarageScene({ hidden, selected, onSelect, removedScrews, ride }) {
  const bikeRef = useRef(); const keys = useRef({}); const speed = useRef(0)
  useEffect(() => { const down = (e) => { keys.current[e.key.toLowerCase()] = true }; const up = (e) => { keys.current[e.key.toLowerCase()] = false }; window.addEventListener('keydown', down); window.addEventListener('keyup', up); return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) } }, [])
  useFrame((state, delta) => { if (!bikeRef.current || !ride) return; const accelerating = keys.current.w || keys.current.arrowup; const braking = keys.current.s || keys.current.arrowdown; const steer = (keys.current.a || keys.current.arrowleft ? 1 : 0) - (keys.current.d || keys.current.arrowright ? 1 : 0); speed.current = THREE.MathUtils.damp(speed.current, accelerating ? 18 : braking ? 0 : 5, 4, delta); bikeRef.current.rotation.y += steer * delta * Math.min(1, speed.current / 8); bikeRef.current.position.z += speed.current * delta; bikeRef.current.position.x += Math.sin(bikeRef.current.rotation.y) * speed.current * delta * 0.45; state.camera.position.lerp(new THREE.Vector3(bikeRef.current.position.x, 3.2, bikeRef.current.position.z - 5.5), 0.08); state.camera.lookAt(bikeRef.current.position.x, 1, bikeRef.current.position.z) })
  return <><ambientLight intensity={1.2} /><directionalLight position={[5, 8, 4]} intensity={3} castShadow /><pointLight position={[-4, 4, 1]} color="#00d9ff" intensity={18} distance={12} /><pointLight position={[5, 3, -3]} color="#8b5cf6" intensity={12} distance={10} /><Environment preset="warehouse" /><Grid args={[40, 40]} cellSize={0.5} cellThickness={0.7} cellColor="#164554" sectionSize={5} sectionThickness={1.3} sectionColor="#0f8195" fadeDistance={30} /><ContactShadows position={[0, 0, 0]} opacity={0.55} scale={30} blur={2.5} far={8} /><BikeModel ref={bikeRef} hidden={hidden} selected={selected} onSelect={onSelect} removedScrews={removedScrews} />{!ride && <OrbitControls makeDefault enablePan={false} minDistance={2.5} maxDistance={8} target={[0, 1, 0]} />}{ride && <Html fullscreen><div className="ride-hint">WASD / ARROWS TO RIDE · ESC TO EXIT</div></Html>}</>
}

export default function VehicleLab() {
  const [mode, setMode] = useState('configure'); const [selected, setSelected] = useState('engineCover'); const [hidden, setHidden] = useState({ fairing: false, exhaust: false, wheels: false, engineCover: false }); const [removedScrews, setRemovedScrews] = useState([]); const [installed, setInstalled] = useState({}); const [message, setMessage] = useState('Select a component. The camera is fully 3D.')
  const stats = useMemo(() => { const s = { ...STOCK }; PARTS.forEach((p) => { if (installed[p.id]) { s.power += p.power || 0; s.weight += p.weight || 0; s.grip += p.grip || 0; s.braking += p.braking || 0; s.handling += p.handling || 0 } }); return s }, [installed])
  const select = (id) => { if (id.startsWith('screw:')) { const screw = id.slice(6); setRemovedScrews((v) => v.includes(screw) ? v.filter((x) => x !== screw) : [...v, screw]); setMessage('Screw removed. Inspect the exposed assembly.'); return } setSelected(id); setMessage(id === 'engineCover' ? 'Engine cover selected. Remove it to inspect the internals.' : `${id.toUpperCase()} selected.`) }
  const togglePart = (id) => { setHidden((v) => ({ ...v, [id]: !v[id] })); setMessage(hidden[id] ? `${id} installed.` : `${id} removed. You can inspect what is underneath.`) }
  useEffect(() => { const onKey = (e) => { if (e.key === 'Escape' && mode === 'ride') setMode('configure') }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [mode])
  return <div className="vehicle-lab">
    <Canvas camera={{ position: [4.8, 3.2, 5.5], fov: 42 }} shadows dpr={[1, 2]}><GarageScene hidden={hidden} selected={selected} onSelect={select} removedScrews={removedScrews} ride={mode === 'ride'} /></Canvas>
    <div className="lab-topbar"><div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">3D MECHANICAL SIMULATION</div></div><div className="vehicle-name">KAWASAKI // NINJA 650 <span>2021</span></div><div className="top-actions"><button onClick={() => setMode('configure')} className={mode === 'configure' ? 'active' : ''}>WORKSHOP</button><button onClick={() => setMode('ride')} className={mode === 'ride' ? 'active ride' : 'ride'}>TEST RIDE</button></div></div>
    {mode !== 'ride' && <><aside className="parts-panel glass"><div className="panel-title">COMPONENTS</div><div className="part-list">{PARTS.map((p) => <button key={p.id} className={selected === p.id ? 'part selected' : 'part'} onClick={() => select(p.id)}><span><b>{p.name}</b><small>{p.category}</small></span><strong>{installed[p.id] ? 'UPGRADED' : 'STOCK'}</strong></button>)}<button className={selected === 'engineCover' ? 'part selected' : 'part'} onClick={() => select('engineCover')}><span><b>Engine Cover</b><small>ENGINE / 4 BOLTS</small></span><strong>{hidden.engineCover ? 'OPEN' : 'CLOSED'}</strong></button></div><div className="tool-box"><div className="panel-title">TOOLS</div><div className="tools"><span>🔧 SOCKET</span><span>🪛 DRIVER</span><span>⚙ TORQUE</span></div></div></aside>
      <section className="center-callout"><div className="reticle">◈</div><div>{message}</div></section>
      <aside className="stats-panel glass"><div className="panel-title">LIVE TELEMETRY</div>{Object.entries(stats).map(([k, v]) => <div className="stat" key={k}><span>{k.toUpperCase()}</span><b>{v}{k === 'power' ? ' HP' : k === 'weight' ? ' KG' : '%'}</b><i><em style={{ width: `${Math.min(100, k === 'weight' ? Math.max(20, 100 - (v - 180)) : v)}%` }} /></i></div>)}<div className="divider" /><div className="panel-title">SELECTED PART</div><div className="selected-card"><b>{selected === 'engineCover' ? 'ENGINE COVER' : selected.toUpperCase()}</b><span>CLICK THE 3D PART TO INSPECT</span></div>{selected === 'engineCover' && <button className="primary" onClick={() => togglePart('engineCover')}>{hidden.engineCover ? 'CLOSE ENGINE COVER' : 'REMOVE ENGINE COVER'}</button>}{['exhaust', 'fairing', 'wheels'].includes(selected) && <button className="primary" onClick={() => togglePart(selected)}>{hidden[selected] ? `INSTALL ${selected.toUpperCase()}` : `REMOVE ${selected.toUpperCase()}`}</button>}{PARTS.some((p) => p.id === selected) && <button className="primary" onClick={() => { setInstalled((v) => ({ ...v, [selected]: !v[selected] })); setMessage(`${selected} ${installed[selected] ? 'returned to stock' : 'upgraded'}.`) }}>{installed[selected] ? 'RETURN TO STOCK' : 'INSTALL UPGRADE'}</button>}<button className="secondary" onClick={() => { setRemovedScrews([]); setHidden({ fairing: false, exhaust: false, wheels: false, engineCover: false }); setInstalled({}); setMessage('Vehicle reset to stock configuration.') }}>RESET BUILD</button></aside>
      <div className="bottom-hud glass"><span><b>DRAG / ROTATE</b> orbit camera</span><span><b>SCROLL</b> zoom</span><span><b>CLICK</b> select component</span><span><b>CLICK SCREW</b> remove fastener</span></div></>}
  </div>
}

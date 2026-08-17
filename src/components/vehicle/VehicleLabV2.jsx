import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Grid, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PARTS = [
  ['fairing', 'Carbon Fairing', 'BODY'],
  ['exhaust', 'Titanium Exhaust', 'PERFORMANCE'],
  ['wheels', 'Forged Wheels', 'WHEELS'],
  ['brakes', 'Race Brakes', 'BRAKES'],
  ['suspension', 'Track Suspension', 'SUSPENSION'],
  ['engine', 'Engine Assembly', 'ENGINE'],
]

function Mat({ color = '#20262c', metal = 0.75, rough = 0.25 }) {
  return <meshStandardMaterial color={color} metalness={metal} roughness={rough} />
}

function Beam({ a, b, r = 0.035, color = '#56616b' }) {
  const va = useMemo(() => new THREE.Vector3(...a), [a.join(',')])
  const vb = useMemo(() => new THREE.Vector3(...b), [b.join(',')])
  const mid = useMemo(() => va.clone().add(vb).multiplyScalar(.5), [va, vb])
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize()), [va, vb])
  return <mesh position={mid} quaternion={q}><cylinderGeometry args={[r, r, va.distanceTo(vb), 12]} /><Mat color={color} /></mesh>
}

function Wheel({ z, front, removed, selected, onClick, moving = false }) {
  const ref = useRef()
  useFrame((_, d) => { if (moving && ref.current) ref.current.rotation.x -= d * 8 })
  if (removed) return null
  return <group ref={ref} position={[0, .52, z]} onClick={e => { e.stopPropagation(); onClick('wheels') }}>
    <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[.48, .105, 20, 48]} /><Mat color="#090d11" metal={.35} rough={.3} /></mesh>
    <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[.40, .035, 12, 48]} /><Mat color={selected ? '#22d3ee' : '#c7d0d7'} /></mesh>
    {Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI * 2 / 10; return <Beam key={i} a={[0, 0, 0]} b={[Math.cos(a) * .39, Math.sin(a) * .39, 0]} r={.012} color="#8d99a3" /> })}
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.08, .08, .16, 24]} /><Mat color="#313a42" /></mesh>
    {front && <mesh position={[.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.25, .25, .035, 40]} /><Mat color="#9da7af" /></mesh>}
  </group>
}

function Engine({ coverOpen, removed, selected, onClick }) {
  if (removed) return null
  return <group onClick={e => { e.stopPropagation(); onClick('engine') }}>
    <mesh position={[0, .92, 0]}><boxGeometry args={[.86, .78, .72]} /><Mat color="#171c21" /></mesh>
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[0, .62 + i * .08, .01]}><boxGeometry args={[1.02, .025, .7]} /><Mat color="#4c5862" /></mesh>)}
    <mesh position={[0, 1.27, -.39]}><boxGeometry args={[.68, .48, .08]} /><Mat color={coverOpen ? '#0c1115' : selected ? '#22d3ee' : '#68747e'} /></mesh>
    <mesh position={[0, 1.05, .41]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.18, .18, .18, 24]} /><Mat color="#9d5f32" /></mesh>
    {coverOpen && <group>
      <mesh position={[0, 1.32, -.47]}><cylinderGeometry args={[.28, .28, .05, 32]} /><Mat color="#c57a39" metal={.65} /></mesh>
      <mesh position={[0, 1.55, -.46]}><boxGeometry args={[.13, .42, .13]} /><Mat color="#b6c0c7" /></mesh>
      <mesh position={[.28, 1.28, -.48]}><torusGeometry args={[.10, .025, 8, 24]} /><Mat color="#e1a34f" /></mesh>
    </group>}
  </group>
}

function Bike({ removed, selected, onSelect, exploded, riding }) {
  const root = useRef()
  useFrame((_, d) => {
    if (!root.current || !riding) return
    root.current.position.z += d * .08
    if (root.current.position.z > 3) root.current.position.z = -3
  })
  const gap = exploded ? .35 : 0
  return <group ref={root}>
    <group position={[0, 0, gap]}><Wheel z={1.55} front removed={removed.wheels} selected={selected === 'wheels'} onClick={onSelect} moving={riding} /></group>
    <group position={[0, 0, -gap]}><Wheel z={-1.55} removed={removed.wheels} selected={selected === 'wheels'} onClick={onSelect} moving={riding} /></group>
    <Beam a={[0, .56, 1.48]} b={[0, 1.45, .35]} />
    <Beam a={[0, .56, -1.42]} b={[0, 1.20, -.38]} />
    <Beam a={[0, 1.42, .35]} b={[0, .82, -1.1]} r={.055} color="#3b454e" />
    <Beam a={[-.32, .82, -.95]} b={[.32, .82, -.95]} r={.04} color="#3b454e" />
    <Beam a={[0, 1.38, .35]} b={[0, 1.73, 1.42]} r={.055} color="#8d99a2" />
    <Beam a={[0, 1.73, 1.42]} b={[0, 1.64, 1.62]} r={.045} color="#77838d" />
    <mesh position={[0, 1.64, 1.63]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.065, .065, .72, 18]} /><Mat color="#1a2026" /></mesh>
    <Engine coverOpen={!!removed.engineCover} removed={removed.engine} selected={selected === 'engine'} onClick={onSelect} />
    {!removed.fairing && <group onClick={e => { e.stopPropagation(); onSelect('fairing') }}>
      <mesh position={[0, 1.55, .35]} scale={[.72, .36, .88]}><sphereGeometry args={[1, 32, 20]} /><Mat color={selected === 'fairing' ? '#0b8293' : '#10161b'} metal={.82} rough={.18} /></mesh>
      <mesh position={[0, 1.18, .92]} scale={[.53, .30, .62]}><sphereGeometry args={[1, 28, 16]} /><Mat color="#151b20" metal={.55} /></mesh>
      <mesh position={[0, 1.18, 1.02]} scale={[.30, .16, .42]}><sphereGeometry args={[1, 24, 14]} /><Mat color="#050708" metal={.1} rough={.35} /></mesh>
      <mesh position={[0, 1.12, -.78]} scale={[.56, .24, .68]}><boxGeometry args={[1, 1, 1]} /><Mat color="#0b1015" metal={.45} /></mesh>
      <mesh position={[0, 1.76, 1.43]}><boxGeometry args={[.34, .12, .28]} /><Mat color="#080c10" metal={.5} /></mesh>
      <mesh position={[0, 1.63, 1.58]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.10, .10, .06, 24]} /><Mat color="#f2f5f6" metal={.2} rough={.1} /></mesh>
    </group>}
    {!removed.seat && <group onClick={e => { e.stopPropagation(); onSelect('seat') }}>
      <mesh position={[0, 1.38, -.55]} scale={[.46, .15, .92]}><boxGeometry args={[1, 1, 1]} /><Mat color={selected === 'seat' ? '#22d3ee' : '#07090b'} metal={.15} rough={.8} /></mesh>
      <mesh position={[0, 1.40, -1.02]} scale={[.30, .14, .45]}><boxGeometry args={[1, 1, 1]} /><Mat color="#0e1419" metal={.15} rough={.75} /></mesh>
    </group>}
    {!removed.exhaust && <group onClick={e => { e.stopPropagation(); onSelect('exhaust') }}>
      <Beam a={[.42, .78, -.72]} b={[.48, .84, -1.35]} r={.075} color="#a8b1b8" />
      <mesh position={[.49, .86, -1.45]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.14, .12, .62, 24]} /><Mat color={selected === 'exhaust' ? '#22d3ee' : '#707b84'} metal={.95} rough={.17} /></mesh>
    </group>}
    <group onClick={e => { e.stopPropagation(); onSelect('brakes') }}>
      <mesh position={[.15, .52, 1.55]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.25, .25, .035, 40]} /><Mat color={removed.brakes ? '#252a2f' : selected === 'brakes' ? '#22d3ee' : '#b6bec5'} /></mesh>
      <mesh position={[.23, .59, 1.55]}><boxGeometry args={[.12, .20, .12]} /><Mat color="#242a30" /></mesh>
    </group>
  </group>
}

function Track({ bike, speed }) {
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, 0]}><planeGeometry args={[50, 50]} /><meshStandardMaterial color="#12171b" roughness={.9} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .01, 0]}><ringGeometry args={[5.5, 7.5, 96]} /><meshStandardMaterial color="#3b4146" roughness={.85} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .015, 0]}><ringGeometry args={[5.65, 7.35, 96]} /><meshStandardMaterial color="#15191d" roughness={.8} /></mesh>
    {Array.from({ length: 32 }, (_, i) => { const a = i * Math.PI * 2 / 32; return <mesh key={i} position={[Math.cos(a) * 6.45, .035, Math.sin(a) * 6.45]}><boxGeometry args={[.35, .25, .10]} /><Mat color={i % 2 ? '#d8d8d8' : '#e33a3a'} metal={.05} rough={.7} /></mesh> })}
    <Grid position={[0, .02, 0]} args={[50, 50]} cellSize={1} sectionSize={5} fadeDistance={30} sectionColor="#20323a" cellColor="#172329" />
    <Bike {...bike} riding />
    <OrbitControls target={[0, .8, 0]} maxPolarAngle={Math.PI / 2.05} />
    <Environment preset="night" />
    <directionalLight position={[5, 8, 4]} intensity={2.4} />
    <ambientLight intensity={.65} />
  </>
}

export default function VehicleLabV2() {
  const [mode, setMode] = useState('workshop')
  const [selected, setSelected] = useState('engine')
  const [exploded, setExploded] = useState(false)
  const [removed, setRemoved] = useState({})
  const [upgrades, setUpgrades] = useState([])
  const [speed, setSpeed] = useState(0)

  const stats = useMemo(() => {
    let s = { power: 68, weight: 196, grip: 82, braking: 80, handling: 78 }
    upgrades.forEach(id => {
      if (id === 'exhaust') { s.power += 5; s.weight -= 4 }
      if (id === 'wheels') { s.grip += 5; s.weight -= 3 }
      if (id === 'brakes') s.braking += 12
      if (id === 'suspension') s.handling += 10
      if (id === 'fairing') s.weight -= 2
    })
    return s
  }, [upgrades])

  useEffect(() => {
    if (mode !== 'ride') return
    const down = e => {
      if (['w', 'arrowup'].includes(e.key.toLowerCase())) setSpeed(s => Math.min(260, s + 8))
      if (['s', 'arrowdown'].includes(e.key.toLowerCase())) setSpeed(s => Math.max(0, s - 14))
      if (e.key.toLowerCase() === 'r') setSpeed(0)
    }
    const up = e => { if (['w', 'arrowup'].includes(e.key.toLowerCase())) setSpeed(s => Math.max(0, s - 3)) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [mode])

  const remove = id => setRemoved(v => ({ ...v, [id]: !v[id] }))
  const reset = () => { setRemoved({}); setUpgrades([]); setExploded(false); setSelected('engine'); setSpeed(0) }
  const toggleUpgrade = id => setUpgrades(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id])

  if (mode === 'ride') return <div style={{ position: 'fixed', inset: 0, background: '#05080a' }}>
    <Canvas camera={{ position: [0, 2.8, 8], fov: 55 }}>
      <Track bike={{ removed, selected, onSelect: setSelected, exploded: false }} speed={speed} />
    </Canvas>
    <div style={ui.top}><b>VEHICLE<span style={{ color: '#22d3ee' }}>LAB</span></b><span>KAWASAKI NINJA 650 // 2021</span><button onClick={() => setMode('workshop')}>WORKSHOP</button></div>
    <div style={ui.ride}><strong>TEST RIDE</strong><div>W / ↑ ACCELERATE</div><div>S / ↓ BRAKE</div><div>R RESET</div><div style={{ fontSize: 26, color: '#22d3ee' }}>{Math.round(speed)} KM/H</div></div>
  </div>

  return <div style={{ position: 'fixed', inset: 0, background: '#05080a', color: '#dce7eb', fontFamily: 'monospace' }}>
    <div style={ui.top}><b>VEHICLE<span style={{ color: '#22d3ee' }}>LAB</span></b><span>3D MECHANICAL SIMULATION // WORKSHOP BUILD 03</span><div><button style={ui.buttonActive}>WORKSHOP</button><button onClick={() => setMode('ride')}>TEST RIDE</button></div></div>
    <div style={ui.left}><h4>WORKSHOP COMPONENTS</h4>{PARTS.map(([id, name, cat]) => <button key={id} onClick={() => setSelected(id)} style={{ ...ui.item, ...(selected === id ? ui.selected : {}) }}><span>{name}<small>{cat}</small></span><em>{removed[id] ? 'REMOVED' : 'INSPECT'}</em></button>)}<h4 style={{ marginTop: 22 }}>UPGRADES</h4>{PARTS.slice(0, 5).map(([id, name]) => <button key={id} onClick={() => toggleUpgrade(id)} style={ui.item}><span>{name}<small>{upgrades.includes(id) ? 'INSTALLED' : 'STOCK'}</small></span><em>{upgrades.includes(id) ? 'ON' : 'ADD'}</em></button>)}</div>
    <div style={ui.right}><h4>LIVE VEHICLE STATE</h4>{[['POWER', stats.power + ' HP'], ['WEIGHT', stats.weight + ' KG'], ['GRIP', stats.grip + '%'], ['BRAKING', stats.braking + '%'], ['HANDLING', stats.handling + '%']].map(x => <div key={x[0]} style={ui.stat}><span>{x[0]}</span><b>{x[1]}</b></div>)}<hr/><h4>SELECTED PART</h4><div style={ui.card}><b>{selected.toUpperCase()}</b><small>3D COMPONENT // CLICK TO INSPECT</small></div><button onClick={() => remove(selected)} style={ui.big}>{removed[selected] ? 'RESTORE PART' : 'REMOVE PART'}</button>{selected === 'engine' && <button onClick={() => remove('engineCover')} style={ui.big}>{removed.engineCover ? 'CLOSE ENGINE COVER' : 'OPEN ENGINE COVER'}</button>}<button onClick={() => setExploded(v => !v)} style={ui.big}>{exploded ? 'ASSEMBLE VEHICLE' : 'EXPLODE ASSEMBLY'}</button><button onClick={reset} style={ui.big}>RESET BUILD</button><button onClick={() => setMode('ride')} style={{ ...ui.big, borderColor: '#20e09b', color: '#20e09b' }}>ENTER RACE TRACK</button></div>
    <Canvas camera={{ position: [4.8, 2.8, 5.4], fov: 48 }}>
      <color attach="background" args={['#05080a']} />
      <ambientLight intensity={1.1} /><directionalLight position={[4, 7, 5]} intensity={3} /><directionalLight position={[-4, 3, -4]} intensity={1.5} color="#1a8fa3" />
      <Grid args={[40, 40]} cellSize={.5} sectionSize={2.5} fadeDistance={24} sectionColor="#16414a" cellColor="#0c252b" />
      <Bike removed={removed} selected={selected} onSelect={setSelected} exploded={exploded} riding={false} />
      <OrbitControls target={[0, 1, 0]} minDistance={2.5} maxDistance={10} enableDamping />
      <Environment preset="city" />
    </Canvas>
    <div style={ui.hint}>DRAG TO ORBIT • SCROLL TO ZOOM • CLICK COMPONENTS TO INSPECT • EXPLODE TO TEARDOWN</div>
  </div>
}

const ui = {
  top: { position: 'absolute', zIndex: 5, left: 0, right: 0, top: 0, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(3,8,11,.88)', borderBottom: '1px solid #12353d', letterSpacing: 3, fontSize: 12 },
  left: { position: 'absolute', zIndex: 5, left: 32, top: 112, bottom: 55, width: 300, padding: 18, overflowY: 'auto', background: 'rgba(3,10,14,.91)', border: '1px solid #12404a' },
  right: { position: 'absolute', zIndex: 5, right: 32, top: 112, bottom: 55, width: 300, padding: 18, background: 'rgba(3,10,14,.91)', border: '1px solid #12404a' },
  item: { width: '100%', display: 'flex', justifyContent: 'space-between', textAlign: 'left', padding: '14px 12px', marginBottom: 7, background: '#071116', border: '1px solid #142b31', color: '#b8c8ce', cursor: 'pointer', fontFamily: 'monospace' },
  selected: { borderColor: '#22d3ee', background: '#092028' },
  buttonActive: { borderColor: '#22d3ee' },
  button: { marginLeft: 8, padding: '11px 17px', color: '#dce7eb', background: '#071116', border: '1px solid #1b3d45', cursor: 'pointer', fontFamily: 'monospace' },
  stat: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #10272d', fontSize: 12 },
  card: { padding: 16, border: '1px solid #1a4650', background: '#061319', display: 'flex', flexDirection: 'column', gap: 8 },
  big: { width: '100%', marginTop: 9, padding: 12, background: '#07151a', color: '#b9d3d9', border: '1px solid #20505b', cursor: 'pointer', fontFamily: 'monospace' },
  hint: { position: 'absolute', zIndex: 5, bottom: 14, left: '50%', transform: 'translateX(-50%)', color: '#78939a', fontSize: 11, letterSpacing: 1 },
  ride: { position: 'absolute', zIndex: 5, left: 30, top: 105, padding: 18, background: 'rgba(3,10,14,.9)', border: '1px solid #20d3ee', lineHeight: 2, letterSpacing: 2 }
}

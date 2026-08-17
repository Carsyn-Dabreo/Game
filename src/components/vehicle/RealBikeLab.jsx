import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, Html, OrbitControls, Environment, ContactShadows, useGLTF, useThree } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MODEL = '/models/motorbike.glb'

const DEFAULT_CAMERA = { position: [5.8, 3.1, 6.8], target: [0, 1.15, 0] }
const ENGINE_CAMERA = { position: [2.0, 1.55, 2.15], target: [0, 0.95, 0] }
const FRONT_CAMERA = { position: [2.8, 1.9, 3.6], target: [0, 1.0, 1.25] }
const REAR_CAMERA = { position: [2.8, 1.55, -3.4], target: [0, 0.95, -1.2] }

function CameraRig({ view }) {
  const { camera } = useThree()
  const controls = useRef()
  const desiredPosition = useMemo(() => new THREE.Vector3(...view.position), [view.position])
  const desiredTarget = useMemo(() => new THREE.Vector3(...view.target), [view.target])

  useFrame((_, delta) => {
    const speed = 1 - Math.pow(0.001, delta)
    camera.position.lerp(desiredPosition, speed)
    if (controls.current) {
      controls.current.target.lerp(desiredTarget, speed)
      controls.current.update()
    }
  })

  return <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={0.65} maxDistance={9} />
}

function Bike({ inspect, onSelect }) {
  const { scene } = useGLTF(MODEL)
  const clone = useMemo(() => scene.clone(true), [scene])
  const fit = useMemo(() => {
    clone.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDimension = Math.max(size.x, size.y, size.z)
    return { scale: 3.7 / maxDimension, offset: new THREE.Vector3(-center.x, -box.min.y, -center.z) }
  }, [clone])

  useEffect(() => {
    clone.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      if (object.material) object.material.side = THREE.DoubleSide
    })
  }, [clone])

  return (
    <group scale={fit.scale} position={[0, 0, 0]}>
      <primitive
        object={clone}
        position={fit.offset}
        rotation={[0, Math.PI, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('FULL VEHICLE') }}
      />
    </group>
  )
}
useGLTF.preload(MODEL)

function Hotspot({ position, label, active, onClick }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick() }}>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={active ? '#ffffff' : '#22d3ee'} transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.16, 24]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <Html center distanceFactor={5} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#8eeeff', fontFamily: 'monospace', fontSize: 9, letterSpacing: '.12em', whiteSpace: 'nowrap', textShadow: '0 0 8px #00d9ff' }}>{label}</div>
      </Html>
    </group>
  )
}

function Bolt({ position, removed, onClick, index }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current || removed) return
    ref.current.rotation.y += delta * 5
  })
  if (removed) return null
  return (
    <mesh ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onClick(index) }}>
      <cylinderGeometry args={[0.055, 0.055, 0.045, 6]} />
      <meshStandardMaterial color="#c9d3da" metalness={0.9} roughness={0.2} emissive="#082a31" />
    </mesh>
  )
}

function EngineInspection({ coverOpen, bolts, onBolt, onToggleCover, exploded }) {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.05, 0.78, 0.82]} />
        <meshStandardMaterial color="#242b31" metalness={0.82} roughness={0.28} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.68 + i * 0.075, 0.03]}>
          <boxGeometry args={[1.18, 0.035, 0.76]} />
          <meshStandardMaterial color="#68737c" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {!coverOpen && (
        <group position={[0, 1.28, -0.48]}>
          <mesh onClick={(e) => { e.stopPropagation(); onToggleCover() }}>
            <boxGeometry args={[0.82, 0.58, 0.1]} />
            <meshStandardMaterial color="#111820" metalness={0.8} roughness={0.22} />
          </mesh>
          {[[ -0.31, 0.20, -0.07 ], [ 0.31, 0.20, -0.07 ], [ -0.31, -0.20, -0.07 ], [ 0.31, -0.20, -0.07 ]].map((p, i) => (
            <Bolt key={i} position={p} removed={bolts[i]} onClick={onBolt} index={i} />
          ))}
        </group>
      )}

      {coverOpen && (
        <group position={[0, 1.28, -0.58]}>
          <mesh position={[0, 0, exploded ? -0.55 : 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.29, 0.29, 0.12, 32]} />
            <meshStandardMaterial color="#c47a35" metalness={0.72} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.3, exploded ? -0.45 : 0]}>
            <boxGeometry args={[0.16, 0.5, 0.16]} />
            <meshStandardMaterial color="#a9b4bc" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.3, exploded ? -0.45 : 0]}>
            <boxGeometry args={[0.62, 0.1, 0.18]} />
            <meshStandardMaterial color="#9ba6ae" metalness={0.82} roughness={0.22} />
          </mesh>
          <Html position={[0, 0, 0.25]} center distanceFactor={4}>
            <div style={{ color: '#8eeeff', fontFamily: 'monospace', fontSize: 9, letterSpacing: '.1em', whiteSpace: 'nowrap' }}>ENGINE INTERNALS</div>
          </Html>
        </group>
      )}
    </group>
  )
}

function Loading() {
  return <Html center><div style={{ fontFamily: 'monospace', letterSpacing: '.16em', fontSize: 12, color: '#8eeeff', whiteSpace: 'nowrap' }}>LOADING REAL MOTORCYCLE...</div></Html>
}

class ModelErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return <Html center><div style={{ fontFamily: 'monospace', color: '#ff6688', background: '#080b10', border: '1px solid #ff6688', padding: 20, width: 360 }}><div style={{ letterSpacing: '.12em', marginBottom: 10 }}>MODEL LOAD ERROR</div><div style={{ fontSize: 11, lineHeight: 1.6 }}>{String(this.state.error.message || this.state.error)}</div></div></Html>
  }
}

export default function RealBikeLab() {
  const [mode, setMode] = useState('workshop')
  const [selected, setSelected] = useState('FULL VEHICLE')
  const [view, setView] = useState(DEFAULT_CAMERA)
  const [engineOpen, setEngineOpen] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [bolts, setBolts] = useState([false, false, false, false])
  const [message, setMessage] = useState('CLICK A 3D HOTSPOT OR PART · DRAG TO ROTATE · SCROLL TO ZOOM')

  const selectPart = (part) => {
    setSelected(part)
    if (part === 'ENGINE ASSEMBLY') {
      setView(ENGINE_CAMERA)
      setMessage('ENGINE SELECTED · CAMERA IS FLYING IN · CLICK ENGINE COVER OR INSPECT')
    } else if (part === 'FRONT') {
      setView(FRONT_CAMERA)
      setMessage('FRONT ASSEMBLY SELECTED · INSPECT FORKS, BRAKES AND WHEEL')
    } else if (part === 'REAR') {
      setView(REAR_CAMERA)
      setMessage('REAR ASSEMBLY SELECTED · INSPECT CHAIN, SPROCKET AND WHEEL')
    } else {
      setView(DEFAULT_CAMERA)
      setMessage('FULL VEHICLE SELECTED · DRAG TO ROTATE · SCROLL TO ZOOM')
    }
  }

  const openEngine = () => {
    setSelected('ENGINE ASSEMBLY')
    setView(ENGINE_CAMERA)
    setMessage('ENGINE INSPECTION · CLICK A BOLT TO REMOVE IT')
  }

  const removeBolt = (index) => {
    setBolts((current) => current.map((value, i) => i === index ? true : value))
    const next = bolts.map((value, i) => i === index ? true : value)
    if (next.every(Boolean)) setMessage('ALL ENGINE COVER FASTENERS REMOVED · OPEN ENGINE COVER')
    else setMessage(`FASTENER ${index + 1} REMOVED · ${next.filter(Boolean).length}/4 REMOVED`)
  }

  const toggleCover = () => {
    if (!bolts.every(Boolean)) {
      setMessage('CANNOT OPEN COVER · REMOVE ALL 4 FASTENERS FIRST')
      return
    }
    setEngineOpen(true)
    setMessage('ENGINE COVER REMOVED · INTERNAL ASSEMBLY EXPOSED')
  }

  const reset = () => {
    setSelected('FULL VEHICLE')
    setView(DEFAULT_CAMERA)
    setEngineOpen(false)
    setExploded(false)
    setBolts([false, false, false, false])
    setMessage('CLICK A 3D HOTSPOT OR PART · DRAG TO ROTATE · SCROLL TO ZOOM')
  }

  return (
    <div className="vehicle-lab">
      <Canvas camera={{ position: DEFAULT_CAMERA.position, fov: 42 }} shadows dpr={[1, 2]} onPointerMissed={() => setSelected('FULL VEHICLE')}>
        <color attach="background" args={['#02070b']} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[5, 8, 4]} intensity={4.5} castShadow />
        <pointLight position={[-4, 4, 2]} intensity={18} distance={14} color="#00d9ff" />
        <pointLight position={[4, 3, -4]} intensity={14} distance={12} color="#8b5cf6" />
        <Environment preset="warehouse" />
        <gridHelper args={[20, 40, '#164554', '#07151b']} position={[0, 0, 0]} />
        <Suspense fallback={<Loading />}>
          <ModelErrorBoundary>
            <Bike inspect={selected !== 'FULL VEHICLE'} onSelect={selectPart} />
          </ModelErrorBoundary>
        </Suspense>

        {selected === 'FULL VEHICLE' && <>
          <Hotspot position={[0, 0.98, 0]} label="ENGINE" active={false} onClick={openEngine} />
          <Hotspot position={[0, 0.72, 1.42]} label="FRONT" active={false} onClick={() => selectPart('FRONT')} />
          <Hotspot position={[0, 0.68, -1.35]} label="REAR" active={false} onClick={() => selectPart('REAR')} />
        </>}

        {selected === 'ENGINE ASSEMBLY' && (
          <EngineInspection coverOpen={engineOpen} bolts={bolts} onBolt={removeBolt} onToggleCover={toggleCover} exploded={exploded} />
        )}

        <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={12} blur={2.5} far={8} />
        <CameraRig view={view} />
      </Canvas>

      <div className="lab-topbar">
        <div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">REAL 3D VEHICLE WORKSHOP</div></div>
        <div className="vehicle-name">SCANNED MOTORCYCLE <span>GLB</span></div>
        <div className="top-actions"><button className={mode === 'workshop' ? 'active' : ''} onClick={() => setMode('workshop')}>WORKSHOP</button><button className={mode === 'ride' ? 'active ride' : 'ride'} onClick={() => setMode('ride')}>TEST RIDE</button></div>
      </div>

      {mode === 'workshop' && <>
        <aside className="parts-panel glass">
          <div className="panel-title">VEHICLE INSPECTION</div>
          <button className={selected === 'FULL VEHICLE' ? 'part selected' : 'part'} onClick={reset}><span><b>Complete Motorcycle</b><small>CLICK PARTS IN 3D</small></span><strong>3D</strong></button>
          <button className={selected === 'ENGINE ASSEMBLY' ? 'part selected' : 'part'} onClick={openEngine}><span><b>Engine Assembly</b><small>ZOOM / OPEN / DISASSEMBLE</small></span><strong>OPEN</strong></button>
          <button className={selected === 'FRONT' ? 'part selected' : 'part'} onClick={() => selectPart('FRONT')}><span><b>Front Assembly</b><small>FORK / BRAKE / WHEEL</small></span><strong>ZOOM</strong></button>
          <button className={selected === 'REAR' ? 'part selected' : 'part'} onClick={() => selectPart('REAR')}><span><b>Rear Assembly</b><small>CHAIN / SPROCKET / WHEEL</small></span><strong>ZOOM</strong></button>
          <div className="tool-box"><div className="panel-title">MECHANICAL TOOLS</div><div className="tools"><span>🔩 CLICK FASTENERS</span><span>🔧 REMOVE COMPONENTS</span><span>⚙ EXPLODE ASSEMBLY</span></div></div>
        </aside>

        <section className="center-callout"><div className="reticle">◈</div><div>{message}</div></section>

        <aside className="stats-panel glass">
          <div className="panel-title">LIVE WORKSHOP STATE</div>
          <div className="selected-card"><b>{selected}</b><span>{engineOpen ? 'ENGINE COVER REMOVED' : 'INTERACTIVE 3D INSPECTION'}</span></div>
          <div className="stat">MODEL <b>GLB</b></div>
          <div className="stat">FASTENERS <b>{bolts.filter(Boolean).length}/4</b></div>
          <div className="stat">COVER <b>{engineOpen ? 'OPEN' : 'CLOSED'}</b></div>
          {!engineOpen && selected === 'ENGINE ASSEMBLY' && <button className="primary" onClick={toggleCover}>OPEN ENGINE COVER</button>}
          {engineOpen && <button className="primary" onClick={() => { setExploded(!exploded); setMessage(exploded ? 'ASSEMBLY RESTORED' : 'EXPLODED VIEW ACTIVE · INTERNALS SEPARATED') }}>{exploded ? 'RESTORE ASSEMBLY' : 'EXPLODE ASSEMBLY'}</button>}
          <button className="primary" onClick={reset} style={{ marginTop: 8 }}>RESET BUILD</button>
        </aside>
      </>}

      {mode === 'ride' && <div className="ride-hint">TEST RIDE SYSTEM · PHYSICS CONTROL NEXT · SWITCH TO WORKSHOP TO INSPECT</div>}
    </div>
  )
}

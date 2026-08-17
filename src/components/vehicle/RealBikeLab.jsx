import React, { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL = '/models/motorbike.glb'

function Bike() {
  const { scene } = useGLTF(MODEL)
  const clone = useMemo(() => scene.clone(true), [scene])
  const group = useRef()

  const fit = useMemo(() => {
    clone.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDimension = Math.max(size.x, size.y, size.z)
    const scale = 3.6 / maxDimension
    return {
      scale,
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    }
  }, [clone])

  useMemo(() => {
    clone.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true
        object.receiveShadow = true
        if (object.material) {
          object.material.side = THREE.DoubleSide
        }
      }
    })
  }, [clone])

  return (
    <group ref={group} scale={fit.scale}>
      <primitive object={clone} position={fit.offset} rotation={[0, Math.PI, 0]} />
    </group>
  )
}

useGLTF.preload(MODEL)

function Loading() {
  return (
    <Html center>
      <div style={{ fontFamily: 'monospace', letterSpacing: '.16em', fontSize: 12, color: '#8eeeff', whiteSpace: 'nowrap' }}>
        LOADING REAL MOTORCYCLE...
      </div>
    </Html>
  )
}

function LoadError({ error }) {
  return (
    <Html center>
      <div style={{ fontFamily: 'monospace', color: '#ff6688', background: '#080b10', border: '1px solid #ff6688', padding: 20, width: 360 }}>
        <div style={{ letterSpacing: '.12em', marginBottom: 10 }}>MODEL LOAD ERROR</div>
        <div style={{ fontSize: 11, lineHeight: 1.6 }}>{String(error?.message || error)}</div>
        <div style={{ fontSize: 10, marginTop: 12, color: '#9aa6af' }}>/models/motorbike.glb</div>
      </div>
    </Html>
  )
}

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) return <LoadError error={this.state.error} />
    return this.props.children
  }
}

export default function RealBikeLab() {
  const [mode, setMode] = useState('workshop')
  const [selected, setSelected] = useState('FULL VEHICLE')
  const [message, setMessage] = useState('REAL SCANNED MOTORCYCLE · DRAG TO ROTATE · SCROLL TO ZOOM')
  const [camera, setCamera] = useState({ position: [5.5, 2.8, 6.5], target: [0, 1.2, 0] })

  const focusEngine = () => {
    setSelected('ENGINE ASSEMBLY')
    setCamera({ position: [3.4, 1.9, 3.8], target: [0, 1.0, 0] })
    setMessage('ENGINE INSPECTION · REAL GEOMETRY · MECHANICAL DISASSEMBLY NEXT')
  }

  const resetCamera = () => {
    setSelected('FULL VEHICLE')
    setCamera({ position: [5.5, 2.8, 6.5], target: [0, 1.2, 0] })
    setMessage('REAL SCANNED MOTORCYCLE · DRAG TO ROTATE · SCROLL TO ZOOM')
  }

  return (
    <div className="vehicle-lab">
      <Canvas camera={{ position: camera.position, fov: 40 }} shadows dpr={[1, 2]}>
        <color attach="background" args={['#02070b']} />
        <ambientLight intensity={1.25} />
        <directionalLight position={[5, 8, 4]} intensity={4} castShadow />
        <pointLight position={[-4, 4, 2]} intensity={18} distance={14} color="#00d9ff" />
        <pointLight position={[4, 3, -4]} intensity={14} distance={12} color="#8b5cf6" />
        <Environment preset="warehouse" />
        <gridHelper args={[20, 40, '#164554', '#07151b']} position={[0, 0, 0]} />
        <Suspense fallback={<Loading />}>
          <ModelErrorBoundary>
            <Bike />
          </ModelErrorBoundary>
        </Suspense>
        <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={12} blur={2.5} far={8} />
        <OrbitControls makeDefault enablePan={false} minDistance={2.2} maxDistance={9} target={camera.target} />
      </Canvas>

      <div className="lab-topbar">
        <div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">REAL 3D VEHICLE WORKSHOP</div></div>
        <div className="vehicle-name">SCANNED MOTORCYCLE <span>GLB</span></div>
        <div className="top-actions">
          <button className={mode === 'workshop' ? 'active' : ''} onClick={() => setMode('workshop')}>WORKSHOP</button>
          <button className={mode === 'ride' ? 'active ride' : 'ride'} onClick={() => setMode('ride')}>TEST RIDE</button>
        </div>
      </div>

      {mode === 'workshop' && <>
        <aside className="parts-panel glass">
          <div className="panel-title">VEHICLE INSPECTION</div>
          <button className={selected === 'FULL VEHICLE' ? 'part selected' : 'part'} onClick={resetCamera}>
            <span><b>Complete Motorcycle</b><small>REAL SCANNED MODEL</small></span><strong>3D</strong>
          </button>
          <button className={selected === 'ENGINE ASSEMBLY' ? 'part selected' : 'part'} onClick={focusEngine}>
            <span><b>Engine Assembly</b><small>INSPECT / DISASSEMBLY</small></span><strong>OPEN</strong>
          </button>
          <div className="tool-box">
            <div className="panel-title">NEXT SYSTEM</div>
            <div className="tools"><span>🔩 INDIVIDUAL FASTENERS</span><span>🔧 TOOL INTERACTION</span><span>⚙ EXPLODED ASSEMBLY</span></div>
          </div>
        </aside>
        <section className="center-callout"><div className="reticle">◈</div><div>{message}</div></section>
        <aside className="stats-panel glass">
          <div className="panel-title">MODEL STATUS</div>
          <div className="selected-card"><b>{selected}</b><span>HIGH-DETAIL 3D ASSET</span></div>
          <div className="stat">MODEL <b>GLB</b></div>
          <div className="stat">MODE <b>REAL GEOMETRY</b></div>
          <div className="stat">INTERACTION <b>ACTIVE</b></div>
          <button className="primary" onClick={focusEngine}>INSPECT ENGINE</button>
          <button className="primary" onClick={resetCamera} style={{ marginTop: 8 }}>RESET CAMERA</button>
        </aside>
      </>}

      {mode === 'ride' && <div className="ride-hint">TEST RIDE SYSTEM · VEHICLE PHYSICS NEXT · ESC TO EXIT</div>}
    </div>
  )
}

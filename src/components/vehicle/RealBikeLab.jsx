import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls, ContactShadows, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL = '/models/motorbike.glb'

function CameraRig({ focus }) {
  const { camera } = useThree()
  useEffect(() => {
    if (!focus) return
    const target = new THREE.Vector3(...focus)
    camera.position.lerp(target, 1)
  }, [focus, camera])
  return null
}

function Bike() {
  const { scene } = useGLTF(MODEL)
  const ref = useRef()
  const clone = useMemo(() => scene.clone(true), [scene])
  useEffect(() => {
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [clone])
  return <primitive ref={ref} object={clone} scale={1.35} rotation={[0, Math.PI, 0]} position={[0, 0, 0]} />
}
useGLTF.preload(MODEL)

function Loading() {
  return <Html center><div style={{fontFamily:'monospace',letterSpacing:'.16em',fontSize:12,color:'#8eeeff'}}>LOADING VEHICLE MODEL...</div></Html>
}

export default function RealBikeLab() {
  const [mode, setMode] = useState('workshop')
  const [selected, setSelected] = useState('FULL VEHICLE')
  const [focus, setFocus] = useState(null)
  const [message, setMessage] = useState('REAL SCANNED MOTORCYCLE · DRAG TO ROTATE · SCROLL TO ZOOM')

  const focusEngine = () => {
    setSelected('ENGINE ASSEMBLY')
    setFocus([2.4, 1.2, 3.0])
    setMessage('ENGINE INSPECTION · NEXT: SEPARATE MECHANICAL COMPONENTS')
  }

  return <div className="vehicle-lab">
    <Canvas camera={{ position:[5.5,2.8,6.5], fov:40 }} shadows dpr={[1,2]}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[5,8,4]} intensity={3.5} castShadow />
      <pointLight position={[-4,4,2]} intensity={16} distance={12} color="#00d9ff" />
      <pointLight position={[4,3,-4]} intensity={12} distance={10} color="#8b5cf6" />
      <Environment preset="warehouse" />
      <gridHelper args={[40,40,'#164554','#07151b']} position={[0,0,0]} />
      <Suspense fallback={<Loading />}><Bike /></Suspense>
      <ContactShadows position={[0,0,0]} opacity={0.5} scale={25} blur={2.5} far={8} />
      <OrbitControls makeDefault enablePan={false} minDistance={2.2} maxDistance={12} target={[0,1,0]} />
      <CameraRig focus={focus} />
    </Canvas>

    <div className="lab-topbar"><div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">REAL 3D VEHICLE WORKSHOP</div></div><div className="vehicle-name">SCANNED MOTORCYCLE <span>GLB</span></div><div className="top-actions"><button className={mode==='workshop'?'active':''} onClick={()=>setMode('workshop')}>WORKSHOP</button><button className={mode==='ride'?'active ride':'ride'} onClick={()=>setMode('ride')}>TEST RIDE</button></div></div>

    {mode==='workshop' && <>
      <aside className="parts-panel glass">
        <div className="panel-title">VEHICLE INSPECTION</div>
        <button className={selected==='FULL VEHICLE'?'part selected':'part'} onClick={()=>{setSelected('FULL VEHICLE');setFocus(null);setMessage('REAL SCANNED MOTORCYCLE · DRAG TO ROTATE · SCROLL TO ZOOM')}}><span><b>Complete Motorcycle</b><small>REAL SCANNED MODEL</small></span><strong>3D</strong></button>
        <button className={selected==='ENGINE ASSEMBLY'?'part selected':'part'} onClick={focusEngine}><span><b>Engine Assembly</b><small>INSPECT / DISASSEMBLY</small></span><strong>OPEN</strong></button>
        <div className="tool-box"><div className="panel-title">NEXT SYSTEM</div><div className="tools"><span>🔩 INDIVIDUAL FASTENERS</span><span>🔧 TOOL INTERACTION</span><span>⚙ EXPLODED ASSEMBLY</span></div></div>
      </aside>
      <section className="center-callout"><div className="reticle">◈</div><div>{message}</div></section>
      <aside className="stats-panel glass"><div className="panel-title">MODEL STATUS</div><div className="selected-card"><b>{selected}</b><span>HIGH-DETAIL 3D ASSET</span></div><div className="stat">MODEL <b>GLB</b></div><div className="stat">MODE <b>REAL GEOMETRY</b></div><div className="stat">INTERACTION <b>ACTIVE</b></div><button className="primary" onClick={focusEngine}>INSPECT ENGINE</button></aside>
    </>}

    {mode==='ride' && <div className="ride-hint">TEST RIDE SYSTEM · VEHICLE PHYSICS NEXT · ESC TO EXIT</div>}
  </div>
}

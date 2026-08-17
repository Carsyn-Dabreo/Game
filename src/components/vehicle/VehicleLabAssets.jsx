import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL = '/models/motorbike.glb'
const CYAN = '#22d3ee'

const panel = {
  background: 'rgba(3,10,15,.94)',
  border: '1px solid rgba(34,211,238,.35)',
  boxShadow: '0 18px 50px rgba(0,0,0,.5)',
  backdropFilter: 'blur(10px)',
}

const button = {
  background: 'rgba(5,20,27,.95)',
  border: '1px solid rgba(34,211,238,.45)',
  color: '#d9fbff',
  padding: '12px 16px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  fontSize: 12,
}

function useBikeModel() {
  const { scene } = useGLTF(MODEL)
  const clone = useMemo(() => scene.clone(true), [scene])
  const fit = useMemo(() => {
    clone.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    return {
      scale: 4.6 / Math.max(size.x, size.y, size.z, 1),
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    }
  }, [clone])

  useEffect(() => {
    clone.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      if (!object.material) return
      object.material.side = THREE.DoubleSide
      if ('roughness' in object.material) object.material.roughness = Math.min(object.material.roughness ?? 0.5, 0.65)
      if ('metalness' in object.material) object.material.metalness = Math.min(object.material.metalness ?? 0, 0.85)
    })
  }, [clone])

  return { clone, fit }
}

useGLTF.preload(MODEL)

function Bike({ refObj, position = [0, 0, 0], rotation = [0, Math.PI, 0], scale = 1 }) {
  const { clone, fit } = useBikeModel()
  return (
    <group ref={refObj} position={position} rotation={rotation} scale={fit.scale * scale}>
      <primitive object={clone} position={fit.offset} />
    </group>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={2.1} />
      <hemisphereLight skyColor="#dffbff" groundColor="#10151a" intensity={2.4} />
      <directionalLight position={[6, 10, 7]} intensity={5.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <directionalLight position={[-7, 5, -4]} intensity={3} />
      <pointLight position={[0, 5, 3]} intensity={14} distance={12} color="#29d8ff" />
      <pointLight position={[0, 3, -5]} intensity={10} distance={10} color="#8c5cff" />
    </>
  )
}

function Garage() {
  return (
    <group>
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[28, 0.3, 22]} />
        <meshStandardMaterial color="#151d22" roughness={0.75} />
      </mesh>
      <gridHelper args={[28, 56, '#1b5a67', '#08151c']} position={[0, 0.02, 0]} />
      <mesh position={[0, 4.3, -10.7]}>
        <boxGeometry args={[28, 9, 0.25]} />
        <meshStandardMaterial color="#071015" roughness={0.9} />
      </mesh>
      {[-13.8, 13.8].map((x) => (
        <mesh key={x} position={[x, 3, 0]}>
          <boxGeometry args={[0.25, 6, 22]} />
          <meshStandardMaterial color="#091319" />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[8, 0.16, 6]} />
        <meshStandardMaterial color="#303a40" metalness={0.65} roughness={0.3} />
      </mesh>
      {[-3.3, 3.3].flatMap((x) => [-2.4, 2.4].map((z) => (
        <mesh key={`${x}:${z}`} position={[x, 0.8, z]}>
          <boxGeometry args={[0.14, 1.6, 0.14]} />
          <meshStandardMaterial color="#8a969c" metalness={0.9} />
        </mesh>
      )))}
      {[-7, 0, 7].map((x) => (
        <group key={x} position={[x, 5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 5.5, 12]} />
            <meshStandardMaterial color="#55636a" metalness={0.8} />
          </mesh>
          <pointLight position={[0, -0.4, 0]} intensity={13} distance={7} color="#e2fbff" />
        </group>
      ))}
    </group>
  )
}

function CameraReset({ engine, reset }) {
  const { camera } = useThree()
  useEffect(() => {
    const position = engine ? [2.8, 1.8, 2.8] : [6.5, 3.2, 7.5]
    camera.position.set(...position)
    camera.lookAt(0, 1, 0)
  }, [camera, engine, reset])
  return null
}

function EngineDetail({ bolts, setBolts, cover, setCover, exploded, setExploded }) {
  const allRemoved = bolts.every(Boolean)
  return (
    <group position={[0, 0.15, 0]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[1.55, 1.05, 1.05]} />
        <meshStandardMaterial color="#252f35" metalness={0.82} roughness={0.28} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, 0.38 + i * 0.1, 0]}>
          <boxGeometry args={[1.75, 0.045, 0.94]} />
          <meshStandardMaterial color="#7c878d" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {!cover && (
        <group position={[0, 1.48, -0.6]}>
          <mesh>
            <boxGeometry args={[1.25, 0.75, 0.14]} />
            <meshStandardMaterial color="#0c151a" metalness={0.85} />
          </mesh>
          {[[-0.47, 0.28, 0], [0.47, 0.28, 0], [-0.47, -0.28, 0], [0.47, -0.28, 0]].map((p, i) => (
            bolts[i] ? null : (
              <mesh key={i} position={p} onClick={(event) => { event.stopPropagation(); setBolts((old) => old.map((v, j) => j === i ? true : v)) }}>
                <cylinderGeometry args={[0.08, 0.08, 0.08, 6]} />
                <meshStandardMaterial color="#e4edf1" metalness={1} roughness={0.12} />
              </mesh>
            )
          ))}
        </group>
      )}
      {cover && (
        <group position={[0, 1.48, -0.65]}>
          <mesh position={[0, 0, exploded ? -0.9 : 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
            <meshStandardMaterial color="#b96b32" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.38, exploded ? -0.65 : 0]}>
            <boxGeometry args={[0.18, 0.55, 0.18]} />
            <meshStandardMaterial color="#b9c4c9" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.38, exploded ? -0.65 : 0]}>
            <boxGeometry args={[0.8, 0.12, 0.2]} />
            <meshStandardMaterial color="#b9c4c9" metalness={0.9} />
          </mesh>
        </group>
      )}
      <Html position={[0, 2.2, 0]} center>
        <div style={{ ...panel, padding: '8px 12px', color: CYAN, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>
          ENGINE {cover ? 'OPEN' : 'COVER CLOSED'}
        </div>
      </Html>
      {!cover && allRemoved && (
        <Html position={[0, 2.65, 0]} center>
          <button style={button} onClick={() => setCover(true)}>OPEN ENGINE COVER</button>
        </Html>
      )}
      {cover && (
        <Html position={[0, 2.65, 0]} center>
          <button style={button} onClick={() => setExploded((v) => !v)}>{exploded ? 'RESTORE INTERNALS' : 'EXPLODE INTERNALS'}</button>
        </Html>
      )}
    </group>
  )
}

function WorkshopScene({ engine, bolts, setBolts, cover, setCover, exploded, setExploded, reset }) {
  return (
    <>
      <color attach="background" args={['#02070b']} />
      <Lighting />
      <Garage />
      {!engine && <Bike scale={1.3} />}
      {engine && <EngineDetail bolts={bolts} setBolts={setBolts} cover={cover} setCover={setCover} exploded={exploded} setExploded={setExploded} />}
      <Bike scale={engine ? 0.85 : 1.3} visible={false} />
      <CameraReset engine={engine} reset={reset} />
    </>
  )
}

function RaceTrack() {
  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[90, 0.3, 64]} />
        <meshStandardMaterial color="#070b0d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[11, 22, 128]} />
        <meshStandardMaterial color="#24292d" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[22, 25, 128]} />
        <meshStandardMaterial color="#c9c9c9" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 80 }).map((_, i) => {
        const t = (i / 80) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(t) * 24.3, 0.32, Math.sin(t) * 15.3]} rotation={[0, t, 0]}>
            <boxGeometry args={[0.45, 0.65, 1.3]} />
            <meshStandardMaterial color={i % 2 ? '#f4f4f4' : '#d52d38'} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.05, -15.3]}>
        <boxGeometry args={[4, 0.12, 0.35]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <Html position={[0, 3.8, -18.8]} center>
        <div style={{ color: CYAN, fontFamily: 'monospace', fontSize: 18, letterSpacing: 5, textShadow: '0 0 14px #22d3ee' }}>VEHICLELAB CIRCUIT</div>
      </Html>
    </group>
  )
}

function Ride() {
  const bike = useRef()
  const keys = useRef({})
  const speed = useRef(0)
  const heading = useRef(0)
  const { camera } = useThree()
  const [hud, setHud] = useState({ speed: 0, rpm: 1200, gear: 1, time: 0 })
  const start = useRef(performance.now())
  const { clone, fit } = useBikeModel()

  useEffect(() => {
    const down = (event) => {
      const key = event.key.toLowerCase()
      keys.current[key] = true
      if (key === 'r') {
        speed.current = 0
        heading.current = 0
        bike.current?.position.set(0, 0.05, -15)
      }
    }
    const up = (event) => { keys.current[event.key.toLowerCase()] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useFrame((_, dt) => {
    if (!bike.current) return
    const k = keys.current
    const throttle = k.w || k.arrowup
    const brake = k.s || k.arrowdown || k[' ']
    const steer = (k.a || k.arrowleft ? -1 : 0) + (k.d || k.arrowright ? 1 : 0)

    if (throttle) speed.current = Math.min(32, speed.current + dt * 13)
    else speed.current = Math.max(0, speed.current - dt * 2.5)
    if (brake) speed.current = Math.max(0, speed.current - dt * 20)

    heading.current += steer * dt * 0.95 * Math.min(1, speed.current / 6)
    bike.current.position.x += Math.sin(heading.current) * speed.current * dt
    bike.current.position.z += Math.cos(heading.current) * speed.current * dt
    bike.current.rotation.y = heading.current + Math.PI
    bike.current.rotation.z = -steer * 0.1

    if (Math.abs(bike.current.position.x) > 40 || Math.abs(bike.current.position.z) > 28) {
      bike.current.position.set(0, 0.05, -15)
      speed.current = 0
      heading.current = 0
    }

    const p = bike.current.position
    const desired = new THREE.Vector3(p.x - Math.sin(heading.current) * 8, 4.1, p.z - Math.cos(heading.current) * 8)
    camera.position.lerp(desired, 1 - Math.pow(0.0005, dt))
    camera.lookAt(p.x, 1, p.z)
    setHud({ speed: Math.round(speed.current * 8.2), rpm: Math.round(1200 + speed.current * 360), gear: Math.max(1, Math.min(6, Math.floor(speed.current / 5) + 1)), time: (performance.now() - start.current) / 1000 })
  })

  return (
    <>
      <color attach="background" args={['#081014']} />
      <Lighting />
      <RaceTrack />
      <group ref={bike} position={[0, 0.05, -15]} scale={fit.scale * 1.1}>
        <primitive object={clone} position={fit.offset} />
      </group>
      <Html fullscreen>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'monospace', color: '#dffcff' }}>
          <div style={{ position: 'absolute', top: 24, left: 28, right: 28, display: 'flex', justifyContent: 'space-between', fontSize: 14, letterSpacing: 3 }}>
            <span>VEHICLELAB // RACE DEMO</span><span>KAWASAKI NINJA 650 // 2021</span>
          </div>
          <div style={{ position: 'absolute', right: 35, bottom: 55, ...panel, padding: '18px 24px', minWidth: 180, textAlign: 'right' }}>
            <div style={{ fontSize: 48, fontWeight: 800 }}>{hud.speed}</div>
            <div style={{ color: CYAN, letterSpacing: 3 }}>KM/H</div>
            <div style={{ marginTop: 10 }}>RPM <b>{hud.rpm}</b></div><div>GEAR <b>{hud.gear}</b></div><div>LAP <b>01</b></div><div>TIME <b>{hud.time.toFixed(1)}s</b></div>
          </div>
          <div style={{ position: 'absolute', left: 35, bottom: 55, ...panel, padding: '14px 18px', lineHeight: 1.8, fontSize: 12 }}>W / ↑ THROTTLE<br />S / ↓ BRAKE<br />A / D STEER<br />R RESET</div>
        </div>
      </Html>
    </>
  )
}

export default function VehicleLabAssets() {
  const [mode, setMode] = useState('workshop')
  const [engine, setEngine] = useState(false)
  const [bolts, setBolts] = useState([false, false, false, false])
  const [cover, setCover] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [reset, setReset] = useState(0)

  const enterEngine = () => { setEngine(true); setCover(false); setExploded(false); setBolts([false, false, false, false]); setReset((v) => v + 1) }
  const resetWorkshop = () => { setEngine(false); setCover(false); setExploded(false); setBolts([false, false, false, false]); setReset((v) => v + 1) }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#02070b', color: '#dffcff', fontFamily: 'monospace', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', zIndex: 20, top: 0, left: 0, right: 0, height: 78, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: 'rgba(1,7,11,.92)', borderBottom: '1px solid rgba(34,211,238,.22)' }}>
        <div><div style={{ fontSize: 24, letterSpacing: 7 }}>VEHICLE<span style={{ color: CYAN }}>LAB</span></div><div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.65 }}>REAL 3D VEHICLE WORKSHOP // GARAGE + CIRCUIT</div></div>
        <div style={{ letterSpacing: 4, fontSize: 13 }}>KAWASAKI NINJA 650 <span style={{ color: CYAN }}>2021</span> // GLB</div>
        <div style={{ display: 'flex', gap: 8 }}><button style={{ ...button, borderColor: mode === 'workshop' ? CYAN : undefined }} onClick={() => setMode('workshop')}>WORKSHOP</button><button style={{ ...button, borderColor: mode === 'ride' ? CYAN : undefined }} onClick={() => setMode('ride')}>TEST RIDE</button></div>
      </div>

      <Canvas shadows camera={{ position: [6, 3, 7], fov: 50 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <Suspense fallback={<Html center><div style={{ ...panel, padding: 20, color: CYAN, fontFamily: 'monospace' }}>LOADING 3D VEHICLE...</div></Html>}>
          {mode === 'workshop' ? <WorkshopScene engine={engine} bolts={bolts} setBolts={setBolts} cover={cover} setCover={setCover} exploded={exploded} setExploded={setExploded} reset={reset} /> : <Ride />}
        </Suspense>
      </Canvas>

      {mode === 'workshop' && (
        <>
          <div style={{ position: 'absolute', zIndex: 10, top: 120, left: 26, width: 300, ...panel, padding: 20 }}>
            <div style={{ color: CYAN, letterSpacing: 4, fontSize: 12, marginBottom: 14 }}>WORKSHOP</div>
            <button style={{ ...button, width: '100%', textAlign: 'left', marginBottom: 8 }} onClick={resetWorkshop}>COMPLETE MOTORCYCLE <small style={{ float: 'right' }}>3D</small></button>
            <button style={{ ...button, width: '100%', textAlign: 'left', marginBottom: 8 }} onClick={enterEngine}>ENGINE ASSEMBLY <small style={{ float: 'right' }}>{engine ? 'OPEN' : 'INSPECT'}</small></button>
            <button style={{ ...button, width: '100%', textAlign: 'left', marginBottom: 8 }}>FRONT ASSEMBLY <small style={{ float: 'right' }}>NEXT</small></button>
            <button style={{ ...button, width: '100%', textAlign: 'left' }}>REAR ASSEMBLY <small style={{ float: 'right' }}>NEXT</small></button>
          </div>
          <div style={{ position: 'absolute', zIndex: 10, top: 120, right: 26, width: 300, ...panel, padding: 20 }}>
            <div style={{ color: CYAN, letterSpacing: 4, fontSize: 12, marginBottom: 18 }}>LIVE VEHICLE STATE</div>
            {['POWER 68 HP', 'WEIGHT 196 KG', 'GRIP 82%', 'BRAKING 80%'].map((x) => <div key={x} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(34,211,238,.12)', padding: '12px 0', fontSize: 12 }}>{x}</div>)}
            <button style={{ ...button, width: '100%', marginTop: 18, borderColor: '#20e080' }} onClick={() => setMode('ride')}>ENTER RACE TRACK</button>
          </div>
          <div style={{ position: 'absolute', bottom: 25, left: '50%', transform: 'translateX(-50%)', color: '#b8dce2', fontSize: 11, letterSpacing: 2 }}>DRAG ORBIT · SCROLL ZOOM · ENGINE ASSEMBLY TO INSPECT</div>
        </>
      )}
    </div>
  )
}

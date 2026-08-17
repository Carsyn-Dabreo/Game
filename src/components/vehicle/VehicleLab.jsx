import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL = '/models/motorbike.glb'
const CYAN = '#22d3ee'

const PARTS = [
  { id: 'fairing', name: 'Carbon Fairing', category: 'BODY', weight: -2 },
  { id: 'exhaust', name: 'Titanium Exhaust', category: 'PERFORMANCE', power: 5, weight: -4 },
  { id: 'wheels', name: 'Forged Wheel Set', category: 'WHEELS', grip: 5, weight: -3 },
  { id: 'brakes', name: 'Race Brake Kit', category: 'BRAKES', braking: 12 },
  { id: 'suspension', name: 'Track Suspension', category: 'SUSPENSION', handling: 10 },
]

const STOCK = { power: 68, weight: 196, grip: 82, braking: 80, handling: 78 }

const css = `
*{box-sizing:border-box}.vehicle-lab{position:relative;width:100%;height:100vh;overflow:hidden;background:#02070b;color:#d9fbff;font-family:monospace}.vehicle-lab canvas{position:absolute!important;inset:0}.top{position:absolute;z-index:20;top:0;left:0;right:0;height:86px;display:flex;align-items:center;justify-content:space-between;padding:18px 28px;background:linear-gradient(180deg,rgba(1,7,11,.98),rgba(1,7,11,.72),transparent);border-bottom:1px solid rgba(34,211,238,.18)}.brand{font-size:25px;letter-spacing:6px;color:#fff}.brand span{color:${CYAN}}.micro{font-size:9px;letter-spacing:3px;color:#6c8b93;margin-top:5px}.vehicle-name{font-size:13px;letter-spacing:4px}.vehicle-name b{color:${CYAN}}.top-actions{display:flex;gap:10px}.ui-btn{background:rgba(3,15,21,.92);border:1px solid rgba(34,211,238,.42);color:#d9fbff;padding:12px 16px;font:11px monospace;letter-spacing:2px;cursor:pointer}.ui-btn:hover,.ui-btn.active{border-color:${CYAN};box-shadow:0 0 20px rgba(34,211,238,.12);background:rgba(6,31,40,.95)}.panel{position:absolute;z-index:20;width:315px;background:rgba(3,10,15,.94);border:1px solid rgba(34,211,238,.28);box-shadow:0 18px 55px rgba(0,0,0,.5);backdrop-filter:blur(10px)}.left{left:28px;top:110px;bottom:28px;overflow:auto}.right{right:28px;top:110px;width:300px}.title{padding:18px 18px 12px;font-size:10px;letter-spacing:4px;color:${CYAN};border-bottom:1px solid rgba(34,211,238,.14)}.part{width:100%;display:flex;align-items:center;justify-content:space-between;text-align:left;background:rgba(4,17,23,.7);border:0;border-bottom:1px solid rgba(34,211,238,.1);padding:15px 16px;color:#d9fbff;cursor:pointer}.part:hover,.part.sel{background:rgba(9,42,52,.75);box-shadow:inset 3px 0 ${CYAN}}.part b{display:block;font-size:11px;letter-spacing:2px}.part small{display:block;color:#617a83;font-size:8px;letter-spacing:2px;margin-top:5px}.part strong{font-size:8px;color:${CYAN};letter-spacing:1px}.stat{padding:13px 17px;border-bottom:1px solid rgba(34,211,238,.09)}.stat-row{display:flex;justify-content:space-between;font-size:9px;letter-spacing:2px}.bar{height:3px;background:#14232a;margin-top:8px}.bar i{display:block;height:100%;background:${CYAN};box-shadow:0 0 8px ${CYAN}}.tools{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:14px}.tool{padding:11px;border:1px solid rgba(34,211,238,.15);font-size:8px;letter-spacing:1px;color:#8fa8ae}.action{margin:14px;width:calc(100% - 28px);border:1px solid ${CYAN};background:rgba(4,28,36,.9);color:#eaffff;padding:13px;font:10px monospace;letter-spacing:2px;cursor:pointer}.danger{border-color:#ef5966;color:#ffb9c0}.success{border-color:#47e6a1;color:#baffdf}.hint{position:absolute;z-index:15;bottom:18px;left:50%;transform:translateX(-50%);font-size:9px;letter-spacing:3px;color:#8aa4ab;text-align:center;white-space:nowrap}.toast{position:absolute;z-index:30;left:50%;bottom:55px;transform:translateX(-50%);padding:10px 16px;background:rgba(3,12,17,.96);border:1px solid rgba(34,211,238,.3);font-size:10px;letter-spacing:2px}.rideHud{position:absolute;z-index:25;left:28px;top:110px;padding:16px 18px;min-width:210px;background:rgba(2,9,13,.9);border:1px solid rgba(34,211,238,.3)}.rideHud .big{font-size:32px;letter-spacing:3px;color:#fff}.rideHud .unit{font-size:9px;color:${CYAN};letter-spacing:3px}.rideHud .line{display:flex;justify-content:space-between;margin-top:10px;font-size:9px;letter-spacing:2px}.centerCard{position:absolute;z-index:20;left:50%;top:50%;transform:translate(-50%,-50%);min-width:340px;padding:22px;background:rgba(3,10,15,.96);border:1px solid rgba(34,211,238,.35);box-shadow:0 20px 60px rgba(0,0,0,.6);text-align:center}.centerCard h3{margin:0 0 8px;font-size:13px;letter-spacing:4px;color:${CYAN}}.centerCard p{font-size:9px;line-height:1.8;color:#819aa2}.boltGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px}.bolt{padding:12px 8px;border:1px solid rgba(34,211,238,.25);background:#07151b;color:#d9fbff;cursor:pointer;font:9px monospace;letter-spacing:1px}.bolt.removed{opacity:.4;text-decoration:line-through}.step{padding:14px 17px;font-size:9px;letter-spacing:2px;color:#8da6ad}.step b{color:${CYAN}}@media(max-width:900px){.left{width:250px}.right{width:230px}.vehicle-name{display:none}.panel{font-size:90%}}
`

function BikeModel({ bikeRef, hidden, disassembly }) {
  const { scene } = useGLTF(MODEL)
  const clone = useMemo(() => scene.clone(true), [scene])
  const fit = useMemo(() => {
    clone.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    return { scale: 4.9 / Math.max(size.x, size.y, size.z, 1), offset: new THREE.Vector3(-center.x, -box.min.y, -center.z) }
  }, [clone])

  useEffect(() => {
    clone.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      if (o.material) {
        o.material.side = THREE.DoubleSide
        if ('roughness' in o.material) o.material.roughness = Math.min(o.material.roughness ?? .5, .7)
        if ('metalness' in o.material) o.material.metalness = Math.min(o.material.metalness ?? 0, .9)
      }
    })
  }, [clone])

  useEffect(() => {
    clone.traverse((o) => {
      if (!o.isMesh || !o.material) return
      const n = `${o.name} ${o.parent?.name || ''}`.toLowerCase()
      const shouldHide = (hidden.fairing && /(fair|tank|body|cover|cowl)/.test(n)) || (hidden.exhaust && /exhaust|muffler|silencer/.test(n)) || (hidden.wheels && /wheel|rim|tire/.test(n)) || (hidden.seat && /seat|saddle/.test(n))
      o.visible = !shouldHide
    })
  }, [clone, hidden])

  return <group ref={bikeRef} scale={fit.scale * 1.35} rotation={[0, Math.PI, 0]}>
    <primitive object={clone} position={fit.offset} />
    {disassembly > 0 && <group position={[0, 1.1, 0]}><mesh position={[0, .55, 0]}><boxGeometry args={[1.5,.95,1.05]} /><meshStandardMaterial color="#202a30" metalness={.85} roughness={.3} /></mesh><mesh position={[0,1.08,-.6]}><boxGeometry args={[1.2,.1,.1]} /><meshStandardMaterial color="#9aa8ae" metalness={1} /></mesh></group>}
  </group>
}

function Garage() {
  return <group>
    <mesh position={[0,-.22,0]} receiveShadow><boxGeometry args={[34,.35,26]} /><meshStandardMaterial color="#171e22" roughness={.78} /></mesh>
    <gridHelper args={[34,68,'#185365','#08141a']} position={[0,-.02,0]} />
    <mesh position={[0,4.5,-12.8]}><boxGeometry args={[34,9,.3]} /><meshStandardMaterial color="#071015" roughness={.9} /></mesh>
    {[-16.8,16.8].map(x=><mesh key={x} position={[x,3,0]}><boxGeometry args={[.3,6,26]} /><meshStandardMaterial color="#091319" /></mesh>)}
    <mesh position={[0,.02,0]}><boxGeometry args={[9,.16,7]} /><meshStandardMaterial color="#353d42" metalness={.65} roughness={.32} /></mesh>
    {[-3.7,3.7].flatMap(x=>[-2.8,2.8].map(z=><mesh key={`${x}-${z}`} position={[x,.85,z]}><boxGeometry args={[.15,1.7,.15]} /><meshStandardMaterial color="#9aa5aa" metalness={.9} /></mesh>))}
    {[-8,0,8].map(x=><group key={x} position={[x,5.2,0]}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.05,.05,5.8,12]} /><meshStandardMaterial color="#59666c" metalness={.85} /></mesh><pointLight position={[0,-.35,0]} intensity={14} distance={8} color="#dffaff" /></group>)}
    <mesh position={[0,1.8,-12.55]}><boxGeometry args={[7,3.5,.15]} /><meshStandardMaterial color="#101b20" metalness={.35} roughness={.55} /></mesh>
  </group>
}

function Track() {
  const barriers=[]
  for(let i=0;i<96;i++){const t=i/96*Math.PI*2;const x=Math.cos(t)*22;const z=Math.sin(t)*14;barriers.push(<mesh key={i} position={[x,.35,z]} rotation={[0,-t,0]}><boxGeometry args={[.65,.7,1.4]} /><meshStandardMaterial color={i%2?'#f0f0f0':'#d62e3d'} /></mesh>)}
  return <group>
    <mesh position={[0,-.3,0]} receiveShadow><boxGeometry args={[90,.4,60]} /><meshStandardMaterial color="#080b0d" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]}><ringGeometry args={[9,21,128]} /><meshStandardMaterial color="#252b2f" roughness={.92} side={THREE.DoubleSide} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.01,0]}><ringGeometry args={[21,25,128]} /><meshStandardMaterial color="#697277" roughness={.85} side={THREE.DoubleSide} /></mesh>
    {barriers}
    <mesh position={[0,.06,-14]}><boxGeometry args={[4,.12,.4]} /><meshStandardMaterial color="#fff" /></mesh>
    {[-2.4,-1.2,0,1.2,2.4].map((x,i)=><mesh key={i} position={[x,.07,-14]}><boxGeometry args={[.9,.05,.5]} /><meshStandardMaterial color={i%2?'#111':'#fff'} /></mesh>)}
    <mesh position={[0,2.8,-19]}><boxGeometry args={[7,5,.18]} /><meshStandardMaterial color="#111b20" emissive="#08252c" /></mesh>
    <Html position={[0,3.8,-19.2]} center><div style={{color:CYAN,font:'bold 16px monospace',letterSpacing:5,textShadow:'0 0 14px #22d3ee'}}>VEHICLELAB CIRCUIT</div></Html>
  </group>
}

function RideScene({ onTelemetry }) {
  const bikeRef=useRef(); const keys=useRef({}); const speed=useRef(0); const heading=useRef(0); const {camera}=useThree(); const lap=useRef(0); const lastZ=useRef(-14); const [hud,setHud]=useState({speed:0,rpm:1200,gear:1,lap:0,time:0}); const start=useRef(performance.now())
  useEffect(()=>{const d=e=>{keys.current[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault()};const u=e=>{keys.current[e.key.toLowerCase()]=false};window.addEventListener('keydown',d);window.addEventListener('keyup',u);return()=>{window.removeEventListener('keydown',d);window.removeEventListener('keyup',u)}},[])
  useFrame((_,dt)=>{
    if(!bikeRef.current)return
    const k=keys.current; const throttle=k.w||k.arrowup; const brake=k.s||k.arrowdown||k[' ']; const steer=(k.a||k.arrowleft?-1:0)+(k.d||k.arrowright?1:0)
    if(throttle)speed.current=THREE.MathUtils.damp(speed.current,32,2.2,dt);else speed.current=THREE.MathUtils.damp(speed.current,0,1.5,dt);if(brake)speed.current=THREE.MathUtils.damp(speed.current,0,5,dt)
    heading.current+=steer*dt*(.45+speed.current/30); bikeRef.current.position.x+=Math.sin(heading.current)*speed.current*dt*.55; bikeRef.current.position.z+=Math.cos(heading.current)*speed.current*dt; bikeRef.current.rotation.y=heading.current+Math.PI; bikeRef.current.rotation.z=-steer*.12
    const r=Math.sqrt((bikeRef.current.position.x/15)**2+(bikeRef.current.position.z/9)**2)
    if(r>2.5){bikeRef.current.position.set(0,.05,-14);heading.current=0;speed.current=0}
    if(lastZ.current>0 && bikeRef.current.position.z<0 && Math.abs(bikeRef.current.position.x)<5){lap.current+=1} lastZ.current=bikeRef.current.position.z
    const p=bikeRef.current.position;const desired=new THREE.Vector3(p.x-Math.sin(heading.current)*7,3.1,p.z-Math.cos(heading.current)*7);camera.position.lerp(desired,1-Math.pow(.0005,dt));camera.lookAt(p.x,1,p.z)
    const next={speed:Math.round(speed.current*7.1),rpm:Math.round(1200+speed.current*390),gear:Math.min(6,1+Math.floor(speed.current/5)),lap:lap.current,time:Math.round((performance.now()-start.current)/100)/10};setHud(next);onTelemetry(next)
  })
  return <><color attach="background" args={['#020507']} /><ambientLight intensity={1.3}/><hemisphereLight skyColor="#bcecf5" groundColor="#11151a" intensity={1.8}/><directionalLight position={[8,12,6]} intensity={4.5} castShadow/><pointLight position={[0,5,0]} intensity={7} color="#22d3ee"/><Track/><BikeModel bikeRef={bikeRef} hidden={{}} disassembly={0}/></>
}

function WorkshopScene({ bikeRef, hidden, disassembly, engineFocus }) {
  const controls=useRef(); const {camera}=useThree()
  useEffect(()=>{camera.position.set(engineFocus?3.1:6.8,engineFocus?2.5:3.5,engineFocus?3.2:7.5);camera.lookAt(0,1,0);controls.current?.target.set(0,1,0);controls.current?.update()},[engineFocus,camera])
  return <><color attach="background" args={['#02070b']}/><ambientLight intensity={1.45}/><hemisphereLight skyColor="#dffbff" groundColor="#11151a" intensity={2}/><directionalLight position={[7,11,7]} intensity={5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}/><directionalLight position={[-6,5,-4]} intensity={2.5}/><pointLight position={[0,4,3]} intensity={15} distance={13} color="#22d3ee"/><pointLight position={[0,3,-4]} intensity={10} distance={10} color="#8c5cff"/><Garage/><BikeModel bikeRef={bikeRef} hidden={hidden} disassembly={disassembly}/><OrbitControls ref={controls} makeDefault enablePan={false} minDistance={3} maxDistance={14} minPolarAngle={.35} maxPolarAngle={1.55} rotateSpeed={.65} zoomSpeed={.8}/></>
}

function EngineBench({ bolts, setBolts, coverOpen, setCoverOpen, exploded, setExploded }) {
  const all=bolts.every(Boolean)
  return <group position={[0,0,0]}>
    <mesh position={[0,-.15,0]}><boxGeometry args={[6,.3,4]} /><meshStandardMaterial color="#30383d" metalness={.7} roughness={.3}/></mesh>
    <mesh position={[0,.95,0]} castShadow><boxGeometry args={[2.4,1.55,1.5]}/><meshStandardMaterial color="#222b30" metalness={.85} roughness={.28}/></mesh>
    {Array.from({length:8}).map((_,i)=><mesh key={i} position={[0,.25+i*.18,0]}><boxGeometry args={[2.7,.06,1.35]}/><meshStandardMaterial color="#879399" metalness={.9} roughness={.22}/></mesh>)}
    {!coverOpen&&<group>{[[-.78,1.45,-.85],[.78,1.45,-.85],[-.78,.45,-.85],[.78,.45,-.85]].map((p,i)=>bolts[i]?null:<mesh key={i} position={p} onClick={e=>{e.stopPropagation();setBolts(v=>v.map((x,j)=>j===i?true:x))}}><cylinderGeometry args={[.12,.12,.1,8]}/><meshStandardMaterial color="#e6f1f4" metalness={1} roughness={.12}/></mesh>)}</group>}
    {!coverOpen&&<mesh position={[0,.95,-.86]} onClick={e=>{e.stopPropagation();if(all)setCoverOpen(true)}}><boxGeometry args={[2.35,1.5,.12]}/><meshStandardMaterial color="#0c151a" metalness={.8} roughness={.25}/></mesh>}
    {coverOpen&&<group><mesh position={[0,1.9,exploded?-.9:-.1]}><boxGeometry args={[2.15,.18,1.35]}/><meshStandardMaterial color="#b7c2c7" metalness={.85} roughness={.25}/></mesh><mesh position={[0,1.15,exploded?.9:0]}><cylinderGeometry args={[.42,.42,.18,32]}/><meshStandardMaterial color="#bd743d" metalness={.65} roughness={.3}/></mesh><mesh position={[-.8,1.15,exploded?-.6:0]}><boxGeometry args={[.28,.9,.28]}/><meshStandardMaterial color="#c9d4d8" metalness={.9}/></mesh><mesh position={[.8,1.15,exploded?.6:0]}><boxGeometry args={[.28,.9,.28]}/><meshStandardMaterial color="#c9d4d8" metalness={.9}/></mesh></group>}
    <Html position={[0,3,0]} center><div style={{padding:'8px 12px',background:'rgba(2,9,13,.94)',border:'1px solid rgba(34,211,238,.35)',color:CYAN,font:'10px monospace',letterSpacing:2}}>ENGINE {coverOpen?'OPEN':'COVER CLOSED'}</div></Html>
  </group>
}

export default function VehicleLab(){
  const [mode,setMode]=useState('workshop'); const [engineFocus,setEngineFocus]=useState(false); const [hidden,setHidden]=useState({fairing:false,exhaust:false,wheels:false,seat:false}); const [installed,setInstalled]=useState({}); const [bolts,setBolts]=useState([false,false,false,false]); const [coverOpen,setCoverOpen]=useState(false); const [exploded,setExploded]=useState(false); const [message,setMessage]=useState('Drag to orbit · scroll to zoom · click a component')
  const bikeRef=useRef();
  const [telemetry,setTelemetry]=useState({speed:0,rpm:1200,gear:1,lap:0,time:0})
  const stats=useMemo(()=>{const s={...STOCK};PARTS.forEach(p=>{if(installed[p.id]){s.power+=(p.power||0);s.weight+=(p.weight||0);s.grip+=(p.grip||0);s.braking+=(p.braking||0);s.handling+=(p.handling||0)}});return s},[installed])
  const togglePart=(id)=>{setInstalled(v=>({...v,[id]:!v[id]}));setMessage(installed[id]?`${id.toUpperCase()} returned to stock`:`${id.toUpperCase()} upgrade installed`)}
  const removePart=(id)=>{setHidden(v=>({...v,[id]:!v[id]}));setMessage(hidden[id]?`${id.toUpperCase()} reinstalled`:`${id.toUpperCase()} removed for inspection`)}
  const startEngine=()=>{setEngineFocus(true);setBolts([false,false,false,false]);setCoverOpen(false);setExploded(false);setMessage('Remove all four fasteners to unlock the engine cover')}
  const reset=()=>{setEngineFocus(false);setHidden({fairing:false,exhaust:false,wheels:false,seat:false});setInstalled({});setBolts([false,false,false,false]);setCoverOpen(false);setExploded(false);setMessage('Workshop reset — bike ready for inspection')}
  useEffect(()=>{if(coverOpen)setMessage(exploded?'Internal engine components separated — inspect and restore them':'Engine cover removed — explode the assembly to inspect internals')},[coverOpen,exploded])
  return <div className="vehicle-lab"><style>{css}</style>
    <div className="top"><div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">REAL 3D VEHICLE WORKSHOP // GARAGE + CIRCUIT</div></div><div className="vehicle-name">KAWASAKI // NINJA 650 <b>2021</b></div><div className="top-actions"><button className={`ui-btn ${mode==='workshop'?'active':''}`} onClick={()=>{setMode('workshop');setEngineFocus(false)}}>WORKSHOP</button><button className={`ui-btn ${mode==='ride'?'active':''}`} onClick={()=>{setMode('ride');setEngineFocus(false)}}>TEST RIDE</button></div></div>
    {mode==='workshop'?<>
      <div className="panel left"><div className="title">WORKSHOP COMPONENTS</div>{PARTS.map(p=><button className={`part ${installed[p.id]?'sel':''}`} key={p.id} onClick={()=>togglePart(p.id)}><span><b>{p.name}</b><small>{p.category}</small></span><strong>{installed[p.id]?'UPGRADED':'STOCK'}</strong></button>)}<button className="part" onClick={()=>removePart('fairing')}><span><b>{hidden.fairing?'INSTALL FAIRING':'REMOVE FAIRING'}</b><small>BODY INSPECTION</small></span><strong>{hidden.fairing?'OPEN':'CLOSED'}</strong></button><button className="part" onClick={()=>removePart('exhaust')}><span><b>{hidden.exhaust?'INSTALL EXHAUST':'REMOVE EXHAUST'}</b><small>EXHAUST INSPECTION</small></span><strong>{hidden.exhaust?'OPEN':'CLOSED'}</strong></button><button className={`part ${engineFocus?'sel':''}`} onClick={startEngine}><span><b>ENGINE ASSEMBLY</b><small>4 FASTENERS / DISASSEMBLY</small></span><strong>INSPECT</strong></button><div className="title">MECHANICAL TOOLS</div><div className="tools"><div className="tool">🔧 SOCKET</div><div className="tool">🪛 DRIVER</div><div className="tool">⚙ TORQUE</div><div className="tool">◉ INSPECTION</div></div>{engineFocus&&<><div className="step"><b>STEP 1</b> Remove 4 fasteners</div><div className="boltGrid">{bolts.map((b,i)=><button key={i} className={`bolt ${b?'removed':''}`} onClick={()=>setBolts(v=>v.map((x,j)=>j===i?!x:x))}>BOLT {i+1}<br/>{b?'REMOVED':'REMOVE'}</button>)}</div><button className="action" disabled={!bolts.every(Boolean)} onClick={()=>setCoverOpen(true)}>{bolts.every(Boolean)?'OPEN ENGINE COVER':'REMOVE ALL 4 FASTENERS'}</button>{coverOpen&&<><div className="step"><b>STEP 2</b> Cover open</div><button className="action" onClick={()=>setExploded(v=>!v)}>{exploded?'RESTORE ENGINE':'EXPLODE ENGINE ASSEMBLY'}</button><button className="action success" onClick={()=>{setExploded(false);setCoverOpen(false);setBolts([false,false,false,false]);setMessage('Engine reassembled successfully')}}>REASSEMBLE & CLOSE</button></>}</>}</div>
      <div className="panel right"><div className="title">LIVE VEHICLE STATE</div>{[['POWER',stats.power,'HP',100],['WEIGHT',stats.weight,'KG',250],['GRIP',stats.grip,'%',100],['BRAKING',stats.braking,'%',100],['HANDLING',stats.handling,'%',100]].map(([n,v,u,max])=><div className="stat" key={n}><div className="stat-row"><span>{n}</span><b>{v} {u}</b></div><div className="bar"><i style={{width:`${Math.min(100,v/max*100)}%`}}/></div></div>)}<button className="action" onClick={()=>removePart('wheels')}>{hidden.wheels?'REINSTALL WHEELS':'REMOVE WHEELS'}</button><button className="action" onClick={()=>removePart('seat')}>{hidden.seat?'REINSTALL SEAT':'REMOVE SEAT'}</button><button className="action danger" onClick={reset}>RESET BUILD</button></div>
      {engineFocus&&<div className="centerCard"><h3>ENGINE SERVICE BAY</h3><p>{!coverOpen?'Remove all four fasteners using the buttons at left.':'The engine cover is open. Separate the internal assembly, inspect it, then reassemble it.'}</p></div>}
      <div className="hint">DRAG ORBIT · SCROLL ZOOM · CLICK COMPONENTS · ENGINE ASSEMBLY FOR MECHANICAL DEMO</div><div className="toast">{message}</div>
      <Canvas shadows camera={{position:[6.8,3.5,7.5],fov:42}} dpr={[1,2]}><WorkshopScene bikeRef={bikeRef} hidden={hidden} disassembly={exploded?2:engineFocus?1:0} engineFocus={engineFocus}/>{engineFocus&&<EngineBench bolts={bolts} setBolts={setBolts} coverOpen={coverOpen} setCoverOpen={setCoverOpen} exploded={exploded} setExploded={setExploded}/>}</Canvas>
    </>:<>
      <Canvas shadows camera={{position:[0,3.2,8],fov:50}} dpr={[1,2]}><RideScene onTelemetry={setTelemetry}/></Canvas>
      <div className="rideHud"><div className="big">{telemetry.speed}</div><div className="unit">KM/H</div><div className="line"><span>RPM</span><b>{telemetry.rpm}</b></div><div className="line"><span>GEAR</span><b>{telemetry.gear}</b></div><div className="line"><span>LAP</span><b>{telemetry.lap}</b></div><div className="line"><span>TIME</span><b>{telemetry.time}s</b></div></div><div className="panel right"><div className="title">TEST RIDE</div><div className="step"><b>W / ↑</b> throttle</div><div className="step"><b>S / ↓ / SPACE</b> brake</div><div className="step"><b>A / D / ← →</b> steer</div><div className="step"><b>R</b> reset position</div><button className="action" onClick={()=>setMode('workshop')}>RETURN TO WORKSHOP</button></div><div className="hint">W / A / S / D OR ARROW KEYS TO RIDE · STAY ON THE CIRCUIT</div>
    </>}
  </div>
}

useGLTF.preload(MODEL)

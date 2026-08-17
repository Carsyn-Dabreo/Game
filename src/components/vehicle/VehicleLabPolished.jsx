import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL='/models/motorbike.glb'
const PARTS=[
  ['FULL VEHICLE','Complete Motorcycle','3D'],
  ['ENGINE ASSEMBLY','Engine Assembly','INSPECT'],
  ['FRONT','Front Assembly','ZOOM'],
  ['REAR','Rear Assembly','ZOOM'],
]

function Bike({onClick,scale=1,position=[0,0,0],rotation=[0,Math.PI,0]}){
  const {scene}=useGLTF(MODEL)
  const clone=useMemo(()=>scene.clone(true),[scene])
  const fit=useMemo(()=>{
    clone.updateMatrixWorld(true)
    const box=new THREE.Box3().setFromObject(clone)
    const size=box.getSize(new THREE.Vector3())
    const center=box.getCenter(new THREE.Vector3())
    return {scale:4.2/Math.max(size.x,size.y,size.z,1),offset:new THREE.Vector3(-center.x,-box.min.y,-center.z)}
  },[clone])
  useEffect(()=>clone.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material)o.material.side=THREE.DoubleSide}}),[clone])
  return <group position={position} rotation={rotation} scale={fit.scale*scale}><primitive object={clone} position={fit.offset} onClick={e=>{e.stopPropagation();onClick?.()}}/></group>
}
useGLTF.preload(MODEL)

function Garage(){return <group>
  <mesh position={[0,-.12,0]} receiveShadow><boxGeometry args={[20,.2,16]}/><meshStandardMaterial color="#10181e" roughness={.72} metalness={.28}/></mesh>
  <gridHelper args={[20,40,'#174552','#071319']} position={[0,.01,0]}/>
  <mesh position={[0,4.2,-7.8]}><boxGeometry args={[20,8.5,.2]}/><meshStandardMaterial color="#071117" roughness={.9}/></mesh>
  <mesh position={[-9.9,3,0]}><boxGeometry args={[.2,6,16]}/><meshStandardMaterial color="#09131a"/></mesh>
  <mesh position={[9.9,3,0]}><boxGeometry args={[.2,6,16]}/><meshStandardMaterial color="#09131a"/></mesh>
  <mesh position={[0,.08,0]} receiveShadow><boxGeometry args={[7,.16,5.2]}/><meshStandardMaterial color="#29343b" metalness={.75} roughness={.25}/></mesh>
  {[[-3,.7,-2.15],[3,.7,-2.15],[-3,.7,2.15],[3,.7,2.15]].map((p,i)=><mesh key={i} position={p}><boxGeometry args={[.15,1.4,.15]}/><meshStandardMaterial color="#7b8992" metalness={.85}/></mesh>)}
  <group position={[-7.2,1.25,-6.4]}><mesh><boxGeometry args={[4,2.5,.7]}/><meshStandardMaterial color="#17232a" metalness={.55}/></mesh>{[-.7,0,.7].map(y=><mesh key={y} position={[0,y,.38]}><boxGeometry args={[3.4,.08,.45]}/><meshStandardMaterial color="#687881" metalness={.75}/></mesh>)}</group>
  <group position={[6.8,1.2,-6.4]}><mesh><boxGeometry args={[4.4,2.4,.8]}/><meshStandardMaterial color="#17242b" metalness={.55}/></mesh><mesh position={[0,1.28,0]}><boxGeometry args={[4.4,.12,.8]}/><meshStandardMaterial color="#7b8992" metalness={.8}/></mesh><mesh position={[0,.55,.42]}><boxGeometry args={[3.7,.9,.04]}/><meshStandardMaterial color="#061018" emissive="#003846" emissiveIntensity={2}/></mesh></group>
  <group position={[-7,1.1,2.7]}><mesh><boxGeometry args={[3.5,2.2,.9]}/><meshStandardMaterial color="#18262d" metalness={.5}/></mesh>{[.2,.7,1.2].map(y=><mesh key={y} position={[0,y-1,.48]}><boxGeometry args={[2.8,.035,.03]}/><meshStandardMaterial color="#22d3ee" emissive="#075b69"/></mesh>)}</group>
  {[-6,0,6].map(x=><group key={x} position={[x,5,0]}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.04,.04,4.8,12]}/><meshStandardMaterial color="#43515a" metalness={.8}/></mesh><pointLight position={[0,-.2,0]} intensity={11} distance={7} color="#d8fbff"/></group>)}
  <mesh position={[0,2.7,-7.62]}><boxGeometry args={[8,3.2,.06]}/><meshStandardMaterial color="#050a0e" emissive="#002d38" emissiveIntensity={1.4}/></mesh>
  <Html position={[0,2.7,-7.5]} center><div className="garage-sign">VEHICLELAB // PERFORMANCE WORKSHOP</div></Html>
</group>}

function Hotspot({position,label,onClick}){return <group position={position} onClick={e=>{e.stopPropagation();onClick()}}><mesh><sphereGeometry args={[.14,16,16]}/><meshBasicMaterial color="#22d3ee" transparent opacity={.18} depthWrite={false}/></mesh><mesh rotation={[Math.PI/2,0,0]}><ringGeometry args={[.11,.15,24]}/><meshBasicMaterial color="#22d3ee" transparent opacity={.9} depthWrite={false}/></mesh><Html center distanceFactor={4} style={{pointerEvents:'none'}}><div className="hotspot-label">{label}</div></Html></group>}

function CameraDirector({selected,resetToken}){
  const {camera}=useThree(); const controls=useRef()
  const views={FULL:{p:[6.1,2.8,6.4],t:[0,1.05,0]},ENGINE:{p:[2.8,1.75,2.7],t:[0,1,.1]},FRONT:{p:[2.9,1.7,3.6],t:[0,.95,1.15]},REAR:{p:[2.9,1.5,-3.7],t:[0,.9,-1.15]}}
  useEffect(()=>{const v=views[selected]||views.FULL;camera.position.set(...v.p);controls.current?.target.set(...v.t);controls.current?.update()},[camera,selected,resetToken])
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.07} enablePan={false} minDistance={1.2} maxDistance={10} rotateSpeed={.8} zoomSpeed={.9}/>
}

function EngineInspect({bolts,onBolt,coverOpen,onCover,exploded}){return <group position={[0,.05,0]}>
  <mesh position={[0,1.02,0]}><boxGeometry args={[1.3,.86,.96]}/><meshStandardMaterial color="#242d33" metalness={.84} roughness={.28}/></mesh>
  {Array.from({length:8}).map((_,i)=><mesh key={i} position={[0,.7+i*.09,.02]}><boxGeometry args={[1.46,.04,.88]}/><meshStandardMaterial color="#707c84" metalness={.85} roughness={.24}/></mesh>)}
  {!coverOpen&&<group position={[0,1.42,-.55]}><mesh onClick={e=>{e.stopPropagation();if(bolts.every(Boolean))onCover()}}><boxGeometry args={[1.05,.72,.12]}/><meshStandardMaterial color="#10181e" metalness={.8} roughness={.22}/></mesh>{[[-.4,.26,-.09],[.4,.26,-.09],[-.4,-.26,-.09],[.4,-.26,-.09]].map((p,i)=>!bolts[i]&&<mesh key={i} position={p} onClick={e=>{e.stopPropagation();onBolt(i)}}><cylinderGeometry args={[.075,.075,.06,6]}/><meshStandardMaterial color="#d7e0e5" metalness={.95} roughness={.18}/></mesh>)}</group>}
  {coverOpen&&<group position={[0,1.42,-.62]}><mesh position={[0,0,exploded?-.8:0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.32,.32,.14,32]}/><meshStandardMaterial color="#b96e2f" metalness={.72} roughness={.3}/></mesh><mesh position={[0,.34,exploded?-.62:0]}><boxGeometry args={[.18,.5,.18]}/><meshStandardMaterial color="#aeb9c0" metalness={.85}/></mesh><mesh position={[0,-.34,exploded?-.62:0]}><boxGeometry args={[.72,.11,.2]}/><meshStandardMaterial color="#aeb9c0" metalness={.85}/></mesh><Html center><div className="hotspot-label">INTERNAL ASSEMBLY</div></Html></group>}
</group>}

function WorkshopScene({selected,setSelected,bolts,onBolt,coverOpen,setCoverOpen,exploded}){return <>
  <color attach="background" args={['#02070b']}/><ambientLight intensity={1.35}/><directionalLight position={[4,8,5]} intensity={4.2} castShadow/><pointLight position={[-4,4,2]} intensity={16} distance={12} color="#00d9ff"/><pointLight position={[4,3,-4]} intensity={11} distance={12} color="#805cff"/><Environment preset="warehouse"/><Garage/>
  <Suspense fallback={<Html center><div className="loading-text">LOADING REAL MOTORCYCLE...</div></Html>}><Bike onClick={()=>setSelected('FULL VEHICLE')} scale={1.2}/></Suspense>
  {selected==='FULL VEHICLE'&&<><Hotspot position={[0,.95,0]} label="ENGINE" onClick={()=>setSelected('ENGINE ASSEMBLY')}/><Hotspot position={[0,.65,1.42]} label="FRONT" onClick={()=>setSelected('FRONT')}/><Hotspot position={[0,.62,-1.38]} label="REAR" onClick={()=>setSelected('REAR')}/></>}
  {selected==='ENGINE ASSEMBLY'&&<EngineInspect bolts={bolts} onBolt={onBolt} coverOpen={coverOpen} onCover={()=>setCoverOpen(true)} exploded={exploded}/>}<CameraDirector selected={selected==='FULL VEHICLE'?'FULL':selected==='ENGINE ASSEMBLY'?'ENGINE':selected} resetToken={selected}/>
</>}

function Track(){const barriers=useMemo(()=>Array.from({length:64},(_,i)=>{const t=i/64*Math.PI*2;return{x:Math.cos(t)*22,z:Math.sin(t)*14,tangent:Math.atan2(Math.cos(t),-Math.sin(t)),ox:Math.cos(t)*25.2,oz:Math.sin(t)*17.2,ix:Math.cos(t)*18.8,iz:Math.sin(t)*10.8}}),[]);return <group>
  <mesh position={[0,-.2,0]} receiveShadow><boxGeometry args={[70,.2,52]}/><meshStandardMaterial color="#070d11" roughness={1}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]}><ringGeometry args={[10.8,19.2,96]}/><meshStandardMaterial color="#181c1f" roughness={.92} side={THREE.DoubleSide}/></mesh>
  {barriers.map((b,i)=><group key={i}><mesh position={[b.ox,.32,b.oz]} rotation={[0,b.tangent,0]}><boxGeometry args={[.35,.62,1.5]}/><meshStandardMaterial color={i%2?'#f2f2f2':'#df3742'}/></mesh><mesh position={[b.ix,.32,b.iz]} rotation={[0,b.tangent,0]}><boxGeometry args={[.35,.62,1.5]}/><meshStandardMaterial color={i%2?'#f2f2f2':'#df3742'}/></mesh></group>)}
  <group position={[22,.04,0]}>{Array.from({length:12},(_,i)=><mesh key={i} position={[0,.01,-2.75+i*.5]}><boxGeometry args={[4.2,.035,.25]}/><meshStandardMaterial color={i%2?'#f5f5f5':'#d93640'}/></mesh>)}</group>
  <mesh position={[0,.8,-18]}><boxGeometry args={[50,1.6,.35]}/><meshStandardMaterial color="#10191f" metalness={.65}/></mesh><mesh position={[0,.8,18]}><boxGeometry args={[50,1.6,.35]}/><meshStandardMaterial color="#10191f" metalness={.65}/></mesh>
  {[-18,-9,0,9,18].map(x=><group key={x} position={[x,3,-18]}><mesh><boxGeometry args={[.14,4.2,.14]}/><meshStandardMaterial color="#53616a" metalness={.8}/></mesh><pointLight position={[0,-1.4,0]} intensity={10} distance={9} color="#c8faff"/></group>)}
  <Html position={[0,2.1,0]} center><div className="track-world-label">VEHICLELAB CIRCUIT // RACE MODE</div></Html>
</group>}

function RideController({onExit}){const {scene}=useGLTF(MODEL);const clone=useMemo(()=>scene.clone(true),[scene]);const bike=useRef();const keys=useRef({});const velocity=useRef(0);const heading=useRef(0);const [telemetry,setTelemetry]=useState({speed:0,rpm:1200,gear:1,time:0});const start=useRef(performance.now());const {camera}=useThree();const fit=useMemo(()=>{clone.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(clone);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());return{scale:4/Math.max(size.x,size.y,size.z,1),offset:new THREE.Vector3(-center.x,-box.min.y,-center.z)}},[clone]);
  useEffect(()=>{clone.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});const down=e=>{keys.current[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='r'){velocity.current=0;heading.current=0;if(bike.current)bike.current.position.set(22,.02,0)}};const up=e=>keys.current[e.key.toLowerCase()]=false;window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[clone]);
  useFrame((_,delta)=>{if(!bike.current)return;const k=keys.current;const throttle=k.w||k.arrowup;const brake=k.s||k.arrowdown||k[' '];const steer=(k.a||k.arrowleft?-1:0)+(k.d||k.arrowright?1:0);if(throttle)velocity.current=Math.min(25,velocity.current+delta*10);else velocity.current=Math.max(0,velocity.current-delta*2.2);if(brake)velocity.current=Math.max(0,velocity.current-delta*15);const sp=Math.min(1,velocity.current/8);heading.current+=steer*delta*1.15*sp;bike.current.position.x+=Math.sin(heading.current)*velocity.current*delta;bike.current.position.z+=Math.cos(heading.current)*velocity.current*delta;bike.current.rotation.y=heading.current+Math.PI;bike.current.rotation.z=-steer*.09*sp;const p=bike.current.position;if(Math.abs(p.x)>31||Math.abs(p.z)>24){p.x=22;p.z=0;velocity.current=0;heading.current=0}const desired=new THREE.Vector3(p.x-Math.sin(heading.current)*6,3.0,p.z-Math.cos(heading.current)*6);camera.position.lerp(desired,1-Math.pow(.001,delta));camera.lookAt(p.x,1.05,p.z);setTelemetry({speed:Math.round(velocity.current*10),rpm:Math.round(1200+velocity.current*350),gear:Math.max(1,Math.min(6,Math.floor(velocity.current/4)+1)),time:(performance.now()-start.current)/1000})});
  return <><color attach="background" args={['#020508']}/><ambientLight intensity={1.1}/><directionalLight position={[8,10,5]} intensity={3.5} castShadow/><pointLight position={[0,5,0]} intensity={12} distance={20} color="#bff8ff"/><Track/><group ref={bike} position={[22,.02,0]} scale={fit.scale*1.08}><primitive object={clone} position={fit.offset}/></group><RideHUD telemetry={telemetry} onExit={onExit}/></>}

function RideHUD({telemetry,onExit}){return <div className="ride-hud"><div className="ride-top"><span>VEHICLELAB // TEST RIDE // CIRCUIT 01</span><button onClick={onExit}>EXIT TO WORKSHOP</button></div><div className="ride-speed"><b>{String(telemetry.speed).padStart(3,'0')}</b><span>KM/H</span></div><div className="ride-metrics"><span>RPM <b>{telemetry.rpm}</b></span><span>GEAR <b>{telemetry.gear}</b></span><span>LAP <b>1/3</b></span><span>TIME <b>{telemetry.time.toFixed(3)}</b></span></div><div className="ride-controls"><b>W / ↑</b> THROTTLE <b>S / ↓</b> BRAKE <b>A D / ← →</b> STEER <b>SPACE</b> HARD BRAKE <b>R</b> RESET <b>ESC</b> EXIT</div></div>}

export default function VehicleLabPolished(){
  const [mode,setMode]=useState('workshop');const [selected,setSelected]=useState('FULL VEHICLE');const [bolts,setBolts]=useState([false,false,false,false]);const [coverOpen,setCoverOpen]=useState(false);const [exploded,setExploded]=useState(false)
  useEffect(()=>{const esc=e=>{if(e.key==='Escape')setMode('workshop')};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[])
  const select=id=>{setSelected(id);if(id!=='ENGINE ASSEMBLY'){setCoverOpen(false);setExploded(false)}}
  const reset=()=>{setSelected('FULL VEHICLE');setBolts([false,false,false,false]);setCoverOpen(false);setExploded(false)}
  if(mode==='ride')return <div className="vehicle-lab"><Canvas shadows dpr={[1,2]} camera={{position:[28,3.5,7],fov:55}}><RideController onExit={()=>setMode('workshop')}/></Canvas></div>
  return <div className="vehicle-lab"><Canvas shadows dpr={[1,2]} camera={{position:[6.1,2.8,6.4],fov:48}}><WorkshopScene selected={selected} setSelected={select} bolts={bolts} onBolt={i=>setBolts(v=>v.map((x,j)=>j===i?true:x))} coverOpen={coverOpen} setCoverOpen={setCoverOpen} exploded={exploded}/></Canvas>
    <header className="lab-topbar"><div><div className="brand">VEHICLE<span>LAB</span></div><div className="micro">REAL 3D VEHICLE WORKSHOP // GARAGE BUILD</div></div><div className="vehicle-name">KAWASAKI NINJA 650 <span>2021</span> // GLB</div><div className="top-actions"><button className="active">WORKSHOP</button><button className="ride" onClick={()=>setMode('ride')}>TEST RIDE</button></div></header>
    <aside className="parts-panel glass"><div className="panel-title">WORKSHOP COMPONENTS</div><div className="part-list">{PARTS.map(([id,name,badge])=><button key={id} className={`part ${selected===id?'selected':''}`} onClick={()=>select(id)}><span><b>{name}</b><small>{id==='ENGINE ASSEMBLY'?'REMOVE / INSPECT':id==='FULL VEHICLE'?'REAL SCANNED MODEL':'BRAKE / WHEEL / ASSEMBLY'}</small></span><strong>{badge}</strong></button>)}</div><div className="tool-box"><div className="panel-title">MECHANICAL TOOLS</div><div className="tools"><span>🔩 CLICK FASTENERS</span><span>🔧 REMOVE COMPONENTS</span><span>◉ EXPLODE ASSEMBLY</span></div></div></aside>
    <aside className="stats-panel glass"><div className="panel-title">LIVE WORKSHOP STATE</div><div className="stat">POWER <b>68 HP</b></div><div className="stat">WEIGHT <b>196 KG</b></div><div className="stat">GRIP <b>82%</b></div><div className="stat">BRAKING <b>80%</b></div><div className="stat">HANDLING <b>78%</b></div><div className="divider"/><div className="panel-title">SELECTED PART</div><div className="selected-card"><b>{selected}</b><span>{selected==='ENGINE ASSEMBLY'?'4 FASTENERS // INTERNAL INSPECTION':'3D COMPONENT // PHYSICALLY INTERACTIVE'}</span></div>{selected==='ENGINE ASSEMBLY'&&<><button className="primary" disabled={!bolts.every(Boolean)} onClick={()=>setCoverOpen(true)}>{coverOpen?'ENGINE COVER OPEN':'OPEN ENGINE COVER'}</button>{coverOpen&&<button className="primary" onClick={()=>setExploded(v=>!v)}>{exploded?'RESTORE INTERNALS':'EXPLODE ASSEMBLY'}</button>}</>}<button className="secondary" onClick={reset}>RESET BUILD</button><button className="ride-launch" onClick={()=>setMode('ride')}>🏁 TEST RIDE ON CIRCUIT</button></aside>
    <div className="center-callout"><div className="reticle">◇</div>{selected==='ENGINE ASSEMBLY'?(bolts.every(Boolean)?'ALL FASTENERS REMOVED · OPEN THE COVER':`REMOVE ${bolts.filter(Boolean).length}/4 FASTENERS`):'DRAG TO ORBIT · SCROLL TO ZOOM · CLICK A 3D HOTSPOT'}</div><div className="bottom-hud"><span><b>DRAG</b> ORBIT</span><span><b>SCROLL</b> ZOOM</span><span><b>CLICK</b> SELECT</span><span><b>TEST RIDE</b> ENTER CIRCUIT</span></div>
  </div>
}

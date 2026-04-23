import React, { useMemo } from 'react'
import { Box, Sphere, Cylinder, Plane, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import InteractiveObject from '../components/game/InteractiveObject'
import NPC from '../components/game/NPC'
import Vehicle from '../components/game/Vehicle'
import Road from '../components/game/Road'
import * as THREE from 'three'

function Building({ position, size, color, emissive }) {
  return (
    <group position={position}>
      <Box args={size} castShadow receiveShadow>
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.1} metalness={0.8} roughness={0.2} />
      </Box>
      {/* Windows */}
      {Array.from({ length: Math.floor(size[1] / 2) }).map((_, i) => (
        <Box
          key={i}
          position={[0, -size[1]/2 + 1 + i * 2, size[2]/2 + 0.01]}
          args={[size[0] * 0.8, 1.5, 0.1]}
        >
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
        </Box>
      ))}
    </group>
  )
}

function StreetLight({ position }) {
  return (
    <group position={position}>
      <Cylinder args={[0.1, 0.1, 4]} position={[0, 2, 0]} castShadow>
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Sphere args={[0.3]} position={[0, 4, 0]}>
        <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  )
}

function Hologram({ position }) {
  const meshRef = React.useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1, 2, 1]}>
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} transparent opacity={0.6} />
      </Box>
    </group>
  )
}

function DataStream({ start, end }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      pts.push(new THREE.Vector3(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI * 4) * 2,
        start[2] + (end[2] - start[2]) * t
      ))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [start, end])

  return (
    <line>
      <bufferGeometry attach="geometry" {...points} />
      <lineBasicMaterial color="#00ffff" linewidth={2} />
    </line>
  )
}

export default function Environment() {
  // Generate buildings
  const buildings = useMemo(() => [
    { position: [-10, 5, -10], size: [8, 10, 8], color: "#1a237e", emissive: "#3949ab" },
    { position: [10, 7, -10], size: [6, 14, 6], color: "#4a148c", emissive: "#7b1fa2" },
    { position: [-10, 6, 10], size: [7, 12, 7], color: "#b71c1c", emissive: "#e53935" },
    { position: [10, 8, 10], size: [5, 16, 5], color: "#1b5e20", emissive: "#43a047" },
    { position: [0, 4, 0], size: [10, 8, 10], color: "#e65100", emissive: "#ff9800" },
    { position: [-20, 5, 0], size: [6, 10, 6], color: "#006064", emissive: "#00acc1" },
    { position: [20, 6, 0], size: [8, 12, 8], color: "#4e342e", emissive: "#8d6e63" },
    { position: [0, 5, -20], size: [7, 10, 7], color: "#311b92", emissive: "#673ab7" },
    { position: [0, 7, 20], size: [6, 14, 6], color: "#004d40", emissive: "#00897b" },
  ], [])

  // Street lights
  const streetLights = useMemo(() => [
    [-15, 0, -15], [15, 0, -15], [-15, 0, 15], [15, 0, 15],
    [-5, 0, -5], [5, 0, -5], [-5, 0, 5], [5, 0, 5],
  ], [])

  // Holograms
  const holograms = useMemo(() => [
    [0, 3, -5], [5, 3, 0], [-5, 3, 0], [0, 3, 5],
  ], [])

  // Data streams
  const dataStreams = useMemo(() => [
    { start: [-10, 8, -10], end: [10, 10, -10] },
    { start: [10, 10, -10], end: [10, 12, 10] },
    { start: [10, 12, 10], end: [-10, 10, 10] },
    { start: [-10, 10, 10], end: [-10, 8, -10] },
  ], [])

  // Interactive objects with challenges
  const interactiveObjects = useMemo(() => [
    {
      position: [-5, 2, -5],
      size: [1, 1, 1],
      challenge: {
        title: "Firewall Breach",
        type: "Security",
        description: "A firewall has been compromised. Identify the vulnerability.",
        content: "Which port is commonly used for FTP attacks?\nA) Port 21\nB) Port 80\nC) Port 443\nD) Port 22"
      }
    },
    {
      position: [5, 2, 5],
      size: [1, 1, 1],
      challenge: {
        title: "SQL Injection",
        type: "Database",
        description: "Detect and prevent SQL injection attacks.",
        content: "What prevents SQL injection?\nA) Input validation\nB) Parameterized queries\nC) Both A and B\nD) None"
      }
    },
    {
      position: [0, 2, 0],
      size: [1, 1, 1],
      challenge: {
        title: "Phishing Detection",
        type: "Social Engineering",
        description: "Identify phishing attempts in emails.",
        content: "Red flag in phishing emails:\nA) Urgent language\nB) Generic greetings\nC) Suspicious links\nD) All of the above"
      }
    }
  ], [])

  // Roads
  const roads = useMemo(() => [
    { position: [0, 0, -15], width: 8, length: 30 },
    { position: [-15, 0, 0], width: 8, length: 30, rotation: [0, Math.PI/2, 0] },
    { position: [15, 0, 0], width: 8, length: 30, rotation: [0, Math.PI/2, 0] },
    { position: [0, 0, 15], width: 8, length: 30 }
  ], [])

  // NPCs in the city
  const npcs = useMemo(() => [
    { position: [-8, 0, -8], name: "Alex", task: "Help me secure the network" },
    { position: [8, 0, -8], name: "Sam", task: "Investigate the breach" },
    { position: [0, 0, 0], name: "Jordan", task: "Update security protocols" },
    { position: [-12, 0, 5], name: "Casey", task: "Scan for vulnerabilities" },
    { position: [12, 0, 5], name: "Morgan", task: "Recover encrypted data" }
  ], [])

  // Vehicles in the city
  const vehicles = useMemo(() => [
    { position: [0, 0, -15], color: "#ff4444", type: "car" },
    { position: [-10, 0, 0], color: "#4444ff", type: "car" },
    { position: [10, 0, 0], color: "#44ff44", type: "car" },
    { position: [0, 0, 15], color: "#ffff44", type: "car" }
  ], [])

  return (
    <>
      {/* Ground */}
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </Plane>

      {/* Roads */}
      {roads.map((road, i) => (
        <Road key={i} {...road} />
      ))}

      {/* Grid floor */}
      <gridHelper args={[100, 50, "#00ffff", "#004444"]} position={[0, 0.01, 0]} />

      {/* Buildings */}
      {buildings.map((building, i) => (
        <Building key={i} {...building} />
      ))}

      {/* Street lights */}
      {streetLights.map((position, i) => (
        <StreetLight key={i} position={position} />
      ))}

      {/* Holograms */}
      {holograms.map((position, i) => (
        <Hologram key={i} position={position} />
      ))}

      {/* Data streams */}
      {dataStreams.map((stream, i) => (
        <DataStream key={i} {...stream} />
      ))}

      {/* NPCs */}
      {npcs.map((npc, i) => (
        <NPC key={i} {...npc} />
      ))}

      {/* Vehicles */}
      {vehicles.map((vehicle, i) => (
        <Vehicle key={i} {...vehicle} />
      ))}

      {/* Interactive objects */}
      {interactiveObjects.map((obj, i) => (
        <InteractiveObject key={i} {...obj} />
      ))}

      {/* Floating particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Sphere key={i} args={[0.05]} position={[
          (Math.random() - 0.5) * 40,
          Math.random() * 10 + 2,
          (Math.random() - 0.5) * 40
        ]}>
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </>
  )
}

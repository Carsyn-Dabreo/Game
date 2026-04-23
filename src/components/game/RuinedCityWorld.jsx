import React, { useMemo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import AnimatedZombie from './AnimatedZombie'
import {
  BUILDINGS,
  COVER_OBJECTS,
  CRATES,
  DISTRICTS,
  TRAFFIC_LIGHT_POS,
  getGroundHeight,
  makeCollider
} from './survivalData'

function TrafficLight({ active }) {
  const color = active ? '#ff4949' : '#ffbd61'
  return (
    <group position={[TRAFFIC_LIGHT_POS.x, getGroundHeight(0, 0), TRAFFIC_LIGHT_POS.z]}>
      {[
        [-2.6, 0],
        [2.6, 0],
        [0, -2.6],
        [0, 2.6]
      ].map(([x, z], index) => (
        <group key={index} position={[x, 0, z]}>
          <mesh position={[0, 3.6, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 7.2, 8]} />
            <meshStandardMaterial color="#42474e" />
          </mesh>
          <mesh position={[0, 6.7, 0]}>
            <boxGeometry args={[0.55, 1.4, 0.55]} />
            <meshStandardMaterial color="#202328" />
          </mesh>
          <mesh position={[0, 6.95, 0.3]}>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.15} />
          </mesh>
        </group>
      ))}
      {active && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[1.8, 18, 18]} />
          <meshStandardMaterial color="#ff5454" emissive="#ff3434" emissiveIntensity={1.25} transparent opacity={0.25} />
        </mesh>
      )}
    </group>
  )
}

function SupplyCrate({ crate, unlocked }) {
  return (
    <group position={[crate.x, getGroundHeight(crate.x, crate.z), crate.z]}>
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[3.2, 2.3, 2.2]} />
        <meshStandardMaterial color={unlocked ? '#35565b' : '#5b432f'} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.4, 1.12]}>
        <planeGeometry args={[2, 0.8]} />
        <meshStandardMaterial
          color={unlocked ? '#7ff3ff' : '#ffcc66'}
          emissive={unlocked ? '#46dff0' : '#a26a1e'}
          emissiveIntensity={0.65}
        />
      </mesh>
      <Text position={[0, 3.4, 0]} fontSize={0.72} color={unlocked ? '#7ff3ff' : '#ffd98a'} anchorX="center" anchorY="middle">
        {unlocked ? crate.rewardLabel.toUpperCase() : crate.label.toUpperCase()}
      </Text>
    </group>
  )
}

export default function RuinedCityWorld({ bullets, zombies, crateStates, trafficLureTime, zombieTarget }) {
  const colliders = useMemo(() => [...BUILDINGS.map(makeCollider), ...COVER_OBJECTS.map(makeCollider)], [])

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2600, 2600]} />
        <meshStandardMaterial color="#7f715e" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[240, 240]} />
        <meshStandardMaterial color="#25272d" roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[26, 240]} />
        <meshStandardMaterial color="#2f3640" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[240, 26]} />
        <meshStandardMaterial color="#2f3640" roughness={0.9} />
      </mesh>

      {[-44, 44].map((x) => (
        <mesh key={`v-road-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.04, 0]} receiveShadow>
          <planeGeometry args={[18, 240]} />
          <meshStandardMaterial color="#2b3138" roughness={0.95} />
        </mesh>
      ))}
      {[-48, 48].map((z) => (
        <mesh key={`h-road-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, z]} receiveShadow>
          <planeGeometry args={[240, 18]} />
          <meshStandardMaterial color="#2b3138" roughness={0.95} />
        </mesh>
      ))}

      {[...Array(15)].map((_, i) => (
        <group key={`markings-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, -112 + i * 16]} receiveShadow>
            <planeGeometry args={[2, 6]} />
            <meshStandardMaterial color="#c1af6a" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-44, 0.055, -112 + i * 16]} receiveShadow>
            <planeGeometry args={[1.6, 5]} />
            <meshStandardMaterial color="#c1af6a" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[44, 0.055, -112 + i * 16]} receiveShadow>
            <planeGeometry args={[1.6, 5]} />
            <meshStandardMaterial color="#c1af6a" />
          </mesh>
        </group>
      ))}

      {[...Array(15)].map((_, i) => (
        <mesh key={`cross-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-112 + i * 16, 0.055, 0]} receiveShadow>
          <planeGeometry args={[6, 2]} />
          <meshStandardMaterial color="#c1af6a" />
        </mesh>
      ))}

      {BUILDINGS.map((building, index) => (
        <group key={`building-${index}`} position={[building.x, building.h / 2 + getGroundHeight(building.x, building.z), building.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[building.w, building.h, building.d]} />
            <meshStandardMaterial color={building.color} roughness={0.98} metalness={0.03} />
          </mesh>
          <mesh position={[0, building.h / 2 + 0.12, 0]} receiveShadow>
            <boxGeometry args={[building.w * 0.96, 0.22, building.d * 0.96]} />
            <meshStandardMaterial color="#3d434d" />
          </mesh>
          <mesh position={[0, 0.35, building.d / 2 + 0.04]}>
            <planeGeometry args={[building.w * 0.7, building.h * 0.52]} />
            <meshStandardMaterial color="#7d9fb9" emissive="#2e5b82" emissiveIntensity={0.08} />
          </mesh>
        </group>
      ))}

      {COVER_OBJECTS.map((cover, index) => (
        <mesh
          key={`cover-${index}`}
          castShadow
          receiveShadow
          position={[cover.x, cover.h / 2 + getGroundHeight(cover.x, cover.z), cover.z]}
        >
          <boxGeometry args={[cover.w, cover.h, cover.d]} />
          <meshStandardMaterial color={cover.color} roughness={1} />
        </mesh>
      ))}

      {DISTRICTS.map((district) => (
        <Text
          key={district.id}
          position={[district.x, 0.5 + getGroundHeight(district.x, district.z), district.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={4.2}
          color={district.color}
          fillOpacity={0.15}
          anchorX="center"
          anchorY="middle"
        >
          {district.name.toUpperCase()}
        </Text>
      ))}

      {[-96, -64, -32, 0, 32, 64, 96].flatMap((x) =>
        [-96, -32, 32, 96].map((z) => (
          <group key={`lamp-${x}-${z}`} position={[x, getGroundHeight(x, z), z]}>
            <mesh position={[0, 4, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.22, 8, 8]} />
              <meshStandardMaterial color="#47515c" />
            </mesh>
            <mesh position={[0, 8.1, 0]}>
              <sphereGeometry args={[0.38, 16, 16]} />
              <meshStandardMaterial color="#ffd7a7" emissive="#ffb66f" emissiveIntensity={0.62} />
            </mesh>
          </group>
        ))
      )}

      {[[-24, -8], [28, 18], [-70, 42], [72, 62], [92, -54]].map(([x, z], index) => (
        <group key={`smoke-${index}`} position={[x, 0, z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[3.2, 6.6, 10, 12]} />
            <meshStandardMaterial color="#1e1d1d" transparent opacity={0.18} />
          </mesh>
        </group>
      ))}

      <TrafficLight active={trafficLureTime > 0} />
      {CRATES.map((crate) => (
        <SupplyCrate key={crate.id} crate={crate} unlocked={crateStates[crate.id]} />
      ))}

      {zombies.map((zombie) => (
        <AnimatedZombie key={zombie.id} zombie={zombie} target={zombieTarget} />
      ))}

      {bullets.map((flash) => (
        <mesh key={flash.id} position={[flash.x, flash.y, flash.z]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshBasicMaterial color={flash.color} transparent opacity={flash.life * 4} />
        </mesh>
      ))}

      <fog attach="fog" args={['#8f7b65', 86, 250]} />
      <primitive object={new THREE.Object3D()} userData={{ colliders }} />
    </>
  )
}

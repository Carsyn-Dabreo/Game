import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getGroundHeight } from './survivalData'

export default function AnimatedZombie({ zombie, target }) {
  const group = useRef(null)
  const leftArm = useRef(null)
  const rightArm = useRef(null)
  const leftLeg = useRef(null)
  const rightLeg = useRef(null)

  useFrame((state) => {
    if (!group.current) return
    const speedFactor = zombie.stagger > 0 ? 1.4 : zombie.speed * 0.65
    const swing = Math.sin(state.clock.elapsedTime * (2.4 + speedFactor)) * 0.45

    if (leftArm.current) leftArm.current.rotation.x = swing + 0.5
    if (rightArm.current) rightArm.current.rotation.x = -swing + 0.5
    if (leftLeg.current) leftLeg.current.rotation.x = -swing
    if (rightLeg.current) rightLeg.current.rotation.x = swing

    if (target) {
      const angle = Math.atan2(target.x - zombie.x, target.z - zombie.z)
      group.current.rotation.y = angle
    }
  })

  return (
    <group ref={group} position={[zombie.x, getGroundHeight(zombie.x, zombie.z), zombie.z]}>
      <mesh castShadow position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.38, 1.3, 4, 10]} />
        <meshStandardMaterial color="#6f7d63" roughness={0.97} />
      </mesh>

      <mesh castShadow position={[0, 2.34, 0]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial color="#98ab83" roughness={0.98} />
      </mesh>

      <group ref={leftArm} position={[-0.46, 1.8, 0]}>
        <mesh castShadow position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.12, 0.92, 4, 8]} />
          <meshStandardMaterial color="#889777" roughness={1} />
        </mesh>
      </group>

      <group ref={rightArm} position={[0.46, 1.8, 0]}>
        <mesh castShadow position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.12, 0.92, 4, 8]} />
          <meshStandardMaterial color="#889777" roughness={1} />
        </mesh>
      </group>

      <group ref={leftLeg} position={[-0.18, 0.78, 0]}>
        <mesh castShadow position={[0, -0.52, 0]}>
          <capsuleGeometry args={[0.14, 0.94, 4, 8]} />
          <meshStandardMaterial color="#4f4b47" roughness={1} />
        </mesh>
      </group>

      <group ref={rightLeg} position={[0.18, 0.78, 0]}>
        <mesh castShadow position={[0, -0.52, 0]}>
          <capsuleGeometry args={[0.14, 0.94, 4, 8]} />
          <meshStandardMaterial color="#4f4b47" roughness={1} />
        </mesh>
      </group>

      <mesh position={[0, 3.15, 0]}>
        <planeGeometry args={[1.2, 0.16]} />
        <meshBasicMaterial color="#2a0f0f" transparent opacity={0.22} />
      </mesh>
      <mesh position={[-0.6 + (1.2 * (zombie.hp / zombie.maxHp)) / 2, 3.15, 0]}>
        <planeGeometry args={[1.2 * (zombie.hp / zombie.maxHp), 0.16]} />
        <meshBasicMaterial color="#ff6565" />
      </mesh>
    </group>
  )
}

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../../stores/gameStore'
import * as THREE from 'three'

const MOVE_SPEED = 0.1
const JUMP_FORCE = 0.15
const GRAVITY = 0.005
const MIN_Y = 2

export default function Player() {
  const { camera } = useThree()
  const velocity = useRef({ x: 0, y: 0, z: 0 })
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false })
  const isGrounded = useRef(true)
  const mouse = useRef({ x: 0, y: 0 })
  const isPointerLocked = useRef(false)
  
  const setPlayerPosition = useGameStore(state => state.setPlayerPosition)

  // Initialize camera position
  useEffect(() => {
    camera.position.set(0, 2, 5)
  }, [camera])

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.current.w = true; break
        case 'a': keys.current.a = true; break
        case 's': keys.current.s = true; break
        case 'd': keys.current.d = true; break
        case ' ': keys.current.space = true; break
        case 'e': 
          // Trigger E key interaction
          window.dispatchEvent(new CustomEvent('playerInteract'))
          break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.current.w = false; break
        case 'a': keys.current.a = false; break
        case 's': keys.current.s = false; break
        case 'd': keys.current.d = false; break
        case ' ': keys.current.space = false; break
      }
    }

    const handleMouseMove = (e) => {
      if (isPointerLocked.current) {
        mouse.current.x += e.movementX * 0.002
        mouse.current.y -= e.movementY * 0.002
        mouse.current.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, mouse.current.y))
      }
    }

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null
    }

    const handleClick = () => {
      if (!isPointerLocked.current && document.querySelector('canvas')) {
        document.querySelector('canvas').requestPointerLock()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('pointerlockchange', handlePointerLockChange)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('pointerlockchange', handlePointerLockChange)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  useFrame(() => {
    // Camera rotation
    camera.rotation.order = 'YXZ'
    camera.rotation.y = mouse.current.x
    camera.rotation.x = mouse.current.y

    // Movement direction
    const direction = new THREE.Vector3()
    
    // Get camera's forward and right vectors
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()
    camera.getWorldDirection(forward)
    right.crossVectors(forward, camera.up).normalize()
    
    // Calculate movement
    forward.multiplyScalar(Number(keys.current.w) - Number(keys.current.s))
    right.multiplyScalar(Number(keys.current.d) - Number(keys.current.a))
    
    direction.addVectors(forward, right).normalize().multiplyScalar(MOVE_SPEED)

    // Apply gravity
    if (!isGrounded.current) {
      velocity.current.y -= GRAVITY
    }

    // Jump
    if (keys.current.space && isGrounded.current) {
      velocity.current.y = JUMP_FORCE
      isGrounded.current = false
    }

    // Update position
    camera.position.x += direction.x
    camera.position.z += direction.z
    camera.position.y += velocity.current.y

    // Ground collision
    if (camera.position.y <= MIN_Y) {
      camera.position.y = MIN_Y
      velocity.current.y = 0
      isGrounded.current = true
    }

    // Update store
    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z])
  })

  return null
}

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../../stores/gameStore'
import * as THREE from 'three'

const MOVE_SPEED = 0.06
const JUMP_FORCE = 0.1
const GRAVITY = 0.003
const MIN_Y = 0.5
const MOUSE_SENSITIVITY = 0.003

export default function RealisticPostApocalypticPlayer() {
  const { camera } = useThree()
  const velocity = useRef({ x: 0, y: 0, z: 0 })
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false })
  const isGrounded = useRef(true)
  const mouse = useRef({ x: 0, y: 0 })
  const isPointerLocked = useRef(false)
  const cameraShake = useRef({ x: 0, y: 0 })
  
  const setPlayerPosition = useGameStore(state => state.setPlayerPosition)

  // Initialize camera position
  useEffect(() => {
    camera.position.set(0, 2, 10) // Spawn at eye level in the city
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
      if (isPointerLocked.current && e.movementX !== undefined && e.movementY !== undefined) {
        mouse.current.x += e.movementX * MOUSE_SENSITIVITY
        mouse.current.y -= e.movementY * MOUSE_SENSITIVITY
        mouse.current.y = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, mouse.current.y))
        
        // Add slight camera shake on movement
        if (keys.current.w || keys.current.a || keys.current.s || keys.current.d) {
          cameraShake.current.x = (Math.random() - 0.5) * 0.002
          cameraShake.current.y = (Math.random() - 0.5) * 0.002
        }
      }
    }

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null
    }

    const handleClick = (e) => {
      if (!isPointerLocked.current && e.target.tagName === 'CANVAS') {
        e.target.requestPointerLock()
      }
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('pointerlockchange', handlePointerLockChange)
    window.addEventListener('click', handleClick)
    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('pointerlockchange', handlePointerLockChange)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  useFrame((state) => {
    // Camera rotation with shake
    camera.rotation.order = 'YXZ'
    camera.rotation.y = mouse.current.x + cameraShake.current.x
    camera.rotation.x = mouse.current.y + cameraShake.current.y

    // Decay camera shake
    cameraShake.current.x *= 0.9
    cameraShake.current.y *= 0.9

    // Movement direction
    const direction = new THREE.Vector3()
    
    // Get camera's forward and right vectors
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()
    camera.getWorldDirection(forward)
    right.crossVectors(forward, camera.up).normalize()
    
    // Calculate movement with slight bobbing
    const moveSpeed = keys.current.w || keys.current.a || keys.current.s || keys.current.d ? MOVE_SPEED : MOVE_SPEED * 0.5
    forward.multiplyScalar(Number(keys.current.w) - Number(keys.current.s))
    right.multiplyScalar(Number(keys.current.d) - Number(keys.current.a))
    
    direction.addVectors(forward, right).normalize().multiplyScalar(moveSpeed)

    // Apply gravity
    if (!isGrounded.current) {
      velocity.current.y -= GRAVITY
    }

    // Jump
    if (keys.current.space && isGrounded.current) {
      velocity.current.y = JUMP_FORCE
      isGrounded.current = false
      // Add jump shake
      cameraShake.current.y = 0.01
    }

    // Update position
    camera.position.x += direction.x
    camera.position.z += direction.z
    camera.position.y += velocity.current.y

    // Add head bobbing when walking
    if (keys.current.w || keys.current.a || keys.current.s || keys.current.d) {
      const bobAmount = Math.sin(state.clock.elapsedTime * 8) * 0.02
      camera.position.y += bobAmount
    }

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

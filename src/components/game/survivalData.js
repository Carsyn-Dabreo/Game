import * as THREE from 'three'

export const EYE_HEIGHT = 1.72
export const WALK_SPEED = 7.4
export const SPRINT_SPEED = 12.4
export const JUMP_FORCE = 8.2
export const GRAVITY = 24
export const PLAYER_RADIUS = 0.7
export const MOUSE_SENSITIVITY = 0.0021
export const BULLET_RANGE = 42
export const WORLD_LIMIT = 118
export const PLAYER_MAX_HEALTH = 100
export const PISTOL_DAMAGE = 34
export const SHOTGUN_DAMAGE = 72
export const HACK_RANGE = 8
export const ZOMBIE_ATTACK_RANGE = 1.9
export const ZOMBIE_ATTACK_DAMAGE = 11
export const ZOMBIE_ATTACK_COOLDOWN = 0.9

export const BUILDINGS = [
  { x: -72, z: -70, w: 20, d: 22, h: 22, color: '#59636e' },
  { x: -34, z: -72, w: 24, d: 28, h: 30, color: '#646f79' },
  { x: 6, z: -72, w: 22, d: 24, h: 20, color: '#52606c' },
  { x: 44, z: -70, w: 28, d: 22, h: 34, color: '#5e6974' },
  { x: 78, z: -72, w: 18, d: 26, h: 18, color: '#67727d' },
  { x: -78, z: -30, w: 16, d: 24, h: 16, color: '#66717d' },
  { x: -40, z: -30, w: 22, d: 26, h: 38, color: '#5a6470' },
  { x: 2, z: -28, w: 20, d: 20, h: 14, color: '#737e89' },
  { x: 40, z: -28, w: 24, d: 22, h: 24, color: '#606a75' },
  { x: 78, z: -28, w: 18, d: 18, h: 28, color: '#515b66' },
  { x: -74, z: 26, w: 22, d: 22, h: 26, color: '#58636f' },
  { x: -34, z: 26, w: 24, d: 24, h: 18, color: '#6b7580' },
  { x: 8, z: 30, w: 28, d: 26, h: 32, color: '#59646f' },
  { x: 50, z: 30, w: 22, d: 22, h: 18, color: '#6d7882' },
  { x: 84, z: 30, w: 16, d: 24, h: 22, color: '#5a6671' },
  { x: -50, z: 72, w: 34, d: 18, h: 16, color: '#5e6873' },
  { x: 0, z: 72, w: 26, d: 22, h: 24, color: '#69747e' },
  { x: 48, z: 72, w: 30, d: 20, h: 14, color: '#55606a' }
]

export const DISTRICTS = [
  { id: 'district-west', name: 'Old Market', x: -72, z: 0, radius: 48, color: '#7dd9ff' },
  { id: 'district-north', name: 'Signal Row', x: 0, z: -76, radius: 44, color: '#ffd48e' },
  { id: 'district-central', name: 'Dead Plaza', x: 0, z: 0, radius: 34, color: '#ff8f7d' },
  { id: 'district-east', name: 'Cargo Spine', x: 76, z: 0, radius: 48, color: '#b6ff9c' },
  { id: 'district-south', name: 'Clinic Fringe', x: 0, z: 78, radius: 42, color: '#cdb8ff' }
]

export const SPAWN_NODES = [
  { x: -104, z: -82 }, { x: -96, z: -20 }, { x: -104, z: 36 }, { x: -72, z: 104 },
  { x: -18, z: -108 }, { x: 26, z: -104 }, { x: 104, z: -72 }, { x: 104, z: -18 },
  { x: 98, z: 34 }, { x: 76, z: 102 }, { x: 12, z: 108 }, { x: -28, z: 104 }
]

export const COVER_OBJECTS = [
  { x: -16, z: 12, w: 5, d: 9, h: 1.6, color: '#4c423b' },
  { x: 18, z: -6, w: 8, d: 4, h: 1.4, color: '#514740' },
  { x: -10, z: -44, w: 4, d: 10, h: 1.5, color: '#584b44' },
  { x: 56, z: 4, w: 6, d: 6, h: 1.2, color: '#4a413b' },
  { x: -58, z: 8, w: 7, d: 4, h: 1.3, color: '#5a4e46' },
  { x: 26, z: 58, w: 10, d: 3, h: 1.2, color: '#4f443f' },
  { x: -30, z: 50, w: 6, d: 5, h: 1.5, color: '#55483e' }
]

export const TRAFFIC_LIGHT_POS = new THREE.Vector3(0, 0, 0)

export const CRATES = [
  {
    id: 'crate-shotgun',
    label: 'Weapons Crate',
    x: -44,
    z: 18,
    rewardType: 'weapon',
    rewardLabel: 'Shotgun + shells'
  },
  {
    id: 'crate-ammo',
    label: 'Ammo Cache',
    x: 42,
    z: -18,
    rewardType: 'ammo',
    rewardLabel: 'SMG rounds'
  },
  {
    id: 'crate-med',
    label: 'Med Crate',
    x: 0,
    z: 76,
    rewardType: 'heal',
    rewardLabel: 'Emergency medkit'
  }
]

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function flatDistance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

export function makeCollider(entry) {
  return {
    minX: entry.x - entry.w / 2 - PLAYER_RADIUS,
    maxX: entry.x + entry.w / 2 + PLAYER_RADIUS,
    minZ: entry.z - entry.d / 2 - PLAYER_RADIUS,
    maxZ: entry.z + entry.d / 2 + PLAYER_RADIUS,
    top: entry.h
  }
}

export function formatTimer(seconds) {
  const safe = Math.max(0, Math.ceil(seconds))
  return `${safe}s`
}

export function spawnWave(count, wave, area = WORLD_LIMIT - 14) {
  return Array.from({ length: count }, (_, index) => {
    const node = SPAWN_NODES[(index + wave * 2) % SPAWN_NODES.length]
    const jitterX = (((index * 37 + wave * 19) % 9) - 4) * 1.7
    const jitterZ = (((index * 23 + wave * 11) % 9) - 4) * 1.7
    return {
      id: `z-${wave}-${index}-${Math.round(Math.random() * 1e6)}`,
      x: clamp(node.x + jitterX, -area, area),
      z: clamp(node.z + jitterZ, -area, area),
      y: 0,
      hp: 100 + wave * 18,
      maxHp: 100 + wave * 18,
      speed: 2 + wave * 0.2 + (index % 3) * 0.12,
      attackCooldown: 0,
      stagger: 0
    }
  })
}

export function getGroundHeight(x, z) {
  const boulevard = Math.abs(x) < 12 || Math.abs(z) < 12
  const sideStreet = Math.abs(x - 44) < 9 || Math.abs(x + 44) < 9 || Math.abs(z - 48) < 9 || Math.abs(z + 48) < 9
  const plaza = Math.abs(x) < 18 && Math.abs(z) < 18
  if (plaza) return 0.08
  if (boulevard) return 0.04
  if (sideStreet) return 0.02
  return 0.18
}

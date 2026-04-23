import React, { useEffect, useMemo, useRef, useState } from 'react'

const WORLD_W = 2200
const WORLD_H = 1400
const VIEW_W = 900
const VIEW_H = 560
const PLAYER_SIZE = 26
const CAR_W = 74
const CAR_H = 38
const WALK_SPEED = 220
const RUN_SPEED = 340
const CAR_ACCEL = 460
const CAR_MAX_SPEED = 520
const FRICTION = 0.92
const INTERACT_DISTANCE = 90

const DISTRICTS = [
  { id: 'signal', name: 'Signal Plaza', x: 1120, y: 700, r: 180, color: '#76e4ff' },
  { id: 'market', name: 'Cipher Market', x: 520, y: 760, r: 170, color: '#ffd76a' },
  { id: 'clinic', name: 'Patch Clinic', x: 1640, y: 980, r: 160, color: '#8ef0a9' },
  { id: 'relay', name: 'Relay Heights', x: 1650, y: 420, r: 170, color: '#c7b3ff' }
]

const BUILDINGS = [
  { x: 320, y: 220, w: 180, h: 170, tone: '#18314a', glow: '#67ddff' },
  { x: 620, y: 210, w: 210, h: 180, tone: '#1c3650', glow: '#7effc8' },
  { x: 960, y: 210, w: 180, h: 180, tone: '#1c3350', glow: '#7caeff' },
  { x: 1300, y: 210, w: 210, h: 180, tone: '#203852', glow: '#cf95ff' },
  { x: 1680, y: 200, w: 180, h: 190, tone: '#21354e', glow: '#ff98c8' },
  { x: 330, y: 560, w: 170, h: 160, tone: '#1c334c', glow: '#78dfff' },
  { x: 1680, y: 550, w: 180, h: 160, tone: '#233751', glow: '#ffca74' },
  { x: 340, y: 980, w: 180, h: 150, tone: '#1d344d', glow: '#7edcff' },
  { x: 690, y: 980, w: 200, h: 150, tone: '#223952', glow: '#8effd3' },
  { x: 1060, y: 970, w: 210, h: 170, tone: '#1c334d', glow: '#8cc8ff' },
  { x: 1430, y: 980, w: 200, h: 150, tone: '#243b55', glow: '#cfa6ff' },
  { x: 1770, y: 980, w: 160, h: 150, tone: '#1d334c', glow: '#97ffb6' }
]

const BLOCKERS = [
  ...BUILDINGS,
  { x: 910, y: 620, w: 120, h: 70, tone: '#4a4038' },
  { x: 1220, y: 830, w: 140, h: 60, tone: '#54443c' },
  { x: 740, y: 780, w: 80, h: 130, tone: '#564842' }
]

const CONTRACTS = [
  {
    id: 'traffic',
    title: 'Hijack Smart Traffic',
    district: 'Signal Plaza',
    description: 'Override the traffic grid to create a secure lane for emergency vehicles.',
    x: 1120,
    y: 700,
    reward: 220
  },
  {
    id: 'locker',
    title: 'Decrypt Market Locker',
    district: 'Cipher Market',
    description: 'Break the locker firmware and recover cyber tools for the merchants.',
    x: 530,
    y: 820,
    reward: 260
  },
  {
    id: 'clinic',
    title: 'Restore Clinic Net',
    district: 'Patch Clinic',
    description: 'Reconnect medical kiosks and drone dispatch across the clinic district.',
    x: 1640,
    y: 1040,
    reward: 240
  }
]

const UPGRADES = [
  { id: 'scanner', key: '1', name: 'Threat Scanner', cost: 120, description: 'Highlights all contracts and contacts.' },
  { id: 'wallet', key: '2', name: 'Crypto Wallet', cost: 160, description: 'Increases contract payouts by 30%.' },
  { id: 'autodrive', key: '3', name: 'Drive Assist', cost: 190, description: 'Improves acceleration and top speed.' }
]

const CONTACTS = [
  { id: 'c1', name: 'Fixer Nia', x: 760, y: 670, path: { x: 70, y: 20 }, color: '#7de2ff' },
  { id: 'c2', name: 'Medic Sol', x: 1510, y: 920, path: { x: 40, y: 70 }, color: '#9effb8' },
  { id: 'c3', name: 'Trader Veer', x: 490, y: 920, path: { x: 60, y: 40 }, color: '#ffd97b' }
]

const initialGame = {
  player: { x: 1080, y: 860 },
  car: { x: 980, y: 760, angle: 0, speed: 0 },
  inCar: false,
  credits: 320,
  reputation: 1,
  currentContractId: 'traffic',
  completedContracts: {},
  ownedUpgrades: {},
  phoneOpen: false,
  district: 'Signal Plaza',
  prompt: 'WASD move. E interact. Tab phone.',
  message: 'Neon City systems online.',
  speed: 0
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function getDistrictName(position) {
  const match = DISTRICTS.find((d) => distance(position, { x: d.x, y: d.y }) <= d.r)
  return match ? match.name : 'Outer Loop'
}

function intersectsRect(x, y, sizeW, sizeH, rect) {
  return !(
    x + sizeW / 2 < rect.x - rect.w / 2 ||
    x - sizeW / 2 > rect.x + rect.w / 2 ||
    y + sizeH / 2 < rect.y - rect.h / 2 ||
    y - sizeH / 2 > rect.y + rect.h / 2
  )
}

function nearestContract(game) {
  return CONTRACTS.find((c) => !game.completedContracts[c.id] && distance(game.player, c) <= INTERACT_DISTANCE)
}

function nearCar(game) {
  return distance(game.player, game.car) <= INTERACT_DISTANCE
}

function purchaseUpgrade(game, upgrade) {
  if (game.ownedUpgrades[upgrade.id]) return game
  if (game.credits < upgrade.cost) {
    return { ...game, message: 'Not enough credits for that upgrade.' }
  }
  return {
    ...game,
    credits: game.credits - upgrade.cost,
    ownedUpgrades: { ...game.ownedUpgrades, [upgrade.id]: true },
    message: `${upgrade.name} installed.`
  }
}

function CameraView({ game, contacts }) {
  const camera = useMemo(() => {
    const x = clamp(game.player.x - VIEW_W / 2, 0, WORLD_W - VIEW_W)
    const y = clamp(game.player.y - VIEW_H / 2, 0, WORLD_H - VIEW_H)
    return { x, y }
  }, [game.player.x, game.player.y])

  return (
    <div style={viewportStyle}>
      <div
        style={{
          position: 'absolute',
          left: -camera.x,
          top: -camera.y,
          width: WORLD_W,
          height: WORLD_H
        }}
      >
        <div style={worldBaseStyle} />
        <div style={roadVertical(1100, 24)} />
        <div style={roadVertical(760, 18)} />
        <div style={roadVertical(1460, 18)} />
        <div style={roadHorizontal(700, 24)} />
        <div style={roadHorizontal(420, 18)} />
        <div style={roadHorizontal(980, 18)} />

        {DISTRICTS.map((district) => (
          <div
            key={district.id}
            style={{
              position: 'absolute',
              left: district.x - district.r,
              top: district.y - district.r,
              width: district.r * 2,
              height: district.r * 2,
              borderRadius: '50%',
              background: `${district.color}18`,
              border: `1px solid ${district.color}30`,
              boxShadow: `0 0 90px ${district.color}22 inset`
            }}
          />
        ))}

        {BUILDINGS.map((building) => (
          <div
            key={`${building.x}-${building.y}`}
            style={{
              position: 'absolute',
              left: building.x - building.w / 2,
              top: building.y - building.h / 2,
              width: building.w,
              height: building.h,
              borderRadius: 18,
              background: `linear-gradient(180deg, ${building.tone}, #0f1b29)`,
              border: '1px solid rgba(170,220,255,0.08)',
              boxShadow: '0 22px 50px rgba(0,0,0,0.28)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '12% 14%',
                borderRadius: 14,
                border: `1px solid ${building.glow}55`,
                boxShadow: `0 0 30px ${building.glow}55 inset`
              }}
            />
          </div>
        ))}

        {CONTRACTS.map((contract) => {
          const done = game.completedContracts[contract.id]
          const active = game.currentContractId === contract.id
          const color = done ? '#90f0a8' : active ? '#ffd66e' : '#7ce9ff'
          return (
            <div key={contract.id} style={{ position: 'absolute', left: contract.x - 26, top: contract.y - 58, width: 52, textAlign: 'center' }}>
              <div
                style={{
                  width: 18,
                  height: 52,
                  margin: '0 auto',
                  borderRadius: 999,
                  background: '#0f1b2a',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              />
              <div
                style={{
                  width: 22,
                  height: 22,
                  margin: '-6px auto 0',
                  transform: 'rotate(45deg)',
                  background: color,
                  boxShadow: `0 0 18px ${color}`
                }}
              />
              <div style={{ marginTop: 10, color, fontSize: 11, fontWeight: 700 }}>{done ? 'DONE' : contract.title}</div>
            </div>
          )
        })}

        {contacts.map((contact) => (
          <div key={contact.id} style={{ position: 'absolute', left: contact.x - 10, top: contact.y - 22, width: 20, textAlign: 'center' }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                margin: '0 auto',
                background: contact.color,
                boxShadow: `0 0 14px ${contact.color}`
              }}
            />
            {game.ownedUpgrades.scanner && <div style={{ marginTop: 8, fontSize: 10, color: '#a5efff' }}>{contact.name}</div>}
          </div>
        ))}

        <div
          style={{
            position: 'absolute',
            left: game.car.x - CAR_W / 2,
            top: game.car.y - CAR_H / 2,
            width: CAR_W,
            height: CAR_H,
            transform: `rotate(${game.car.angle}rad)`,
            transformOrigin: 'center',
            borderRadius: 14,
            background: 'linear-gradient(180deg, #8de1ff, #4da6d1)',
            border: '2px solid rgba(230,250,255,0.7)',
            boxShadow: '0 14px 28px rgba(0,0,0,0.26)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 18,
              top: 6,
              width: 34,
              height: 24,
              borderRadius: 10,
              background: 'rgba(238,249,255,0.82)',
              boxShadow: '0 0 12px rgba(131,232,255,0.35) inset'
            }}
          />
        </div>

        {!game.inCar && (
          <div
            style={{
              position: 'absolute',
              left: game.player.x - PLAYER_SIZE / 2,
              top: game.player.y - PLAYER_SIZE / 2,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #f7f6ef, #7ee0ff)',
              border: '2px solid rgba(255,255,255,0.75)',
              boxShadow: '0 0 16px rgba(126,224,255,0.45)'
            }}
          />
        )}
      </div>
    </div>
  )
}

function roadVertical(x, width) {
  return {
    position: 'absolute',
    left: x - width / 2,
    top: 0,
    width,
    height: WORLD_H,
    background: '#1f2c39'
  }
}

function roadHorizontal(y, height) {
  return {
    position: 'absolute',
    left: 0,
    top: y - height / 2,
    width: WORLD_W,
    height,
    background: '#1f2c39'
  }
}

function PhonePanel({ game }) {
  if (!game.phoneOpen) return null
  const active = CONTRACTS.find((c) => c.id === game.currentContractId && !game.completedContracts[c.id])
  return (
    <div style={phoneOverlayStyle}>
      <div style={phoneCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={eyebrowStyle}>Neon Phone</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>Ops Deck</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#9ce5ff' }}>Credits</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{game.credits}</div>
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
          <div style={phonePanelStyle}>
            <div style={eyebrowStyle}>Active Contract</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{active ? active.title : 'All contracts complete'}</div>
            <div style={{ marginTop: 8, color: 'rgba(223,232,242,0.82)', lineHeight: 1.6 }}>
              {active ? active.description : 'Roam the city and use the systems as your demo flow.'}
            </div>
          </div>
          <div style={phonePanelStyle}>
            <div style={eyebrowStyle}>Upgrades</div>
            {UPGRADES.map((upgrade) => (
              <div key={upgrade.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{upgrade.key}. {upgrade.name}</strong>
                  <span>{game.ownedUpgrades[upgrade.id] ? 'Owned' : `${upgrade.cost}c`}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(220,228,240,0.74)' }}>{upgrade.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HUD({ game }) {
  const active = CONTRACTS.find((c) => c.id === game.currentContractId)
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
          <div style={panelStyle}>
            <div style={eyebrowStyle}>Cyber Operations Prototype</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Neon City Ops</div>
              <div style={badgeStyle}>{game.district}</div>
            </div>
            <div style={{ marginTop: 12, color: 'rgba(228,236,245,0.84)', lineHeight: 1.55 }}>
              {active ? active.description : 'All contracts complete.'}
            </div>
          </div>

          <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Metric label="Credits" value={`${game.credits}`} accent="#ffd88a" />
            <Metric label="Reputation" value={`L${game.reputation}`} accent="#8ff3b0" />
            <Metric label="Mode" value={game.inCar ? 'Driving' : 'On Foot'} accent="#8fdfff" />
            <Metric label="Speed" value={`${game.speed.toFixed(0)} m/s`} accent="#ff9f87" />
          </div>
        </div>

        <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
          <div style={panelStyle}>
            <div style={eyebrowStyle}>Contracts</div>
            {CONTRACTS.map((contract) => (
              <div key={contract.id} style={taskLineStyle(game.completedContracts[contract.id])}>{contract.title}</div>
            ))}
          </div>

          <div style={panelStyle}>
            <div style={eyebrowStyle}>Controls</div>
            <div style={controlsGridStyle}>
              <ControlHint keys="WASD" label={game.inCar ? 'Drive' : 'Move'} />
              <ControlHint keys="E" label="Interact" />
              <ControlHint keys="Shift" label="Sprint" />
              <ControlHint keys="Tab" label="Phone" />
              <ControlHint keys="1-3" label="Buy upgrades" />
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: '50%', bottom: 28, transform: 'translateX(-50%)', pointerEvents: 'none' }}>
          <div style={{ ...panelStyle, padding: '10px 16px', minWidth: 460, textAlign: 'center' }}>
            {game.prompt}
            <div style={{ marginTop: 6, color: '#8fdfff', fontSize: 12 }}>{game.message}</div>
          </div>
        </div>
      </div>

      <PhonePanel game={game} />
    </>
  )
}

function Metric({ label, value, accent }) {
  return (
    <div>
      <div style={{ ...eyebrowStyle, color: accent }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  )
}

function ControlHint({ keys, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={keyStyle}>{keys}</span>
      <span style={{ color: 'rgba(224, 233, 248, 0.82)', fontSize: 13 }}>{label}</span>
    </div>
  )
}

function GameRoot() {
  const [game, setGame] = useState({
    ...initialGame
  })
  const pressed = useRef({})
  const raf = useRef(0)
  const contacts = useRef(CONTACTS.map((contact) => ({ ...contact })))
  const blockers = BLOCKERS

  useEffect(() => {
    const down = (event) => {
      if (event.code === 'Tab') {
        event.preventDefault()
        setGame((current) => ({ ...current, phoneOpen: !current.phoneOpen }))
        return
      }
      pressed.current[event.code] = true
    }
    const up = (event) => {
      pressed.current[event.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now

      contacts.current = contacts.current.map((contact, index) => ({
        ...contact,
        x: contact.x + Math.sin(now / 900 + index) * 0.4,
        y: contact.y + Math.cos(now / 1000 + index) * 0.4
      }))

      setGame((current) => {
        let next = { ...current, ownedUpgrades: { ...current.ownedUpgrades }, completedContracts: { ...current.completedContracts } }

        if (next.phoneOpen) {
          UPGRADES.forEach((upgrade) => {
            if (pressed.current[`Digit${upgrade.key}`]) {
              next = purchaseUpgrade(next, upgrade)
              pressed.current[`Digit${upgrade.key}`] = false
            }
          })
        }

        const playerPoint = { x: next.player.x, y: next.player.y }
        const activeContract = CONTRACTS.find((contract) => contract.id === next.currentContractId && !next.completedContracts[contract.id])
        const nearbyContract = nearestContract(next)
        const canEnterCar = nearCar(next)

        if (pressed.current.KeyE) {
          if (next.inCar) {
            next.inCar = false
            next.message = 'Vehicle disconnected.'
          } else if (nearbyContract) {
            const bonus = next.ownedUpgrades.wallet ? 1.3 : 1
            const reward = Math.round(nearbyContract.reward * bonus)
            next.completedContracts[nearbyContract.id] = true
            next.credits += reward
            next.reputation += 1
            next.message = `${nearbyContract.title} complete. +${reward} credits.`
            const nextTask = CONTRACTS.find((contract) => !next.completedContracts[contract.id])
            next.currentContractId = nextTask ? nextTask.id : nearbyContract.id
          } else if (canEnterCar) {
            next.inCar = true
            next.message = 'Vehicle linked.'
          }
          pressed.current.KeyE = false
        }

        if (next.inCar) {
          const driveBoost = next.ownedUpgrades.autodrive ? 1.2 : 1
          let car = { ...next.car }
          if (pressed.current.KeyW || pressed.current.ArrowUp) car.speed += CAR_ACCEL * driveBoost * dt
          if (pressed.current.KeyS || pressed.current.ArrowDown) car.speed -= CAR_ACCEL * dt
          car.speed *= FRICTION
          car.speed = clamp(car.speed, -CAR_MAX_SPEED * 0.4, CAR_MAX_SPEED * driveBoost)

          const steer = (pressed.current.KeyA || pressed.current.ArrowLeft ? 1 : 0) - (pressed.current.KeyD || pressed.current.ArrowRight ? 1 : 0)
          if (Math.abs(car.speed) > 5) {
            car.angle += steer * 2.2 * dt
          }

          let nextX = clamp(car.x + Math.sin(car.angle) * car.speed * dt, 80, WORLD_W - 80)
          let nextY = clamp(car.y + Math.cos(car.angle) * car.speed * dt, 80, WORLD_H - 80)

          const blocked = blockers.some((blocker) => intersectsRect(nextX, nextY, CAR_W, CAR_H, blocker))
          if (blocked) {
            nextX = car.x
            nextY = car.y
            car.speed *= -0.2
          }

          car.x = nextX
          car.y = nextY
          next.car = car
          next.player = { x: car.x, y: car.y }
          next.speed = Math.abs(car.speed) / 18
        } else {
          let dx = 0
          let dy = 0
          if (pressed.current.KeyW || pressed.current.ArrowUp) dy -= 1
          if (pressed.current.KeyS || pressed.current.ArrowDown) dy += 1
          if (pressed.current.KeyA || pressed.current.ArrowLeft) dx -= 1
          if (pressed.current.KeyD || pressed.current.ArrowRight) dx += 1
          if (dx || dy) {
            const len = Math.hypot(dx, dy) || 1
            const speed = pressed.current.ShiftLeft || pressed.current.ShiftRight ? RUN_SPEED : WALK_SPEED
            let nextX = clamp(next.player.x + (dx / len) * speed * dt, 60, WORLD_W - 60)
            let nextY = clamp(next.player.y + (dy / len) * speed * dt, 60, WORLD_H - 60)
            const blocked = blockers.some((blocker) => intersectsRect(nextX, nextY, PLAYER_SIZE, PLAYER_SIZE, blocker))
            if (!blocked) {
              next.player = { x: nextX, y: nextY }
            }
            next.speed = speed / 25
          } else {
            next.speed = 0
          }
        }


        next.district = getDistrictName(next.player.x, next.player.y)

        next.prompt = next.phoneOpen
          ? 'Phone open. Press 1-3 to buy upgrades, Tab to close.'
          : next.inCar
            ? 'Driving coupe. WASD drive. E exit.'
            : nearbyContract
              ? `Press E to ${nearbyContract.title.toLowerCase()}.`
              : canEnterCar
                ? 'Press E to drive the coupe.'
                : activeContract
                  ? activeContract.description
                  : 'All contracts complete. Roam freely.'

        return next
      })

      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [blockers])

  return (
    <div style={rootStyle}>
      <div style={stageStyle}>
        <CameraView game={game} contacts={contacts.current} />
        <HUD game={game} />
      </div>
    </div>
  )
}

export default function CityGame() {
  return <GameRoot />
}

const rootStyle = {
  width: '100%',
  height: '100%',
  background: 'radial-gradient(circle at top, #5f88bf 0%, #111a26 56%, #080c12 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative'
}

const stageStyle = {
  width: '100%',
  height: '100%',
  position: 'relative'
}

const viewportStyle = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden'
}

const worldBaseStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, #9cb6d1 0%, #6d8298 100%)'
}

const panelStyle = {
  padding: '16px 18px',
  borderRadius: 18,
  background: 'linear-gradient(180deg, rgba(10, 18, 30, 0.88), rgba(7, 11, 19, 0.74))',
  border: '1px solid rgba(121, 223, 255, 0.18)',
  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
  color: '#f5fbff',
  backdropFilter: 'blur(10px)'
}

const eyebrowStyle = {
  marginBottom: 8,
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#90eaff'
}

const badgeStyle = {
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(123, 227, 255, 0.12)',
  border: '1px solid rgba(123, 227, 255, 0.28)',
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#b6efff'
}

const controlsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10
}

const keyStyle = {
  padding: '5px 10px',
  borderRadius: 999,
  border: '1px solid rgba(145, 231, 255, 0.3)',
  background: 'rgba(145, 231, 255, 0.08)',
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
}

const mapStyle = {
  position: 'relative',
  width: 172,
  height: 172,
  borderRadius: 18,
  overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(10, 20, 36, 0.96), rgba(8, 12, 18, 0.98))',
  border: '1px solid rgba(135, 240, 255, 0.14)'
}

const gridStyle = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    linear-gradient(rgba(150, 222, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(150, 222, 255, 0.07) 1px, transparent 1px)
  `,
  backgroundSize: '34px 34px'
}

const phoneOverlayStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(4, 9, 16, 0.44)',
  backdropFilter: 'blur(12px)'
}

const phoneCardStyle = {
  width: 'min(840px, calc(100vw - 40px))',
  padding: 24,
  borderRadius: 28,
  background: 'linear-gradient(180deg, rgba(8, 16, 28, 0.95), rgba(11, 29, 49, 0.9))',
  border: '1px solid rgba(132, 223, 255, 0.22)',
  boxShadow: '0 40px 110px rgba(0,0,0,0.4)',
  color: '#f5fbff'
}

const phonePanelStyle = {
  padding: 16,
  borderRadius: 18,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)'
}

function taskLineStyle(done) {
  return {
    padding: '8px 0',
    color: done ? '#98f2a0' : 'rgba(228, 234, 244, 0.84)',
    textDecoration: done ? 'line-through' : 'none'
  }
}

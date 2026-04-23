import React from 'react'
import {
  CRATES,
  DISTRICTS,
  TRAFFIC_LIGHT_POS,
  WORLD_LIMIT,
  clamp
} from './survivalData'

const size = 170
const mapStyle = {
  position: 'relative',
  width: 170,
  height: 170,
  borderRadius: 18,
  overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(14, 20, 28, 0.96), rgba(8, 12, 18, 0.98))',
  border: '1px solid rgba(135, 240, 255, 0.14)'
}

const gridOverlayStyle = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    linear-gradient(rgba(150, 222, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(150, 222, 255, 0.07) 1px, transparent 1px)
  `,
  backgroundSize: '34px 34px'
}

function pointStyle(x, y, color, pointSize) {
  return {
    position: 'absolute',
    left: x - pointSize / 2,
    top: y - pointSize / 2,
    width: pointSize,
    height: pointSize,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 12px ${color}`
  }
}

export default function Minimap({ panelStyle, eyebrowStyle, playerPosition, zombies, hackedCrates, trafficLightHacked, trafficLureTime }) {
  const worldSpan = WORLD_LIMIT * 2
  const toMap = (x, z) => ({
    x: clamp(((x + WORLD_LIMIT) / worldSpan) * size, 0, size),
    y: clamp(((z + WORLD_LIMIT) / worldSpan) * size, 0, size)
  })

  const player = toMap(playerPosition[0], playerPosition[2])
  const traffic = toMap(TRAFFIC_LIGHT_POS.x, TRAFFIC_LIGHT_POS.z)

  return (
    <div style={panelStyle}>
      <div style={eyebrowStyle}>District Map</div>
      <div style={mapStyle}>
        <div style={gridOverlayStyle} />
        {DISTRICTS.map((district) => {
          const point = toMap(district.x, district.z)
          return (
            <div
              key={district.id}
              style={{
                position: 'absolute',
                left: point.x - district.radius / 3,
                top: point.y - district.radius / 3,
                width: district.radius / 1.5,
                height: district.radius / 1.5,
                borderRadius: '50%',
                background: `${district.color}18`,
                border: `1px solid ${district.color}33`
              }}
            />
          )
        })}
        <div style={{ position: 'absolute', left: 78, top: 0, width: 14, height: 170, background: 'rgba(120, 180, 255, 0.1)' }} />
        <div style={{ position: 'absolute', left: 0, top: 78, width: 170, height: 14, background: 'rgba(120, 180, 255, 0.1)' }} />
        <div style={pointStyle(traffic.x, traffic.y, trafficLureTime > 0 ? '#ff6666' : trafficLightHacked ? '#7ff3ff' : '#ffd174', 10)} />
        {CRATES.map((crate) => {
          const point = toMap(crate.x, crate.z)
          return <div key={crate.id} style={pointStyle(point.x, point.y, hackedCrates[crate.id] ? '#8bf0a3' : '#ffe08d', 9)} />
        })}
        {zombies.slice(0, 18).map((zombie) => {
          const point = toMap(zombie.x, zombie.z)
          return <div key={zombie.id} style={pointStyle(point.x, point.y, '#ff8b7b', 6)} />
        })}
        <div style={pointStyle(player.x, player.y, '#8afcff', 12)} />
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(224, 232, 242, 0.72)' }}>
        Blue: you, red: infected, gold: objectives, green: looted crates
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, useId } from 'react'

interface PulseLineProps {
  intensity?: number // 0-100
  className?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const SEGMENTS = 120

export const PulseLine = ({ intensity = 50, className = '' }: PulseLineProps) => {
  const normalized = clamp(intensity, 0, 100)
  const [phaseSnapshot, setPhaseSnapshot] = useState(0)
  const phaseRef = useRef(0)
  const gradientId = useId()
  const fillGradientId = `${gradientId}-fill`
  const glowGradientId = `${gradientId}-glow`

  useEffect(() => {
    let frameId: number
    let lastTimestamp = performance.now()
    let accumulator = 0

    const animate = (timestamp: number) => {
      const deltaMs = timestamp - lastTimestamp
      lastTimestamp = timestamp

      const deltaSeconds = deltaMs / 1000
      const speed = 0.75 + normalized * 0.025 // Faster pulse for higher intensity

      phaseRef.current = (phaseRef.current + deltaSeconds * speed) % (Math.PI * 2)
      accumulator += deltaMs

      if (accumulator >= 1000 / 30) { // Throttle to ~30fps to save frames
        setPhaseSnapshot(phaseRef.current)
        accumulator = 0
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [normalized])

  const { linePoints, fillPoints, glowPoints } = useMemo(() => {
    const amplitude = 8 + normalized * 0.22
    const tension = 1.4 + normalized * 0.015
    const baseline = 50

    const line: string[] = []
    const glow: string[] = []

    for (let index = 0; index <= SEGMENTS; index += 1) {
      const progress = index / SEGMENTS
      const x = progress * 100
      const sine = Math.sin(progress * Math.PI * tension + phaseSnapshot)
      const envelope = 0.82 + Math.cos(progress * Math.PI * 2) * 0.08
      const y = baseline + sine * amplitude * envelope
      line.push(`${x.toFixed(3)},${y.toFixed(3)}`)

      const glowY = baseline + sine * (amplitude + 2) * envelope
      glow.push(`${x.toFixed(3)},${glowY.toFixed(3)}`)
    }

    const fill = `${line.join(' ')} 100,100 0,100`

    return {
      linePoints: line.join(' '),
      fillPoints: fill,
      glowPoints: glow.join(' ')
    }
  }, [phaseSnapshot, normalized])

  const hue = 325 - normalized * 0.35
  const primary = `hsl(${hue}, 82%, 72%)`
  const secondary = `hsl(${hue}, 70%, 78%)`
  const highlight = `hsla(${hue}, 85%, 78%, 0.55)`

  return (
    <svg
      className={`w-full h-24 ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={secondary} stopOpacity={0.65} />
          <stop offset="50%" stopColor={primary} stopOpacity={0.95} />
          <stop offset="100%" stopColor={secondary} stopOpacity={0.65} />
        </linearGradient>
        <linearGradient id={fillGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlight} stopOpacity={0.3} />
          <stop offset="100%" stopColor={highlight} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id={glowGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity={0} />
          <stop offset="35%" stopColor={primary} stopOpacity={0.45} />
          <stop offset="65%" stopColor={primary} stopOpacity={0.45} />
          <stop offset="100%" stopColor={primary} stopOpacity={0} />
        </linearGradient>
      </defs>

      <motion.polygon
        points={fillPoints}
        fill={`url(#${fillGradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.polyline
        points={glowPoints}
        fill="none"
        stroke={`url(#${glowGradientId})`}
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ opacity: 0.15 }}
        animate={{ opacity: [0.1, 0.35, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(1.2px)' }}
      />

      <polyline
        points={linePoints}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

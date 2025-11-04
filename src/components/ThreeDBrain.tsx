import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { PointerEvent } from 'react'

interface ThreeDBrainProps {
  className?: string
}

type DepthLayer = 'near' | 'mid' | 'far'

const gradients: Record<DepthLayer, string> = {
  near: 'from-lilac-200/85 via-lilac-300/80 to-ink-200/70',
  mid: 'from-lilac-200/70 via-pink-200/70 to-blue-200/60',
  far: 'from-blue-200/70 via-lilac-200/60 to-ink-200/55'
}

export const ThreeDBrain = ({ className = '' }: ThreeDBrainProps) => {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)

  const rotateX = useTransform(pointerY, [-160, 160], [16, -16])
  const rotateY = useTransform(pointerX, [-160, 160], [-18, 18])

  const depthNearX = useTransform(pointerX, [-160, 160], [-18, 18])
  const depthNearY = useTransform(pointerY, [-160, 160], [-18, 18])
  const depthMidX = useTransform(pointerX, [-160, 160], [-12, 12])
  const depthMidY = useTransform(pointerY, [-160, 160], [-12, 12])
  const depthFarX = useTransform(pointerX, [-160, 160], [-8, 8])
  const depthFarY = useTransform(pointerY, [-160, 160], [-8, 8])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set(event.clientX - rect.left - rect.width / 2)
    pointerY.set(event.clientY - rect.top - rect.height / 2)
  }

  const handlePointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  const lobes: Array<{
    id: string
    top: string
    left: string
    size: string
    depth: DepthLayer
    duration: number
  }> = [
    {
      id: 'frontal',
      top: '14%',
      left: '18%',
      size: '48%',
      depth: 'near',
      duration: 5.2
    },
    {
      id: 'parietal',
      top: '16%',
      left: '44%',
      size: '44%',
      depth: 'mid',
      duration: 6
    },
    {
      id: 'temporal',
      top: '46%',
      left: '22%',
      size: '42%',
      depth: 'mid',
      duration: 5.6
    },
    {
      id: 'occipital',
      top: '44%',
      left: '52%',
      size: '38%',
      depth: 'far',
      duration: 6.4
    }
  ]

  const nodes = [
    { id: 'node-1', top: '18%', left: '42%', size: 14, delay: 0 },
    { id: 'node-2', top: '32%', left: '62%', size: 10, delay: 0.3 },
    { id: 'node-3', top: '58%', left: '36%', size: 12, delay: 0.6 },
    { id: 'node-4', top: '52%', left: '68%', size: 9, delay: 0.45 }
  ]

  const depthStyles = (depth: DepthLayer) => {
    if (depth === 'near') {
      return { x: depthNearX, y: depthNearY }
    }
    if (depth === 'mid') {
      return { x: depthMidX, y: depthMidY }
    }
    return { x: depthFarX, y: depthFarY }
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-[36px] border border-white/40 bg-white/20 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-[0_40px_120px_rgba(85,109,143,0.25)] ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ perspective: 1600 }}
      aria-hidden
    >
      <div className="pointer-events-none absolute -inset-16 bg-gradient-to-br from-lilac-200/30 via-white/10 to-blue-200/25 blur-3xl" />

      <motion.div
        className="relative mx-auto aspect-[4/3] w-full max-w-xl"
        style={{ rotateX, rotateY }}
      >
        <motion.div
          className="pointer-events-none absolute inset-[14%] rounded-[46%] bg-gradient-to-br from-white/45 via-lilac-200/30 to-transparent"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {lobes.map((lobe) => (
          <motion.div
            key={lobe.id}
            className={`absolute rounded-full bg-gradient-to-br ${gradients[lobe.depth]} shadow-[0_24px_64px_rgba(160,130,196,0.35)]`}
            style={{
              width: lobe.size,
              height: lobe.size,
              top: lobe.top,
              left: lobe.left,
              ...depthStyles(lobe.depth)
            }}
            animate={{ scale: [0.98, 1.04, 0.98], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: lobe.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/70 via-lilac-200/80 to-blue-200/80 shadow-[0_20px_60px_rgba(160,130,196,0.35)]"
          style={{ x: depthFarX, y: depthFarY }}
          animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
          style={{ x: depthMidX, y: depthMidY }}
          animate={{ scale: [1.05, 1.18, 1.05], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.svg
          className="pointer-events-none absolute inset-0"
          viewBox="0 0 100 100"
          fill="none"
          style={{ x: depthFarX, y: depthFarY }}
        >
          <defs>
            <linearGradient id="neuralGradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#a082c4" stopOpacity="0.85" />
              <stop offset="0.5" stopColor="#7fb3ff" stopOpacity="0.8" />
              <stop offset="1" stopColor="#f0e8ff" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {[
            { d: 'M18 60 C34 26 68 24 82 60', duration: 5.4 },
            { d: 'M24 42 C42 24 58 26 74 46', duration: 4.8 },
            { d: 'M30 68 C48 52 58 50 70 64', duration: 5.8 }
          ].map((stroke, index) => (
            <motion.path
              key={`connection-${index}`}
              d={stroke.d}
              stroke="url(#neuralGradient)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 9"
              initial={{ pathLength: 0, opacity: 0, strokeDashoffset: 0 }}
              animate={{ pathLength: 1, opacity: 1, strokeDashoffset: -16 }}
              transition={{
                pathLength: { duration: 1.4, ease: 'easeOut' },
                opacity: { duration: 0.8, ease: 'easeOut' },
                strokeDashoffset: {
                  duration: stroke.duration,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut'
                }
              }}
            />
          ))}
        </motion.svg>

        {nodes.map((node) => (
          <motion.span
            key={node.id}
            className="absolute rounded-full bg-white/90 shadow-[0_8px_24px_rgba(160,130,196,0.45)]"
            style={{
              width: node.size,
              height: node.size,
              top: node.top,
              left: node.left,
              ...depthStyles('near')
            }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.6, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.span
              className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 to-transparent"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  )
}

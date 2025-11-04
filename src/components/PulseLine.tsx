import { motion } from 'framer-motion'

interface PulseLineProps {
  intensity?: number // 0-100
  className?: string
}

export const PulseLine = ({ intensity = 50, className = '' }: PulseLineProps) => {
  const points = Array.from({ length: 50 }, (_, i) => {
    const x = (i / 49) * 100
    const baseY = 50
    const wave = Math.sin(i * 0.3) * 20 * (intensity / 100)
    return `${x},${baseY + wave}`
  }).join(' ')

  return (
    <svg 
      className={`w-full h-24 ${className}`} 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      <motion.polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-ink-400/60"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* Glowing overlay */}
      <motion.polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-lilac-400/40 blur-sm"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </svg>
  )
}

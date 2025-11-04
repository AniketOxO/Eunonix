import { motion } from 'framer-motion'

interface BreathingOrbProps {
  size?: number
  color?: string
  className?: string
}

export const BreathingOrb = ({ 
  size = 120, 
  color = 'bg-gradient-to-br from-lilac-300/40 to-ink-300/30',
  className = '' 
}: BreathingOrbProps) => {
  return (
    <motion.div
      className={`rounded-full ${color} blur-3xl ${className}`}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

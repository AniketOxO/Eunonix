import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface RippleProps {
  className?: string
  children?: ReactNode
}

export const Ripple = ({ className = '', children }: RippleProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Ripple circles */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-full border-2 border-ink-300/20"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ 
            scale: 2.5, 
            opacity: 0 
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 1,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Center content */}
      {children && (
        <motion.div
          className="relative z-10"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

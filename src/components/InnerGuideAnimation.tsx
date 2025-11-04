import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export const InnerGuideAnimation = () => {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer halo */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-lilac-300/30 to-golden-300/20"
        animate={{
          scale: isActive ? [1, 1.3, 1] : 1,
          opacity: isActive ? [0.4, 0.7, 0.4] : 0.4,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />
      
      {/* Middle layer */}
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-lilac-400/40 to-golden-400/30"
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "linear" 
        }}
      />
      
      {/* Core */}
      <motion.div
        className="absolute inset-16 rounded-full bg-gradient-to-br from-white/80 to-lilac-200/60 backdrop-blur-sm"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Pulse particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-lilac-400/60 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: -4,
            marginTop: -4,
          }}
          animate={{
            x: Math.cos((i / 8) * Math.PI * 2) * 80,
            y: Math.sin((i / 8) * Math.PI * 2) * 80,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BreathingOrb } from '@/components/BreathingOrb'
import { PulseLine } from '@/components/PulseLine'

const Welcome = () => {
  const navigate = useNavigate()
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        navigate('/home')
      }, 800)
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-sand-50 via-breath-blue to-lilac-100 flex items-center justify-center overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <BreathingOrb 
          size={500} 
          color="bg-gradient-to-br from-lilac-300/30 to-transparent"
          className="absolute -top-32 -right-32"
        />
        <BreathingOrb 
          size={400} 
          color="bg-gradient-to-br from-golden-300/20 to-transparent"
          className="absolute top-1/2 -left-32"
        />
        <BreathingOrb 
          size={450} 
          color="bg-gradient-to-br from-ink-300/15 to-transparent"
          className="absolute bottom-0 right-1/4"
        />
      </div>

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full bg-gradient-to-br from-white/60 to-lilac-200/40 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <PulseLine intensity={80} className="w-20 sm:w-24" />
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-ink-900 mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Welcome to <span className="text-gradient font-medium">Eunonix</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-ink-600 font-light max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Your mind is about to meet clarity
        </motion.p>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center justify-center gap-2 text-ink-400">
            <div className="w-2 h-2 rounded-full bg-lilac-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-lilac-400 animate-pulse delay-100" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-lilac-400 animate-pulse delay-200" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Welcome

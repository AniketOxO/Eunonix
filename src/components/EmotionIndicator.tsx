import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface EmotionIndicatorProps {
  emotion: string
  intensity: number // 0-100
  className?: string
}

export const EmotionIndicator = ({ emotion, intensity, className = '' }: EmotionIndicatorProps) => {
  const navigate = useNavigate()
  
  const emotionColors: Record<string, string> = {
    joy: 'from-yellow-400 to-orange-400',
    calm: 'from-blue-400 to-cyan-400',
    focus: 'from-purple-400 to-indigo-400',
    sad: 'from-gray-400 to-blue-500',
    anxious: 'from-red-400 to-orange-500',
    excited: 'from-pink-400 to-rose-400',
    neutral: 'from-gray-300 to-gray-400',
    motivated: 'from-orange-400 to-amber-400',
    empathetic: 'from-pink-400 to-purple-400',
    rest: 'from-indigo-400 to-blue-400'
  }

  const gradient = emotionColors[emotion.toLowerCase()] || emotionColors.neutral

  return (
    <motion.button
      onClick={() => navigate('/neuro-adaptive')}
      className={`flex items-center gap-3 cursor-pointer ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Click to open Neuro-Adaptive Settings"
    >
      <div className="relative w-12 h-12">
        {/* Background pulse */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-20`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main orb */}
        <motion.div
          className={`absolute inset-1 rounded-full bg-gradient-to-br ${gradient}`}
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-ink-800 capitalize">{emotion}</span>
          <span className="text-xs text-ink-500">{intensity}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${intensity}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.button>
  )
}

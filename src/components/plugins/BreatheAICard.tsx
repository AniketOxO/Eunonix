import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PHASES: Array<{ id: 'inhale' | 'hold' | 'exhale'; duration: number; prompt: string }> = [
  { id: 'inhale', duration: 4, prompt: 'Inhale gently through the nose' },
  { id: 'hold', duration: 4, prompt: 'Hold softly, keep shoulders relaxed' },
  { id: 'exhale', duration: 6, prompt: 'Exhale like you are fogging glass' }
]

const phaseColor: Record<'inhale' | 'hold' | 'exhale', string> = {
  inhale: 'from-emerald-400/70 to-emerald-600/60',
  hold: 'from-blue-400/70 to-blue-600/60',
  exhale: 'from-purple-400/70 to-purple-600/60'
}

interface BreatheAICardProps {
  highlighted?: boolean
}

export const BreatheAICard = ({ highlighted = false }: BreatheAICardProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [seconds, setSeconds] = useState(PHASES[0].duration)
  const [completedRounds, setCompletedRounds] = useState(0)

  const activePhase = useMemo(() => PHASES[phaseIndex], [phaseIndex])

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) {
          return prev - 1
        }

        const nextIndex = (phaseIndex + 1) % PHASES.length
        if (nextIndex === 0) {
          setCompletedRounds((count) => count + 1)
        }
        if (navigator.vibrate) {
          navigator.vibrate([40])
        }
        setPhaseIndex(nextIndex)
        return PHASES[nextIndex].duration
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, phaseIndex])

  const progress = 1 - seconds / activePhase.duration

  const handleToggle = () => {
    setIsRunning((value) => !value)
  }

  const handleReset = () => {
    setIsRunning(false)
    setPhaseIndex(0)
    setSeconds(PHASES[0].duration)
    setCompletedRounds(0)
  }

  return (
    <motion.div
      className={`bg-white/50 backdrop-blur-md rounded-2xl border border-lilac-200/40 p-6 flex flex-col ${highlighted ? 'ring-2 ring-emerald-400/60 shadow-xl animate-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Breathe AI</p>
          <h3 className="text-xl font-medium text-ink-900">Coherent Breathing</h3>
        </div>
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${phaseColor[activePhase.id]} text-white`}
          animate={{ scale: isRunning ? [1, 1.08, 1] : 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 1.8 }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>
      </div>

      <div className="relative h-48 mb-6">
        <motion.div
          key={activePhase.id}
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br ${phaseColor[activePhase.id]}`}
          initial={{ scale: 0.85, opacity: 0.7 }}
          animate={{ scale: isRunning ? 1.05 : 0.95, opacity: 0.8 }}
          transition={{ duration: 1.2, repeat: isRunning ? Infinity : 0, repeatType: 'reverse' }}
        />
        <motion.div
          className="absolute inset-8 rounded-full bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
          animate={{ scale: 1 + progress * 0.08 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activePhase.id}
              className="text-lg font-medium text-ink-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activePhase.prompt}
            </motion.span>
          </AnimatePresence>
          <span className="mt-3 text-4xl font-light text-ink-900">{seconds}s</span>
        </motion.div>
      </div>

      <p className="text-sm text-ink-600 mb-6">
        Completed rounds: <span className="font-semibold text-ink-800">{completedRounds}</span>
      </p>

      <div className="flex items-center gap-3 mt-auto">
        <button
          onClick={handleToggle}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${isRunning ? 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50' : 'bg-gradient-to-r from-emerald-500 to-lilac-500 text-white shadow-lg'}`}
        >
          {isRunning ? 'Pause' : 'Begin Session'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-xl text-sm text-ink-400 hover:text-ink-600"
        >
          Reset
        </button>
      </div>
    </motion.div>
  )
}

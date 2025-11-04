import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const FOCUS_DURATION = 25 * 60
const BREAK_DURATION = 5 * 60

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface FocusFlowCardProps {
  highlighted?: boolean
}

export const FocusFlowCard = ({ highlighted = false }: FocusFlowCardProps) => {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [seconds, setSeconds] = useState(FOCUS_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const interval = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) {
          return prev - 1
        }

        // Completed current interval
        const nextMode = mode === 'focus' ? 'break' : 'focus'
        const nextDuration = nextMode === 'focus' ? FOCUS_DURATION : BREAK_DURATION

        if (mode === 'focus') {
          setCompletedCycles((count) => count + 1)
          if (navigator.vibrate) {
            navigator.vibrate([120, 80, 120])
          }
        } else if (navigator.vibrate) {
          navigator.vibrate([80])
        }

        setMode(nextMode)
        return nextDuration
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, mode])

  const progress = useMemo(() => {
    const total = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION
    return 1 - seconds / total
  }, [mode, seconds])

  const handleToggle = () => {
    setIsRunning((value) => !value)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMode('focus')
    setSeconds(FOCUS_DURATION)
    setCompletedCycles(0)
  }

  return (
    <motion.div
      className={`bg-white/50 backdrop-blur-md rounded-2xl border border-ink-200/40 p-6 flex flex-col ${highlighted ? 'ring-2 ring-ink-500/60 shadow-xl animate-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Focus Flow</p>
          <h3 className="text-xl font-medium text-ink-900">
            {mode === 'focus' ? 'Deep Session' : 'Recovery Pause'}
          </h3>
        </div>
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${mode === 'focus' ? 'bg-gradient-to-br from-ink-500 to-lilac-400 text-white' : 'bg-lilac-100 text-lilac-600'}`}
          animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 1.5 }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>
      </div>

      <div className="relative h-40 mb-6">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="68"
            stroke="#ede9fe"
            strokeWidth="12"
            fill="none"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="68"
            stroke="url(#focus-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={2 * Math.PI * 68}
            strokeDashoffset={(1 - progress) * 2 * Math.PI * 68}
            animate={{ strokeDashoffset: (1 - progress) * 2 * Math.PI * 68 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="focus-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4338CA" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-ink-500 mb-1">{mode === 'focus' ? 'Focus Interval' : 'Break Interval'}</span>
          <span className="text-4xl font-light text-ink-900">{formatTime(seconds)}</span>
        </div>
      </div>

      <p className="text-sm text-ink-600 mb-6">
        Completed cycles today: <span className="font-semibold text-ink-800">{completedCycles}</span>
      </p>

      <div className="flex items-center gap-3 mt-auto">
        <button
          onClick={handleToggle}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${isRunning ? 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50' : 'bg-gradient-to-r from-ink-600 to-lilac-500 text-white shadow-lg'}`}
        >
          {isRunning ? 'Pause' : 'Start Focus'}
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

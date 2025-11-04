              <div className="absolute inset-0 rounded-2xl border border-white/60" aria-hidden />
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const THEMES = {
  ocean: {
    label: 'Ocean Drift',
    container: 'bg-gradient-to-br from-sky-50 via-white to-sky-100',
    border: 'border-sky-200/50',
    focusAccent: 'bg-gradient-to-br from-sky-500 to-indigo-500 text-white',
    breakAccent: 'bg-sky-100 text-sky-600',
    ringColor: '#bae6fd',
    progressStart: '#0ea5e9',
    progressEnd: '#6366f1',
    buttonGradient: 'from-sky-500 to-indigo-500',
    fullscreen: 'border-sky-300/60 text-sky-600 bg-sky-500/10 hover:bg-sky-500/20',
    overlay: 'bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.28),_transparent_55%)]'
  },
  desert: {
    label: 'Desert Dunes',
    container: 'bg-gradient-to-br from-amber-50 via-white to-orange-50',
    border: 'border-amber-200/50',
    focusAccent: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
    breakAccent: 'bg-orange-100 text-orange-600',
    ringColor: '#fed7aa',
    progressStart: '#f97316',
    progressEnd: '#f59e0b',
    buttonGradient: 'from-amber-500 to-orange-500',
    fullscreen: 'border-orange-300/60 text-orange-600 bg-orange-500/10 hover:bg-orange-500/20',
    overlay: 'bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.22),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.26),_transparent_55%)]'
  },
  beach: {
    label: 'Beach House',
    container: 'bg-gradient-to-br from-cyan-50 via-white to-emerald-50',
    border: 'border-cyan-200/50',
    focusAccent: 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white',
    breakAccent: 'bg-emerald-100 text-emerald-600',
    ringColor: '#bbf7d0',
    progressStart: '#06b6d4',
    progressEnd: '#10b981',
    buttonGradient: 'from-cyan-500 to-emerald-500',
    fullscreen: 'border-emerald-300/60 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20',
    overlay: 'bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.22),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.26),_transparent_55%)]'
  },
  workspace: {
    label: 'Creator Studio',
    container: 'bg-gradient-to-br from-slate-50 via-white to-slate-200/60',
    border: 'border-slate-200/60',
    focusAccent: 'bg-gradient-to-br from-slate-700 to-indigo-600 text-white',
    breakAccent: 'bg-slate-100 text-slate-600',
    ringColor: '#cbd5f5',
    progressStart: '#1f2937',
    progressEnd: '#6366f1',
    buttonGradient: 'from-slate-700 to-indigo-600',
    fullscreen: 'border-slate-300/60 text-slate-600 bg-slate-500/10 hover:bg-slate-500/20',
    overlay: 'bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.18),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(30,64,175,0.22),_transparent_55%)]'
  },
  bookstore: {
    label: 'Bookstore Glow',
    container: 'bg-gradient-to-br from-rose-50 via-white to-amber-50',
    border: 'border-rose-200/50',
    focusAccent: 'bg-gradient-to-br from-rose-500 to-amber-500 text-white',
    breakAccent: 'bg-rose-100 text-rose-600',
    ringColor: '#fecdd3',
    progressStart: '#f43f5e',
    progressEnd: '#f59e0b',
    buttonGradient: 'from-rose-500 to-amber-500',
    fullscreen: 'border-rose-300/60 text-rose-600 bg-rose-500/10 hover:bg-rose-500/20',
    overlay: 'bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.2),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.24),_transparent_55%)]'
  }
} as const

const FULLSCREEN_DECOR = {
  ocean: {
    gradient: ['#0b75d4', '#0a5196', '#062f56'],
    orb: ['rgba(125, 211, 252, 0.95)', 'rgba(59, 130, 246, 0.75)'],
    waves: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)']
  },
  desert: {
    gradient: ['#f6ad55', '#ed8936', '#c05621'],
    orb: ['rgba(254, 215, 170, 0.95)', 'rgba(251, 146, 60, 0.7)'],
    waves: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.1)']
  },
  beach: {
    gradient: ['#0ea5e9', '#0d9488', '#10705d'],
    orb: ['rgba(167, 243, 208, 0.95)', 'rgba(34, 197, 94, 0.7)'],
    waves: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)']
  },
  workspace: {
    gradient: ['#312e81', '#3730a3', '#1e1b4b'],
    orb: ['rgba(199, 210, 254, 0.9)', 'rgba(99, 102, 241, 0.7)'],
    waves: ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.08)']
  },
  bookstore: {
    gradient: ['#f97385', '#f59e0b', '#a16207'],
    orb: ['rgba(254, 215, 170, 0.9)', 'rgba(244, 114, 182, 0.7)'],
    waves: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.1)']
  }
} as const

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface FocusFlowCardProps {
  highlighted?: boolean
}

export const FocusFlowCard = ({ highlighted = false }: FocusFlowCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const focusDuration = focusMinutes * 60
  const breakDuration = breakMinutes * 60
  const [seconds, setSeconds] = useState(focusDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>('ocean')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const theme = THEMES[themeKey]
  const fullscreenDecor = FULLSCREEN_DECOR[themeKey] ?? FULLSCREEN_DECOR.ocean
  const lastDurationsRef = useRef({ focus: focusDuration, break: breakDuration })
  const themeSelectorRef = useRef<HTMLDivElement>(null)

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
        const nextDuration = nextMode === 'focus' ? focusDuration : breakDuration

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
  }, [isRunning, mode, focusDuration, breakDuration])

  const progress = useMemo(() => {
    const total = mode === 'focus' ? focusDuration : breakDuration
    return 1 - seconds / total
  }, [mode, seconds, focusDuration, breakDuration])

  const handleToggle = () => {
    setIsRunning((value) => !value)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMode('focus')
    setSeconds(focusDuration)
    setCompletedCycles(0)
  }

  useEffect(() => {
    if (isRunning) {
      lastDurationsRef.current = { focus: focusDuration, break: breakDuration }
      return
    }

    const focusChanged = lastDurationsRef.current.focus !== focusDuration
    const breakChanged = lastDurationsRef.current.break !== breakDuration

    if (mode === 'focus' && focusChanged) {
      setSeconds(focusDuration)
    } else if (mode === 'break' && breakChanged) {
      setSeconds(breakDuration)
    }

    lastDurationsRef.current = { focus: focusDuration, break: breakDuration }
  }, [focusDuration, breakDuration, mode, isRunning])

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
      setIsThemeMenuOpen(false)
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange)
  }, [])

  useEffect(() => {
    const body = document.body

    if (isFullScreen) {
      body.classList.add('show-native-cursor')
    } else {
      body.classList.remove('show-native-cursor')
    }

    document.dispatchEvent(new Event('lifeos-cursor-visibility-change'))

    return () => {
      body.classList.remove('show-native-cursor')
      document.dispatchEvent(new Event('lifeos-cursor-visibility-change'))
    }
  }, [isFullScreen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!themeSelectorRef.current) return
      if (!themeSelectorRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsThemeMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleToggleFullScreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const disableAdjustments = isRunning

  const handleFocusChange = (value: number) => {
    if (Number.isNaN(value)) return
    const clamped = Math.min(120, Math.max(5, value))
    setFocusMinutes(clamped)
  }

  const handleBreakChange = (value: number) => {
    if (Number.isNaN(value)) return
    const clamped = Math.min(60, Math.max(1, value))
    setBreakMinutes(clamped)
  }

  const themeButtonClass = isFullScreen
    ? 'flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs text-white font-medium transition-colors hover:bg-white/25 backdrop-blur'
    : 'flex items-center gap-2 rounded-xl border border-ink-200/50 bg-white/80 px-3 py-2 text-xs text-ink-600 hover:bg-white'

  const themeMenuClass = isFullScreen
    ? 'absolute top-full right-0 mt-3 w-56 rounded-2xl border border-white/18 bg-white/12 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.38)] overflow-hidden z-30'
    : 'absolute top-full right-0 mt-2 w-52 rounded-xl border border-ink-200/60 bg-white shadow-xl overflow-hidden z-30'

  const themeOptionClass = (key: keyof typeof THEMES) => {
    if (isFullScreen) {
      return `w-full text-left px-4 py-2 text-sm transition-colors ${themeKey === key ? 'bg-white/25 text-white font-semibold' : 'text-white/80 hover:bg-white/15 hover:text-white'}`
    }
    return `w-full text-left px-4 py-2 text-sm transition-colors ${themeKey === key ? 'bg-sand-100 text-ink-900 font-semibold' : 'text-ink-600 hover:bg-sand-100/80'}`
  }

  const actionButtonClass = isFullScreen
    ? `backdrop-blur-lg border border-white/25 text-white ${isRunning ? 'bg-white/10 hover:bg-white/20' : 'bg-white/20 hover:bg-white/30 shadow-[0_0_45px_rgba(8,47,73,0.25)]'}`
    : isRunning
      ? 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50'
      : `bg-gradient-to-r ${theme.buttonGradient} text-white shadow-lg`

  const containerClasses = [
    'backdrop-blur-md rounded-2xl border p-6 flex flex-col gap-6 h-full relative overflow-hidden',
    theme.container,
    theme.border,
    highlighted ? 'ring-2 ring-ink-500/60 shadow-xl animate-pulse' : '',
    isFullScreen ? 'min-h-screen w-full rounded-none border-none p-8 md:p-12 gap-10 justify-between' : ''
  ]

  return (
    <motion.div
      ref={containerRef}
      className={containerClasses.filter(Boolean).join(' ')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${theme.overlay} ${isFullScreen ? 'opacity-0' : 'opacity-70'}`}
      />
      {isFullScreen && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${fullscreenDecor.gradient[0]} 0%, ${fullscreenDecor.gradient[1]} 55%, ${fullscreenDecor.gradient[2]} 100%)`
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-[14%] flex justify-center pointer-events-none"
            animate={{ scale: [1, 1.04, 1], opacity: [0.85, 0.95, 0.85] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-56 h-56 rounded-full blur-[2px]"
              style={{
                background: `radial-gradient(circle, ${fullscreenDecor.orb[0]} 0%, ${fullscreenDecor.orb[1]} 70%)`
              }}
            />
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none overflow-hidden">
            {[0, 1, 2].map((wave) => (
              <motion.svg
                key={wave}
                viewBox="0 0 720 240"
                preserveAspectRatio="none"
                className="absolute bottom-0 w-[200%] h-56"
                style={{
                  left: wave % 2 === 0 ? '-25%' : '-35%',
                  fill: fullscreenDecor.waves[wave]
                }}
                initial={{ x: 0 }}
                animate={{ x: ['0%', wave % 2 === 0 ? '-50%' : '-40%', '0%'] }}
                transition={{ duration: 18 + wave * 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M0 180 C 120 130, 240 220, 360 170 C 480 120, 600 210, 720 160 L 720 240 L 0 240 Z" />
              </motion.svg>
            ))}
          </div>
        </>
      )}
      <div className={`relative z-10 flex flex-col gap-6 h-full ${isFullScreen ? 'max-w-5xl mx-auto w-full items-center text-center gap-10 py-10 text-white' : ''}`}>
        <div className={isFullScreen ? 'flex flex-col items-center gap-4' : 'flex flex-col gap-4'}>
          <div className={isFullScreen ? 'flex flex-col items-center gap-4' : 'flex items-center justify-between'}>
            <div className={isFullScreen ? 'space-y-1' : ''}>
              <p className={`text-xs font-semibold tracking-[0.35em] uppercase ${isFullScreen ? 'text-white/70' : 'text-ink-400'}`}>Focus Flow</p>
              <h3 className={`${isFullScreen ? 'text-3xl font-semibold text-white drop-shadow-sm' : 'text-xl font-medium text-ink-900'}`}>
                {mode === 'focus' ? 'Deep Session' : 'Recovery Pause'}
              </h3>
            </div>
            <div className={`flex items-center gap-2 ${isFullScreen ? 'flex-wrap justify-center' : ''}`}>
              <div ref={themeSelectorRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen((value) => !value)}
                  className={themeButtonClass}
                  aria-haspopup="listbox"
                  aria-expanded={isThemeMenuOpen}
                >
                  <span>{theme.label}</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 2.5L6 6.5L10 2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {isThemeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className={themeMenuClass}
                      role="listbox"
                    >
                      {Object.entries(THEMES).map(([key, value]) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => {
                            setThemeKey(key as keyof typeof THEMES)
                            setIsThemeMenuOpen(false)
                          }}
                          className={themeOptionClass(key as keyof typeof THEMES)}
                          role="option"
                          aria-selected={themeKey === key}
                        >
                          {value.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={handleToggleFullScreen}
                className={isFullScreen
                  ? 'rounded-full px-4 py-2 text-xs font-medium border border-white/30 bg-white/15 text-white hover:bg-white/25 transition-colors backdrop-blur'
                  : `rounded-xl px-3 py-2 text-xs border transition-colors ${theme.fullscreen}`}
              >
                {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
          <motion.div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${isFullScreen ? 'bg-white/15 border border-white/25 text-white' : mode === 'focus' ? theme.focusAccent : theme.breakAccent}`}
            animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isRunning ? Infinity : 0, duration: 1.5 }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
        </div>

        <div className={`grid md:grid-cols-2 gap-4 ${isFullScreen ? 'w-full gap-6' : ''}`}>
          <div className={`rounded-2xl border p-4 relative overflow-hidden ${isFullScreen ? 'border-white/15 bg-white/10 backdrop-blur-lg text-white/80' : 'border-ink-200/30 bg-white/60'}`}>
            <div className="relative z-10 space-y-3">
              <p className={`text-xs font-semibold uppercase tracking-[0.36em] ${isFullScreen ? 'text-white/60' : 'text-ink-500 tracking-wide'}`}>Customise session</p>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center justify-between text-sm ${isFullScreen ? 'text-white/80' : 'text-ink-600'}`}>
                  <span>Focus length (minutes)</span>
                  <div className="relative">
                  <input
                    type="number"
                    min={5}
                    max={120}
                    step={1}
                    value={focusMinutes}
                    onChange={(event) => handleFocusChange(Number(event.target.value))}
                    disabled={disableAdjustments}
                    className={isFullScreen
                      ? 'w-24 rounded-xl border border-white/20 bg-white/10 pl-4 pr-8 py-2 text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-40 backdrop-blur appearance-none'
                      : 'w-24 rounded-xl border border-ink-200/50 bg-white/80 pl-4 pr-8 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-ink-200 disabled:opacity-50 appearance-none'}
                  />
                  <div className={`absolute inset-y-0 right-1.5 flex flex-col justify-center gap-1 pointer-events-none ${isFullScreen ? 'text-white/60' : 'text-ink-400'}`}>
                    <svg className="w-2.5 h-2.5" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.75L4 1.75L7 4.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg className="w-2.5 h-2.5" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.25L4 4.25L7 1.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                  </label>
                <label className={`flex items-center justify-between text-sm ${isFullScreen ? 'text-white/80' : 'text-ink-600'}`}>
                  <span>Break length (minutes)</span>
                  <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    step={1}
                    value={breakMinutes}
                    onChange={(event) => handleBreakChange(Number(event.target.value))}
                    disabled={disableAdjustments}
                    className={isFullScreen
                      ? 'w-24 rounded-xl border border-white/20 bg-white/10 pl-4 pr-8 py-2 text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-40 backdrop-blur appearance-none'
                      : 'w-24 rounded-xl border border-ink-200/50 bg-white/80 pl-4 pr-8 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-ink-200 disabled:opacity-50 appearance-none'}
                  />
                  <div className={`absolute inset-y-0 right-1.5 flex flex-col justify-center gap-1 pointer-events-none ${isFullScreen ? 'text-white/60' : 'text-ink-400'}`}>
                    <svg className="w-2.5 h-2.5" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.75L4 1.75L7 4.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg className="w-2.5 h-2.5" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.25L4 4.25L7 1.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                  </label>
                <p className={`text-xs ${isFullScreen ? 'text-white/60' : 'text-ink-400'}`}>Adjust timings before you start to keep flow tailored to the day.</p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl border border-white/60 pointer-events-none" aria-hidden />
          </div>
          <div className={`rounded-2xl border p-4 relative overflow-hidden ${isFullScreen ? 'border-white/15 bg-white/10 backdrop-blur-lg text-white/80' : 'border-ink-200/30 bg-white/60'}`}>
            <div className="relative z-10 space-y-3">
              <p className={`text-xs font-semibold uppercase tracking-[0.36em] ${isFullScreen ? 'text-white/60' : 'text-ink-500 tracking-wide'}`}>Cycle overview</p>
              <div className={`flex items-center justify-between text-sm ${isFullScreen ? 'text-white/80' : 'text-ink-600'}`}>
                <span>Total cycle</span>
                <span>{focusMinutes + breakMinutes} min</span>
              </div>
              <div className={`flex items-center justify-between text-sm ${isFullScreen ? 'text-white/80' : 'text-ink-600'}`}>
                <span>Focus : Break ratio</span>
                <span>{focusMinutes}:{breakMinutes}</span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl border border-white/60 pointer-events-none" aria-hidden />
          </div>
        </div>

        <div className={`relative ${isFullScreen ? 'h-48' : 'h-40'}`}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="68"
              stroke={theme.ringColor}
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
                <stop offset="0%" stopColor={theme.progressStart} />
                <stop offset="100%" stopColor={theme.progressEnd} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-sm mb-1 tracking-[0.3em] uppercase ${isFullScreen ? 'text-white/60' : 'text-ink-500'}`}>{mode === 'focus' ? 'Focus Interval' : 'Break Interval'}</span>
            <span className={`font-light ${isFullScreen ? 'text-5xl text-white drop-shadow-sm' : 'text-4xl text-ink-900'}`}>{formatTime(seconds)}</span>
          </div>
        </div>

        <p className={`text-sm ${isFullScreen ? 'text-white/75' : 'text-ink-600'}`}>
          Completed cycles today: <span className={isFullScreen ? 'font-semibold text-white' : 'font-semibold text-ink-800'}>{completedCycles}</span>
        </p>

        <div className={`flex items-center gap-3 mt-auto ${isFullScreen ? 'w-full' : ''}`}>
          <button
            onClick={handleToggle}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${actionButtonClass}`}
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </button>
          <button
            onClick={handleReset}
            className={isFullScreen
              ? 'px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white/80 transition-colors'
              : 'px-4 py-3 rounded-xl text-sm text-ink-400 hover:text-ink-600'}
          >
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  )
}

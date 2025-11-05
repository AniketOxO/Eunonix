import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type PhaseId = 'inhale' | 'hold' | 'exhale'

interface Phase {
  id: PhaseId
  duration: number
  prompt: string
}

interface BreathingProtocol {
  id: string
  title: string
  subtitle: string
  description: string
  cadence: string
  benefits: string[]
  tips: string[]
  metrics: Array<{ label: string; value: string }>
  pattern: Phase[]
}

const BREATHING_PROTOCOLS: BreathingProtocol[] = [
  {
    id: 'coherent',
    title: 'Coherent Breathing',
    subtitle: 'Vagus-activating 4:4:6 rhythm',
    description: 'Balances your heart-rate variability while gently shifting the nervous system into parasympathetic mode.',
    cadence: 'Inhale 4s • Hold 4s • Exhale 6s',
    benefits: ['Stabilises heart rhythm coherence', 'Softens anxious tension', 'Improves emotional regulation'],
    tips: ['Let the exhale linger to signal safety to your system', 'Soften your shoulders on every gentle pause', 'Imagine the breath drawing a smooth figure-eight through the heart'],
    metrics: [
      { label: 'Nervous System', value: 'Parasympathetic reset' },
      { label: 'Focus', value: 'Even, sustained' },
      { label: 'Energy', value: 'Gentle uplift' }
    ],
    pattern: [
      { id: 'inhale', duration: 4, prompt: 'Inhale gently through the nose, feel your ribs opening like wings' },
      { id: 'hold', duration: 4, prompt: 'Hold softly and melt your jaw while the shoulders float down' },
      { id: 'exhale', duration: 6, prompt: 'Exhale slowly as if fogging glass, letting the whole body soften' }
    ]
  },
  {
    id: 'box',
    title: 'Box Breathing',
    subtitle: 'Equalised 4:4:4 rhythm',
    description: 'A military-tested cadence that sharpens presence and smooths stress spikes when you need quick composure.',
    cadence: 'Inhale 4s • Hold 4s • Exhale 4s',
    benefits: ['Reclaims focus in under two minutes', 'Steadies the heartbeat after sudden stress', 'Builds resilience to pressure'],
    tips: ['Visualise each side of the square glowing gently as you breathe', 'Rest the elbows by your side to keep the ribs relaxed', 'If lightheadedness arises, take shorter holds until the body settles'],
    metrics: [
      { label: 'Nervous System', value: 'Symmetry training' },
      { label: 'Focus', value: 'High alert clarity' },
      { label: 'Energy', value: 'Grounded calm' }
    ],
    pattern: [
      { id: 'inhale', duration: 4, prompt: 'Breathe in as you trace the first side of your calming square' },
      { id: 'hold', duration: 4, prompt: 'Hold softly and notice the steadiness of that still edge' },
      { id: 'exhale', duration: 4, prompt: 'Exhale to complete the next side, feeling grounded and clear' }
    ]
  },
  {
    id: 'resonant',
    title: 'Resonant Wave',
    subtitle: 'Heart-brain resonance flow',
    description: 'Works with your natural baroreflex to synchronise breathing, heartbeat, and brain-wave coherence.',
    cadence: 'Inhale 5s • Hold 2s • Exhale 5s',
    benefits: ['Enhances cognitive flexibility', 'Boosts HRV in under five minutes', 'Creates a gentle rocking sensation in the body'],
    tips: ['Count a smooth five on the inhale, then float for a heartbeat before the exhale', 'Picture moonlit waves rolling gently in and out', 'Keep the throat open, as if sighing the breath into the horizon'],
    metrics: [
      { label: 'Nervous System', value: 'Coherence boost' },
      { label: 'Focus', value: 'Flow-state' },
      { label: 'Energy', value: 'Balanced' }
    ],
    pattern: [
      { id: 'inhale', duration: 5, prompt: 'Inhale slowly and feel the ribs expand like a rising wave' },
      { id: 'hold', duration: 2, prompt: 'Hover softly at the crest, savoring a suspended stillness' },
      { id: 'exhale', duration: 5, prompt: 'Exhale with a relaxed jaw, gliding back toward calm shores' }
    ]
  },
  {
    id: '478',
    title: '4-7-8 Reset',
    subtitle: 'Deep unwind cadence',
    description: 'A calming signature popularised by Dr. Andrew Weil that settles the body before rest or sleep.',
    cadence: 'Inhale 4s • Hold 7s • Exhale 8s',
    benefits: ['Dials down late-night racing thoughts', 'Encourages diaphragmatic breathing', 'Supports faster transition into sleep'],
    tips: ['Touch the tongue to the roof of the mouth throughout the cycle', 'Keep the shoulders heavy as the breath lengthens', 'Let the exhale drift out with a soft “whoosh” sound'],
    metrics: [
      { label: 'Nervous System', value: 'Sleep priming' },
      { label: 'Focus', value: 'Dreamy calm' },
      { label: 'Energy', value: 'Downshift' }
    ],
    pattern: [
      { id: 'inhale', duration: 4, prompt: 'Inhale softly for a count of four, drawing air deep and slow' },
      { id: 'hold', duration: 7, prompt: 'Hold with ease, floating in the quiet while the body stays still' },
      { id: 'exhale', duration: 8, prompt: 'Exhale fully and whisper the breath away into the night air' }
    ]
  }
]

const CALMING_TRACKS = [
  {
    title: 'Gentle Breathing',
    artist: 'Aeria',
    url: 'https://open.spotify.com/track/1bKvFGk3jfbQ3VIAtF5pPz?si=eunonix_breathe_ai'
  },
  {
    title: 'Slow Horizons',
    artist: 'Evening Tape',
    url: 'https://open.spotify.com/track/0S4dDuO8N58dS9J33qG1Ui?si=eunonix_breathe_ai'
  },
  {
    title: 'Nocturne Bloom',
    artist: 'Aria Bloom',
    url: 'https://open.spotify.com/track/6FR8udBvGpHhT9xJ0eYq6p?si=eunonix_breathe_ai'
  }
]

const phaseColor: Record<PhaseId, string> = {
  inhale: 'from-emerald-400/70 to-emerald-600/60',
  hold: 'from-blue-400/70 to-blue-600/60',
  exhale: 'from-purple-400/70 to-purple-600/60'
}

const INITIAL_PROTOCOL = BREATHING_PROTOCOLS[0]
const VOICE_PADDING_SECONDS = 2
const INTRO_MESSAGE = "Hi, I'm your Eunonix breathing guide. Let's arrive together and begin when you're ready."
const INTRO_FALLBACK_DURATION = 2800
const PHASE_LABELS: Record<PhaseId, string> = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale'
}

interface BreatheAICardProps {
  highlighted?: boolean
}

export const BreatheAICard = ({ highlighted = false }: BreatheAICardProps) => {
  const canUseVoice = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [selectedProtocolId, setSelectedProtocolId] = useState(INITIAL_PROTOCOL.id)
  const activeProtocol = useMemo(
    () => BREATHING_PROTOCOLS.find((protocol) => protocol.id === selectedProtocolId) ?? INITIAL_PROTOCOL,
    [selectedProtocolId]
  )
  const phases = activeProtocol.pattern
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [seconds, setSeconds] = useState(() => {
    const baseDuration = phases[0]?.duration ?? 0
    return baseDuration + (canUseVoice ? VOICE_PADDING_SECONDS : 0)
  })
  const [completedRounds, setCompletedRounds] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(canUseVoice)
  const [hasVoices, setHasVoices] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [calmingVoices, setCalmingVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isIntroPlaying, setIsIntroPlaying] = useState(false)
  const [isAwaitingReady, setIsAwaitingReady] = useState(false)

  const isVoiceActive = voiceEnabled && hasVoices

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const promptTimeoutRef = useRef<number | null>(null)
  const introTimeoutRef = useRef<number | null>(null)

  const handleVoiceSelection = useCallback(
    (voiceURI: string) => {
      const preferred = calmingVoices.find((voice) => voice.voiceURI === voiceURI)
      if (preferred) {
        setSelectedVoice(preferred)
      }
    },
    [calmingVoices]
  )
  const activePhase = useMemo(() => phases[phaseIndex], [phaseIndex, phases])
  const getPhaseDuration = useCallback(
    (index: number) => {
      const phase = phases[index]
      if (!phase) return 0
      const padding = voiceEnabled ? VOICE_PADDING_SECONDS : 0
      return Math.max(1, phase.duration + padding)
    },
    [phases, voiceEnabled]
  )
  const totalDuration = useMemo(() => phases.reduce((sum, phase) => sum + phase.duration, 0), [phases])
  const effectiveTotalDuration = useMemo(
    () => phases.reduce((sum, _phase, index) => sum + getPhaseDuration(index), 0),
    [phases, getPhaseDuration]
  )
  const formatCadenceForProtocol = useCallback(
    (protocol: BreathingProtocol, includePadding: boolean) => {
      const padding = includePadding ? VOICE_PADDING_SECONDS : 0
      return protocol.pattern
        .map((phase) => `${PHASE_LABELS[phase.id]} ${Math.max(1, phase.duration + padding)}s`)
        .join(' • ')
    },
    []
  )
  const activeCadenceLabel = useMemo(
    () => formatCadenceForProtocol(activeProtocol, voiceEnabled).toUpperCase(),
    [activeProtocol, voiceEnabled, formatCadenceForProtocol]
  )
  const startBreathingSession = useCallback(() => {
    setPhaseIndex(0)
    setSeconds(getPhaseDuration(0))
    setIsIntroPlaying(false)
    setIsAwaitingReady(false)
    setIsRunning(true)
  }, [getPhaseDuration])

  useEffect(() => {
    setIsRunning(false)
    setIsIntroPlaying(false)
    setIsAwaitingReady(false)
    setPhaseIndex(0)
    setSeconds(getPhaseDuration(0))
    setCompletedRounds(0)
  }, [selectedProtocolId, phases, getPhaseDuration])

  useEffect(() => {
    setSeconds(getPhaseDuration(phaseIndex))
  }, [voiceEnabled, getPhaseDuration, phaseIndex])

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) {
          return prev - 1
        }

        const nextIndex = (phaseIndex + 1) % phases.length
        if (nextIndex === 0) {
          setCompletedRounds((count) => count + 1)
        }
        if (navigator.vibrate) {
          navigator.vibrate([40])
        }
        setPhaseIndex(nextIndex)
        return getPhaseDuration(nextIndex)
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, phaseIndex, phases, getPhaseDuration])

  const activePhaseDuration = getPhaseDuration(phaseIndex) || 1
  const progress = 1 - seconds / activePhaseDuration

  const cancelNarration = useCallback(() => {
    if (typeof window === 'undefined') return
    if (promptTimeoutRef.current !== null) {
      window.clearTimeout(promptTimeoutRef.current)
      promptTimeoutRef.current = null
    }
    if (introTimeoutRef.current !== null) {
      window.clearTimeout(introTimeoutRef.current)
      introTimeoutRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onend = null
      currentUtteranceRef.current = null
    }
  }, [])

  const speakText = useCallback(
    (text: string, onComplete?: () => void) => {
      if (typeof window === 'undefined') {
        if (onComplete) onComplete()
        return
      }

      const finish = () => {
        if (currentUtteranceRef.current) {
          currentUtteranceRef.current.onend = null
          currentUtteranceRef.current = null
        }
        if (onComplete) {
          onComplete()
        }
      }

      if (promptTimeoutRef.current !== null) {
        window.clearTimeout(promptTimeoutRef.current)
        promptTimeoutRef.current = null
      }

      const synthAvailable = 'speechSynthesis' in window
      const synth = synthAvailable ? window.speechSynthesis : null

      if (!voiceEnabled || !synth) {
        const estimated = Math.max(INTRO_FALLBACK_DURATION, text.split(' ').length * 220)
        promptTimeoutRef.current = window.setTimeout(() => {
          promptTimeoutRef.current = null
          finish()
        }, estimated)
        return
      }

      synth.cancel()
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onend = null
        currentUtteranceRef.current = null
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1.05
      utterance.volume = 0.96
      const voiceForPrompt = selectedVoice ?? calmingVoices[0] ?? null
      if (voiceForPrompt) {
        utterance.voice = voiceForPrompt
      }
      utterance.onend = finish
      utterance.onerror = finish

      promptTimeoutRef.current = window.setTimeout(() => {
        currentUtteranceRef.current = utterance
        synth.speak(utterance)
        promptTimeoutRef.current = null
      }, 60)
    },
    [voiceEnabled, calmingVoices, selectedVoice]
  )

  const speakPrompt = useCallback(
    (text: string) => {
      speakText(text)
    },
    [speakText]
  )

  useEffect(() => {
    if (!isRunning) return
    speakPrompt(activePhase.prompt)
  }, [activePhase.id, activePhase.prompt, isRunning, speakPrompt])

  useEffect(() => {
    if (!canUseVoice) {
      return
    }

    const synth = window.speechSynthesis
    const priorityNames = ['aria', 'sarah', 'natasha', 'jenny', 'amy', 'emma', 'salli', 'joanna', 'olivia', 'ava', 'isabella', 'charlotte', 'allison', 'zoe', 'maya']
    const femaleMarkers = [/female/i, /feminine/i, /woman/i, /wavenet-f/i, /girl/i, /neural female/i]
    const maleMarkers = [/male/i, /man/i, /wavenet-m/i, /brian/i, /neil/i, /guy/i, /boy/i, /adam/i]

    const isLikelyFemale = (voice: SpeechSynthesisVoice) => {
      const normalized = voice.name.toLowerCase()
      if (maleMarkers.some((marker) => marker.test(voice.name))) return false
      if (priorityNames.some((candidate) => normalized.includes(candidate))) return true
      if (femaleMarkers.some((marker) => marker.test(voice.name))) return true
      const typed = voice as SpeechSynthesisVoice & { gender?: string }
      if (typed.gender?.toLowerCase() === 'female') return true
      return /-f\d*$|female/i.test(voice.voiceURI)
    }

    const chooseCalmingVoice = (voices: SpeechSynthesisVoice[]) => {
      const englishVoices = voices.filter((voice) => voice.lang.startsWith('en'))
      const ranked = [...englishVoices, ...voices].filter((voice, index, arr) => arr.indexOf(voice) === index)
      const femaleCandidates = ranked.filter(isLikelyFemale)

      if (femaleCandidates.length > 0) {
        const neural = femaleCandidates.find((voice) => /neural|natural/i.test(voice.name))
        return neural ?? femaleCandidates[0]
      }

      return englishVoices[0] ?? voices[0] ?? null
    }

    const collectCalmingVoices = (voices: SpeechSynthesisVoice[]) => {
      const englishVoices = voices.filter((voice) => voice.lang.startsWith('en'))
      const ranked = [...englishVoices, ...voices].filter((voice, index, arr) => arr.indexOf(voice) === index)
      const femaleCandidates = ranked.filter(isLikelyFemale)
      return femaleCandidates.length > 0 ? femaleCandidates : englishVoices
    }

    const updateVoices = () => {
      const voiceList = synth.getVoices()
      setHasVoices(voiceList.length > 0)
      if (voiceList.length > 0) {
        const chosen = chooseCalmingVoice(voiceList)
        setCalmingVoices(collectCalmingVoices(voiceList))
        if (!selectedVoice) {
          setSelectedVoice(chosen)
        }
        const stillAvailable = voiceList.find((voice) => voice.voiceURI === selectedVoice?.voiceURI)
        if (!stillAvailable) {
          setSelectedVoice(chosen)
        }
      }
    }

    updateVoices()
    const handler = () => updateVoices()

    synth.addEventListener('voiceschanged', handler)
    synth.onvoiceschanged = handler

    return () => {
      synth.removeEventListener('voiceschanged', handler)
      synth.onvoiceschanged = null
      cancelNarration()
    }
  }, [canUseVoice, selectedVoice, cancelNarration])

  useEffect(() => {
    if (!canUseVoice) return
    if (!voiceEnabled) {
      cancelNarration()
    }
  }, [voiceEnabled, canUseVoice, cancelNarration])

  useEffect(() => {
    if (!canUseVoice) return
    if (!isRunning) {
      cancelNarration()
    }
  }, [isRunning, canUseVoice, cancelNarration])

  useEffect(() => {
    return () => {
      cancelNarration()
    }
  }, [cancelNarration])

  const handleToggle = () => {
    if (isRunning) {
      cancelNarration()
      setIsRunning(false)
      return
    }

    if (isIntroPlaying || isAwaitingReady) {
      cancelNarration()
      setIsIntroPlaying(false)
      setIsAwaitingReady(false)
      setPhaseIndex(0)
      setSeconds(getPhaseDuration(0))
      return
    }

    cancelNarration()
    setPhaseIndex(0)
    setSeconds(getPhaseDuration(0))
    setIsRunning(false)
    setIsIntroPlaying(true)
    setIsAwaitingReady(false)

    if (voiceEnabled && canUseVoice) {
      speakText(INTRO_MESSAGE, () => {
        setIsIntroPlaying(false)
        setIsAwaitingReady(true)
      })
    } else {
      if (typeof window === 'undefined') {
        setIsIntroPlaying(false)
        setIsAwaitingReady(true)
        return
      }
      introTimeoutRef.current = window.setTimeout(() => {
        introTimeoutRef.current = null
        setIsIntroPlaying(false)
        setIsAwaitingReady(true)
      }, INTRO_FALLBACK_DURATION)
    }
  }

  const handleReadyConfirm = useCallback(() => {
    cancelNarration()
    startBreathingSession()
  }, [cancelNarration, startBreathingSession])

  const handleReset = () => {
    cancelNarration()
    setIsIntroPlaying(false)
    setIsAwaitingReady(false)
    setIsRunning(false)
    setPhaseIndex(0)
    setSeconds(getPhaseDuration(0))
    setCompletedRounds(0)
  }

  const statusKey = isIntroPlaying ? 'intro' : isAwaitingReady ? 'ready' : activePhase.id
  const statusBadgeLabel = isIntroPlaying ? 'WELCOME' : isAwaitingReady ? 'READY?' : activePhase.id === 'inhale' ? 'BREATHE IN' : activePhase.id === 'hold' ? 'HOLD' : 'BREATHE OUT'
  const statusMessage = isIntroPlaying
    ? "Hi, I'm your Eunonix breathing guide. Find a comfortable posture and we'll begin."
    : isAwaitingReady
      ? 'When you feel settled, tap "I\'m Ready" to start your guided breathing.'
      : activePhase.prompt
  const statusTimerDisplay = isIntroPlaying || isAwaitingReady ? 'Ready' : `${seconds}s`
  const statusSubLabel = isIntroPlaying ? 'SETTLING IN' : isAwaitingReady ? 'AWAITING YOUR CUE' : activeCadenceLabel
  const primaryActionIsActive = isRunning || isIntroPlaying || isAwaitingReady
  const primaryActionLabel = isIntroPlaying ? 'Cancel Intro' : isAwaitingReady ? 'Cancel Setup' : isRunning ? 'Pause Session' : 'Begin Session'

  return (
    <motion.div
      className={`bg-white/50 backdrop-blur-md rounded-2xl border border-lilac-200/40 p-6 flex flex-col h-full ${highlighted ? 'ring-2 ring-emerald-400/60 shadow-xl animate-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.4em] uppercase text-ink-400">Breathe AI</p>
          <h3 className="text-2xl font-semibold text-ink-900">{activeProtocol.title}</h3>
          <p className="text-xs text-emerald-500 mt-1">{activeProtocol.subtitle}</p>
        </div>
        {canUseVoice ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled((value) => !value)}
              className={`flex items-center gap-2 text-xs rounded-full px-3 py-1.5 border transition-colors ${isVoiceActive ? 'text-emerald-600 border-emerald-200 bg-emerald-50/80' : 'text-ink-400 border-ink-200/50 hover:text-ink-600 hover:border-ink-300 bg-white/60'}`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 011.707-.707l4 4A1 1 0 0115.293 6H14v4a4 4 0 01-4 4H8a1 1 0 01-1-1v-1a3 3 0 013-3h1V6H9a1 1 0 01-1-1V2z" />
                <path d="M5 10a5 5 0 015-5v2a3 3 0 00-3 3v1H6a1 1 0 01-1-1z" />
              </svg>
              {isVoiceActive ? 'Voice on' : 'Voice guidance'}
            </button>
            {voiceEnabled && calmingVoices.length > 0 ? (
              <select
                value={selectedVoice?.voiceURI ?? calmingVoices[0].voiceURI}
                onChange={(event) => handleVoiceSelection(event.target.value)}
                className="text-xs rounded-lg border border-emerald-200 bg-white/80 px-2 py-1 text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                title="Select calming voice"
              >
                {calmingVoices.map((voice) => (
                  <option value={voice.voiceURI} key={voice.voiceURI}>
                    {voice.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ) : null}
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${phaseColor[activePhase.id]} text-white shadow-inner shadow-emerald-500/40`}
          animate={{ scale: isRunning ? [1, 1.08, 1] : 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 1.8 }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12 items-start">
        <div className="xl:col-span-5 flex flex-col gap-5">
          <div className="relative h-52 xl:h-64">
            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-emerald-100/70 via-white/60 to-lilac-100/60 border border-emerald-100/40 shadow-[0_28px_40px_-28px_rgba(16,185,129,0.45)]" />
            <motion.div
              key={activePhase.id}
              className={`absolute inset-[6px] rounded-[30px] bg-gradient-to-br ${phaseColor[activePhase.id]} opacity-75`}
              initial={{ scale: 0.92, opacity: 0.65 }}
              animate={{ scale: isRunning ? 1 : 0.95, opacity: isRunning ? 0.85 : 0.7 }}
              transition={{ duration: 1.3, repeat: isRunning ? Infinity : 0, repeatType: 'reverse', ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-[28px] rounded-[24px] bg-white/85 backdrop-blur-xl px-6 sm:px-8 flex flex-col items-center justify-center text-center shadow-[0_20px_35px_-28px_rgba(15,118,110,0.45)]"
              animate={{ scale: 1 + progress * 0.05 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <motion.div
                className="absolute -top-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-200/60 text-emerald-600 text-xs font-semibold uppercase tracking-[0.25em]"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {statusBadgeLabel}
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusKey}
                  className="text-base font-medium text-ink-600"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {statusMessage}
                </motion.span>
              </AnimatePresence>
              <span className="mt-3 text-5xl font-light text-ink-900">{statusTimerDisplay}</span>
              <p className="mt-1 text-[11px] text-emerald-500 uppercase tracking-[0.3em] opacity-80">{statusSubLabel}</p>
            </motion.div>
          </div>

          <div className="rounded-2xl border border-emerald-100/60 bg-white/75 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-ink-500">
              Completed rounds today: <span className="font-semibold text-ink-700">{completedRounds}</span>
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleToggle}
                className={`flex-1 sm:flex-none sm:min-w-[160px] py-3 rounded-xl font-semibold transition-all ${primaryActionIsActive ? 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50' : 'bg-gradient-to-r from-emerald-500 to-lilac-500 text-white shadow-lg'}`}
              >
                {primaryActionLabel}
              </button>
              {isAwaitingReady ? (
                <button
                  onClick={handleReadyConfirm}
                  className="flex-1 sm:flex-none sm:min-w-[150px] px-4 py-3 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
                >
                  I'm Ready
                </button>
              ) : null}
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl text-sm text-ink-400 hover:text-ink-600"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100/60 bg-white/80 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Cycle Overview</p>
              <span className="text-xs text-emerald-500">Total {voiceEnabled ? effectiveTotalDuration : totalDuration}s</span>
            </div>
            <div className="mt-4 flex items-end gap-3">
              {phases.map((phase, index) => {
                const isActivePhase = index === phaseIndex
                const displayedDuration = voiceEnabled ? getPhaseDuration(index) : phase.duration
                return (
                  <div
                    key={`${phase.id}-${index}`}
                    className="flex-1 flex flex-col items-center gap-2"
                    style={{ flexGrow: displayedDuration, flexBasis: 0 }}
                  >
                    <motion.div className="relative w-full h-3 rounded-full border border-white/60 bg-ink-100/60 overflow-hidden">
                      <motion.span
                        className={`absolute inset-0 bg-gradient-to-r ${phaseColor[phase.id]}`}
                        animate={isActivePhase ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.35 }}
                        transition={{ duration: 2.1, repeat: isActivePhase ? Infinity : 0, ease: 'easeInOut' }}
                      />
                    </motion.div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${isActivePhase ? 'text-ink-900' : 'text-ink-500'}`}>{displayedDuration}s</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-ink-400">{phase.id.toUpperCase()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 flex flex-col gap-5">
          <div className="rounded-2xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50/90 via-white to-lilac-50/80 px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.3em]">Breathing Programs</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {BREATHING_PROTOCOLS.map((protocol) => {
                const isSelected = protocol.id === selectedProtocolId
                return (
                  <motion.button
                    key={protocol.id}
                    onClick={() => setSelectedProtocolId(protocol.id)}
                    className={`relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all ${isSelected ? 'border-emerald-300 bg-white shadow-lg shadow-emerald-200/40' : 'border-emerald-100/60 bg-white/70 backdrop-blur hover:border-emerald-200'}`}
                    whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="absolute inset-0 opacity-70 bg-gradient-to-br from-emerald-200/30 via-white/40 to-lilac-200/30" />
                    <div className="relative flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold uppercase tracking-[0.35em] ${isSelected ? 'text-emerald-600' : 'text-ink-300'}`}>Cadence</span>
                        {isSelected ? (
                          <motion.span
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            Active
                          </motion.span>
                        ) : null}
                      </div>
                      <p className="text-sm font-semibold text-ink-900">{protocol.title}</p>
                      <p className="text-[11px] text-ink-500 leading-relaxed">{formatCadenceForProtocol(protocol, voiceEnabled)}</p>
                      <p className="text-xs text-ink-400 leading-relaxed">{protocol.description}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100/60 bg-white/75 px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="md:w-1/2 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.3em]">Cadence Signature</p>
                  <h4 className="text-lg font-semibold text-ink-900 mt-1">{formatCadenceForProtocol(activeProtocol, voiceEnabled)}</h4>
                  <p className="text-sm text-ink-500 mt-2 leading-relaxed">{activeProtocol.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {activeProtocol.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-emerald-100/70 bg-gradient-to-br from-white via-emerald-50/40 to-lilac-50/30 px-3 py-3"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-emerald-500">{metric.label}</p>
                      <p className="text-sm text-ink-700 mt-1">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.3em]">Benefits</p>
                  <ul className="mt-2 space-y-2 text-sm text-ink-500">
                    {activeProtocol.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-lilac-400" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.3em]">Micro-coaching</p>
                  <ul className="mt-2 space-y-2 text-sm text-ink-500">
                    {activeProtocol.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <span className="mt-[6px] inline-flex h-2 w-2 flex-shrink-0 items-center justify-center rounded-full border border-emerald-300">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50/80 via-white to-lilac-50/80 px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.3em]">Soundscapes</p>
            <h4 className="text-lg font-semibold text-ink-900 mt-1">Curated Calming Music</h4>
            <p className="text-sm text-ink-500 mt-2 max-w-xl">Blend the guided breath with gentle ambient textures selected to keep your nervous system in parasympathetic mode.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {CALMING_TRACKS.map((track, index) => (
              <motion.a
                key={track.title}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative overflow-hidden rounded-2xl border border-emerald-100/40 px-4 py-5 flex items-center gap-4 bg-white/70 backdrop-blur transition-all group ${index % 2 === 0 ? 'sm:translate-y-0' : 'sm:-translate-y-2'}`}
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="absolute inset-0 opacity-80 bg-gradient-to-br from-emerald-200/40 via-white/20 to-lilac-200/40 group-hover:from-emerald-300/50 group-hover:to-lilac-300/45 transition-colors" />
                <div className="relative z-10 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <div className="relative z-10 flex-1 text-left">
                  <p className="text-sm font-semibold text-ink-900 group-hover:text-emerald-700 transition-colors">
                    {track.title}
                  </p>
                  <p className="text-xs text-ink-500 mt-1">{track.artist}</p>
                </div>
                <svg className="relative z-10 w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

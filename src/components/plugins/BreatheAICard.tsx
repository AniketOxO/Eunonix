import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PHASES: Array<{ id: 'inhale' | 'hold' | 'exhale'; duration: number; prompt: string }> = [
  { id: 'inhale', duration: 4, prompt: 'Inhale gently' },
  { id: 'hold', duration: 4, prompt: 'Hold softly, keep shoulders relaxed' },
  { id: 'exhale', duration: 6, prompt: 'Exhale slowly' }
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
  }
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
  const canUseVoice = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [seconds, setSeconds] = useState(PHASES[0].duration)
  const [completedRounds, setCompletedRounds] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(canUseVoice)
  const [hasVoices, setHasVoices] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [calmingVoices, setCalmingVoices] = useState<SpeechSynthesisVoice[]>([])

  const handleVoiceSelection = useCallback(
    (voiceURI: string) => {
      const preferred = calmingVoices.find((voice) => voice.voiceURI === voiceURI)
      if (preferred) {
        setSelectedVoice(preferred)
      }
    },
    [calmingVoices]
  )
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

  const speakPrompt = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return
      }

      const synth = window.speechSynthesis
      if (!synth) return

      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.88
      utterance.pitch = 1
      utterance.volume = 0.92
      const voiceForPrompt = selectedVoice ?? calmingVoices[0] ?? null
      if (voiceForPrompt) {
        utterance.voice = voiceForPrompt
      }
      synth.speak(utterance)
    },
    [voiceEnabled, selectedVoice, calmingVoices]
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
      synth.cancel()
    }
  }, [canUseVoice, selectedVoice])

  useEffect(() => {
    if (!canUseVoice) return
    if (!voiceEnabled) {
      window.speechSynthesis.cancel()
    }
  }, [voiceEnabled, canUseVoice])

  useEffect(() => {
    if (!canUseVoice) return
    if (!isRunning) {
      window.speechSynthesis.cancel()
    }
  }, [isRunning, canUseVoice])

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
      className={`bg-white/50 backdrop-blur-md rounded-2xl border border-lilac-200/40 p-6 flex flex-col h-full ${highlighted ? 'ring-2 ring-emerald-400/60 shadow-xl animate-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Breathe AI</p>
          <h3 className="text-xl font-medium text-ink-900">Coherent Breathing</h3>
        </div>
        {canUseVoice ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled((value) => !value)}
              className={`flex items-center gap-2 text-xs rounded-full px-3 py-1 border transition-colors ${voiceEnabled && hasVoices ? 'text-emerald-600 border-emerald-200 bg-emerald-50/80' : 'text-ink-400 border-ink-200/50 hover:text-ink-600 hover:border-ink-300 bg-white/60'}`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 011.707-.707l4 4A1 1 0 0115.293 6H14v4a4 4 0 01-4 4H8a1 1 0 01-1-1v-1a3 3 0 013-3h1V6H9a1 1 0 01-1-1V2z" />
                <path d="M5 10a5 5 0 015-5v2a3 3 0 00-3 3v1H6a1 1 0 01-1-1z" />
              </svg>
              {voiceEnabled && hasVoices ? 'Voice on' : 'Voice guidance'}
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
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${phaseColor[activePhase.id]} text-white`}
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
                {activePhase.id === 'inhale' && 'Breathe In'}
                {activePhase.id === 'hold' && 'Hold'}
                {activePhase.id === 'exhale' && 'Breathe Out'}
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activePhase.id}
                  className="text-base font-medium text-ink-600"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {activePhase.prompt}
                </motion.span>
              </AnimatePresence>
              <span className="mt-3 text-5xl font-light text-ink-900">{seconds}s</span>
              <p className="mt-1 text-xs text-emerald-500 uppercase tracking-[0.25em]">Steady cadence</p>
            </motion.div>
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-6 w-16 h-16 rounded-full border border-emerald-200/50 flex items-center justify-center"
              animate={{ scale: isRunning ? [1, 1.08, 1] : 1, opacity: isRunning ? [0.6, 0.4, 0.6] : 0.5 }}
              transition={{ duration: 2.2, repeat: isRunning ? Infinity : 0 }}
            >
              <motion.span
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-lilac-400"
                animate={{ scale: isRunning ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1.4, repeat: isRunning ? Infinity : 0, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>

          <div className="rounded-2xl border border-emerald-100/60 bg-white/75 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-ink-500">
              Completed rounds today: <span className="font-semibold text-ink-700">{completedRounds}</span>
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleToggle}
                className={`flex-1 sm:flex-none sm:min-w-[160px] py-3 rounded-xl font-semibold transition-all ${isRunning ? 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50' : 'bg-gradient-to-r from-emerald-500 to-lilac-500 text-white shadow-lg'}`}
              >
                {isRunning ? 'Pause Session' : 'Begin Session'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl text-sm text-ink-400 hover:text-ink-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 flex flex-col gap-5">
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

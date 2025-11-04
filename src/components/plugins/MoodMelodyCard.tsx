import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

const MOOD_PRESETS: Record<string, {
  title: string
  description: string
  frequencies: number[]
}> = {
  calm: {
    title: 'Calm Current',
    description: 'Gentle harmonics tuned to encourage soft focus and steady breathing.',
    frequencies: [174, 396]
  },
  motivated: {
    title: 'Momentum Drive',
    description: 'Layered pulses in the beta range to elevate forward motion.',
    frequencies: [432, 528]
  },
  empathetic: {
    title: 'Heart Bloom',
    description: 'Warm pads with slight vibrato to keep your nervous system open and receptive.',
    frequencies: [288, 639]
  },
  rest: {
    title: 'Night Tide',
    description: 'Low-frequency waves with slow attack to ease you toward recovery.',
    frequencies: [111, 222]
  }
}

const PLAYLISTS: Record<string, Array<{ title: string; artist: string; url: string }>> = {
  calm: [
    { title: 'Soft Focus', artist: 'Liminal Drift', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
    { title: 'Gentle Breathing', artist: 'Aeria', url: 'https://open.spotify.com/track/1bKvFGk3jfbQ3VIAtF5pPz' },
    { title: 'Slow Horizons', artist: 'Evening Tape', url: 'https://open.spotify.com/track/0S4dDuO8N58dS9J33qG1Ui' }
  ],
  motivated: [
    { title: 'Forward Motion', artist: 'Pulse District', url: 'https://open.spotify.com/playlist/37i9dQZF1DX1g0iEXLFycr' },
    { title: 'Momentum Sparks', artist: 'JETTA', url: 'https://open.spotify.com/track/26FF50s9QWGWpZJYG1ultk' },
    { title: 'Uplift Switch', artist: 'Shallows', url: 'https://open.spotify.com/track/793oXhN3kLBXjg5eQqr8RP' }
  ],
  empathetic: [
    { title: 'Heart Lines', artist: 'Iris Nova', url: 'https://open.spotify.com/playlist/37i9dQZF1DWUu64Xz8AIAL' },
    { title: 'Open Hands', artist: 'Soham', url: 'https://open.spotify.com/track/5CxfQ0bBuGJPD7W82dMan3' },
    { title: 'Kindred', artist: 'Evena', url: 'https://open.spotify.com/track/0yF7kRXKuX3sI5Gucs5cjT' }
  ],
  rest: [
    { title: 'Night Drift', artist: 'Emerald Waves', url: 'https://open.spotify.com/playlist/37i9dQZF1DX2pqFscFD0Pw' },
    { title: 'Moonlit Lines', artist: 'Lux Prima', url: 'https://open.spotify.com/track/7zQET3JacrP6MqxsVXni4e' },
    { title: 'Deep Tide', artist: 'Oceanora', url: 'https://open.spotify.com/track/5lvXioOsDq3PcTJS3BM4ti' }
  ]
}

interface MoodMelodyCardProps {
  onNavigateToSensory?: () => void
  highlighted?: boolean
}

export const MoodMelodyCard = ({ onNavigateToSensory, highlighted = false }: MoodMelodyCardProps) => {
  const { mood } = useAppStore()
  const dominant = mood.dominantEmotion ?? 'calm'
  const preset = useMemo(() => MOOD_PRESETS[dominant] ?? MOOD_PRESETS.calm, [dominant])
  const playlist = useMemo(() => PLAYLISTS[dominant] ?? PLAYLISTS.calm, [dominant])

  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const timeoutRef = useRef<number | null>(null)

  const openInNewTab = (url: string) => {
    if (typeof window === 'undefined') return
    window.open(url, '_blank', 'noopener')
  }

  const stopAudio = () => {
    oscillatorsRef.current.forEach(o => {
      try {
        o.stop()
      } catch {
        // oscillator may already be stopped
      }
    })
    oscillatorsRef.current = []
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime ?? 0, 0.25)
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (audioCtxRef.current) {
      // closing releases hardware resources
      audioCtxRef.current.close().catch(() => undefined)
      audioCtxRef.current = null
    }
    gainNodeRef.current = null
  }

  const startAudio = async () => {
    if (isPlaying) return

    const AudioConstructor = typeof window !== 'undefined'
      ? (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      : undefined

    if (!AudioConstructor) {
      console.warn('[MoodMelody] Web Audio API is not supported in this browser.')
      return
    }

    const ctx = new AudioConstructor()
    audioCtxRef.current = ctx

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0
    masterGain.connect(ctx.destination)
    gainNodeRef.current = masterGain

    const oscillators = preset.frequencies.map((freq, index) => {
      const osc = ctx.createOscillator()
      osc.type = index % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq

      const oscGain = ctx.createGain()
      oscGain.gain.value = 0.2 / preset.frequencies.length

      // Subtle modulation for texture
      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.12 + index * 0.05
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 5
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()

      osc.connect(oscGain)
      oscGain.connect(masterGain)
      osc.start()
      oscillatorsRef.current.push(osc)
      return osc
    })

    // Slow attack for smooth fade in
    masterGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 2)

    setIsPlaying(true)

    // Auto-stop after 15 minutes to avoid runaway session
    timeoutRef.current = window.setTimeout(() => {
      setIsPlaying(false)
      stopAudio()
    }, 15 * 60 * 1000)

    return oscillators
  }

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const handleToggle = async () => {
    if (isPlaying) {
      setIsPlaying(false)
      stopAudio()
      return
    }
    try {
      await startAudio()
    } catch (error) {
      console.error('[MoodMelody] Failed to start audio', error)
      setIsPlaying(false)
      stopAudio()
    }
  }

  return (
    <motion.div
      className={`bg-white/50 backdrop-blur-md rounded-2xl border border-lilac-200/40 p-6 flex flex-col justify-between min-h-[220px] ${highlighted ? 'ring-2 ring-lilac-400/70 shadow-xl animate-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-lilac-600 uppercase">Mood Melody</p>
          <h3 className="text-xl font-medium text-ink-900">{preset.title}</h3>
        </div>
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPlaying ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white' : 'bg-lilac-100 text-lilac-600'}`}
          animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </motion.div>
      </div>

      <p className="text-sm text-ink-600 leading-relaxed mb-6">{preset.description}</p>

      <div className="mb-6 rounded-xl border border-lilac-200/30 bg-white/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-lilac-500">Recommended blend</span>
          <button
            onClick={() => {
              const playlistUrl = playlist[0]?.url
              if (playlistUrl) {
                openInNewTab(playlistUrl)
              }
            }}
            className="text-xs text-lilac-600 hover:text-lilac-700 font-medium"
          >
            Open in Spotify →
          </button>
        </div>
        <ul className="space-y-2">
          {playlist.map((track, index) => (
            <li
              key={track.title}
              className="flex items-center justify-between text-sm text-ink-600"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-lilac-500">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-ink-700 font-medium">{track.title}</p>
                  <p className="text-xs text-ink-400">{track.artist}</p>
                </div>
              </div>
              <button
                onClick={() => openInNewTab(track.url)}
                className="text-xs text-lilac-600 hover:text-lilac-700"
              >
                Play ↗
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleToggle}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${isPlaying ? 'bg-gradient-to-r from-ink-600 to-lilac-500 text-white shadow-lg' : 'bg-white text-ink-700 border border-lilac-200 hover:bg-lilac-50'}`}
        >
          {isPlaying ? 'Stop Session' : 'Play Adaptive Sound'}
        </button>
        <button
          onClick={onNavigateToSensory}
          className="px-4 py-3 rounded-xl text-sm text-lilac-600 hover:text-lilac-700 font-medium"
        >
          Open Studio →
        </button>
      </div>
    </motion.div>
  )
}

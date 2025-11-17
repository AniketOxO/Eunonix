import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useNeuroAdaptive } from '@/hooks/useNeuroAdaptive'

interface SensoryProfile {
  id: string
  name: string
  emotion: string
  ambientLight: {
    color: string
    brightness: number
    pattern: 'steady' | 'pulse' | 'wave' | 'breathe'
  }
  soundscape: {
    type: 'nature' | 'ambient' | 'binaural' | 'white-noise' | 'music'
    volume: number
  }
  haptics: {
    enabled: boolean
    pattern: 'calm' | 'energize' | 'ground' | 'focus'
    intensity: number
  }
  visualEnvironment: {
    theme: 'forest' | 'ocean' | 'cosmos' | 'desert' | 'aurora' | 'abstract'
    depth: '2D' | '3D' | 'VR'
  }
}

const PRESET_PROFILES: SensoryProfile[] = [
  {
    id: 'calm-sanctuary',
    name: 'Calm Sanctuary',
    emotion: 'calm',
    ambientLight: { color: '#4A90E2', brightness: 40, pattern: 'breathe' },
    soundscape: { type: 'nature', volume: 30 },
    haptics: { enabled: true, pattern: 'calm', intensity: 20 },
    visualEnvironment: { theme: 'ocean', depth: '3D' }
  },
  {
    id: 'focused-flow',
    name: 'Focused Flow',
    emotion: 'focused',
    ambientLight: { color: '#8B7FD8', brightness: 60, pattern: 'steady' },
    soundscape: { type: 'binaural', volume: 40 },
    haptics: { enabled: true, pattern: 'focus', intensity: 30 },
    visualEnvironment: { theme: 'cosmos', depth: '3D' }
  },
  {
    id: 'energized-boost',
    name: 'Energized Boost',
    emotion: 'excited',
    ambientLight: { color: '#FF6B6B', brightness: 80, pattern: 'pulse' },
    soundscape: { type: 'music', volume: 60 },
    haptics: { enabled: true, pattern: 'energize', intensity: 70 },
    visualEnvironment: { theme: 'aurora', depth: '3D' }
  },
  {
    id: 'grounded-earth',
    name: 'Grounded Earth',
    emotion: 'anxious',
    ambientLight: { color: '#8B6F47', brightness: 50, pattern: 'wave' },
    soundscape: { type: 'nature', volume: 35 },
    haptics: { enabled: true, pattern: 'ground', intensity: 50 },
    visualEnvironment: { theme: 'forest', depth: '3D' }
  },
  {
    id: 'creative-surge',
    name: 'Creative Surge',
    emotion: 'motivated',
    ambientLight: { color: '#E94B3C', brightness: 70, pattern: 'wave' },
    soundscape: { type: 'ambient', volume: 45 },
    haptics: { enabled: false, pattern: 'calm', intensity: 0 },
    visualEnvironment: { theme: 'abstract', depth: '3D' }
  }
]

const SensoryExpansion = () => {
  const navigate = useNavigate()
  const { emotionalState, adaptiveTheme } = useNeuroAdaptive()
  const [activeProfile, setActiveProfile] = useState<SensoryProfile | null>(null)
  const [isImmersive, setIsImmersive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  const [deviceSupport, setDeviceSupport] = useState({
    ambientLight: false,
    haptics: false,
    vr: false,
    audio: true
  })

  const [customSettings, setCustomSettings] = useState({
    brightness: 60,
    volume: 40,
    hapticIntensity: 50,
    selectedColor: '#8B7FD8'
  })

  useEffect(() => {
    // Check device capabilities
    setDeviceSupport({
      ambientLight: 'bluetooth' in navigator || 'usb' in navigator,
      haptics: 'vibrate' in navigator,
      vr: 'xr' in navigator,
      audio: true
    })

    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    return () => {
      stopAudio()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
      } catch (e) {
        // Already stopped
      }
      oscillatorRef.current = null
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const playAudio = useCallback((type: string, volume: number) => {
    if (!audioContextRef.current) return

    // Stop any existing audio
    stopAudio()

    const audioContext = audioContextRef.current
    
    // Resume context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const gainNode = audioContext.createGain()
    gainNode.gain.value = volume / 100

    if (type === 'binaural') {
      // Binaural beats for focus
      const leftOsc = audioContext.createOscillator()
      const rightOsc = audioContext.createOscillator()
      const merger = audioContext.createChannelMerger(2)

      leftOsc.frequency.value = 200
      rightOsc.frequency.value = 210 // 10Hz theta wave

      leftOsc.connect(merger, 0, 0)
      rightOsc.connect(merger, 0, 1)
      merger.connect(gainNode)
      gainNode.connect(audioContext.destination)

      leftOsc.start()
      rightOsc.start()

      oscillatorRef.current = leftOsc
    } else if (type === 'nature' || type === 'ambient') {
      // Create realistic nature sounds: birds chirping, water flowing, wind rustling
      const bufferSize = 8192
      
      // Generate bird chirping sounds using frequency modulation
      const birdOsc1 = audioContext.createOscillator()
      const birdOsc2 = audioContext.createOscillator()
      const birdGain = audioContext.createGain()
      const birdLFO = audioContext.createOscillator()
      const birdLFOGain = audioContext.createGain()
      
      birdOsc1.type = 'sine'
      birdOsc2.type = 'sine'
      birdOsc1.frequency.value = 2000 // Bird chirp frequency
      birdOsc2.frequency.value = 2400
      
      birdLFO.type = 'sine'
      birdLFO.frequency.value = 3 // Chirp rhythm
      birdLFOGain.gain.value = 200
      
      birdLFO.connect(birdLFOGain)
      birdLFOGain.connect(birdOsc1.frequency)
      
      birdOsc1.connect(birdGain)
      birdOsc2.connect(birdGain)
      birdGain.gain.value = 0.05 // Subtle bird sounds
      
      // Create water flowing sound using filtered noise
      const waterNoise = audioContext.createScriptProcessor(bufferSize, 1, 1)
      const waterFilter = audioContext.createBiquadFilter()
      waterFilter.type = 'lowpass'
      waterFilter.frequency.value = 1200 // Water frequency range
      waterFilter.Q.value = 1
      
      waterNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.3 // Moderate water sound
        }
      }
      
      // Create wind rustling using very low frequency noise
      const windNoise = audioContext.createScriptProcessor(bufferSize, 1, 1)
      const windFilter = audioContext.createBiquadFilter()
      windFilter.type = 'bandpass'
      windFilter.frequency.value = 400 // Wind frequency
      windFilter.Q.value = 0.5
      
      const windLFO = audioContext.createOscillator()
      const windLFOGain = audioContext.createGain()
      windLFO.type = 'sine'
      windLFO.frequency.value = 0.3 // Slow wind gusts
      windLFOGain.gain.value = 200
      
      windLFO.connect(windLFOGain)
      windLFOGain.connect(windFilter.frequency)
      
      windNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.2 // Gentle wind
        }
      }
      
      // Mix all nature sounds together
      waterNoise.connect(waterFilter)
      waterFilter.connect(gainNode)
      
      windNoise.connect(windFilter)
      windFilter.connect(gainNode)
      
      birdGain.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Start all oscillators
      birdOsc1.start()
      birdOsc2.start()
      birdLFO.start()
      windLFO.start()

      oscillatorRef.current = waterNoise as any
    } else if (type === 'white-noise') {
      // White noise
      const bufferSize = 4096
      const whiteNoise = audioContext.createScriptProcessor(bufferSize, 1, 1)

      whiteNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }
      }

      whiteNoise.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillatorRef.current = whiteNoise as any
    } else {
      // Calming harmonic music with 432 Hz base (healing frequency)
      const osc1 = audioContext.createOscillator()
      const osc2 = audioContext.createOscillator()
      const osc3 = audioContext.createOscillator()
      
      const gain1 = audioContext.createGain()
      const gain2 = audioContext.createGain()
      const gain3 = audioContext.createGain()
      
      // 432 Hz and its harmonics for deep relaxation
      osc1.type = 'sine'
      osc1.frequency.value = 432 // Base healing frequency
      gain1.gain.value = 0.3
      
      osc2.type = 'sine'
      osc2.frequency.value = 432 * 1.5 // Perfect fifth (648 Hz)
      gain2.gain.value = 0.15
      
      osc3.type = 'sine'
      osc3.frequency.value = 432 * 2 // Octave (864 Hz)
      gain3.gain.value = 0.1
      
      // Add subtle vibrato for organic feel
      const vibrato = audioContext.createOscillator()
      const vibratoGain = audioContext.createGain()
      vibrato.frequency.value = 5 // 5 Hz vibrato
      vibratoGain.gain.value = 3 // Subtle pitch variation
      
      vibrato.connect(vibratoGain)
      vibratoGain.connect(osc1.frequency)
      
      osc1.connect(gain1)
      osc2.connect(gain2)
      osc3.connect(gain3)
      
      gain1.connect(gainNode)
      gain2.connect(gainNode)
      gain3.connect(gainNode)
      
      gainNode.connect(audioContext.destination)
      
      osc1.start()
      osc2.start()
      osc3.start()
      vibrato.start()

      oscillatorRef.current = osc1
    }

    gainNodeRef.current = gainNode
    setIsPlaying(true)
  }, [stopAudio])

  const triggerHaptic = useCallback((pattern: 'calm' | 'energize' | 'ground' | 'focus', intensity: number) => {
    if (!deviceSupport.haptics || !navigator.vibrate) return

    const patterns = {
      calm: [100, 50, 100, 50, 100],
      energize: [50, 30, 50, 30, 50, 30, 50],
      ground: [200, 100, 200, 100, 200],
      focus: [150, 75, 150, 75, 150, 75]
    }

    const scaledPattern = patterns[pattern].map(ms => Math.round(ms * (intensity / 100)))
    navigator.vibrate(scaledPattern)
  }, [deviceSupport.haptics])

  const render3DEnvironment = useCallback((theme: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    let time = 0

    const animate = () => {
      time += 0.01

      if (theme === 'ocean') {
        // Ocean waves
        ctx.clearRect(0, 0, width, height)
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, '#0077be')
        gradient.addColorStop(1, '#003d5c')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        // Draw waves
        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.moveTo(0, height / 2)
          
          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin((x + time * 50 + i * 100) * 0.01) * (30 - i * 5)
            ctx.lineTo(x, y)
          }
          
          ctx.lineTo(width, height)
          ctx.lineTo(0, height)
          ctx.closePath()
          
          ctx.fillStyle = `rgba(255, 255, 255, ${0.1 - i * 0.015})`
          ctx.fill()
        }
      } else if (theme === 'cosmos') {
        // Starfield
        ctx.fillStyle = '#000814'
        ctx.fillRect(0, 0, width, height)

        // Stars
        for (let i = 0; i < 200; i++) {
          const x = (i * 137.508) % width
          const y = (i * 97.123 + time * 10) % height
          const size = (Math.sin(time + i) + 1) * 1.5
          
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        // Nebula
        const nebula = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 300)
        nebula.addColorStop(0, 'rgba(138, 127, 216, 0.3)')
        nebula.addColorStop(0.5, 'rgba(184, 134, 211, 0.1)')
        nebula.addColorStop(1, 'rgba(138, 127, 216, 0)')
        ctx.fillStyle = nebula
        ctx.fillRect(0, 0, width, height)
      } else if (theme === 'forest') {
        // Forest scene
        const forestGradient = ctx.createLinearGradient(0, 0, 0, height)
        forestGradient.addColorStop(0, '#1a472a')
        forestGradient.addColorStop(1, '#0d2818')
        ctx.fillStyle = forestGradient
        ctx.fillRect(0, 0, width, height)

        // Trees
        for (let i = 0; i < 15; i++) {
          const x = (i * width) / 15
          const treeHeight = 100 + Math.sin(time + i) * 20
          
          ctx.fillStyle = `rgba(34, 139, 34, ${0.3 + Math.random() * 0.3})`
          ctx.beginPath()
          ctx.moveTo(x, height)
          ctx.lineTo(x - 20, height - treeHeight)
          ctx.lineTo(x + 20, height - treeHeight)
          ctx.closePath()
          ctx.fill()
        }

        // Fireflies
        for (let i = 0; i < 30; i++) {
          const x = (Math.sin(time + i * 0.5) * 0.5 + 0.5) * width
          const y = (Math.cos(time * 0.7 + i * 0.3) * 0.5 + 0.5) * height
          const alpha = Math.sin(time * 3 + i) * 0.5 + 0.5
          
          ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (theme === 'aurora') {
        // Aurora borealis
        const skyGradient = ctx.createLinearGradient(0, 0, 0, height)
        skyGradient.addColorStop(0, '#001a33')
        skyGradient.addColorStop(1, '#003d5c')
        ctx.fillStyle = skyGradient
        ctx.fillRect(0, 0, width, height)

        // Aurora waves
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(0, height / 3)
          
          for (let x = 0; x < width; x++) {
            const y = height / 3 + Math.sin((x + time * 100 + i * 150) * 0.005) * 100
            ctx.lineTo(x, y)
          }
          
          ctx.lineTo(width, height)
          ctx.lineTo(0, height)
          ctx.closePath()
          
          const colors = ['rgba(0, 255, 127, 0.3)', 'rgba(138, 43, 226, 0.3)', 'rgba(255, 20, 147, 0.3)']
          ctx.fillStyle = colors[i]
          ctx.fill()
        }
      } else if (theme === 'desert') {
        // Desert dunes
        const desertGradient = ctx.createLinearGradient(0, 0, 0, height)
        desertGradient.addColorStop(0, '#ff9966')
        desertGradient.addColorStop(1, '#d4a574')
        ctx.fillStyle = desertGradient
        ctx.fillRect(0, 0, width, height)

        // Dunes
        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.moveTo(0, height - i * 50)
          
          for (let x = 0; x < width; x++) {
            const y = height - i * 50 - Math.sin((x + time * 20 + i * 100) * 0.01) * 30
            ctx.lineTo(x, y)
          }
          
          ctx.lineTo(width, height)
          ctx.lineTo(0, height)
          ctx.closePath()
          
          ctx.fillStyle = `rgba(212, 165, 116, ${0.5 + i * 0.1})`
          ctx.fill()
        }

        // Sun
        const sunGradient = ctx.createRadialGradient(width * 0.8, height * 0.2, 20, width * 0.8, height * 0.2, 60)
        sunGradient.addColorStop(0, 'rgba(255, 200, 0, 1)')
        sunGradient.addColorStop(1, 'rgba(255, 200, 0, 0)')
        ctx.fillStyle = sunGradient
        ctx.fillRect(0, 0, width, height)
      } else if (theme === 'abstract') {
        // Abstract particles
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, width, height)

        for (let i = 0; i < 50; i++) {
          const x = (Math.sin(time + i) * 0.5 + 0.5) * width
          const y = (Math.cos(time * 0.7 + i * 0.5) * 0.5 + 0.5) * height
          const size = Math.sin(time * 2 + i) * 10 + 15
          
          const hue = (time * 50 + i * 7) % 360
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.6)`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()
  }, [])

  const activateProfile = useCallback((profile: SensoryProfile) => {
    setActiveProfile(profile)
    
    // Update custom settings
    setCustomSettings({
      brightness: profile.ambientLight.brightness,
      volume: profile.soundscape.volume,
      hapticIntensity: profile.haptics.intensity,
      selectedColor: profile.ambientLight.color
    })
    
    // Trigger haptic feedback
    if (deviceSupport.haptics && profile.haptics.enabled) {
      triggerHaptic(profile.haptics.pattern, profile.haptics.intensity)
    }

    // Don't auto-start audio - let user control it
    // User can click Play button to start audio

    // Start 3D environment if canvas exists
    if (canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      render3DEnvironment(profile.visualEnvironment.theme, canvasRef.current)
    }
  }, [deviceSupport.haptics, triggerHaptic, render3DEnvironment])

  useEffect(() => {
    // Auto-select profile based on emotional state
    if (!activeProfile && emotionalState) {
      const matchingProfile = PRESET_PROFILES.find(
        p => p.emotion === emotionalState
      )
      if (matchingProfile) {
        activateProfile(matchingProfile)
      }
    }
  }, [emotionalState, activeProfile, activateProfile])

  const enterImmersiveMode = () => {
    setIsImmersive(true)
    document.documentElement.requestFullscreen?.()
  }

  const exitImmersiveMode = useCallback(() => {
    setIsImmersive(false)
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  }, [])

  // ESC key to exit immersive mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImmersive) {
        exitImmersiveMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isImmersive, exitImmersiveMode])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-lilac-50">
      {/* Header */}
      <header className="border-b border-ink-200/20 bg-white/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="cursor-pointer flex items-center gap-3"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.02 }}
            >
              <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              <h1 className="text-2xl font-semibold text-ink-800">Sensory Expansion</h1>
            </motion.div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-5xl font-light text-ink-900 mb-4">
            5D <span className="text-gradient font-medium">Experience Layer</span>
          </h1>
          <p className="text-xl text-ink-600 max-w-2xl mx-auto mb-6">
            Where emotion meets sensory tech. Transform your feelings into a living, breathing landscape.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-ink-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Sound</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Color</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Light</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Touch</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>3D Space</span>
            </div>
          </div>
        </motion.div>

        {/* Current Emotional State */}
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-3xl border border-ink-200/30 p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-ink-900 mb-2">Your Current State</h2>
              <p className="text-ink-600">Detected from your interactions and biometrics</p>
            </div>
            <motion.div
              className="px-6 py-3 rounded-2xl"
              style={{ backgroundColor: adaptiveTheme.accentColor.replace('text-', '#') + '20' }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-lg font-medium capitalize" style={{ color: adaptiveTheme.accentColor.replace('text-', '#') }}>
                {emotionalState}
              </span>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <div className="text-sm text-ink-600 mb-1">Soundscape</div>
              <div className="text-lg font-semibold text-ink-900">Adaptive</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="text-sm text-ink-600 mb-1">Ambient Light</div>
              <div className="text-lg font-semibold text-ink-900">
                {deviceSupport.ambientLight ? 'Connected' : 'Not Available'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="text-sm text-ink-600 mb-1">Haptics</div>
              <div className="text-lg font-semibold text-ink-900">
                {deviceSupport.haptics ? 'Ready' : 'Not Supported'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div className="text-sm text-ink-600 mb-1">3D Environment</div>
              <div className="text-lg font-semibold text-ink-900">Active</div>
            </div>
          </div>
        </motion.div>

        {/* Preset Profiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-ink-900 mb-6">Sensory Profiles</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_PROFILES.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`relative bg-white/60 backdrop-blur-sm rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  activeProfile?.id === profile.id
                    ? 'border-lilac-500 shadow-lg'
                    : 'border-ink-200/30 hover:border-ink-300 hover:shadow-md'
                }`}
                onClick={() => activateProfile(profile)}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeProfile?.id === profile.id && (
                  <motion.div
                    className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-lilac-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: profile.ambientLight.color + '30' }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: profile.ambientLight.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-900">{profile.name}</h3>
                    <p className="text-sm text-ink-600 capitalize">{profile.emotion}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-600">Light</span>
                    <span className="font-medium text-ink-800 capitalize">{profile.ambientLight.pattern}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-600">Sound</span>
                    <span className="font-medium text-ink-800 capitalize">{profile.soundscape.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-600">Environment</span>
                    <span className="font-medium text-ink-800 capitalize">{profile.visualEnvironment.theme}</span>
                  </div>
                  {profile.haptics.enabled && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Haptic Feedback</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Profile Controls */}
        <AnimatePresence>
          {activeProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-lilac-50 to-purple-50 rounded-3xl border border-lilac-200/50 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-semibold text-ink-900 mb-2">
                    {activeProfile.name} Active
                  </h2>
                  <p className="text-ink-600">Adjust your sensory experience in real-time</p>
                </div>
                <Button onClick={enterImmersiveMode} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Enter Immersive Mode
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Ambient Light Control */}
                <div className="bg-white/60 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400/20 to-blue-400/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-ink-900">Ambient Light</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-ink-600">Brightness</label>
                        <span className="text-sm font-medium text-ink-800">{customSettings.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customSettings.brightness}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-ink-600 mb-2 block">Color</label>
                      <div className="flex gap-2">
                        {['#4A90E2', '#8B7FD8', '#FF6B6B', '#8B6F47', '#E94B3C'].map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setCustomSettings(prev => ({ ...prev, selectedColor: color }))
                              if (activeProfile) {
                                setActiveProfile({
                                  ...activeProfile,
                                  ambientLight: { ...activeProfile.ambientLight, color }
                                })
                              }
                            }}
                            className={`w-10 h-10 rounded-lg border-2 shadow-sm transition-all ${
                              customSettings.selectedColor === color ? 'border-ink-800 scale-110' : 'border-white'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Soundscape Control */}
                <div className="bg-white/60 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-ink-900">Soundscape</h3>
                    </div>
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          stopAudio()
                        } else if (activeProfile) {
                          playAudio(activeProfile.soundscape.type, customSettings.volume)
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        isPlaying 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isPlaying ? 'Stop' : 'Play'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-ink-600">Volume</label>
                        <span className="text-sm font-medium text-ink-800">{customSettings.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customSettings.volume}
                        onChange={(e) => {
                          const newVolume = parseInt(e.target.value)
                          setCustomSettings(prev => ({ ...prev, volume: newVolume }))
                          if (gainNodeRef.current && isPlaying) {
                            gainNodeRef.current.gain.value = newVolume / 100
                          }
                        }}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-ink-600 mb-2 block">Type</label>
                      <select 
                        className="w-full px-3 py-2 rounded-lg border border-ink-200/30 bg-white text-ink-800"
                        value={activeProfile?.soundscape.type}
                        onChange={(e) => {
                          if (activeProfile) {
                            const newType = e.target.value as any
                            setActiveProfile({
                              ...activeProfile,
                              soundscape: { ...activeProfile.soundscape, type: newType }
                            })
                            if (isPlaying) {
                              stopAudio()
                              playAudio(newType, customSettings.volume)
                            }
                          }
                        }}
                      >
                        <option value="nature">Nature Sounds</option>
                        <option value="ambient">Ambient Music</option>
                        <option value="binaural">Binaural Beats</option>
                        <option value="white-noise">White Noise</option>
                        <option value="music">Calming Music</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Haptic Feedback */}
                <div className="bg-white/60 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-400/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-ink-900">Haptic Feedback</h3>
                  </div>
                  {deviceSupport.haptics ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-ink-600">Intensity</label>
                          <span className="text-sm font-medium text-ink-800">{customSettings.hapticIntensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={customSettings.hapticIntensity}
                          onChange={(e) => setCustomSettings(prev => ({ ...prev, hapticIntensity: parseInt(e.target.value) }))}
                          className="w-full accent-orange-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => triggerHaptic('calm', customSettings.hapticIntensity)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Calm
                        </button>
                        <button 
                          onClick={() => triggerHaptic('energize', customSettings.hapticIntensity)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Energize
                        </button>
                        <button 
                          onClick={() => triggerHaptic('ground', customSettings.hapticIntensity)}
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          Ground
                        </button>
                        <button 
                          onClick={() => triggerHaptic('focus', customSettings.hapticIntensity)}
                          className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          Focus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500">Haptic feedback not supported on this device</p>
                  )}
                </div>

                {/* 3D Environment */}
                <div className="bg-white/60 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-ink-900">3D Environment</h3>
                  </div>
                  <div className="space-y-3">
                    {['Forest', 'Ocean', 'Cosmos', 'Desert', 'Aurora', 'Abstract'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => {
                          if (activeProfile) {
                            const newProfile = {
                              ...activeProfile,
                              visualEnvironment: { ...activeProfile.visualEnvironment, theme: theme.toLowerCase() as any }
                            }
                            setActiveProfile(newProfile)
                            if (canvasRef.current) {
                              if (animationFrameRef.current) {
                                cancelAnimationFrame(animationFrameRef.current)
                              }
                              render3DEnvironment(theme.toLowerCase(), canvasRef.current)
                            }
                          }
                        }}
                        className={`w-full px-4 py-2 rounded-lg text-left transition-all font-medium ${
                          activeProfile.visualEnvironment.theme.toLowerCase() === theme.toLowerCase()
                            ? 'bg-green-100 text-green-700 shadow-md'
                            : 'bg-white text-ink-700 hover:bg-green-50'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3D Environment Preview */}
              <div className="mt-6 bg-white/60 rounded-2xl p-6">
                <h3 className="font-semibold text-ink-900 mb-4">Environment Preview</h3>
                <div className="relative w-full aspect-video bg-ink-900 rounded-xl overflow-hidden">
                  <canvas
                    ref={(el) => {
                      canvasRef.current = el
                      if (el && activeProfile) {
                        el.width = el.offsetWidth
                        el.height = el.offsetHeight
                        render3DEnvironment(activeProfile.visualEnvironment.theme, el)
                      }
                    }}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-sm text-ink-600 mt-3 text-center">
                  Live 3D visualization of your current environment
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Immersive Mode */}
        <AnimatePresence>
          {isImmersive && activeProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black"
            >
              {/* Full-screen 3D Canvas */}
              <canvas
                ref={(el) => {
                  if (el && activeProfile) {
                    el.width = window.innerWidth
                    el.height = window.innerHeight
                    if (animationFrameRef.current) {
                      cancelAnimationFrame(animationFrameRef.current)
                    }
                    render3DEnvironment(activeProfile.visualEnvironment.theme, el)
                  }
                }}
                className="absolute inset-0 w-full h-full"
              />

              {/* Overlay Controls */}
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Exit Button */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={exitImmersiveMode}
                  className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* Audio Toggle */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    if (isPlaying) {
                      stopAudio()
                    } else {
                      playAudio(activeProfile.soundscape.type, customSettings.volume)
                    }
                  }}
                  className="absolute top-8 left-8 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
                >
                  {isPlaying ? (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  )}
                </motion.button>

                {/* Center Content */}
                <motion.div
                  className="text-center text-white z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="w-32 h-32 mx-auto mb-8 rounded-full backdrop-blur-md"
                    style={{ 
                      background: `radial-gradient(circle, ${activeProfile.ambientLight.color}80, transparent)`,
                      boxShadow: `0 0 100px ${activeProfile.ambientLight.color}`,
                      border: `2px solid ${activeProfile.ambientLight.color}40`
                    }}
                    animate={{
                      scale: activeProfile.ambientLight.pattern === 'pulse' 
                        ? [1, 1.2, 1] 
                        : activeProfile.ambientLight.pattern === 'breathe'
                        ? [1, 1.15, 1]
                        : activeProfile.ambientLight.pattern === 'wave'
                        ? [1, 1.1, 1.05, 1]
                        : [1],
                      opacity: activeProfile.ambientLight.pattern === 'wave'
                        ? [0.6, 1, 0.8, 0.6]
                        : [1]
                    }}
                    transition={{
                      duration: activeProfile.ambientLight.pattern === 'pulse' ? 1.5 : 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <h1 className="text-5xl font-light mb-4 drop-shadow-lg">{activeProfile.name}</h1>
                  <p className="text-2xl opacity-80 capitalize mb-8 drop-shadow-md">{activeProfile.emotion} State</p>
                  
                  <motion.div 
                    className="flex items-center justify-center gap-8 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="text-center">
                      <div className="text-sm opacity-60 mb-1">Environment</div>
                      <div className="text-lg font-medium capitalize">{activeProfile.visualEnvironment.theme}</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-sm opacity-60 mb-1">Sound</div>
                      <div className="text-lg font-medium capitalize">{activeProfile.soundscape.type.replace('-', ' ')}</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-sm opacity-60 mb-1">Light</div>
                      <div className="text-lg font-medium capitalize">{activeProfile.ambientLight.pattern}</div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="text-sm opacity-60"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <p>Breathe. Feel. Experience.</p>
                  </motion.div>
                </motion.div>

                {/* Bottom Instructions */}
                <motion.div
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Press ESC or click × to exit
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 mb-8"
        >
          <h2 className="text-2xl font-semibold text-ink-900 mb-6">Advanced Visualization Modes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Emotion Layers */}
            <motion.button
              className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6 text-left group hover:border-lilac-400 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => {
                if (activeProfile) {
                  // Cycle through different light colors to show emotion layers
                  const colors = ['#4A90E2', '#8B7FD8', '#FF6B6B', '#8B6F47']
                  const currentIndex = colors.indexOf(customSettings.selectedColor)
                  const nextColor = colors[(currentIndex + 1) % colors.length]
                  setCustomSettings(prev => ({ ...prev, selectedColor: nextColor }))
                  setActiveProfile({
                    ...activeProfile,
                    ambientLight: { ...activeProfile.ambientLight, color: nextColor }
                  })
                }
                // Trigger haptic
                if (deviceSupport.haptics) {
                  navigator.vibrate([30, 20, 30])
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <motion.div 
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Interactive
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-ink-900 mb-2 uppercase tracking-wide text-sm text-ink-500">EMOTION LAYERS</h3>
              <p className="text-sm text-ink-600">Soft gradients reveal the interplay of calm, curiosity, and drive.</p>
              <div className="mt-4 pt-4 border-t border-ink-200/20">
                <div className="flex items-center text-sm text-purple-600 font-medium">
                  <span>Click to cycle through emotions</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>

            {/* Synapse Trails */}
            <motion.button
              className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6 text-left group hover:border-blue-400 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => {
                // Change visualization theme to show neural-like patterns
                if (activeProfile) {
                  const themes: Array<'cosmos' | 'abstract'> = ['cosmos', 'abstract']
                  const currentTheme = activeProfile.visualEnvironment.theme
                  const nextTheme = themes.includes(currentTheme as any) 
                    ? (themes[0] === currentTheme ? themes[1] : themes[0])
                    : 'cosmos'
                  
                  const newProfile = {
                    ...activeProfile,
                    visualEnvironment: { ...activeProfile.visualEnvironment, theme: nextTheme }
                  }
                  setActiveProfile(newProfile)
                  if (canvasRef.current && animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                    render3DEnvironment(nextTheme, canvasRef.current)
                  }
                }
                // Trigger haptic
                if (deviceSupport.haptics) {
                  navigator.vibrate([50, 30, 50, 30, 50])
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <motion.div 
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  Interactive
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-ink-900 mb-2 uppercase tracking-wide text-sm text-ink-500">SYNAPSE TRAILS</h3>
              <p className="text-sm text-ink-600">Animated neural paths highlight your most active mental loops.</p>
              <div className="mt-4 pt-4 border-t border-ink-200/20">
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  <span>Click to toggle neural visualization</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>

            {/* Coherence Score */}
            <motion.button
              className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6 text-left group hover:border-green-400 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => {
                // Change light pattern to show coherence
                if (activeProfile) {
                  const patterns: Array<'steady' | 'pulse' | 'wave' | 'breathe'> = ['steady', 'pulse', 'wave', 'breathe']
                  const currentPattern = activeProfile.ambientLight.pattern
                  const currentIndex = patterns.indexOf(currentPattern)
                  const nextPattern = patterns[(currentIndex + 1) % patterns.length]
                  
                  setActiveProfile({
                    ...activeProfile,
                    ambientLight: { ...activeProfile.ambientLight, pattern: nextPattern }
                  })
                }
                // Trigger rhythmic haptic for coherence
                if (deviceSupport.haptics) {
                  navigator.vibrate([100, 50, 100, 50, 100])
                }
                // Play calming sound briefly
                if (!isPlaying) {
                  playAudio('ambient', 30)
                  setTimeout(() => stopAudio(), 2000)
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <motion.div 
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  Interactive
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-ink-900 mb-2 uppercase tracking-wide text-sm text-ink-500">COHERENCE SCORE</h3>
              <p className="text-sm text-ink-600">Track mind-body alignment with real-time resonance pulses.</p>
              <div className="mt-4 pt-4 border-t border-ink-200/20">
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <span>Click to test coherence patterns</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>

            {/* Focus Halo */}
            <motion.button
              className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6 text-left group hover:border-orange-400 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => {
                // Increase brightness and change to focus settings
                setCustomSettings(prev => ({ 
                  ...prev, 
                  brightness: Math.min(100, prev.brightness + 20),
                  selectedColor: '#8B7FD8' // Purple for focus
                }))
                if (activeProfile) {
                  setActiveProfile({
                    ...activeProfile,
                    ambientLight: { 
                      ...activeProfile.ambientLight, 
                      brightness: Math.min(100, activeProfile.ambientLight.brightness + 20),
                      color: '#8B7FD8',
                      pattern: 'steady'
                    }
                  })
                }
                // Play binaural beats for focus (disabled on click to avoid unexpected audio)
                // audio is managed from the Soundscape controls — do not auto-play here
                // Trigger focus haptic pattern
                if (deviceSupport.haptics) {
                  triggerHaptic('focus', 50)
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400/20 to-amber-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <motion.div 
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                >
                  Interactive
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-ink-900 mb-2 uppercase tracking-wide text-sm text-ink-500">FOCUS HALO</h3>
              <p className="text-sm text-ink-600">Adaptive glow intensifies during deep concentration blocks.</p>
              <div className="mt-4 pt-4 border-t border-ink-200/20">
                <div className="flex items-center text-sm text-orange-600 font-medium">
                  <span>Click to activate focus mode</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Device Integration Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          <motion.div 
            className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6"
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ink-900 mb-2">Smart Device Integration</h3>
            <p className="text-sm text-ink-600">Connect Philips Hue, smart speakers, haptic devices, and VR headsets for full sensory immersion.</p>
          </motion.div>

          <motion.div 
            className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6"
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ink-900 mb-2">Real-time Adaptation</h3>
            <p className="text-sm text-ink-600">Your environment automatically adjusts to your emotional state, helping you stay balanced and focused.</p>
          </motion.div>

          <motion.div 
            className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6"
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          >
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ink-900 mb-2">Customizable Experiences</h3>
            <p className="text-sm text-ink-600">Create unlimited custom profiles tailored to your unique needs and preferences.</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default SensoryExpansion

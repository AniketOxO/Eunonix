import { useState, useEffect, useCallback } from 'react'
import { emotionEngine, EmotionMetrics, EmotionalState } from '@/utils/emotionDetection'

export interface AdaptiveTheme {
  // Color palette
  bgGradient: string
  cardBg: string
  textPrimary: string
  textSecondary: string
  accentColor: string
  
  // Layout
  spacing: 'compact' | 'normal' | 'spacious'
  fontSize: 'small' | 'medium' | 'large'
  
  // Behavior
  animationSpeed: 'slow' | 'normal' | 'fast'
  soundVolume: number // 0-1
  hapticIntensity: number // 0-1
  
  // Features
  showNotifications: boolean
  autoSave: boolean
  minimalMode: boolean
}

const EMOTION_THEMES: Record<EmotionalState, Partial<AdaptiveTheme>> = {
  calm: {
    bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
    accentColor: 'text-indigo-600',
    spacing: 'spacious',
    fontSize: 'medium',
    animationSpeed: 'slow',
    soundVolume: 0.3,
    showNotifications: true,
    minimalMode: false
  },
  
  anxious: {
    bgGradient: 'from-green-50 via-teal-50 to-blue-50',
    accentColor: 'text-teal-600',
    spacing: 'spacious',
    fontSize: 'large',
    animationSpeed: 'slow',
    soundVolume: 0.2,
    showNotifications: false, // Reduce stimulation
    minimalMode: true
  },
  
  focused: {
    bgGradient: 'from-slate-50 via-gray-50 to-zinc-50',
    accentColor: 'text-slate-700',
    spacing: 'compact',
    fontSize: 'medium',
    animationSpeed: 'fast',
    soundVolume: 0.1,
    showNotifications: false, // No distractions
    minimalMode: true,
    autoSave: true
  },
  
  stressed: {
    bgGradient: 'from-emerald-50 via-green-50 to-lime-50',
    accentColor: 'text-emerald-600',
    spacing: 'spacious',
    fontSize: 'large',
    animationSpeed: 'slow',
    soundVolume: 0.15,
    showNotifications: false,
    minimalMode: true
  },
  
  excited: {
    bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
    accentColor: 'text-amber-600',
    spacing: 'normal',
    fontSize: 'medium',
    animationSpeed: 'fast',
    soundVolume: 0.5,
    showNotifications: true,
    minimalMode: false
  },
  
  fatigued: {
    bgGradient: 'from-stone-50 via-neutral-50 to-gray-50',
    accentColor: 'text-stone-600',
    spacing: 'spacious',
    fontSize: 'large',
    animationSpeed: 'slow',
    soundVolume: 0.2,
    showNotifications: false,
    minimalMode: true
  },
  
  neutral: {
    bgGradient: 'from-sand-50 via-white to-lilac-50',
    accentColor: 'text-lilac-600',
    spacing: 'normal',
    fontSize: 'medium',
    animationSpeed: 'normal',
    soundVolume: 0.4,
    showNotifications: true,
    minimalMode: false
  }
}

const DEFAULT_THEME: AdaptiveTheme = {
  bgGradient: 'from-sand-50 via-white to-lilac-50',
  cardBg: 'bg-white/60',
  textPrimary: 'text-ink-800',
  textSecondary: 'text-ink-600',
  accentColor: 'text-lilac-600',
  spacing: 'normal',
  fontSize: 'medium',
  animationSpeed: 'normal',
  soundVolume: 0.4,
  hapticIntensity: 0.5,
  showNotifications: true,
  autoSave: true,
  minimalMode: false
}

export function useNeuroAdaptive() {
  const [emotionMetrics, setEmotionMetrics] = useState<EmotionMetrics | null>(null)
  const [adaptiveTheme, setAdaptiveTheme] = useState<AdaptiveTheme>(DEFAULT_THEME)
  const [isEnabled, setIsEnabled] = useState(true)
  const [transitionDuration] = useState(2000) // ms for smooth transitions

  // Detect emotion periodically
  useEffect(() => {
    if (!isEnabled) return

    const detectEmotion = () => {
      const metrics = emotionEngine.getSmoothedEmotion()
      setEmotionMetrics(metrics)
      
      // Only adapt if confidence is high enough
      if (metrics.confidence > 0.6) {
        const emotionTheme = EMOTION_THEMES[metrics.state]
        setAdaptiveTheme(prev => ({
          ...prev,
          ...emotionTheme
        }))
      }
    }

    // Initial detection
    detectEmotion()

    // Update every 5 seconds
    const interval = setInterval(detectEmotion, 5000)

    return () => clearInterval(interval)
  }, [isEnabled])

  // Track typing for emotion detection
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCorrection = e.key === 'Backspace' || e.key === 'Delete'
      emotionEngine.recordKeystroke(Date.now(), isCorrection)
    }

  let pauseTimer: ReturnType<typeof setTimeout>
    let lastKeyTime = Date.now()

    const handleKeyUp = () => {
      clearTimeout(pauseTimer)
      pauseTimer = setTimeout(() => {
        const pauseDuration = Date.now() - lastKeyTime
        if (pauseDuration > 500) {
          emotionEngine.recordPause(pauseDuration)
        }
      }, 500)
      lastKeyTime = Date.now()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearTimeout(pauseTimer)
    }
  }, [isEnabled])

  const toggleNeuroAdaptive = useCallback(() => {
    setIsEnabled(prev => !prev)
    if (!isEnabled) {
      setAdaptiveTheme(DEFAULT_THEME)
    }
  }, [isEnabled])

  const setPermission = useCallback((type: 'typing' | 'audio' | 'webcam' | 'interaction', enabled: boolean) => {
    emotionEngine.setPermission(type, enabled)
  }, [])

  const getPermissions = useCallback(() => {
    return emotionEngine.getPermissions()
  }, [])

  const resetDetection = useCallback(() => {
    emotionEngine.reset()
    setEmotionMetrics(null)
    setAdaptiveTheme(DEFAULT_THEME)
  }, [])

  // Generate CSS variables for smooth transitions
  const getCSSVariables = useCallback((): React.CSSProperties => {
    return {
      '--transition-duration': `${transitionDuration}ms`,
      '--sound-volume': adaptiveTheme.soundVolume.toString(),
      '--haptic-intensity': adaptiveTheme.hapticIntensity.toString(),
    } as React.CSSProperties
  }, [transitionDuration, adaptiveTheme])

  return {
    // State
    emotionMetrics,
    adaptiveTheme,
    isEnabled,
    
    // Actions
    toggleNeuroAdaptive,
    setPermission,
    getPermissions,
    resetDetection,
    
    // Helpers
    getCSSVariables,
    
    // Computed
    emotionalState: emotionMetrics?.state || 'neutral',
    cognitiveLoad: emotionMetrics?.confidence || 0,
    isAdapting: isEnabled && (emotionMetrics?.confidence || 0) > 0.6
  }
}

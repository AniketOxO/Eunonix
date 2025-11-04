/**
 * Neuro-Adaptive Interface - Emotion Detection System
 * 
 * Detects user's emotional and cognitive state through:
 * - Typing rhythm analysis
 * - Audio patterns (optional, with permission)
 * - Webcam-based facial analysis (optional, with permission)
 * - Interaction patterns
 * 
 * All processing happens locally - privacy-first approach
 */

export type EmotionalState = 
  | 'calm'
  | 'anxious'
  | 'focused'
  | 'stressed'
  | 'excited'
  | 'fatigued'
  | 'neutral'

export type CognitiveLoad = 'low' | 'medium' | 'high'

export interface EmotionMetrics {
  state: EmotionalState
  cognitiveLoad: CognitiveLoad
  confidence: number // 0-1
  timestamp: Date
  sources: {
    typing: boolean
    audio: boolean
    webcam: boolean
    interaction: boolean
  }
}

export interface TypingPattern {
  keystrokes: number[]
  pauses: number[]
  corrections: number
  averageSpeed: number
  rhythm: 'steady' | 'erratic' | 'slow' | 'fast'
}

export interface InteractionPattern {
  mouseSpeed: number
  clickFrequency: number
  scrollBehavior: 'smooth' | 'jerky' | 'slow'
  focusChanges: number
  timeOnPage: number
}

class EmotionDetectionEngine {
  private typingBuffer: number[] = []
  private pauseBuffer: number[] = []
  private lastKeystroke: number = 0
  private correctionCount: number = 0
  private interactionData: Partial<InteractionPattern> = {}
  private emotionHistory: EmotionMetrics[] = []
  
  // Privacy settings
  private permissions = {
    typing: true, // Always enabled by default
    audio: false,
    webcam: false,
    interaction: true // Mouse/scroll patterns
  }

  constructor() {
    this.startInteractionTracking()
  }

  // === TYPING RHYTHM ANALYSIS ===
  
  recordKeystroke(timestamp: number, isCorrection: boolean = false): void {
    if (!this.permissions.typing) return

    if (this.lastKeystroke > 0) {
      const interval = timestamp - this.lastKeystroke
      this.typingBuffer.push(interval)
      
      // Keep last 50 keystrokes
      if (this.typingBuffer.length > 50) {
        this.typingBuffer.shift()
      }
    }

    if (isCorrection) {
      this.correctionCount++
    }

    this.lastKeystroke = timestamp
  }

  recordPause(duration: number): void {
    if (!this.permissions.typing) return
    
    this.pauseBuffer.push(duration)
    if (this.pauseBuffer.length > 20) {
      this.pauseBuffer.shift()
    }
  }

  analyzeTypingPattern(): TypingPattern {
    if (this.typingBuffer.length < 10) {
      return {
        keystrokes: [],
        pauses: [],
        corrections: 0,
        averageSpeed: 0,
        rhythm: 'steady'
      }
    }

    const avgSpeed = this.typingBuffer.reduce((a, b) => a + b, 0) / this.typingBuffer.length
    const variance = this.calculateVariance(this.typingBuffer)
    
    let rhythm: TypingPattern['rhythm'] = 'steady'
    
    if (variance > 10000) rhythm = 'erratic' // High variance = stress/anxiety
    else if (avgSpeed > 300) rhythm = 'slow'  // Slow typing = fatigue
    else if (avgSpeed < 100) rhythm = 'fast'  // Fast typing = excitement/focus
    
    return {
      keystrokes: [...this.typingBuffer],
      pauses: [...this.pauseBuffer],
      corrections: this.correctionCount,
      averageSpeed: avgSpeed,
      rhythm
    }
  }

  // === INTERACTION PATTERN ANALYSIS ===

  private startInteractionTracking(): void {
    if (typeof window === 'undefined') return

    let mouseMovements: number[] = []
    let lastMouseMove = 0
    let clickTimes: number[] = []
    let focusChanges = 0

    window.addEventListener('mousemove', (e) => {
      if (!this.permissions.interaction) return
      
      const now = Date.now()
      if (lastMouseMove > 0) {
        const speed = Math.sqrt(
          Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)
        )
        mouseMovements.push(speed)
        if (mouseMovements.length > 100) mouseMovements.shift()
      }
      lastMouseMove = now
    })

    window.addEventListener('click', () => {
      if (!this.permissions.interaction) return
      clickTimes.push(Date.now())
      if (clickTimes.length > 20) clickTimes.shift()
    })

    window.addEventListener('focus', () => focusChanges++)
    window.addEventListener('blur', () => focusChanges++)

    // Update interaction data every 2 seconds
    setInterval(() => {
      if (mouseMovements.length > 0) {
        this.interactionData.mouseSpeed = 
          mouseMovements.reduce((a, b) => a + b, 0) / mouseMovements.length
      }
      
      if (clickTimes.length > 1) {
        const intervals = []
        for (let i = 1; i < clickTimes.length; i++) {
          intervals.push(clickTimes[i] - clickTimes[i - 1])
        }
        this.interactionData.clickFrequency = 
          1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length)
      }
      
      this.interactionData.focusChanges = focusChanges
    }, 2000)
  }

  // === EMOTION INFERENCE ===

  detectEmotionalState(): EmotionMetrics {
    const typing = this.analyzeTypingPattern()
    let state: EmotionalState = 'neutral'
    let cognitiveLoad: CognitiveLoad = 'medium'
    let confidence = 0.5

    // Stress indicators
    const stressSignals = [
      typing.rhythm === 'erratic',
      typing.corrections > 5,
      (this.interactionData.mouseSpeed || 0) > 15,
      (this.interactionData.clickFrequency || 0) > 2
    ].filter(Boolean).length

    // Fatigue indicators
    const fatigueSignals = [
      typing.rhythm === 'slow',
      typing.averageSpeed > 250,
      (this.interactionData.mouseSpeed || 0) < 3,
      typing.pauses.some(p => p > 3000)
    ].filter(Boolean).length

    // Focus indicators
    const focusSignals = [
      typing.rhythm === 'steady',
      typing.corrections < 2,
      (this.interactionData.focusChanges || 0) < 3,
      typing.averageSpeed > 0 && typing.averageSpeed < 150
    ].filter(Boolean).length

    // Determine primary state
    if (stressSignals >= 3) {
      state = 'stressed'
      cognitiveLoad = 'high'
      confidence = 0.8
    } else if (stressSignals >= 2) {
      state = 'anxious'
      cognitiveLoad = 'high'
      confidence = 0.7
    } else if (fatigueSignals >= 3) {
      state = 'fatigued'
      cognitiveLoad = 'low'
      confidence = 0.75
    } else if (focusSignals >= 3) {
      state = 'focused'
      cognitiveLoad = 'medium'
      confidence = 0.85
    } else if (typing.rhythm === 'fast' && typing.corrections < 3) {
      state = 'excited'
      cognitiveLoad = 'medium'
      confidence = 0.6
    } else if (typing.averageSpeed === 0 && (this.interactionData.mouseSpeed || 0) < 5) {
      state = 'calm'
      cognitiveLoad = 'low'
      confidence = 0.65
    }

    const metrics: EmotionMetrics = {
      state,
      cognitiveLoad,
      confidence,
      timestamp: new Date(),
      sources: {
        typing: this.permissions.typing && typing.keystrokes.length > 0,
        audio: this.permissions.audio,
        webcam: this.permissions.webcam,
        interaction: this.permissions.interaction
      }
    }

    // Store in history
    this.emotionHistory.push(metrics)
    if (this.emotionHistory.length > 100) {
      this.emotionHistory.shift()
    }

    return metrics
  }

  // Get smoothed emotion over recent history
  getSmoothedEmotion(): EmotionMetrics {
    if (this.emotionHistory.length === 0) {
      return this.detectEmotionalState()
    }

    // Use last 5 readings for smoothing
    const recent = this.emotionHistory.slice(-5)
    const stateCounts: Record<string, number> = {}
    
    recent.forEach(m => {
      stateCounts[m.state] = (stateCounts[m.state] || 0) + 1
    })

    // Find most common state
    const dominantState = Object.entries(stateCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as EmotionalState

    const avgConfidence = recent.reduce((sum, m) => sum + m.confidence, 0) / recent.length

    return {
      ...recent[recent.length - 1],
      state: dominantState,
      confidence: avgConfidence
    }
  }

  // === PRIVACY CONTROLS ===

  setPermission(type: keyof typeof this.permissions, enabled: boolean): void {
    this.permissions[type] = enabled
  }

  getPermissions() {
    return { ...this.permissions }
  }

  // === HELPERS ===

  private calculateVariance(arr: number[]): number {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2))
    return squareDiffs.reduce((a, b) => a + b, 0) / arr.length
  }

  reset(): void {
    this.typingBuffer = []
    this.pauseBuffer = []
    this.correctionCount = 0
    this.interactionData = {}
    this.emotionHistory = []
  }
}

// Singleton instance
export const emotionEngine = new EmotionDetectionEngine()

/**
 * Emotional API - The Infrastructure Layer of Emotional Technology
 * 
 * LifeOS becomes the API of human emotion, allowing developers to build
 * apps that safely plug into users' emotional profiles.
 */

export interface EmotionalAPIClient {
  apiKey: string
  baseURL: string
  version: string
}

/**
 * API Endpoints
 */

// Current State Endpoints
export interface CurrentEmotionResponse {
  state: 'calm' | 'anxious' | 'focused' | 'stressed' | 'excited' | 'fatigued' | 'neutral'
  confidence: number
  timestamp: Date
  context?: {
    activity?: string
    location?: string
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  }
}

export interface CognitiveLoadResponse {
  load: 'low' | 'medium' | 'high'
  percentage: number
  factors: {
    typing: number
    interactions: number
    focus: number
  }
  recommendations: string[]
}

export interface EnergyLevelResponse {
  level: number // 0-100
  trend: 'rising' | 'stable' | 'falling'
  prediction: {
    nextHour: number
    peakTime?: string
    lowTime?: string
  }
}

// Historical Data Endpoints
export interface EmotionHistoryResponse {
  data: {
    timestamp: Date
    state: string
    confidence: number
    energy: number
  }[]
  summary: {
    dominantEmotion: string
    averageEnergy: number
    variability: number
    patterns: EmotionPattern[]
  }
}

export interface EmotionPattern {
  pattern: string
  description: string
  frequency: number
  triggers?: string[]
  timeOfDay?: string[]
}

// Mood & Trends Endpoints
export interface MoodTrendsResponse {
  currentMood: string
  weeklyTrend: 'improving' | 'stable' | 'declining'
  insights: MoodInsight[]
  forecast: {
    tomorrow: string
    confidence: number
  }
}

export interface MoodInsight {
  type: 'positive' | 'neutral' | 'concern'
  title: string
  description: string
  actionable: boolean
  suggestion?: string
}

// Focus State Endpoints
export interface FocusStateResponse {
  state: 'deep-focus' | 'shallow-focus' | 'distracted' | 'transitioning'
  duration: number // minutes in current state
  productivity: number // 0-100
  optimalFor: string[]
  distractions: {
    count: number
    types: string[]
  }
}

/**
 * API Client SDK
 */

export class LifeOSEmotionalAPI {
  private apiKey: string
  private baseURL: string
  private version: string

  constructor(apiKey: string, options?: { baseURL?: string; version?: string }) {
    this.apiKey = apiKey
    this.baseURL = options?.baseURL || 'https://api.lifeos.app'
    this.version = options?.version || 'v1'
  }

  // Current State Methods
  async getCurrentEmotion(): Promise<CurrentEmotionResponse> {
    return this.request('/emotion/current')
  }

  async getCognitiveLoad(): Promise<CognitiveLoadResponse> {
    return this.request('/cognitive/load')
  }

  async getEnergyLevel(): Promise<EnergyLevelResponse> {
    return this.request('/energy/current')
  }

  async getFocusState(): Promise<FocusStateResponse> {
    return this.request('/focus/state')
  }

  // Historical Methods
  async getEmotionHistory(params: {
    from: Date
    to: Date
    granularity?: 'hour' | 'day' | 'week'
  }): Promise<EmotionHistoryResponse> {
    return this.request('/emotion/history', { params })
  }

  async getMoodTrends(days: number = 7): Promise<MoodTrendsResponse> {
    return this.request('/mood/trends', { params: { days } })
  }

  // Webhooks
  async createWebhook(config: WebhookConfig): Promise<Webhook> {
    return this.request('/webhooks', { method: 'POST', body: config })
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    return this.request(`/webhooks/${webhookId}`, { method: 'DELETE' })
  }

  // Real-time Subscriptions
  subscribe(events: APIEvent[], callback: (event: APIEventData) => void): WebSocket {
    const ws = new WebSocket(`${this.baseURL.replace('https', 'wss')}/stream?key=${this.apiKey}`)
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', events }))
    }

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data)
      callback(data)
    }

    return ws
  }

  // Private request handler
  private async request(endpoint: string, options?: any): Promise<any> {
    const url = `${this.baseURL}/${this.version}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      throw new APIError(response.status, await response.text())
    }

    return response.json()
  }
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

// Webhook Types
export interface WebhookConfig {
  url: string
  events: APIEvent[]
  secret?: string
  active: boolean
}

export interface Webhook extends WebhookConfig {
  id: string
  createdAt: Date
  lastTriggered?: Date
}

export type APIEvent = 
  | 'emotion.changed'
  | 'cognitive.high'
  | 'energy.low'
  | 'focus.deep'
  | 'focus.lost'
  | 'mood.improved'
  | 'mood.declined'
  | 'pattern.detected'

export interface APIEventData {
  event: APIEvent
  timestamp: Date
  data: any
  userId: string
}

/**
 * Example Integrations
 */

// Music App Integration
export interface MusicAppIntegration {
  getCurrentPlaylist(): Promise<{
    playlist: string
    reason: string
    tracks: Array<{
      title: string
      artist: string
      emotionalTone: string
    }>
  }>
}

// Writing Tool Integration
export interface WritingToolIntegration {
  getToneRecommendation(): Promise<{
    tone: 'professional' | 'casual' | 'empathetic' | 'direct'
    confidence: number
    reasoning: string
  }>
}

// Focus App Integration
export interface FocusAppIntegration {
  getMentalMode(): Promise<{
    mode: 'deep-work' | 'creative' | 'collaborative' | 'rest'
    optimalDuration: number
    breakSuggestion: string
  }>
}

/**
 * Rate Limiting
 */

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

export const RATE_LIMITS = {
  free: {
    requestsPerMinute: 0,
    requestsPerDay: 0
  },
  premium: {
    requestsPerMinute: 0,
    requestsPerDay: 0
  },
  pro: {
    requestsPerMinute: 60,
    requestsPerDay: 10000
  },
  enterprise: {
    requestsPerMinute: 600,
    requestsPerDay: 'unlimited' as any
  }
}

/**
 * Security & Privacy
 */

export interface APISecurityConfig {
  // User controls
  dataSharing: {
    currentState: boolean
    history: boolean
    predictions: boolean
    anonymized: boolean
  }
  
  // Access control
  allowedDomains: string[]
  ipWhitelist?: string[]
  
  // Data retention
  logRetention: number // days
  autoRevoke: boolean
  revokeAfterDays?: number
}

/**
 * SDK Examples
 */

// Example 1: Music App that adapts to emotion
export const musicAppExample = `
const lifeos = new LifeOSEmotionalAPI('your-api-key')

async function updatePlaylist() {
  const emotion = await lifeos.getCurrentEmotion()
  const energy = await lifeos.getEnergyLevel()
  
  if (emotion.state === 'stressed' && energy.level < 40) {
    // Play calming music
    playPlaylist('calm-focus')
  } else if (emotion.state === 'excited' && energy.level > 70) {
    // Play energetic music
    playPlaylist('high-energy')
  }
}
`

// Example 2: Writing tool that adapts tone
export const writingToolExample = `
const lifeos = new LifeOSEmotionalAPI('your-api-key')

async function suggestTone() {
  const cognitive = await lifeos.getCognitiveLoad()
  const focus = await lifeos.getFocusState()
  
  if (cognitive.load === 'high' && focus.state === 'distracted') {
    return 'Use shorter sentences and simpler words'
  } else if (focus.state === 'deep-focus') {
    return 'Complex writing style supported - go deep'
  }
}
`

// Example 3: Real-time focus app
export const focusAppExample = `
const lifeos = new LifeOSEmotionalAPI('your-api-key')

const ws = lifeos.subscribe(['focus.deep', 'focus.lost'], (event) => {
  if (event.event === 'focus.deep') {
    // Start do-not-disturb mode
    enableDND()
  } else if (event.event === 'focus.lost') {
    // Suggest a break
    suggestBreak()
  }
})
`

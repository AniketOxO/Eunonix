import { describe, it, expect } from 'vitest'
import generateWeeklyReflection from './weeklyReflection'
import { Message, TrainingData } from './detectEmotionResponse'

describe('generateWeeklyReflection', () => {
  it('returns nulls for empty messages', () => {
    const result = generateWeeklyReflection([], null, new Date())
    expect(result.mostCommonEmotion).toBeNull()
    expect(result.bestMoment).toBeNull()
  })

  it('computes summary from recent messages', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const messages: Message[] = [
      { id: 'u1', role: 'user', content: 'I am so stressed about work', timestamp: threeDaysAgo.toISOString() },
      { id: 'a1', role: 'assistant', content: 'I hear you', timestamp: threeDaysAgo.toISOString(), detection: { label: 'stress' } as any },
      { id: 'u2', role: 'user', content: 'I completed my assignment today and feel proud', timestamp: yesterday.toISOString() },
      { id: 'a2', role: 'assistant', content: 'Amazing, congrats!', timestamp: yesterday.toISOString(), detection: { label: 'happy' } as any }
    ]

    const trainingData: TrainingData = {
      userPreferences: { conversationStyle: 'balanced', topicsOfInterest: [], commonGreetings: [], emotionalTone: 'supportive' },
      conversationHistory: { totalMessages: 4, frequentTopics: {}, emotionCounts: { stress: 1, happy: 1 }, successfulResponses: [] },
      personalContext: { goals: [], challenges: [], achievements: [] }
    }

    const r = generateWeeklyReflection(messages, trainingData, now)
    expect(r.mostCommonEmotion).toBeDefined()
    expect(r.bestMoment).toContain('completed my assignment')
    expect(r.toughestMoment).toContain('stressed')
    expect(r.growthSuggestion).toBeDefined()
  })
})

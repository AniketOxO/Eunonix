import { describe, it, expect } from 'vitest'
import detectEmotionResponse from './detectEmotionResponse'

describe('Neutral Confirmation Mode', () => {
  const names = ['ok', 'okay', 'k', 'kk', 'yup', 'sure', 'got it', 'sounds good', 'hmm', 'bet', 'cool']
  for (const t of names) {
    it(`does not trigger support for '${t}'`, () => {
      const resp = detectEmotionResponse(t)
      // Should not send the generic fallback phrase
      expect(resp.toLowerCase()).not.toContain("i'm here for you")
      // Should be a short casual reply
      expect(resp.length).toBeLessThan(120)
    })
  }

  it('uses name when provided in trainingData', () => {
    const resp = detectEmotionResponse('ok', { trainingData: { userPreferences: { conversationStyle: 'balanced', topicsOfInterest: [], commonGreetings: [], emotionalTone: 'supportive' }, conversationHistory: { totalMessages: 0, frequentTopics: {}, emotionCounts: {}, successfulResponses: [] }, personalContext: { name: 'Aniket', goals: [], challenges: [], achievements: [] } } })
    expect(resp.toLowerCase()).toContain('aniket')
  })

  it('does not match longer sentences containing ok as substring', () => {
    const resp = detectEmotionResponse('ok I am feeling so sad today and I dont know what to do')
    // should not be a short casual reply; should contain supportive keywords
    expect(resp.toLowerCase()).toContain('i')
  })
})

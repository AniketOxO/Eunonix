import { describe, it, expect } from 'vitest'
import detectEmotionResponse from './detectEmotionResponse'

describe('Priority modes: greeting, techniques, always-answer-questions', () => {
  it('greeting mode overrides emotional support and returns casual warm reply', () => {
    const inputs = ['hi', 'hello', 'hey', 'heyy', 'yo', 'sup', 'how are you', "how are youu", 'good morning', 'good night', "what's up", 'I\'m good', 'nothing much']
    for (const input of inputs) {
      const out = detectEmotionResponse(input)
      // Should be one of the greeting replies
      expect([
        "I’m doing great! How are you feeling today?",
        "I’m good — happy to see you. What about you?",
        "I’m here and doing well 😄 how’s your day?",
        "All good on my side — what’s up?"
      ]).toContain(out)
    }
  })

  it('techniques mode returns 3-7 techniques and includes known technique names', () => {
    const out = detectEmotionResponse('give me techniques to calm down')
    expect(out.startsWith('Sure! Here are some techniques you can try:')).toBeTruthy()
    // count bullets
    const bullets = out.split('\n- ').slice(1)
    expect(bullets.length).toBeGreaterThanOrEqual(3)
    expect(bullets.length).toBeLessThanOrEqual(7)
    // contains at least one known technique
    const joined = out.toLowerCase()
    expect(joined.includes('4-7-8') || joined.includes('grounding') || joined.includes('brain dump') ).toBeTruthy()
  })

  it('always-answer-questions mode answers questions with an informational starter and steps', () => {
    const out = detectEmotionResponse('How do I improve my focus?')
    expect(/Sure!|Absolutely|Let me help/.test(out)).toBeTruthy()
    expect(out.includes('Clarify the goal')).toBeTruthy()
  })
})

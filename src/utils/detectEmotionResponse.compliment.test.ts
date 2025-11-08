import { describe, it, expect } from 'vitest'
import { detectEmotionResponse } from './detectEmotionResponse'

describe('Compliment Mode', () => {
  const compliments = [
    "you're so nice",
    'you are very clever',
    "you're amazing",
    'you helped me a lot',
    "you're the best",
    "i love your replies",
    "you're funny",
    "you're comforting",
    "i like talking to you",
    "you understand me"
  ]

  for (const msg of compliments) {
    it(`responds appreciatively and without a check-in for: ${msg}`, () => {
      const out = detectEmotionResponse(msg)
  // should include a gratitude/pleasant token and must NOT include a question mark
  // allow both ASCII apostrophe (') and curly apostrophe (’) in contractions like I'm / I’m
  expect(/thank|appreciat|aww|made me smile|i(?:'|’)m happy|i(?:'|’)m glad|haha|sweet|glad/i.test(out)).toBeTruthy()
  expect(out).not.toContain('?')
      // should be short/thankful (no instruction to continue the conversation)
      expect(out.length).toBeLessThan(120)
    })
  }
})

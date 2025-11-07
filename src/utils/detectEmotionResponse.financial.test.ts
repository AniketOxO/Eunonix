import { describe, it, expect } from 'vitest'
import detectEmotionResponse, { detectEmotionLabel } from './detectEmotionResponse'

describe('Financial Stress Mode', () => {
  const triggers = [
    'i am broke',
    "i can't afford rent",
    "can't pay my bills",
    'i have too much debt',
    'no money',
    'lost my job and have no income',
    'i am struggling financially',
    'money stress is killing me'
  ]

  for (const t of triggers) {
    it(`detects financial stress for: ${t}`, () => {
      const resp = detectEmotionResponse(t)
      // Response should be calm/supportive and practical (not the generic fallback)
      expect(resp.toLowerCase()).not.toContain("i'm here for you, even if i don't fully understand")
      // Should mention money or financial language and offer to help organize or calm
      expect(/money|financial|debt|organize|calm|budget|broke|bills|rent/i.test(resp)).toBe(true)

      // Label helper should return 'financial'
      const label = detectEmotionLabel(t)
      expect(label).toBe('financial')
    })
  }
})

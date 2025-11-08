import { describe, it, expect } from 'vitest'
import detectEmotionResponse, { detectEmotionLabel } from './detectEmotionResponse'

describe('Financial Stress Mode', () => {
  const cases = [
    'I want to talk about my financial problem',
    "I'm stressed because my parents have financial pressure",
    "I don't have money to invest right now",
    "My rent is due and I can't afford it",
    'We are completely broke and bills are piling up',
    'Expenses and bills keep growing every month',
    'There is a family financial problem and I am worried',
    "I can't afford rent this month",
    'Money is tight and I feel anxious about it',
    'This financial stress is really getting to me',
    'i am broke',
    "i can't afford rent",
    "can't pay my bills",
    'i have too much debt',
    'no money',
    'lost my job and have no income',
    'i am struggling financially',
    'money stress is killing me'
  ]

  for (const msg of cases) {
    it(`detects financial stress for: ${msg}`, () => {
      const resp = detectEmotionResponse(msg)
      const label = detectEmotionLabel(msg)

      // Label should be 'financial'
      expect(label).toBe('financial')

      // Response should not be the generic fallback
      expect(resp.toLowerCase()).not.toContain("i'm here for you, even if i don't fully understand")

      // Reply should reference money/financial grounding language
      expect(/money|financial|debt|organize|calm|budget|broke|bills|rent|expenses|financial pressure|money stress/i.test(resp)).toBeTruthy()
    })
  }
})

import { describe, it, expect } from 'vitest'
import { detectEmotionLabel, detectEmotionResponse } from './detectEmotionResponse'

describe('Advanced Negative Override', () => {
  const cases = [
    "it's okay, not great",
    'not good',
    'not feeling great',
    'not okay',
    'not really good',
    'not that great',
    'not very good',
    'okay but not good',
    "it's fine, but actually not"
  ]

  for (const c of cases) {
    it(`treats "${c}" as negative (label)`, () => {
      expect(detectEmotionLabel(c)).toBe('sad')
    })

    it(`responds with a negative-leaning reply for: "${c}"`, () => {
      const out = detectEmotionResponse(c)
      // reply should not be a positive celebration message
      expect(out.toLowerCase()).not.toMatch(/(happy to hear|that\u2019s awesome|so happy for you|tell me more)/)
      // should be negative-leaning: express sympathy/acknowledgement or ask what happened
      expect(out.toLowerCase()).toMatch(/(sorry|what happened|tell me|not great|wasn'?t|isn'?t|tough|heavy|want to tell)/)
    })
  }
})

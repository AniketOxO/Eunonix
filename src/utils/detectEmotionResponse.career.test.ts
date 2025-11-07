import { describe, it, expect } from 'vitest'
import detectEmotionResponse, { detectEmotionLabel } from './detectEmotionResponse'

describe('Career & Job Stress Mode', () => {
  const triggers = [
    'i have job stress and pressure at work',
    'i am burned out from my job',
    "i lost my job and i don't know what to do",
    'i feel stuck in my career',
    'office stress is killing me',
    'i hate my job',
    'career confusion and future confusion',
    "i'm scared about my future"
  ]

  for (const t of triggers) {
    it(`detects career stress for: ${t}`, () => {
      const resp = detectEmotionResponse(t)
  // DEBUG: log response to inspect behavior when tests fail
  console.log('CAREER-RESP:', t, '=>', resp)
      // Should be supportive, calm, and not provide HR/legal instructions
      expect(resp.toLowerCase()).toContain('i')
      expect(/career|job|work|burnout|stuck|pressure|future|lost my job/i.test(resp)).toBe(true)
  // Should not offer actionable legal or HR instructions (guard phrases like "I won't provide HR or legal advice" are allowed)
  expect(/(file a complaint|sue|employment lawyer|apply for unemployment|contact hr|reach out to hr)/i.test(resp)).toBe(false)

      const label = detectEmotionLabel(t)
      expect(label).toBe('career')
    })
  }
})

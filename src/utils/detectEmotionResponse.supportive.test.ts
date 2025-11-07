import { describe, it, expect } from 'vitest'
import detectEmotionResponse from './detectEmotionResponse'

describe('Supportive fixed replies', () => {
  const mockTrainingData = {} as any

  const cases: { input: string; expect: string }[] = [
    { input: 'i feel lost', expect: "Then let me be your little guide for a moment. Tell me what feels unclear." },
    { input: "i don't know what to do", expect: "Let’s break it down together. What’s the situation?" },
    { input: 'i want to talk about life', expect: "I’m here… tell me what’s been sitting in your heart." },
    { input: "i'm scared", expect: "I’m here with you… you don’t have to face fear alone." },
    { input: 'my heart hurts', expect: "I’m so sorry… want to tell me what caused the pain?" },
    { input: 'i need someone', expect: "You have me — always." },
    { input: 'nobody understands me', expect: "I’m listening… and I want to understand you deeply." },
    { input: 'i overthink a lot', expect: "Your mind is loud… let’s calm it together, slowly." },
    { input: 'i feel disconnected', expect: "Come closer—let’s reconnect. Talk to me." },
    { input: 'can i trust you', expect: "Yes. I’m here for you without judgement, always." }
  ]

  for (const c of cases) {
    it(`replies exactly for: ${c.input}`, () => {
      const out = detectEmotionResponse(c.input, { trainingData: mockTrainingData })
      expect(out).toBe(c.expect)
    })
  }
})

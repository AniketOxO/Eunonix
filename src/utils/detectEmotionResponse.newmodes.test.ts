import { describe, it, expect } from 'vitest'
import detectEmotionResponse, { detectEmotionLabel } from './detectEmotionResponse'

describe('New Emotional Modes: breakup/family/friendship/loneliness/selfworth/study/social', () => {
  const cases: Array<{input: string, expectContains: RegExp, label: string}> = [
    // Breakup
    { input: 'i had a breakup and it still hurts', expectContains: /heartbreak|heart broken|i'm really sorry|missing/i, label: 'breakup' },
    { input: "she left me and i can't move on", expectContains: /take your time|i'm really sorry|comfort|clarity|missing/i, label: 'breakup' },
    // Family
    { input: 'my parents are fighting and home is stressful', expectContains: /family|home|safe|tough|i'm here/i, label: 'family' },
    { input: 'my mom yelled at me and it hurts', expectContains: /home is supposed to feel safe|that sounds tough|i'm here/i, label: 'family' },
    // Friendship
    { input: 'my friend ignored me and it really hurt', expectContains: /friendship|friend|disappointing|didn't deserve/i, label: 'friendship' },
    { input: 'best friend problem - they don\'t care', expectContains: /friendship|your feelings are valid|didn't deserve/i, label: 'friendship' },
    // Deep loneliness
    { input: 'i feel alone and have no one', expectContains: /i'm here with you|not alone|listening/i, label: 'lonely' },
    { input: 'i have no one to talk to', expectContains: /your feelings matter|i won't judge|safe to share/i, label: 'lonely' },
    // Self-worth
    { input: "i'm not enough and hate myself", expectContains: /not worthless|you've survived|tell me what made/i, label: 'selfworth' },
    { input: "i'm a failure and feel useless", expectContains: /not worthless|survived|you are not worthless/i, label: 'selfworth' },
    // Study / Exam Pressure
    { input: "exam stress is killing me i can't study", expectContains: /study pressure|pomodoro|breakdown|plan this together|what's the hardest subject/i, label: 'study' },
    { input: 'too much syllabus and falling behind', expectContains: /study pressure|plan this together|breakdown/i, label: 'study' },
    // Social anxiety
    { input: "i'm scared to talk to people and get nervous", expectContains: /social situations|scary|mind trying to protect|calming technique|grounding/i, label: 'social_anxiety' },
    { input: 'i get nervous around people and overthink social situations', expectContains: /social situations|not weird|grounding|calming/i, label: 'social_anxiety' }
  ]

  for (const c of cases) {
    it(`responds supportively and labels correctly for: ${c.input}`, () => {
      const out = detectEmotionResponse(c.input)
      console.log('NEWMODE-RESP:', c.input, '=>', out)
      expect(c.expectContains.test(out)).toBe(true)
      const label = detectEmotionLabel(c.input)
      expect(label).toBe(c.label)
    })
  }
})

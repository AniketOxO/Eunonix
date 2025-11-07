import { describe, it, expect } from 'vitest'
import { DIRECT_MAP, FUN_MAP, POSITIVE_MAP } from './detectEmotionResponse'
import runDetectorBackfill from './migrations/detectBackfill'

describe('detectEmotionResponse exports & migration', () => {
  it('exports mapping tables and contains expected triggers', () => {
    // Basic sanity checks
    expect(Array.isArray(DIRECT_MAP)).toBe(true)
    expect(DIRECT_MAP.length).toBeGreaterThan(0)
    // direct map should contain 'hi' trigger somewhere
    const hasHi = DIRECT_MAP.some(e => e.triggers && e.triggers.includes('hi'))
    expect(hasHi).toBe(true)

    // fun map has 'bored' mapping
    const funHasBored = FUN_MAP.some(e => e.triggers && e.triggers.includes('bored'))
    expect(funHasBored).toBe(true)

    // positive map contains 'i'm happy'
    const posHasHappy = POSITIVE_MAP.some(e => e.triggers && e.triggers.includes("i'm happy") )
    expect(posHasHappy).toBe(true)
  })

  it('backfill adds detection metadata and increments training counts', async () => {
    const saved = {
      messages: [
        { id: 'u1', role: 'user', content: "I'm sad and tired", timestamp: new Date().toISOString() },
        { id: 'a1', role: 'assistant', content: 'I am here for you', timestamp: new Date().toISOString() }
      ],
      personality: 'friend',
      trainingData: null
    }

    const result = await runDetectorBackfill(saved as any, [], [], 'friend', 1)

    // assistant message should be annotated
  const assistant = (result.messages[1] as any)
  expect(assistant.detection).toBeDefined()
  expect(assistant.detection.label).toBeDefined()
  // label should be 'sad' (or include 'sad' mapping)
  expect(assistant.detection.label).toMatch(/sad|sadness/i)

    // training counts should include sad
    expect(result.trainingData.conversationHistory.emotionCounts).toBeDefined()
    const counts = result.trainingData.conversationHistory.emotionCounts || {}
    const sadCount = counts['sad'] || counts['sadness'] || 0
    expect(sadCount).toBeGreaterThanOrEqual(1)

    // migrationVersion should be returned
    expect(result.migrationVersion).toBe(1)
  })
})

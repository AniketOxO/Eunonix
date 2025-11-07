import { describe, it, expect } from 'vitest'
import detectEmotionResponse, { detectEmotion } from './detectEmotionResponse'

describe('detectEmotionResponse precedence and mode ordering', () => {
  it('supports exact support mapping over question fallback', () => {
    const resp = detectEmotionResponse("i don't know what to do")
    expect(resp.toLowerCase()).toContain('break it down')
  })

  it('handles common misspelling before generic question response', () => {
    const resp = detectEmotionResponse('I am confued and cannot figure it out')
    expect(resp.toLowerCase()).toContain("did you mean 'confused'")
  })

  it('gives anxiety-specific response rather than generic question steps', () => {
    const resp = detectEmotionResponse("how do I calm down when I'm anxious?")
    // anxiety branch includes 'safe here' phrase
    expect(resp.toLowerCase()).toContain('safe here')
  })

  it('returns techniques list when explicitly requested', () => {
    const resp = detectEmotionResponse('give me techniques to calm down')
    expect(resp.toLowerCase()).toContain('here are some techniques')
  })

  it('does not treat overthinking as a greeting (greeting must be narrow)', () => {
    const resp = detectEmotionResponse('i overthink a lot')
    // should return supportive overthinking flow
    expect(resp.toLowerCase()).toContain('calm it together')
  })

  it('detectEmotion wrapper returns matched trigger info when available', () => {
    const result = detectEmotion('can i trust you')
    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('label')
    // support mapping should yield either a label or a matched trigger from our maps
    const hasLabel = !!result.label
    const hasMatchedTrigger = !!(result.matched && result.matched.trigger)
    expect(hasLabel || hasMatchedTrigger).toBeTruthy()
  })
})

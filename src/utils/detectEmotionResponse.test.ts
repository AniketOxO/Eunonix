import { describe, it, expect } from 'vitest'
import detectEmotionResponse, { detectEmotionLabel, detectEmotion } from './detectEmotionResponse'

describe('detectEmotionResponse / detectEmotionLabel', () => {
  it('detects sadness', () => {
    const label = detectEmotionLabel('I feel so sad today and a bit low')
    expect(label).toBe('sad')
  })

  it('handles common misspelling of confused in response text', () => {
    const resp = detectEmotionResponse('I am confued and cannot figure it out')
    expect(resp.toLowerCase()).toContain("did you mean 'confused'")
  })

  it('detects happiness', () => {
    const label = detectEmotionLabel("This made my day, I'm so happy!")
    expect(label).toBe('happy')
  })

  it('detects hopelessness', () => {
    const label = detectEmotionLabel('I feel hopeless, everything is falling apart')
    expect(label).toBe('hopeless')
  })

  it('detects loneliness', () => {
    const label = detectEmotionLabel('I am feeling so lonely and alone')
    expect(label).toBe('lonely')
  })

  it('detects anger', () => {
    const label = detectEmotionLabel("I'm so angry and frustrated right now")
    expect(label).toBe('anger')
  })

  it('detects anxiety', () => {
    const label = detectEmotionLabel("I'm anxious and my heart is racing")
    expect(label).toBe('anxiety')
  })

  it('detects stress', () => {
    const label = detectEmotionLabel("I'm stressed and overwhelmed with work")
    expect(label).toBe('stress')
  })

  it('detects overthinking', () => {
    const label = detectEmotionLabel("I'm overthinking and my thoughts keep looping")
    expect(label).toBe('overthinking')
  })

  it('detects fun / playful tone', () => {
    const label = detectEmotionLabel('lol that was hilarious, I can\'t stop laughing')
    expect(label).toBe('fun')
  })

  it('detectEmotion wrapper returns both text and label', () => {
    const result = detectEmotion('I am confused about this next step')
    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('label')
    // label for this input should be either 'confusion' or non-null
    expect(result.label).toBeTruthy()
  })
})

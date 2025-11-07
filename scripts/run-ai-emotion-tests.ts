import detectEmotionResponse from '../src/utils/detectEmotionResponse.ts'

// Minimal mock training data
const mockTrainingData = {
  userPreferences: {
    conversationStyle: 'balanced' as const,
    topicsOfInterest: ['habit', 'focus'],
    commonGreetings: ['hi'],
    emotionalTone: 'supportive' as const
  },
  conversationHistory: {
    totalMessages: 0,
    frequentTopics: {},
    emotionCounts: {},
    successfulResponses: []
  },
  personalContext: {
    goals: ['build better habits'],
    challenges: [],
    achievements: []
  }
}

const habits: any[] = []
const goals: any[] = []
const messages: any[] = []
const personality = 'friend' as const

const aiTests: { name: string; inputs: string[]; expectContains: string }[] = [
  { name: 'Sadness', inputs: ['I feel down', 'feeling low', 'not okay emotionally'], expectContains: 'I\u2019m right here with you' },
  { name: 'Stress', inputs: ['I am stressed', 'so overwhelmed', 'too much to handle'], expectContains: 'Take a slow breath with me' },
  { name: 'Anxiety', inputs: ['I am anxious', 'my anxiety is bad', 'panic'], expectContains: "You're safe here" },
  { name: 'Anger', inputs: ['I am angry', 'I lost my temper', 'this triggered me'], expectContains: 'Your feelings are valid' },
  { name: 'Confusion', inputs: ['I am confused', 'I don\'t understand this', 'not making sense'], expectContains: 'It\'s okay to not have clarity' },
  { name: 'Overthinking', inputs: ['I keep overthinking', 'thoughts racing', 'can\'t stop thinking'], expectContains: 'I hear your mind running fast' },
  { name: 'Happiness', inputs: ['I am so happy today', 'this energy feels amazing', 'made my day'], expectContains: 'This energy feels amazing' }
  ,{ name: 'Hopelessness', inputs: ['I feel hopeless', 'everything is falling apart', 'I have no hope'], expectContains: "I\u2019m here with you" }
  ,{ name: 'Loneliness', inputs: ['I feel so lonely', 'I am alone', 'nobody is there for me'], expectContains: 'You deserve connection and warmth' }
]

const supportiveTests: {input: string; expect: string}[] = [
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

let passed = 0
let failed = 0

const runTestSet = (name: string, tests: any[], runner: (t: any) => boolean) => {
  console.log(`\n=== Running ${name} ===`)
  for (const t of tests) {
    const ok = runner(t)
    if (ok) {
      console.log(`[PASS] ${name} - ${JSON.stringify(t)}`)
      passed++
    } else {
      console.error(`[FAIL] ${name} - ${JSON.stringify(t)}`)
      failed++
    }
  }
}

runTestSet('AI Emotion Tests', aiTests, (test) => {
  for (const input of test.inputs) {
    const out = detectEmotionResponse(input, { trainingData: mockTrainingData as any, habits, goals, messages, personality })
    if (!out || !out.includes(test.expectContains)) return false
  }
  return true
})

runTestSet('Supportive Tests', supportiveTests, (t) => {
  const out = detectEmotionResponse(t.input, { trainingData: mockTrainingData })
  return out === t.expect
})

console.log(`\nResults: ${passed} passed, ${failed} failed.`)

if (failed > 0) process.exit(2)
else process.exit(0)

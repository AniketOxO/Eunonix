import detectEmotionResponse from '../src/utils/detectEmotionResponse.ts'

const mockTrainingData = {} as any

const tests: {input: string; expect: string}[] = [
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
for (const t of tests) {
  const out = detectEmotionResponse(t.input, { trainingData: mockTrainingData })
  if (out === t.expect) {
    console.log(`[PASS] ${t.input}`)
    passed++
  } else {
    console.error(`[FAIL] ${t.input} -> ${out} (expected: ${t.expect})`)
    failed++
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`)
if (failed > 0) {
  process.exit(2)
} else {
  process.exit(0)
}

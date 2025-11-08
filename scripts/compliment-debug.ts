import { detectEmotionResponse } from '../src/utils/detectEmotionResponse.ts'

const msgs = ['you are very clever','you helped me a lot','i love your replies','youre comforting','you understand me']
for (const m of msgs) {
  console.log('MSG =>', m)
  console.log('OUT =>', detectEmotionResponse(m))
  console.log('---')
}

import { Message, TrainingData, detectEmotionLabel } from './detectEmotionResponse'

type WeeklySummary = {
  mostCommonEmotion?: string | null
  bestMoment?: string | null
  toughestMoment?: string | null
  pattern?: string | null
  growthSuggestion?: string | null
  // heatmap for hour-of-day activity (0-23)
  hourHeatmap?: number[]
  // week-over-week comparison for emotion counts and activity
  weekComparison?: {
    emotions: Record<string, { thisWeek: number; lastWeek: number; delta: number }>
    activity: { thisWeek: number; lastWeek: number; delta: number }
  }
  // optional debug patterns surfaced for UI or tests
  timePattern?: string | null
  emotionFreqPattern?: string | null
}

const dayOfWeek = (d: Date, locale?: string) => d.toLocaleDateString(locale || undefined, { weekday: 'long' })

export const generateWeeklyReflection = (messages: Message[], trainingData: TrainingData | null, now = new Date(), locale?: string): WeeklySummary => {
  if (!messages || messages.length === 0) {
    return {
      mostCommonEmotion: null,
      bestMoment: null,
      toughestMoment: null,
      pattern: null,
      growthSuggestion: null
    }
  }

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recent = messages.filter(m => new Date(m.timestamp) >= weekAgo && new Date(m.timestamp) <= now)

  // Count emotions from detection metadata or fallback to detector
  const counts: Record<string, number> = {}
  const labeledMessages: Array<{ msg: Message; label?: string | null }> = []
  for (const m of recent) {
    // Prefer persisted detection on assistant messages (they represent reaction to previous user message)
    let label: string | null | undefined = (m as any).detection?.label ?? null
    if (!label && m.role === 'user') {
      // detect from user message content
      label = detectEmotionLabel(m.content)
    }
    if (label) {
      counts[label] = (counts[label] || 0) + 1
      labeledMessages.push({ msg: m, label })
    }
  }

  // pick most common emotion
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const mostCommonEmotion = sorted.length ? sorted[0][0] : (trainingData?.conversationHistory?.emotionCounts ? Object.keys(trainingData.conversationHistory.emotionCounts!).sort((a,b) => (trainingData!.conversationHistory.emotionCounts![b]||0)-(trainingData!.conversationHistory.emotionCounts![a]||0))[0] : null)

  // best moment: find a user message with positive label or mentions 'completed'/'finished'/'success'
  const positiveKeywords = ['completed', 'finished', 'did it', 'success', 'proud', 'celebrate']
  // Prefer user messages for best moment, fall back to assistant detections
  let best: Message | null = null
  for (const m of recent.slice().reverse()) {
    if (m.role !== 'user') continue
    const lower = m.content.toLowerCase()
    if (positiveKeywords.some(k => lower.includes(k))) {
      best = m
      break
    }
  }
  if (!best) {
    for (const m of recent.slice().reverse()) {
      if ((m as any).detection?.label === 'happy') { best = m; break }
    }
  }

  // toughest moment: find a user message with negative label or loneliness/hopeless keywords
  const negativeKeywords = ['lonely', 'hopeless', 'sad', 'overwhelmed', 'anxious', 'stress', 'stressed']
  // Prefer user messages for toughest moment, fall back to assistant detections
  let tough: Message | null = null
  for (const m of recent.slice().reverse()) {
    if (m.role !== 'user') continue
    const lower = m.content.toLowerCase()
    if (negativeKeywords.some(k => lower.includes(k))) { tough = m; break }
  }
  if (!tough) {
    for (const m of recent.slice().reverse()) {
      const label = (m as any).detection?.label
      if (label && ['sad','lonely','hopeless','stress','anxiety','anger','confusion'].includes(label)) { tough = m; break }
    }
  }

  // pattern: look for repeated themes in user's messages (overthinking, late-night mentions)
  const patternCandidates: Record<string, number> = {}
  // time-of-day buckets
  const timeBuckets: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  // hour heatmap
  const hourHeatmap = new Array(24).fill(0)
  // previous week range
  const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
  const prevWeekEnd = new Date(weekAgo.getTime())
  const prevWeek = messages.filter(m => new Date(m.timestamp) >= prevWeekStart && new Date(m.timestamp) < prevWeekEnd)
  for (const m of recent) {
    const lower = m.content.toLowerCase()
    if (lower.includes('overthink') || lower.includes('overthinking')) patternCandidates['Overthinking'] = (patternCandidates['Overthinking'] || 0) + 1
    if (lower.includes('night') || lower.includes('late') || lower.includes('midnight')) patternCandidates['Late night rumination'] = (patternCandidates['Late night rumination'] || 0) + 1
    if (lower.includes('lonely') || lower.includes('alone')) patternCandidates['Loneliness'] = (patternCandidates['Loneliness'] || 0) + 1
    // time bucket by message timestamp if available
    try {
      const hour = new Date(m.timestamp).getHours()
      if (!isNaN(hour)) hourHeatmap[hour]++
      if (hour >= 5 && hour < 12) timeBuckets.morning++
      else if (hour >= 12 && hour < 18) timeBuckets.afternoon++
      else if (hour >= 18 && hour < 22) timeBuckets.evening++
      else timeBuckets.night++
    } catch (e) {
      // ignore
    }
  }
  const pattern = Object.keys(patternCandidates).length ? Object.entries(patternCandidates).sort((a,b)=>b[1]-a[1])[0][0] : null

  // If a sizable portion of messages are in the night bucket, surface late-night pattern
  const totalRecent = recent.length || 1
  const nightRatio = timeBuckets.night / totalRecent
  const timePattern = nightRatio >= 0.3 ? 'Late night activity' : null

  // Also detect if a single emotion dominates recent messages (frequency pattern)
  const emotionFreqPattern = (() => {
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1])
    if (!entries.length) return null
    const [label, cnt] = entries[0]
    if (cnt >= 3 || cnt / totalRecent >= 0.4) return `Frequent ${label}`
    return null
  })()

  // week-over-week emotion comparison
  const thisWeekEmotionCounts: Record<string, number> = {}
  const lastWeekEmotionCounts: Record<string, number> = {}
  for (const m of recent) {
    const l = (m as any).detection?.label ?? (m.role === 'user' ? detectEmotionLabel(m.content) : null)
    if (l) thisWeekEmotionCounts[l] = (thisWeekEmotionCounts[l] || 0) + 1
  }
  for (const m of prevWeek) {
    const l = (m as any).detection?.label ?? (m.role === 'user' ? detectEmotionLabel(m.content) : null)
    if (l) lastWeekEmotionCounts[l] = (lastWeekEmotionCounts[l] || 0) + 1
  }

  const emotionsUnion = Array.from(new Set([...Object.keys(thisWeekEmotionCounts), ...Object.keys(lastWeekEmotionCounts)]))
  const emotionComparison: Record<string, { thisWeek: number; lastWeek: number; delta: number }> = {}
  for (const e of emotionsUnion) {
    const t = thisWeekEmotionCounts[e] || 0
    const l = lastWeekEmotionCounts[e] || 0
    emotionComparison[e] = { thisWeek: t, lastWeek: l, delta: t - l }
  }

  const activityComparison = { thisWeek: recent.length, lastWeek: prevWeek.length, delta: recent.length - prevWeek.length }

  // growth suggestions based on most common emotion
  const suggestionMap: Record<string, string> = {
    stress: 'Try a 5-minute breathing break each afternoon and list the top 3 tasks to simplify.',
    anxiety: 'Practice the 5-4-3-2-1 grounding exercise when anxious and try a short evening wind-down.',
    sad: 'Try a 5-minute evening reflection: note one small win and one gentle next step.',
    overthinking: 'Schedule a 10-minute brain dump before bed to clear looping thoughts.',
    lonely: 'Reach out to one person this week for a short check-in or join a small community event.',
    happy: 'Celebrate the win — write down what worked and how to repeat it.',
    hopeless: 'If feelings of hopelessness persist, consider speaking to a professional; try a small, manageable task to start.',
    anger: 'Take a 5-minute pause and practice box-breathing before responding to triggers.',
    confusion: 'Try mapping out the problem visually: one page, three columns (facts, feelings, next steps).'
  }

  const growthSuggestion = (mostCommonEmotion && suggestionMap[mostCommonEmotion]) ? suggestionMap[mostCommonEmotion] : (pattern ? `Consider a small practice to address this pattern: ${pattern}` : 'Try a 5-minute evening reflection')

  const bestMoment = best ? `${best.content} — ${dayOfWeek(new Date(best.timestamp), locale)}` : null
  const toughestMoment = tough ? `${tough.content} — ${dayOfWeek(new Date(tough.timestamp), locale)}` : null

  return {
    mostCommonEmotion: mostCommonEmotion ?? null,
    bestMoment,
    toughestMoment,
    pattern,
    growthSuggestion,
    hourHeatmap,
    weekComparison: { emotions: emotionComparison, activity: activityComparison },
    timePattern,
    emotionFreqPattern
  }
}

export default generateWeeklyReflection

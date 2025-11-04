import { DayPlan, Habit, MoodData, Reflection, Task } from '@/types'

interface EnergySignals {
  mood: MoodData
  tasks: Task[]
  habits: Habit[]
  dayPlan?: DayPlan
  reflections: Reflection[]
  now?: Date
}

export interface EnergyInsight {
  level: number
  baseline: number
  contributions: {
    plan: number
    completion: number
    habits: number
    recovery: number
    fatigue: number
  }
  clarity: number
  trend: 'rising' | 'stable' | 'falling'
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getTodaysReflectionMood = (reflections: Reflection[], now: Date) => {
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(startOfDay.getDate() + 1)

  const todayReflections = reflections.filter((reflection) => {
    const timestamp = new Date(reflection.timestamp)
    return timestamp >= startOfDay && timestamp < endOfDay
  })

  if (!todayReflections.length) {
    return 0
  }

  const weights: Record<string, number> = {
    calm: 8,
    empathetic: 6,
    motivated: 10,
    rest: 4,
  }

  const total = todayReflections.reduce((sum, reflection) => {
    return sum + (weights[reflection.emotion] ?? 6)
  }, 0)

  const normalised = total / todayReflections.length
  return clamp((normalised - 5) * 4, -12, 18)
}

const deriveCompletionScore = (tasks: Task[], dayPlan?: DayPlan) => {
  if (dayPlan && dayPlan.priorities.length) {
    const total = dayPlan.priorities.length
    const completed = dayPlan.priorities.filter((priority) => priority.completed).length
    const ratio = completed / total
    return ratio * 28
  }

  if (!tasks.length) {
    return 0
  }

  const completed = tasks.filter((task) => task.completed).length
  const ratio = completed / tasks.length
  return ratio * 22
}

const deriveHabitScore = (habits: Habit[]) => {
  if (!habits.length) {
    return 0
  }

  const averageMomentum = habits.reduce((sum, habit) => {
    const normalizedStreak = habit.longestStreak
      ? clamp(habit.streak / habit.longestStreak, 0, 1)
      : clamp(habit.streak / 7, 0, 1)
    const difficultyMultiplier = habit.difficulty === 'hard' ? 1.15 : habit.difficulty === 'medium' ? 1 : 0.85
    return sum + normalizedStreak * difficultyMultiplier
  }, 0) / habits.length

  return averageMomentum * 24
}

const deriveRecoveryScore = (dayPlan?: DayPlan) => {
  if (!dayPlan?.timeBlocks?.length) {
    return 0
  }

  const totalBlocks = dayPlan.timeBlocks.length
  const recoveryBlocks = dayPlan.timeBlocks.filter((block) => block.type === 'break' || block.type === 'rest')
  const ratio = recoveryBlocks.length / totalBlocks

  // Optimal rest ratio around 0.25
  const distanceFromOptimal = Math.abs(ratio - 0.25)
  return clamp((0.25 - distanceFromOptimal) * 40, -20, 16)
}

const deriveFatiguePenalty = (dayPlan?: DayPlan, now: Date = new Date()) => {
  if (!dayPlan?.timeBlocks?.length) {
    return 0
  }

  const currentTime = now.getHours() + now.getMinutes() / 60
  const lateBlocks = dayPlan.timeBlocks.filter((block) => {
    const [hour] = block.endTime.split(':').map(Number)
    return hour >= 21 && block.completed === false
  })

  const fatigueFromLateWork = clamp(lateBlocks.length * 4, 0, 12)
  const longStretch = dayPlan.timeBlocks.some((block) => {
    const [startHour, startMinute] = block.startTime.split(':').map(Number)
    const [endHour, endMinute] = block.endTime.split(':').map(Number)
    const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)
    return duration >= 2.5 && block.type !== 'break' && block.type !== 'rest'
  })

  const fatigueFromStretch = longStretch ? 6 : 0
  const nearEndOfDay = currentTime > 18 ? 4 : 0

  return clamp(fatigueFromLateWork + fatigueFromStretch + nearEndOfDay, 0, 20)
}

const deriveBaseline = (mood: MoodData, dayPlan?: DayPlan) => {
  if (dayPlan?.energyLevel != null) {
    return clamp((dayPlan.energyLevel * 0.7) + (mood.energyLevel * 0.3), 0, 100)
  }
  return mood.energyLevel || 50
}

export const deriveEnergyLevel = ({
  mood,
  tasks,
  habits,
  dayPlan,
  reflections,
  now = new Date(),
}: EnergySignals): EnergyInsight => {
  const baseline = deriveBaseline(mood, dayPlan)
  const completion = deriveCompletionScore(tasks, dayPlan)
  const habitMomentum = deriveHabitScore(habits)
  const recovery = deriveRecoveryScore(dayPlan)
  const reflectionInfluence = getTodaysReflectionMood(reflections, now)
  const fatigue = deriveFatiguePenalty(dayPlan, now)

  const contributions = {
    plan: clamp((baseline - 50) * 0.6, -18, 18),
    completion,
    habits: habitMomentum,
    recovery,
    fatigue,
  }

  const rawEnergy = baseline + contributions.plan + completion + habitMomentum + recovery + reflectionInfluence - fatigue
  const level = clamp(Math.round(rawEnergy), 0, 100)
  const clarityRaw = baseline * 0.25 + completion * 0.9 + habitMomentum * 0.8 - fatigue * 0.6 + 45
  const clarity = clamp(Math.round(clarityRaw), 10, 95)

  let trend: 'rising' | 'stable' | 'falling' = 'stable'
  if (level > mood.energyLevel + 2) {
    trend = 'rising'
  } else if (level < mood.energyLevel - 2) {
    trend = 'falling'
  }

  return {
    level,
    baseline,
    contributions,
    clarity,
    trend,
  }
}

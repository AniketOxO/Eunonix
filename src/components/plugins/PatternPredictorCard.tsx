import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

interface ForecastInsight {
  id: string
  title: string
  detail: string
  confidence: number
}

const toDate = (value: Date | string | number | null | undefined) => {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const daysBetween = (startInput: Date | string | number | null | undefined, endInput: Date | string | number | null | undefined) => {
  const start = toDate(startInput)
  const end = toDate(endInput)
  if (!start || !end) return 0
  const diff = end.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const getAverage = (values: number[]) => {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const buildForecast = (forecastDays: number, metrics: ReturnType<typeof computeMetrics>) => {
  const insights: ForecastInsight[] = []

  if (metrics.energyTrend > 5) {
    insights.push({
      id: 'energy-surge',
      title: 'Energy climb expected',
      detail: `Energy has trended up ${metrics.energyTrend.toFixed(1)} pts. Forecast suggests prime focus windows between ${metrics.focusWindows.morning}% and ${metrics.focusWindows.midday}% efficiency for deep work sessions.`,
      confidence: 0.78,
    })
  } else if (metrics.energyTrend < -5) {
    insights.push({
      id: 'energy-dip',
      title: 'Energy dip incoming',
      detail: 'Projected 4-day decline. Plan restorative blocks and consider switching difficult priorities to earlier slots.',
      confidence: 0.72,
    })
  }

  if (metrics.habitMomentum > 0.6) {
    insights.push({
      id: 'habit-compound',
      title: 'Habit sequence compounding',
      detail: 'Linked habits show strong streak behaviour. Stack habit reflections immediately after completion to lock in the gains.',
      confidence: 0.81,
    })
  } else if (metrics.habitMomentum < 0.3) {
    insights.push({
      id: 'habit-reset',
      title: 'Streak reset recommended',
      detail: 'Momentum score low. Try a 3-day sprint with smaller checkpoints to rebuild confidence.',
      confidence: 0.69,
    })
  }

  if (metrics.reflectionCadence > 0.5) {
    insights.push({
      id: 'reflection-sync',
      title: 'Reflection cadence steady',
      detail: 'Reflection pattern predicts higher clarity by midweek. Schedule a strategy review when clarity crosses 68%.',
      confidence: 0.74,
    })
  }

  if (metrics.goalVelocity > 0.45) {
    insights.push({
      id: 'goal-velocity',
      title: 'Goal velocity accelerating',
      detail: `${(metrics.goalVelocity * 100).toFixed(0)}% of active systems trending upward. Consider unlocking a new milestone by day ${Math.min(forecastDays, 6)}.`,
      confidence: 0.77,
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: 'baseline',
      title: 'Stable pattern detected',
      detail: 'No major volatility signals. Maintain current rituals and watch for micro-shifts in habit completion for early signals.',
      confidence: 0.55,
    })
  }

  return insights
}

const computeMetrics = (appStore: ReturnType<typeof useAppStore.getState>) => {
  const { dayPlans, mood, habits, reflections, goals } = appStore

  const plans = Object.values(dayPlans)
  const sortedByDate = [...plans].sort((a, b) => {
    const aDate = toDate(a?.date)
    const bDate = toDate(b?.date)
    if (!aDate || !bDate) return 0
    return aDate.getTime() - bDate.getTime()
  })

  const energyValues = sortedByDate.map((plan) => plan.energyLevel ?? mood.energyLevel)
  const clarityValues = sortedByDate.map((plan) => plan.completionRate ?? mood.clarity)
  const energyTrend = energyValues.length >= 2 ? energyValues[energyValues.length - 1] - energyValues[0] : 0
  const clarityTrend = clarityValues.length >= 2 ? clarityValues[clarityValues.length - 1] - clarityValues[0] : 0

  const now = new Date()
  const recentReflections = reflections.filter((reflection) => daysBetween(reflection.timestamp, now) <= 14)
  const reflectionCadence = recentReflections.length / 14

  const activeHabits = habits.filter((habit) => {
    const createdAt = toDate(habit.createdAt)
    return createdAt ? daysBetween(createdAt, now) >= 0 : false
  })
  const habitMomentum = activeHabits.length === 0
    ? 0
    : getAverage(activeHabits.map((habit) => Math.min(1, habit.streak / Math.max(7, habit.longestStreak || 1))))

  const energyRecent = energyValues.slice(-3)
  const clarityRecent = clarityValues.slice(-3)

  const focusWindows = {
    morning: Math.round((energyRecent.reduce((sum, value) => sum + value, 0) / Math.max(energyRecent.length, 1)) || mood.energyLevel),
    midday: Math.round((clarityRecent.reduce((sum, value) => sum + value, 0) / Math.max(clarityRecent.length, 1)) || mood.clarity),
    evening: Math.round(((energyValues[energyValues.length - 1] ?? mood.energyLevel) + (clarityValues[clarityValues.length - 1] ?? mood.clarity)) / 2),
  }

  const goalVelocity = goals.length === 0 ? 0 : getAverage(goals.map((goal) => goal.progress / 100))

  return {
    energyTrend,
    clarityTrend,
    reflectionCadence,
    habitMomentum,
    focusWindows,
    goalVelocity,
  }
}

interface PatternPredictorCardProps {
  highlighted?: boolean
}

export const PatternPredictorCard = ({ highlighted = false }: PatternPredictorCardProps) => {
  const appState = useAppStore()
  const [forecastDays, setForecastDays] = useState<7 | 14>(7)
  const metrics = useMemo(() => computeMetrics(appState), [appState.dayPlans, appState.mood, appState.habits, appState.reflections, appState.goals])
  const [insights, setInsights] = useState(() => buildForecast(forecastDays, metrics))

  useEffect(() => {
    setInsights(buildForecast(forecastDays, metrics))
  }, [metrics, forecastDays])

  const regenerate = (days: 7 | 14) => {
    setForecastDays(days)
    setInsights(buildForecast(days, computeMetrics(useAppStore.getState())))
  }

  return (
    <motion.div
      className={`bg-white/55 backdrop-blur-md rounded-2xl border border-ink-200/30 p-6 flex flex-col gap-5 ${highlighted ? 'ring-2 ring-lilac-400/70 shadow-xl animate-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Pattern Predictor</p>
          <h3 className="text-xl font-medium text-ink-900">Forward-looking emotional analytics</h3>
          <p className="text-sm text-ink-500 mt-1 max-w-md">Generates short-term forecasts using your habits, plans, and reflections to surface the next best moves.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/70 border border-ink-200/40 rounded-xl p-2 text-xs">
          <button
            onClick={() => regenerate(7)}
            className={`px-3 py-1.5 rounded-lg font-medium ${forecastDays === 7 ? 'bg-ink-900 text-white shadow' : 'text-ink-500 hover:text-ink-700'}`}
          >
            7 day
          </button>
          <button
            onClick={() => regenerate(14)}
            className={`px-3 py-1.5 rounded-lg font-medium ${forecastDays === 14 ? 'bg-ink-900 text-white shadow' : 'text-ink-500 hover:text-ink-700'}`}
          >
            14 day
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/70 border border-ink-200/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Trend signals</p>
          <ul className="space-y-2 text-xs text-ink-500">
            <li className="flex items-center justify-between">
              <span>Energy change</span>
              <span className="font-semibold text-ink-700">{metrics.energyTrend >= 0 ? '+' : ''}{metrics.energyTrend.toFixed(1)} pts</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Clarity change</span>
              <span className="font-semibold text-ink-700">{metrics.clarityTrend >= 0 ? '+' : ''}{metrics.clarityTrend.toFixed(1)} pts</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Reflection cadence</span>
              <span className="font-semibold text-ink-700">{Math.round(metrics.reflectionCadence * 7)} notes / week</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Habit momentum score</span>
              <span className="font-semibold text-ink-700">{(metrics.habitMomentum * 100).toFixed(0)}%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Goal velocity</span>
              <span className="font-semibold text-ink-700">{(metrics.goalVelocity * 100).toFixed(0)}%</span>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white/70 border border-ink-200/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Focus windows</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-ink-500">
            {(['morning', 'midday', 'evening'] as const).map((slot) => (
              <div key={slot} className="rounded-xl bg-white/60 border border-ink-200/30 p-3 text-center">
                <p className="text-[11px] uppercase tracking-widest text-ink-400">{slot}</p>
                <p className="text-lg font-semibold text-ink-700">{metrics.focusWindows[slot]}%</p>
                <p className="mt-1">efficiency</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => regenerate(forecastDays)}
            className="mt-3 w-full px-4 py-2 rounded-xl text-sm font-medium text-lilac-600 hover:text-lilac-700"
          >
            Refresh with latest data →
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 border border-ink-200/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Predicted scenarios</p>
        <AnimatePresence initial={false}>
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-3 last:mb-0 rounded-xl bg-white/60 border border-ink-200/30 p-3"
            >
              <div className="flex items-center justify-between text-sm text-ink-700 mb-1">
                <span className="font-medium">{insight.title}</span>
                <span className="text-xs text-ink-400">{Math.round(insight.confidence * 100)}% confidence</span>
              </div>
              <p className="text-xs text-ink-500 leading-relaxed">{insight.detail}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

const EMOTION_WEIGHT: Record<string, number> = {
  calm: 0.4,
  motivated: 0.75,
  empathetic: 0.6,
  rest: 0.3
}

const EMOTION_COLOR: Record<string, string> = {
  calm: '#60a5fa',
  motivated: '#f97316',
  empathetic: '#ec4899',
  rest: '#94a3b8'
}

const DAYS_OPTIONS = [7, 14, 30] as const

const formatDateLabel = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    weekday: 'short'
  })
}

const noise = (seed: number) => {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

interface EmotionChartsCardProps {
  highlighted?: boolean
}

export const EmotionChartsCard = ({ highlighted = false }: EmotionChartsCardProps) => {
  const { mood, dayPlans, goals, reflections, habits } = useAppStore()
  const [days, setDays] = useState<(typeof DAYS_OPTIONS)[number]>(7)

  const trend = useMemo(() => {
    const today = new Date()
    return Array.from({ length: days }).map((_, index) => {
      const day = new Date(today)
      day.setDate(today.getDate() - (days - 1 - index))
      const key = day.toISOString().split('T')[0]
      const plan = dayPlans[key]
      const energyBase = plan?.energyLevel ?? mood.energyLevel
      const clarityBase = plan?.completionRate ?? mood.clarity
      const dominant = plan?.focus?.includes('rest') ? 'rest' : mood.dominantEmotion
      const seed = day.getDate() * (index + 3)
      const energy = Math.min(100, Math.max(15, energyBase + Math.round((noise(seed) - 0.5) * 20)))
      const clarity = Math.min(100, Math.max(20, clarityBase + Math.round((noise(seed + 42) - 0.5) * 18)))
      return {
        label: formatDateLabel(day),
        energy,
        clarity,
        emotion: dominant
      }
    })
  }, [dayPlans, mood.clarity, mood.dominantEmotion, mood.energyLevel, days])

  const energySlope = trend[trend.length - 1].energy - trend[0].energy
  const claritySlope = trend[trend.length - 1].clarity - trend[0].clarity

  const emotionDistribution = useMemo(() => {
    return trend.reduce<Record<string, number>>((acc, item) => {
      acc[item.emotion] = (acc[item.emotion] ?? 0) + 1
      return acc
    }, {})
  }, [trend])

  const topGoals = useMemo(() => {
    return [...goals]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 4)
  }, [goals])

  const consistentHabit = useMemo(() => {
    return [...habits]
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3)
  }, [habits])

  const insightLines = useMemo(() => {
    const lines: string[] = []
    if (energySlope > 6) {
      lines.push('Energy trend up by ' + energySlope.toFixed(0) + ' points. Schedule deep work earlier in the day to ride the wave.')
    } else if (energySlope < -6) {
      lines.push('Energy dipping. Pair high-impact tasks with mini-reset breaks to stabilise focus.')
    } else {
      lines.push('Energy holding steady. Maintain your current recovery rhythm.')
    }

    if (claritySlope > 6) {
      lines.push('Clarity is climbing—reflection logs are paying off. Capture insights while they are fresh.')
    } else if (claritySlope < -6) {
      lines.push('Clarity wobble detected. Revisit weekly priorities to reduce context switching.')
    } else {
      lines.push('Clarity stable. Keep your daily review ritual light and consistent.')
    }

    if (reflections.length > 0) {
      const lastReflection = reflections[0]
      lines.push(`Latest reflection (${new Date(lastReflection.timestamp).toLocaleDateString()}): ${lastReflection.content.slice(0, 80)}${lastReflection.content.length > 80 ? '…' : ''}`)
    }

    return lines
  }, [claritySlope, energySlope, reflections])

  const buildPath = (key: 'energy' | 'clarity') => {
    const width = 420
    const height = 140
    const maxVal = 100
    const points = trend.map((item, index) => {
      const x = (width / (trend.length - 1 || 1)) * index
      const y = height - (item[key] / maxVal) * height
      return `${index === 0 ? 'M' : 'L'}${x},${y}`
    })
    return { path: points.join(' '), width, height }
  }

  const energyPath = buildPath('energy')
  const clarityPath = buildPath('clarity')

  return (
    <motion.div
      className={`bg-white/55 backdrop-blur-md rounded-2xl border border-ink-200/30 p-6 flex flex-col gap-6 ${highlighted ? 'ring-2 ring-lilac-400/70 shadow-xl' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Emotion Charts Pro</p>
          <h3 className="text-xl font-medium text-ink-900">Multi-layer Awareness Dashboard</h3>
        </div>
        <div className="flex items-center gap-2">
          {DAYS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setDays(option)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${option === days ? 'bg-ink-900 text-white shadow-md' : 'bg-white/70 text-ink-600 hover:bg-white'}`}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white/70 border border-ink-200/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-700">Energy & Clarity</p>
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ink-500"></span> Energy</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lilac-500"></span> Clarity</div>
            </div>
          </div>
          <div className="overflow-hidden">
            <svg width={energyPath.width} height={energyPath.height} viewBox={`0 0 ${energyPath.width} ${energyPath.height}`} className="w-full">
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <path d={`${energyPath.path}`}
                fill="none"
                stroke="#4338ca"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <path d={`${energyPath.path} L${energyPath.width},${energyPath.height} L0,${energyPath.height} Z`}
                fill="url(#energyGradient)"
                opacity={0.18}
              />
              <path d={clarityPath.path}
                fill="none"
                stroke="#ec4899"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeDasharray="8 6"
              />
              {trend.map((point, index) => {
                const x = (energyPath.width / (trend.length - 1 || 1)) * index
                const yEnergy = energyPath.height - (point.energy / 100) * energyPath.height
                return (
                  <circle key={`point-${index}`} cx={x} cy={yEnergy} r={3} fill="#4338ca" />
                )
              })}
            </svg>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-ink-500">
            {trend.map((point) => (
              <span key={point.label} className="flex-1 text-center">
                {point.label.substring(0, 2)}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/70 border border-ink-200/30 rounded-2xl p-4">
            <p className="text-sm font-semibold text-ink-700 mb-3">Dominant emotions</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(emotionDistribution).map(([emotion, value]) => (
                <div key={emotion} className="rounded-xl bg-white/60 border border-ink-200/30 p-3">
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span className="font-medium text-ink-700 capitalize">{emotion}</span>
                    <span>{((value / trend.length) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(value / trend.length) * 100}%`,
                        backgroundColor: EMOTION_COLOR[emotion] ?? '#94a3b8'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 border border-ink-200/30 rounded-2xl p-4">
            <p className="text-sm font-semibold text-ink-700 mb-3">Top systems in motion</p>
            <div className="space-y-3">
              {topGoals.length === 0 && (
                <p className="text-xs text-ink-500">Create your first goal to track progress here.</p>
              )}
              {topGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span className="font-medium text-ink-700">{goal.title}</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="h-2 mt-2 rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lilac-400 to-ink-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  {goal.emotionalWhy && (
                    <p className="mt-1 text-[11px] text-ink-400">{goal.emotionalWhy}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/70 border border-ink-200/30 rounded-2xl p-4">
          <p className="text-sm font-semibold text-ink-700 mb-3">Momentum notes</p>
          <ul className="space-y-2 text-xs text-ink-500">
            {insightLines.map((line, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-lilac-500 mt-0.5">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/70 border border-ink-200/30 rounded-2xl p-4">
          <p className="text-sm font-semibold text-ink-700 mb-3">Habits on streak</p>
          {consistentHabit.length === 0 ? (
            <p className="text-xs text-ink-500">Mark at least one habit complete to surface streak insights.</p>
          ) : (
            <div className="space-y-3">
              {consistentHabit.map((habit) => {
                const score = Math.min(100, habit.streak * 10)
                return (
                  <div key={habit.id} className="flex items-center justify-between text-xs text-ink-500">
                    <div>
                      <p className="font-medium text-ink-700">{habit.title}</p>
                      <p className="text-[11px] text-ink-400">{habit.streak} day streak • Longest {habit.longestStreak} days</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-ink-900 text-white">{score}% consistency</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/Button'
import { readJSON } from '@/utils/storage'

// Types
interface TimelineEntry {
  id: string
  date: Date
  type: 'journal' | 'goal' | 'habit' | 'milestone' | 'reflection'
  title: string
  content: string
  emotion?: 'joy' | 'calm' | 'growth' | 'struggle' | 'breakthrough' | 'peace'
  tags: string[]
  intensity: number // 1-10
}

interface LifeArc {
  id: string
  name: string
  phase: string
  startDate: Date
  endDate: Date
  theme: string
  description: string
  color: string
  keyMoments: string[] // entry IDs
  emotionalPattern: string
  growthSummary: string
}

interface Chapter {
  id: string
  title: string
  period: string
  entries: TimelineEntry[]
  arc: LifeArc
  storyNarrative: string
}

export default function LifeTimeline() {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<'timeline' | 'arcs' | 'story' | 'export'>('timeline')
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([])
  const [lifeArcs, setLifeArcs] = useState<LifeArc[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedArc, setSelectedArc] = useState<string | null>(null)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [playingStory, setPlayingStory] = useState(false)
  const [filterEmotion, setFilterEmotion] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'all' | '3m' | '6m' | '1y'>('all')

  // Load and analyze data
  useEffect(() => {
    loadTimelineData()
  }, [])

  useEffect(() => {
    if (timelineEntries.length > 0) {
      const arcs = detectLifeArcs(timelineEntries)
      setLifeArcs(arcs)
      const storyChapters = generateStoryChapters(timelineEntries, arcs)
      setChapters(storyChapters)
    }
  }, [timelineEntries])

  const loadTimelineData = () => {
    // Load persisted timeline inputs (journal, goals, habits, etc.)
    const journalData = readJSON<unknown>('eunonix-journal', [])

    const entries: TimelineEntry[] = []

    // Parse journal entries
    if (Array.isArray(journalData)) {
      journalData.forEach((entry: any) => {
        entries.push({
          id: `journal-${entry.id}`,
          date: new Date(entry.date),
          type: 'journal',
          title: entry.title || 'Journal Entry',
          content: entry.content,
          emotion: mapEmotionToCategory(entry.emotions?.[0] || entry.emotion),
          tags: entry.tags || [],
          intensity: entry.emotions?.length ? 6 : entry.emotion ? getEmotionIntensity(entry.emotion) : 5,
        })
      })
    } else if (journalData && typeof journalData === 'object' && Array.isArray((journalData as any).entries)) {
      ;(journalData as any).entries.forEach((entry: any) => {
        entries.push({
          id: `journal-${entry.id}`,
          date: new Date(entry.date),
          type: 'journal',
          title: entry.title || 'Journal Entry',
          content: entry.content,
          emotion: mapEmotionToCategory(entry.emotion),
          tags: entry.tags || [],
          intensity: entry.emotion ? getEmotionIntensity(entry.emotion) : 5,
        })
      })
    }

    // Sort by date
    entries.sort((a, b) => a.date.getTime() - b.date.getTime())
    setTimelineEntries(entries)
  }

  const EMOTION_CATEGORY_MAP: Record<string, TimelineEntry['emotion']> = {
    happy: 'joy',
    joy: 'joy',
    excited: 'joy',
    gratitude: 'joy',
    grateful: 'joy',
    energized: 'joy',
    energetic: 'joy',
    uplifted: 'joy',

    peaceful: 'calm',
    calm: 'calm',
    content: 'calm',
    balanced: 'calm',
    reflective: 'calm',
    restful: 'calm',

    inspired: 'growth',
    motivated: 'growth',
    creative: 'growth',
    creativity: 'growth',
    learning: 'growth',
    focus: 'growth',

    anxious: 'struggle',
    anxiety: 'struggle',
    stressed: 'struggle',
    stress: 'struggle',
    overwhelmed: 'struggle',
    frustrated: 'struggle',
    tired: 'struggle',
    exhausted: 'struggle',
    sad: 'struggle',

    empowered: 'breakthrough',
    accomplished: 'breakthrough',
    breakthrough: 'breakthrough',

    serene: 'peace',
    harmony: 'peace',
    peace: 'peace',
    aligned: 'peace',
  }

  const EMOTION_INTENSITY_MAP: Record<string, number> = {
    excited: 9,
    energized: 9,
    energetic: 9,
    joy: 8,
    happy: 8,
    gratitude: 8,
    grateful: 8,
    inspired: 9,
    creative: 7,
    creativity: 7,
    motivated: 8,
    focus: 8,
    learning: 7,
    anxious: 8,
    anxiety: 8,
    stressed: 8,
    stress: 7,
    overwhelmed: 8,
    frustrated: 7,
    tired: 6,
    exhausted: 7,
    sad: 7,
    empowered: 10,
    accomplished: 9,
    breakthrough: 10,
    peaceful: 6,
    peace: 6,
    calm: 6,
    content: 6,
    balanced: 6,
    reflective: 5,
    serene: 6,
    harmony: 6,
    aligned: 6,
    restful: 5,
    uplifted: 8,
  }

  const mapEmotionToCategory = (emotion: string | undefined | null): TimelineEntry['emotion'] => {
    if (!emotion) {
      return 'calm'
    }

    const normalized = emotion.trim().toLowerCase()
    if (normalized in EMOTION_CATEGORY_MAP) {
      return EMOTION_CATEGORY_MAP[normalized]
    }

    // Fall back to base categories using keyword detection
    if (normalized.includes('anx') || normalized.includes('stress') || normalized.includes('overwhelm')) {
      return 'struggle'
    }
    if (normalized.includes('joy') || normalized.includes('happy') || normalized.includes('energy')) {
      return 'joy'
    }
    if (normalized.includes('inspir') || normalized.includes('creativ') || normalized.includes('grow')) {
      return 'growth'
    }
    if (normalized.includes('peace') || normalized.includes('calm')) {
      return 'calm'
    }

    return 'calm'
  }

  const getEmotionIntensity = (emotion: string | undefined | null): number => {
    if (!emotion) {
      return 5
    }

    const normalized = emotion.trim().toLowerCase()
    if (normalized in EMOTION_INTENSITY_MAP) {
      return EMOTION_INTENSITY_MAP[normalized]
    }

    if (normalized.includes('anx') || normalized.includes('stress')) {
      return 8
    }
    if (normalized.includes('joy') || normalized.includes('energy') || normalized.includes('happy')) {
      return 8
    }
    if (normalized.includes('inspir') || normalized.includes('creativ')) {
      return 7
    }
    if (normalized.includes('tired') || normalized.includes('rest')) {
      return 5
    }

    return 5
  }

  // AI: Detect life arcs from timeline data
  const detectLifeArcs = (entries: TimelineEntry[]): LifeArc[] => {
    if (entries.length === 0) return []

    const arcs: LifeArc[] = []
    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Group entries into phases based on emotional patterns and time gaps
    const phases: TimelineEntry[][] = []
    let currentPhase: TimelineEntry[] = []

  sortedEntries.forEach((entry) => {
      if (currentPhase.length === 0) {
        currentPhase.push(entry)
        return
      }

      const lastEntry = currentPhase[currentPhase.length - 1]
      const daysDiff = (entry.date.getTime() - lastEntry.date.getTime()) / (1000 * 60 * 60 * 24)

      // Start new phase if gap > 45 days or emotional shift
      if (daysDiff > 45 || currentPhase.length >= 5) {
        phases.push([...currentPhase])
        currentPhase = [entry]
      } else {
        currentPhase.push(entry)
      }
    })

    if (currentPhase.length > 0) {
      phases.push(currentPhase)
    }

    // Analyze each phase to create arcs
    phases.forEach((phaseEntries, index) => {
      const emotions = phaseEntries.map(e => e.emotion).filter(Boolean)
      const dominantEmotion = getMostFrequent(emotions)
      const avgIntensity = phaseEntries.reduce((sum, e) => sum + e.intensity, 0) / phaseEntries.length

      const arcThemes = analyzePhaseTheme(phaseEntries, dominantEmotion || 'calm')
      
      arcs.push({
        id: `arc-${index}`,
        name: arcThemes.name,
        phase: `Phase ${index + 1}`,
        startDate: phaseEntries[0].date,
        endDate: phaseEntries[phaseEntries.length - 1].date,
        theme: arcThemes.theme,
        description: arcThemes.description,
        color: getArcColor(dominantEmotion || 'calm'),
        keyMoments: phaseEntries.slice(0, 3).map(e => e.id),
        emotionalPattern: `${dominantEmotion || 'balanced'} (intensity: ${avgIntensity.toFixed(1)}/10)`,
        growthSummary: arcThemes.growthSummary
      })
    })

    return arcs
  }

  const getMostFrequent = (arr: any[]): any => {
    const counts: Record<string, number> = {}
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1
    })
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, arr[0])
  }

  const analyzePhaseTheme = (entries: TimelineEntry[], emotion: string) => {
  const tags = entries.flatMap(e => e.tags)
  const topTags = getMostFrequentN(tags, 3)

    const themes: Record<string, any> = {
      'struggle': {
        name: 'The Struggle',
        theme: 'Facing challenges and inner resistance',
        description: 'A period of confronting difficult truths and pushing through discomfort.',
        growthSummary: 'Building resilience through adversity'
      },
      'growth': {
        name: 'Expansion',
        theme: 'Learning and evolving',
        description: 'A time of rapid personal development and new insights.',
        growthSummary: 'Expanding awareness and capabilities'
      },
      'joy': {
        name: 'Flourishing',
        theme: 'Celebration and achievement',
        description: 'Experiencing the fruits of your efforts and celebrating wins.',
        growthSummary: 'Reaping rewards and building momentum'
      },
      'calm': {
        name: 'Integration',
        theme: 'Finding balance and peace',
        description: 'Settling into new patterns and integrating changes.',
        growthSummary: 'Consolidating growth and finding equilibrium'
      },
      'breakthrough': {
        name: 'Awakening',
        theme: 'Major shifts and revelations',
        description: 'Experiencing profound insights and transformative moments.',
        growthSummary: 'Breaking through old limitations'
      },
      'peace': {
        name: 'Harmony',
        theme: 'Deep acceptance and alignment',
        description: 'Living in flow and authentic expression.',
        growthSummary: 'Embodying transformation and wisdom'
      }
    }

    const baseTheme = themes[emotion] || themes['calm']

    if (topTags.length === 0) {
      return baseTheme
    }

    return {
      ...baseTheme,
      description: `${baseTheme.description} Key focuses: ${topTags.join(', ')}.`
    }
  }

  const getMostFrequentN = (arr: string[], n: number): string[] => {
    const counts: Record<string, number> = {}
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([key]) => key)
  }

  const getArcColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      'joy': 'from-yellow-400 via-orange-300 to-pink-400',
      'calm': 'from-blue-300 via-cyan-200 to-teal-300',
      'growth': 'from-green-400 via-emerald-300 to-lime-400',
      'struggle': 'from-purple-400 via-violet-300 to-indigo-400',
      'breakthrough': 'from-pink-400 via-rose-300 to-red-400',
      'peace': 'from-indigo-300 via-purple-200 to-pink-300'
    }
    return colors[emotion] || colors['calm']
  }

  // Generate story chapters
  const generateStoryChapters = (entries: TimelineEntry[], arcs: LifeArc[]): Chapter[] => {
    return arcs.map((arc, index) => {
      const arcEntries = entries.filter(e => 
        e.date >= arc.startDate && e.date <= arc.endDate
      )

      const narrative = generateNarrative(arc, arcEntries)

      return {
        id: `chapter-${index}`,
        title: `Chapter ${index + 1}: ${arc.name}`,
        period: formatDateRange(arc.startDate, arc.endDate),
        entries: arcEntries,
        arc,
        storyNarrative: narrative
      }
    })
  }

  const generateNarrative = (arc: LifeArc, entries: TimelineEntry[]): string => {
    const start = formatDate(arc.startDate)
    const end = formatDate(arc.endDate)
    const duration = Math.floor((arc.endDate.getTime() - arc.startDate.getTime()) / (1000 * 60 * 60 * 24))

    const keyMoment = entries[0]
    
    return `${start} — ${end} (${duration} days)\n\n${arc.description}\n\nThis chapter began with "${keyMoment?.title}" and unfolded as a journey of ${arc.theme.toLowerCase()}. Through ${entries.length} moments of reflection and growth, a pattern emerged: ${arc.emotionalPattern}.\n\n${arc.growthSummary}.`
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatDateRange = (start: Date, end: Date): string => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${startStr} – ${endStr}`
  }

  // Story playback
  const handlePlayStory = () => {
    setPlayingStory(true)
    setCurrentChapter(0)
    setActiveView('story')
  }

  const handleNextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1)
    } else {
      setPlayingStory(false)
    }
  }

  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1)
    }
  }

  // Export
  const handleExport = () => {
    const firstEntryDate = timelineEntries[0]?.date
    const totalDays = firstEntryDate
      ? Math.max(0, Math.floor((new Date().getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0
    const dominantEmotion = timelineEntries.length > 0
      ? getMostFrequent(timelineEntries.map(e => e.emotion))
      : 'N/A'

    const autobiography = {
      title: 'My Life Story',
      subtitle: 'A Digital Autobiography',
      generatedDate: new Date().toISOString(),
      totalEntries: timelineEntries.length,
      lifeArcs: lifeArcs.map(arc => ({
        name: arc.name,
        phase: arc.phase,
        period: formatDateRange(arc.startDate, arc.endDate),
        theme: arc.theme,
        description: arc.description,
        emotionalPattern: arc.emotionalPattern,
        growthSummary: arc.growthSummary
      })),
      chapters: chapters.map(chapter => ({
        title: chapter.title,
        period: chapter.period,
        narrative: chapter.storyNarrative,
        moments: chapter.entries.map(e => ({
          date: formatDate(e.date),
          title: e.title,
          content: e.content,
          emotion: e.emotion,
          tags: e.tags
        }))
      })),
      statistics: {
        totalDays,
        totalPhases: lifeArcs.length,
        dominantEmotion,
        topTags: getMostFrequentN(timelineEntries.flatMap(e => e.tags), 5)
      }
    }

    const blob = new Blob([JSON.stringify(autobiography, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-life-story-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getEmotionColor = (emotion?: string) => {
    const colors: Record<string, string> = {
      'joy': 'bg-gradient-to-r from-yellow-400 to-orange-400',
      'calm': 'bg-gradient-to-r from-blue-400 to-cyan-400',
      'growth': 'bg-gradient-to-r from-green-400 to-emerald-400',
      'struggle': 'bg-gradient-to-r from-purple-400 to-violet-400',
      'breakthrough': 'bg-gradient-to-r from-pink-400 to-rose-400',
      'peace': 'bg-gradient-to-r from-indigo-400 to-purple-400'
    }
    return colors[emotion || 'calm'] || colors['calm']
  }

  const filteredEntries = timelineEntries.filter(entry => {
    if (filterEmotion && entry.emotion !== filterEmotion) return false
    
    if (timeRange !== 'all') {
      const now = new Date()
      const monthsAgo = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12
      const cutoff = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate())
      if (entry.date < cutoff) return false
    }
    
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-lilac-50 to-golden-50">
      {/* Header */}
      <div className="border-b border-ink-100/10 bg-white/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <div>
                <h1 className="text-2xl font-light text-ink-900">Life Evolution Timeline</h1>
                <p className="text-sm text-ink-600">Your life as an unfolding story</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={activeView === 'timeline' ? 'primary' : 'ghost'}
                onClick={() => setActiveView('timeline')}
              >
                Timeline
              </Button>
              <Button
                variant={activeView === 'arcs' ? 'primary' : 'ghost'}
                onClick={() => setActiveView('arcs')}
              >
                Life Arcs
              </Button>
              <Button
                variant={activeView === 'story' ? 'primary' : 'ghost'}
                onClick={() => setActiveView('story')}
              >
                Story Mode
              </Button>
              <Button
                variant={activeView === 'export' ? 'primary' : 'ghost'}
                onClick={() => setActiveView('export')}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Timeline View */}
          {activeView === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Filters */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-600">Filter:</span>
                  <Button
                    size="sm"
                    variant={filterEmotion === null ? 'primary' : 'ghost'}
                    onClick={() => setFilterEmotion(null)}
                  >
                    All
                  </Button>
                  {(['joy', 'calm', 'growth', 'struggle', 'breakthrough', 'peace'] as const).map(emotion => (
                    <Button
                      key={emotion}
                      size="sm"
                      variant={filterEmotion === emotion ? 'primary' : 'ghost'}
                      onClick={() => setFilterEmotion(emotion)}
                    >
                      {emotion}
                    </Button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-ink-600">Range:</span>
                  {(['all', '3m', '6m', '1y'] as const).map(range => (
                    <Button
                      key={range}
                      size="sm"
                      variant={timeRange === range ? 'primary' : 'ghost'}
                      onClick={() => setTimeRange(range)}
                    >
                      {range === 'all' ? 'All Time' : range.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-lilac-200 via-sand-200 to-golden-200" />

                <div className="space-y-8">
                  {filteredEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-20"
                    >
                      {/* Dot */}
                      <div className={`absolute left-6 top-3 w-5 h-5 rounded-full ${getEmotionColor(entry.emotion)} shadow-lg ring-4 ring-white`} />

                      {/* Card */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-ink-100/20 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-xs text-ink-500 mb-1">
                              {formatDate(entry.date)}
                            </div>
                            <h3 className="text-lg font-medium text-ink-900">{entry.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getEmotionColor(entry.emotion)}`}>
                              {entry.emotion}
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-ink-100/30 text-xs text-ink-600">
                              {entry.type}
                            </div>
                          </div>
                        </div>
                        <p className="text-ink-700 mb-3 leading-relaxed">{entry.content}</p>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-lilac-100/50 text-lilac-700 rounded-lg text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Intensity bar */}
                        <div className="mt-3 pt-3 border-t border-ink-100/20">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-500">Intensity:</span>
                            <div className="flex-1 h-1.5 bg-ink-100/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getEmotionColor(entry.emotion)}`}
                                style={{ width: `${entry.intensity * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-ink-600 font-medium">{entry.intensity}/10</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {filteredEntries.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-ink-500">
                    {timelineEntries.length === 0
                      ? 'Your timeline is waiting for its first entry. Start journaling or tracking milestones to see them appear here.'
                      : 'No entries match the current filters.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Life Arcs View */}
          {activeView === 'arcs' && (
            <motion.div
              key="arcs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-light text-ink-900 mb-2">Your Life Arcs</h2>
                <p className="text-ink-600">AI-detected phases in your journey</p>
              </div>

              <div className="grid gap-6">
                {lifeArcs.map((arc, index) => (
                  <motion.div
                    key={arc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-ink-100/20 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedArc(selectedArc === arc.id ? null : arc.id)}
                  >
                    <div className="flex items-start gap-6">
                      {/* Arc number */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${arc.color} flex items-center justify-center text-white text-2xl font-light shadow-lg`}>
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-xs text-ink-500 mb-1">{arc.phase}</div>
                            <h3 className="text-2xl font-light text-ink-900 mb-1">{arc.name}</h3>
                            <p className="text-sm text-ink-600">{formatDateRange(arc.startDate, arc.endDate)}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${arc.color} text-white text-sm font-medium shadow-md`}>
                            {arc.theme}
                          </div>
                        </div>

                        <p className="text-ink-700 leading-relaxed mb-4">{arc.description}</p>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-lilac-50/50 rounded-xl">
                          <div>
                            <div className="text-xs text-ink-500 mb-1">Emotional Pattern</div>
                            <div className="text-sm font-medium text-ink-900">{arc.emotionalPattern}</div>
                          </div>
                          <div>
                            <div className="text-xs text-ink-500 mb-1">Growth Summary</div>
                            <div className="text-sm font-medium text-ink-900">{arc.growthSummary}</div>
                          </div>
                        </div>

                        {selectedArc === arc.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-ink-100/20"
                          >
                            <h4 className="text-sm font-medium text-ink-900 mb-3">Key Moments</h4>
                            <div className="space-y-3">
                              {timelineEntries
                                .filter(e => arc.keyMoments.includes(e.id))
                                .map(moment => (
                                  <div
                                    key={moment.id}
                                    className="p-3 bg-white/60 rounded-xl border border-ink-100/20"
                                  >
                                    <div className="text-xs text-ink-500 mb-1">{formatDate(moment.date)}</div>
                                    <div className="text-sm font-medium text-ink-900">{moment.title}</div>
                                  </div>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Story Mode */}
          {activeView === 'story' && chapters.length > 0 && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-ink-100/20 shadow-xl">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${chapters[currentChapter].arc.color} flex items-center justify-center text-white text-3xl font-light shadow-lg`}>
                  {currentChapter + 1}
                </div>

                <h2 className="text-4xl font-light text-ink-900 text-center mb-2">
                  {chapters[currentChapter].title}
                </h2>
                <p className="text-center text-ink-600 mb-8">{chapters[currentChapter].period}</p>

                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-ink-700 leading-relaxed whitespace-pre-line">
                    {chapters[currentChapter].storyNarrative}
                  </p>
                </div>

                {/* Moments in this chapter */}
                <div className="mb-8">
                  <h3 className="text-xl font-light text-ink-900 mb-4">Moments in This Chapter</h3>
                  <div className="grid gap-4">
                    {chapters[currentChapter].entries.slice(0, 3).map(entry => (
                      <div
                        key={entry.id}
                        className="p-4 bg-lilac-50/50 rounded-xl border border-ink-100/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-medium text-ink-900">{entry.title}</div>
                          <div className={`px-2 py-1 rounded-lg text-xs text-white ${getEmotionColor(entry.emotion)}`}>
                            {entry.emotion}
                          </div>
                        </div>
                        <p className="text-sm text-ink-700">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-8 border-t border-ink-100/20">
                  <Button
                    variant="ghost"
                    onClick={handlePrevChapter}
                    disabled={currentChapter === 0}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous Chapter
                  </Button>

                  <div className="text-sm text-ink-600">
                    Chapter {currentChapter + 1} of {chapters.length}
                  </div>

                  <Button
                    onClick={handleNextChapter}
                    disabled={currentChapter === chapters.length - 1}
                  >
                    {currentChapter === chapters.length - 1 ? 'Finish' : 'Next Chapter'}
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>

              {!playingStory && (
                <div className="text-center mt-8">
                  <Button onClick={handlePlayStory}>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play Story From Beginning
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Export View */}
          {activeView === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-ink-100/20 shadow-xl text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-lilac-400 via-sand-300 to-golden-400 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>

                <h2 className="text-3xl font-light text-ink-900 mb-2">Your Digital Autobiography</h2>
                <p className="text-ink-600 mb-8">Export your complete life story</p>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-lilac-50/50 rounded-2xl">
                    <div className="text-3xl font-light text-ink-900 mb-1">{timelineEntries.length}</div>
                    <div className="text-sm text-ink-600">Total Entries</div>
                  </div>
                  <div className="p-6 bg-sand-50/50 rounded-2xl">
                    <div className="text-3xl font-light text-ink-900 mb-1">{lifeArcs.length}</div>
                    <div className="text-sm text-ink-600">Life Arcs</div>
                  </div>
                  <div className="p-6 bg-golden-50/50 rounded-2xl">
                    <div className="text-3xl font-light text-ink-900 mb-1">{chapters.length}</div>
                    <div className="text-sm text-ink-600">Chapters</div>
                  </div>
                </div>

                <div className="space-y-4 mb-8 text-left bg-ink-50/30 p-6 rounded-2xl">
                  <h3 className="text-lg font-medium text-ink-900 mb-3">What's Included:</h3>
                  <div className="space-y-2 text-ink-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>All timeline entries with emotions and tags</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>AI-detected life arcs with themes and insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Chapter narratives and story mode content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Statistics and emotional patterns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>JSON format for future import/analysis</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleExport} size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Download My Life Story
                </Button>

                <p className="text-xs text-ink-500 mt-4">
                  Your data is exported as JSON and stays private on your device
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

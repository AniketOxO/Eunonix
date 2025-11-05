import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/Button'
import { formatDate } from '@/utils/emotions'
import { readJSON, writeJSON, safeStorage } from '@/utils/storage'

interface SoulProfile {
  coreValues: string[]
  dominantEmotions: { emotion: string; frequency: number }[]
  thinkingPatterns: string[]
  growthAreas: string[]
  strengths: string[]
  lifePhilosophy: string
  lastUpdated: Date
}

interface ExportData {
  exportDate: string
  version: string
  userData: {
    goals: any[]
    habits: any[]
    journal: any[]
    plans: any[]
    mood: any
  }
  soulProfile: SoulProfile
  stats: {
    totalGoals: number
    totalHabits: number
    totalJournalEntries: number
    totalDays: number
    longestStreak: number
  }
}

const DigitalSoul = () => {
  const navigate = useNavigate()
  const { goals, habits, mood } = useAppStore()
  const { isAuthenticated, requireAuth } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    requireAuth: state.requireAuth
  }))
  
  const [soulProfile, setSoulProfile] = useState<SoulProfile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'soul' | 'backup' | 'sync'>('soul')
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [analysisNotice, setAnalysisNotice] = useState<{ type: 'auth' | 'data'; message: string } | null>(null)

  // Load journal entries
  useEffect(() => {
    const saved = readJSON<Array<Record<string, any> & { date: string }>>('eunonix-journal', [])
    if (saved.length > 0) {
      setJournalEntries(saved.map((entry) => ({ ...entry, date: new Date(entry.date) })))
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setAnalysisNotice({
        type: 'auth',
        message: 'Preview mode is read-only. Sign in to build and save your Digital Soul profile.'
      })
      return
    }

    if (analysisNotice?.type === 'auth') {
      setAnalysisNotice(null)
    }
  }, [isAuthenticated, analysisNotice])

  // Analyze and build soul profile
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    if (journalEntries.length > 0 || goals.length > 0 || habits.length > 0) {
      analyzeSoul()
    }
  }, [journalEntries, goals, habits, isAuthenticated])

  const analyzeSoul = () => {
    if (!isAuthenticated) {
      setAnalysisNotice({
        type: 'auth',
        message: 'Sign in to build your Digital Soul profile. Preview mode does not save or analyze personal data.'
      })
      requireAuth('build your Digital Soul profile', {
        title: 'Sign in to build your Digital Soul',
        message: 'Create a free account to generate a personalized Digital Soul and keep it in sync across devices.'
      })
      return
    }

    if (goals.length === 0 && habits.length === 0 && journalEntries.length === 0) {
      setAnalysisNotice({
        type: 'data',
        message: 'Add at least one goal, habit, or journal reflection to generate meaningful insights.'
      })
      return
    }

    setAnalysisNotice(null)
    setIsAnalyzing(true)
    
    setTimeout(() => {
      // Extract core values from goals
      const coreValues: string[] = []
      goals.forEach(goal => {
        if (goal.category === 'health') coreValues.push('Wellness')
        if (goal.category === 'relationships') coreValues.push('Connection')
        if (goal.category === 'learning') coreValues.push('Growth')
        if (goal.category === 'personal') coreValues.push('Self-Discovery')
        if (goal.category === 'career') coreValues.push('Achievement')
        if (goal.category === 'financial') coreValues.push('Security')
      })

      // Analyze emotions from journal
      const emotionCount: Record<string, number> = {}
      journalEntries.forEach(entry => {
        entry.emotions?.forEach((emotion: string) => {
          emotionCount[emotion] = (emotionCount[emotion] || 0) + 1
        })
      })

      const dominantEmotions = Object.entries(emotionCount)
        .map(([emotion, frequency]) => ({ emotion, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)

      // Identify thinking patterns from journal tags
      const tagCount: Record<string, number> = {}
      journalEntries.forEach(entry => {
        entry.tags?.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      })

      const thinkingPatterns = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag)

      // Identify strengths from consistent habits
      const strengths: string[] = []
      const consistentHabits = habits.filter(h => h.streak >= 7)
      consistentHabits.forEach(habit => {
        if (habit.streak >= 30) strengths.push(`Exceptional discipline in ${habit.title.toLowerCase()}`)
        else if (habit.streak >= 14) strengths.push(`Strong consistency in ${habit.title.toLowerCase()}`)
        else if (habit.streak >= 7) strengths.push(`Growing commitment to ${habit.title.toLowerCase()}`)
      })

      // Identify growth areas
      const growthAreas: string[] = []
      const strugglingHabits = habits.filter(h => h.streak < 3)
      const lowProgressGoals = goals.filter(g => g.progress < 30)
      
      if (strugglingHabits.length > habits.length * 0.3) {
        growthAreas.push('Building sustainable daily routines')
      }
      if (lowProgressGoals.length > 0) {
        growthAreas.push('Breaking down big goals into actionable steps')
      }
      if (journalEntries.filter(e => e.emotions?.includes('anxiety')).length > journalEntries.length * 0.3) {
        growthAreas.push('Developing emotional regulation practices')
      }

      // Generate life philosophy
      const topValue = Array.from(new Set(coreValues))[0] || 'Growth'
      const topEmotion = dominantEmotions[0]?.emotion || 'calm'
      const lifePhilosophy = `You are someone who values ${topValue.toLowerCase()}, often experiencing ${topEmotion}. Your journey is about ${thinkingPatterns[0] || 'self-discovery'}, guided by a desire to become your best self through consistent action and reflection.`

      setSoulProfile({
        coreValues: Array.from(new Set(coreValues)).slice(0, 5),
        dominantEmotions,
        thinkingPatterns,
        growthAreas: growthAreas.slice(0, 3),
        strengths: strengths.slice(0, 3),
        lifePhilosophy,
        lastUpdated: new Date()
      })

      setIsAnalyzing(false)
    }, 2000)
  }

  const handleExportData = () => {
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      userData: {
        goals,
        habits,
        journal: journalEntries,
        plans: Object.values(useAppStore.getState().dayPlans),
        mood
      },
      soulProfile: soulProfile || {
        coreValues: [],
        dominantEmotions: [],
        thinkingPatterns: [],
        growthAreas: [],
        strengths: [],
        lifePhilosophy: '',
        lastUpdated: new Date()
      },
      stats: {
        totalGoals: goals.length,
        totalHabits: habits.length,
        totalJournalEntries: journalEntries.length,
        totalDays: habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak)) : 0,
        longestStreak: habits.length > 0 ? Math.max(0, ...habits.map(h => h.longestStreak)) : 0
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eunonix-backup-${formatDate(new Date()).replace(/\s/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData

        // Restore data to storage
        if (data.userData) {
          writeJSON('eunonix-storage', {
            state: {
              goals: data.userData.goals,
              habits: data.userData.habits,
              mood: data.userData.mood,
              dayPlans: data.userData.plans || [],
            },
            version: 1,
          })

          if (data.userData.journal) {
            writeJSON('eunonix-journal', data.userData.journal)
          }
        }

        setImportStatus({
          type: 'success',
          message: 'Data imported successfully. Refreshing Eunonix to load your latest memories...'
        })

        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } catch (error) {
        setImportStatus({
          type: 'error',
          message: 'We could not import that file. Please confirm the format and try again.'
        })
      }
    }
    reader.readAsText(file)
  }

  const handleSync = async () => {
    setSyncStatus('syncing')
    
    // Simulate cloud sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSyncStatus('synced')
    setLastSync(new Date())
    
    setTimeout(() => {
      setSyncStatus('offline')
    }, 3000)
  }

  const getDataSize = () => {
  const data = safeStorage.getItem('eunonix-storage') || ''
  const journal = safeStorage.getItem('eunonix-journal') || ''
  const companion = safeStorage.getItem('eunonix-companion') || ''
    const totalBytes = data.length + journal.length + companion.length
    return (totalBytes / 1024).toFixed(2) + ' KB'
  }

  return (
    <div className="min-h-screen emotion-bg">
      {/* Header */}
      <header className="glass-card sticky top-0 z-40 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-6 h-6 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h1 className="text-2xl font-semibold text-ink-800">Digital Soul</h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/mindmap')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Mind Map
            </Button>
            <Button variant="ghost" onClick={() => navigate('/journal')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Journal
            </Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {importStatus && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-6 py-4 shadow-sm transition-all ${
              importStatus.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            <span className="mt-0.5">
              {importStatus.type === 'success' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A1 1 0 002.64 20h18.72a1 1 0 00.86-1.44l-8.48-14.7a1 1 0 00-1.72 0z" />
                </svg>
              )}
            </span>
            <div className="flex-1">
              <p className="font-medium">
                {importStatus.type === 'success' ? 'Import complete' : 'Import failed'}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{importStatus.message}</p>
            </div>
            <button
              onClick={() => setImportStatus(null)}
              className="mt-0.5 rounded-full bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-current transition-colors hover:bg-black/10"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('soul')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'soul'
                ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                : 'bg-white/40 text-ink-700 hover:bg-white/60'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Soul Profile
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                : 'bg-white/40 text-ink-700 hover:bg-white/60'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Backup & Export
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'sync'
                ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                : 'bg-white/40 text-ink-700 hover:bg-white/60'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync & Devices
          </button>
        </div>

        {/* Soul Profile Tab */}
        {activeTab === 'soul' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="glass-card p-8 rounded-3xl text-center">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-golden-400/20 to-lilac-400/20 flex items-center justify-center relative"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(201, 165, 92, 0.3)',
                    '0 0 40px rgba(157, 123, 202, 0.4)',
                    '0 0 20px rgba(201, 165, 92, 0.3)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <svg className="w-12 h-12 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>

                {isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-lilac-400"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </motion.div>

              <h2 className="text-3xl font-light text-ink-900 mb-3">Your Digital Soul</h2>
              <p className="text-ink-600 max-w-2xl mx-auto">
                An evolving AI reflection of your thoughts, values, and patterns—built from your goals, habits, and reflections.
              </p>

              {analysisNotice && (
                <div
                  className={`mt-6 px-4 py-3 rounded-2xl text-sm font-medium ${
                    analysisNotice.type === 'auth'
                      ? 'bg-lilac-100/70 text-lilac-800 border border-lilac-200/60'
                      : 'bg-amber-100/80 text-amber-800 border border-amber-200/60'
                  }`}
                >
                  {analysisNotice.message}
                </div>
              )}

              {soulProfile && (
                <p className="text-xs text-ink-500 mt-4">
                  Last updated: {formatDate(soulProfile.lastUpdated)}
                </p>
              )}

              {isAnalyzing && (
                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2 text-lilac-600">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Analyzing your life patterns...
                    </motion.div>
                  </div>
                </div>
              )}

              {!isAnalyzing && !soulProfile && (
                <Button onClick={analyzeSoul} className="mt-6">
                  Build My Soul Profile
                </Button>
              )}
            </div>

            {/* Soul Profile Content */}
            {soulProfile && !isAnalyzing && (
              <>
                {/* Life Philosophy */}
                <div className="glass-card p-8 rounded-3xl">
                  <h3 className="text-xl font-semibold text-ink-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-golden-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Your Life Philosophy
                  </h3>
                  <p className="text-lg text-ink-700 leading-relaxed italic">
                    "{soulProfile.lifePhilosophy}"
                  </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Core Values */}
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Core Values
                    </h3>
                    <div className="space-y-2">
                      {soulProfile.coreValues.length > 0 ? (
                        soulProfile.coreValues.map((value, i) => (
                          <motion.div
                            key={i}
                            className="px-4 py-2 bg-gradient-to-r from-lilac-50 to-sand-50 rounded-xl text-ink-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            {value}
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-sm text-ink-500">Create goals to discover your values</p>
                      )}
                    </div>
                  </div>

                  {/* Dominant Emotions */}
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Dominant Emotions
                    </h3>
                    <div className="space-y-3">
                      {soulProfile.dominantEmotions.length > 0 ? (
                        soulProfile.dominantEmotions.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-ink-700 capitalize">{item.emotion}</span>
                              <span className="text-xs text-ink-500">{item.frequency} times</span>
                            </div>
                            <div className="w-full bg-sand-200/50 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-lilac-400 to-golden-400 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.frequency / soulProfile.dominantEmotions[0].frequency) * 100}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                              />
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-sm text-ink-500">Journal your feelings to track emotions</p>
                      )}
                    </div>
                  </div>

                  {/* Thinking Patterns */}
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Thinking Patterns
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {soulProfile.thinkingPatterns.length > 0 ? (
                        soulProfile.thinkingPatterns.map((pattern, i) => (
                          <motion.span
                            key={i}
                            className="px-3 py-1.5 bg-gradient-to-br from-sand-100 to-lilac-100 text-ink-700 rounded-full text-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            {pattern}
                          </motion.span>
                        ))
                      ) : (
                        <p className="text-sm text-ink-500">Add tags to journal entries to discover patterns</p>
                      )}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-golden-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Your Strengths
                    </h3>
                    <div className="space-y-2">
                      {soulProfile.strengths.length > 0 ? (
                        soulProfile.strengths.map((strength, i) => (
                          <motion.div
                            key={i}
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <svg className="w-5 h-5 text-golden-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-ink-700">{strength}</span>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-sm text-ink-500">Build habit streaks to reveal strengths</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Growth Areas */}
                {soulProfile.growthAreas.length > 0 && (
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Growth Opportunities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {soulProfile.growthAreas.map((area, i) => (
                        <motion.div
                          key={i}
                          className="p-4 bg-gradient-to-br from-lilac-50/50 to-sand-50/50 rounded-2xl border border-lilac-200/30"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <p className="text-sm text-ink-700">{area}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <div className="text-center">
                  <Button onClick={analyzeSoul} variant="ghost">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Soul Profile
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Backup & Export Tab */}
        {activeTab === 'backup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="glass-card p-8 rounded-3xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-lilac-100 to-sand-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-ink-800 mb-3">Life Archive Backup</h2>
              <p className="text-ink-600 mb-6">
                Export all your goals, habits, journal entries, and soul profile as a secure backup file.
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-semibold text-gradient">{goals.length + habits.length + journalEntries.length}</p>
                  <p className="text-xs text-ink-500 mt-1">Total Items</p>
                </div>
                <div className="w-px h-12 bg-ink-200" />
                <div className="text-center">
                  <p className="text-3xl font-semibold text-gradient">{getDataSize()}</p>
                  <p className="text-xs text-ink-500 mt-1">Data Size</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button onClick={handleExportData}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Export Backup
                </Button>

                <label className="inline-block cursor-pointer">
                  <span className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full font-medium transition-all duration-300 min-h-[44px] bg-transparent border-2 border-ink-700 text-ink-700 hover:bg-ink-700 hover:text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import Backup
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* What's Included */}
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-semibold text-ink-800 mb-4">What's Included in Your Backup</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-sand-50/50 rounded-xl">
                  <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Goals</p>
                    <p className="text-xs text-ink-500">{goals.length} items</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-sand-50/50 rounded-xl">
                  <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Habits</p>
                    <p className="text-xs text-ink-500">{habits.length} items</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-sand-50/50 rounded-xl">
                  <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Journal</p>
                    <p className="text-xs text-ink-500">{journalEntries.length} entries</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-sand-50/50 rounded-xl">
                  <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Soul Profile</p>
                    <p className="text-xs text-ink-500">AI analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sync & Devices Tab */}
        {activeTab === 'sync' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="glass-card p-8 rounded-3xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-lilac-100 to-sand-100 flex items-center justify-center relative">
                  <svg className="w-10 h-10 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncStatus === 'syncing' && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-lilac-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-ink-800 mb-3">Sync Across Devices</h2>
                <p className="text-ink-600 mb-6">
                  Keep your Eunonix synchronized across all your devices (coming soon)
                </p>

                {/* Sync Status */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sand-100 to-lilac-100">
                  <div className={`w-2 h-2 rounded-full ${
                    syncStatus === 'synced' ? 'bg-green-500' :
                    syncStatus === 'syncing' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-ink-700">
                    {syncStatus === 'synced' ? 'Synced' :
                     syncStatus === 'syncing' ? 'Syncing...' :
                     'Offline Mode'}
                  </span>
                </div>

                {lastSync && (
                  <p className="text-xs text-ink-500 mt-2">
                    Last synced: {formatDate(lastSync)}
                  </p>
                )}
              </div>

              <Button onClick={handleSync} className="w-full mb-6" disabled={syncStatus === 'syncing'}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </Button>

              {/* Connected Devices */}
              <div>
                <h3 className="text-lg font-semibold text-ink-800 mb-4">Connected Devices</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sand-50/50 to-lilac-50/50 rounded-2xl border border-lilac-200/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-ink-700">This Browser (Web)</p>
                        <p className="text-xs text-ink-500">Active now</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Current
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-sand-50/30 rounded-2xl border border-sand-200/30 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sand-300 to-sand-400 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-ink-700">Mobile App</p>
                        <p className="text-xs text-ink-500">Coming soon</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-sand-50/30 rounded-2xl border border-sand-200/30 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sand-300 to-sand-400 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-ink-700">Tablet</p>
                        <p className="text-xs text-ink-500">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-lilac-50/50 to-golden-50/50">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-lilac-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-ink-800 mb-2">About Sync</h4>
                  <p className="text-sm text-ink-600">
                    Your data is currently stored locally in your browser. Cloud sync across devices is coming soon! 
                    For now, use the Export/Import feature to transfer your Life Archive between devices.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default DigitalSoul

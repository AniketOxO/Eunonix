import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { GlassCard } from '@/components/GlassCard'
import { PulseLine } from '@/components/PulseLine'
import { Button } from '@/components/Button'
import { BreathingOrb } from '@/components/BreathingOrb'
import { HabitTracker } from '@/components/HabitTracker'
import { GoalsOverview } from '@/components/GoalsOverview'
import { DayPlanner } from '@/components/DayPlanner'
import { ProfileDropdown } from '@/components/ProfileDropdown'
import { getTimeOfDayGreeting, formatDate, emotionLabels } from '@/utils/emotions'
import { deriveEnergyLevel } from '@/utils/energy'
import { MoodMelodyCard } from '@/components/plugins/MoodMelodyCard'
import { FocusFlowCard } from '@/components/plugins/FocusFlowCard'
import { BreatheAICard } from '@/components/plugins/BreatheAICard'
import { ToneTunerCard } from '@/components/plugins/ToneTunerCard'
import { EmotionChartsCard } from '@/components/plugins/EmotionChartsCard'
import { AuroraThemePackCard } from '@/components/plugins/AuroraThemePackCard'
import { NotionSyncCard } from '@/components/plugins/NotionSyncCard'
import { PatternPredictorCard } from '@/components/plugins/PatternPredictorCard'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isPluginInstalled, isAuthenticated, requireAuth } = useAuthStore((state) => ({
    user: state.user,
    isPluginInstalled: state.isPluginInstalled,
    isAuthenticated: state.isAuthenticated,
    requireAuth: state.requireAuth
  }))
  const {
    mood,
    goals,
    tasks,
    habits,
    reflections,
    getTodayPlan,
    setMood,
    updateEmotionHue,
  } = useAppStore()
  
  const [activeSection, setActiveSection] = useState<'overview' | 'goals' | 'habits' | 'plan'>('overview')
  const [highlightedPlugin, setHighlightedPlugin] = useState<string | null>(null)
  const pluginSectionRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const installedPlugins = user?.installedPlugins ?? []

  useEffect(() => {
    updateEmotionHue()
  }, [updateEmotionHue])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const pluginId = params.get('plugin')

    if (pluginId && installedPlugins.includes(pluginId)) {
      setActiveSection('overview')
      setHighlightedPlugin(pluginId)

      const timeoutId = window.setTimeout(() => {
        setHighlightedPlugin(null)
      }, 6000)

      requestAnimationFrame(() => {
        pluginSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    setHighlightedPlugin(null)
    return undefined
  }, [location.search, installedPlugins])

  const todayPlan = getTodayPlan()
  const activeHabits = habits.filter(h => h.streak > 0)
  const energyInsights = useMemo(() => deriveEnergyLevel({
    mood,
    tasks,
    habits,
    dayPlan: todayPlan ?? undefined,
    reflections,
  }), [mood, tasks, habits, todayPlan, reflections])

  useEffect(() => {
    const energyDelta = Math.abs(energyInsights.level - mood.energyLevel)
    const clarityDelta = Math.abs(energyInsights.clarity - mood.clarity)

    if (energyDelta < 1 && clarityDelta < 1) {
      return
    }

    setMood({
      ...mood,
      energyLevel: energyInsights.level,
      clarity: energyInsights.clarity,
    })
  }, [energyInsights.level, energyInsights.clarity, mood, setMood])
  
  // Stats for overview
  const totalGoals = goals.length
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) 
    : 0
  const totalHabits = habits.length
  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length)
    : 0
  const todayPriorities = todayPlan?.priorities.length || 0
  const completedPriorities = todayPlan?.priorities.filter(p => p.completed).length || 0

  const sections = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'goals', label: 'Goals', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { id: 'habits', label: 'Habits', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'plan', label: 'Daily Plan', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]

  const handleNavigation = (path: string, featureName: string) => {
    if (!isAuthenticated) {
      requireAuth(featureName, {
        title: 'Sign in to keep your progress',
        message: `You are in preview mode. Sign in to save your ${featureName.toLowerCase()} data across sessions.`
      })
    }

    navigate(path)
  }

  return (
    <div className="min-h-screen emotion-bg transition-colors duration-[2000ms]">
      {/* Floating background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <BreathingOrb 
          size={350} 
          color="bg-gradient-to-br from-lilac-300/15 to-transparent"
          className="absolute top-0 right-0"
        />
        <BreathingOrb 
          size={250} 
          color="bg-gradient-to-br from-golden-300/10 to-transparent"
          className="absolute bottom-0 left-0"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-ink-200/20 backdrop-blur-sm bg-white/30">
          <div className="max-w-[1800px] mx-auto flex justify-between items-center">
            <motion.div
              className="cursor-pointer"
              onClick={() => navigate('/home')}
              whileHover={{ scale: 1.05 }}
            >
              <h1 className="text-xl sm:text-2xl font-semibold text-ink-800">Eunonix</h1>
            </motion.div>

            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              <Button variant="ghost" onClick={() => handleNavigation('/timeline', 'Timeline')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timeline
              </Button>
              <Button variant="ghost" onClick={() => handleNavigation('/mind-architect', 'Mind Architect')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Architect
              </Button>
              <Button variant="ghost" onClick={() => handleNavigation('/community', 'Community')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Community
              </Button>
              <Button variant="ghost" onClick={() => handleNavigation('/digital-soul', 'Digital Soul')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Soul
              </Button>
              <Button variant="ghost" onClick={() => handleNavigation('/mind-map', 'Mind Map')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                MindMap
              </Button>
              <Button variant="ghost" onClick={() => handleNavigation('/journal', 'Journal')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Journal
              </Button>
              <Button variant="ghost" onClick={() => handleNavigation('/ai-companion', 'AI Companion')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Companion
              </Button>
              <Button variant="ghost" onClick={() => handleNavigation('/sensory-expansion', 'Sensory Expansion')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Sensory
              </Button>
              
              <div className="h-6 w-px bg-ink-200/30"></div>
              
              <ProfileDropdown />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
  <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Emotion Status */}
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-ink-900 mb-2">
              {getTimeOfDayGreeting()}, <span className="text-gradient font-medium">{user?.name || 'User'}</span>
            </h2>
            <p className="text-sm sm:text-base text-ink-600 mb-3">
              You're feeling <span className="text-gradient font-medium">
                {emotionLabels[mood.dominantEmotion].toLowerCase()}
              </span> today
            </p>
            <p className="text-xs sm:text-sm text-ink-500">{formatDate(new Date())}</p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-medium transition-all flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                  activeSection === section.id
                    ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white shadow-lg'
                    : 'bg-white/40 text-ink-700 hover:bg-white/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                </svg>
                {section.label}
              </motion.button>
            ))}
          </div>

          {/* Content Sections */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Emotion Pulse */}
                <GlassCard className="lg:col-span-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-medium text-ink-800 mb-1">Real-time Pulse</h3>
                      <p className="text-ink-500 text-xs sm:text-sm">Your emotional rhythm right now</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-light text-ink-800">{energyInsights.level}%</div>
                      <div className="text-xs sm:text-sm text-ink-400 flex items-center gap-2 sm:justify-end">
                        <span>Energy</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${energyInsights.trend === 'rising' ? 'bg-pink-100 text-pink-600' : energyInsights.trend === 'falling' ? 'bg-rose-100 text-rose-600' : 'bg-ink-100/60 text-ink-500'}`}>
                          {energyInsights.trend === 'rising' ? '↑ rising' : energyInsights.trend === 'falling' ? '↓ falling' : '→ stable'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <PulseLine intensity={energyInsights.level} className="h-32 sm:h-48" />
                </GlassCard>

                {/* Quick Stats */}
                <GlassCard>
                  <h3 className="text-lg sm:text-xl font-medium text-ink-800 mb-4 sm:mb-6">Quick Stats</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ink-600">Life Goals</span>
                      <span className="text-xl sm:text-2xl font-light text-ink-800">{totalGoals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ink-600">Avg Progress</span>
                      <span className="text-xl sm:text-2xl font-light text-ink-800">{avgGoalProgress}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ink-600">Active Habits</span>
                      <span className="text-xl sm:text-2xl font-light text-ink-800">{totalHabits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ink-600">Avg Streak</span>
                      <span className="text-xl sm:text-2xl font-light text-ink-800">{avgStreak}d</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-ink-600">Today's Tasks</span>
                      <span className="text-xl sm:text-2xl font-light text-ink-800">{completedPriorities}/{todayPriorities}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Recent Habits */}
                <GlassCard className="lg:col-span-2">
                  <h3 className="text-lg sm:text-xl font-medium text-ink-800 mb-4 sm:mb-6">Active Habits ({activeHabits.length})</h3>
                  <div className="space-y-3">
                    {activeHabits.slice(0, 3).map((habit) => (
                      <div key={habit.id} className="flex justify-between items-center p-3 rounded-xl bg-white/30">
                        <span className="text-ink-700">{habit.title}</span>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-golden-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold text-ink-700">{habit.streak}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveSection('habits')}
                    className="mt-4 w-full py-2 text-sm text-lilac-600 hover:text-lilac-700 font-medium"
                  >
                    View all habits →
                  </button>
                </GlassCard>

                {/* Goals Summary */}
                <GlassCard>
                  <h3 className="text-lg sm:text-xl font-medium text-ink-800 mb-4 sm:mb-6">Top Goals</h3>
                  <div className="space-y-3">
                    {goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="p-3 rounded-xl bg-white/30">
                        <div className="text-sm font-medium text-ink-800 mb-2">{goal.title}</div>
                        <div className="h-1.5 bg-ink-200/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-lilac-400 to-ink-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-ink-500 mt-1">{goal.progress}% complete</div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveSection('goals')}
                    className="mt-4 w-full py-2 text-sm text-lilac-600 hover:text-lilac-700 font-medium"
                  >
                    View all goals →
                  </button>
                </GlassCard>
              </div>
                {(isPluginInstalled('1') || isPluginInstalled('2') || isPluginInstalled('3') || isPluginInstalled('4') || isPluginInstalled('5') || isPluginInstalled('6') || isPluginInstalled('7') || isPluginInstalled('8')) && (
                  <div ref={pluginSectionRef}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-medium text-ink-800">Active Plugins</h3>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="text-sm text-lilac-600 hover:text-lilac-700 font-medium"
                      >
                        Manage plugins →
                      </button>
                    </div>
                    <div className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))] items-stretch">
                      {isPluginInstalled('1') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <MoodMelodyCard
                            onNavigateToSensory={() => navigate('/sensory-expansion')}
                            highlighted={highlightedPlugin === '1'}
                          />
                        </div>
                      )}
                      {isPluginInstalled('2') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <FocusFlowCard highlighted={highlightedPlugin === '2'} />
                        </div>
                      )}
                      {isPluginInstalled('3') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <ToneTunerCard highlighted={highlightedPlugin === '3'} />
                        </div>
                      )}
                      {isPluginInstalled('4') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <EmotionChartsCard highlighted={highlightedPlugin === '4'} />
                        </div>
                      )}
                      {isPluginInstalled('5') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <BreatheAICard highlighted={highlightedPlugin === '5'} />
                        </div>
                      )}
                      {isPluginInstalled('6') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <NotionSyncCard highlighted={highlightedPlugin === '6'} />
                        </div>
                      )}
                      {isPluginInstalled('7') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <AuroraThemePackCard highlighted={highlightedPlugin === '7'} />
                        </div>
                      )}
                      {isPluginInstalled('8') && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <PatternPredictorCard highlighted={highlightedPlugin === '8'} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'goals' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-ink-900 mb-4 sm:mb-6">Life Goals & Systems</h2>
                <GoalsOverview />
              </div>
            )}

            {activeSection === 'habits' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-ink-900 mb-4 sm:mb-6">Daily Habits & Streaks</h2>
                <HabitTracker />
              </div>
            )}

            {activeSection === 'plan' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-ink-900 mb-4 sm:mb-6">Today's Plan</h2>
                <DayPlanner />
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard


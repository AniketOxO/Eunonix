import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { 
  EmotionType, 
  MoodData, 
  Task, 
  Reflection, 
  UserState,
  LifeGoal,
  System,
  Habit,
  DayPlan,
  WeekPlan,
  Priority
} from '@/types'
import { safeStorage } from '@/utils/storage'
import { applyThemeToDocument } from '@/config/themes'
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans'
import type { SubscriptionTier } from '@/types/subscription'
import { useAuthStore } from './useAuthStore'

const PREVIEW_SCOPE = 'preview'
const STORAGE_NAME = 'eunonix-storage'
const previewMemory: Record<string, string> = {}

const getStorageScope = () => {
  const authState = useAuthStore.getState()
  if (authState.isAuthenticated && authState.activeAccountId) {
    return `user:${authState.activeAccountId}`
  }
  return PREVIEW_SCOPE
}

const buildScopedKey = (name: string, scope: string) => `${name}::${scope}`

const scopedStorage = {
  get length() {
    const scope = getStorageScope()
    if (scope === PREVIEW_SCOPE) {
      return Object.keys(previewMemory).length
    }
    return safeStorage.length
  },
  clear: () => {
    const scope = getStorageScope()
    if (scope === PREVIEW_SCOPE) {
      Object.keys(previewMemory).forEach((key) => {
        delete previewMemory[key]
      })
      return
    }
    const key = buildScopedKey(STORAGE_NAME, scope)
    safeStorage.removeItem(key)
  },
  getItem: (name: string) => {
    const scope = getStorageScope()
    const scopedKey = buildScopedKey(name, scope)
    if (scope === PREVIEW_SCOPE) {
      return previewMemory[scopedKey] ?? null
    }
    return safeStorage.getItem(scopedKey)
  },
  key: (index: number) => safeStorage.key(index),
  removeItem: (name: string) => {
    const scope = getStorageScope()
    const scopedKey = buildScopedKey(name, scope)
    if (scope === PREVIEW_SCOPE) {
      delete previewMemory[scopedKey]
      return
    }
    safeStorage.removeItem(scopedKey)
  },
  setItem: (name: string, value: string) => {
    const scope = getStorageScope()
    const scopedKey = buildScopedKey(name, scope)
    if (scope === PREVIEW_SCOPE) {
      previewMemory[scopedKey] = value
      return
    }
    safeStorage.setItem(scopedKey, value)
  }
}

const previewHints = new Set<string>()

const remindSignInIfNeeded = (feature: string) => {
  const authState = useAuthStore.getState()
  if (authState.isAuthenticated) {
    return
  }

  const key = feature.toLowerCase()
  if (previewHints.has(key)) {
    return
  }

  previewHints.add(key)
  authState.requireAuth(feature, {
    message: `You can explore ${feature.toLowerCase()} in preview mode, but sign in to keep your progress.`
  })
}

interface AppStore extends UserState {
  setMood: (mood: MoodData) => void
  
  // Task actions
  addTask: (task: Task) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  
  // Reflection actions
  addReflection: (reflection: Reflection) => void
  
  // Goal actions
  addGoal: (goal: LifeGoal) => void
  updateGoal: (id: string, updates: Partial<LifeGoal>) => void
  deleteGoal: (id: string) => void
  
  // System actions
  addSystem: (system: System) => void
  updateSystem: (id: string, updates: Partial<System>) => void
  deleteSystem: (id: string) => void
  
  // Habit actions
  addHabit: (habit: Habit) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  completeHabit: (id: string, date: string) => void
  deleteHabit: (id: string) => void
  
  // Planning actions
  createDayPlan: (dayPlan: DayPlan) => void
  updateDayPlan: (date: string, updates: Partial<DayPlan>) => void
  addPriority: (date: string, priority: Priority) => void
  togglePriority: (date: string, priorityId: string) => void
  removePriority: (date: string, priorityId: string) => void
  
  createWeekPlan: (weekPlan: WeekPlan) => void
  updateWeekPlan: (weekId: string, updates: Partial<WeekPlan>) => void
  
  // Utility
  updateEmotionHue: () => void
  getTodayPlan: () => DayPlan | undefined
  getActiveHabits: () => Habit[]
  getGoalProgress: (goalId: string) => number

  // Theme
  activeThemeId: string
  setActiveTheme: (themeId: string) => void

  // Sync
  setLastSync: (date: Date | null) => void
}

const emotionToHue: Record<EmotionType, number> = {
  calm: 210,      // Blue
  motivated: 45,  // Golden
  empathetic: 330, // Pink
  rest: 200,      // Gray-blue
}

const getActiveSubscriptionTier = () => useAuthStore.getState().user?.subscriptionTier ?? 'free'
const getActivePlan = () => SUBSCRIPTION_PLANS[getActiveSubscriptionTier()]
const getPlanLimits = () => getActivePlan().limits
const getRecommendedUpgradeTier = (): SubscriptionTier => {
  const tier = getActiveSubscriptionTier()
  if (tier === 'free') return 'premium'
  if (tier === 'premium') return 'pro'
  if (tier === 'pro') return 'enterprise'
  return 'enterprise'
}

const enforceGoalLimit = (currentGoalCount: number) => {
  const limits = getPlanLimits()
  const maxGoals = limits.maxGoals
  if (maxGoals !== undefined && maxGoals !== 'unlimited' && currentGoalCount >= maxGoals) {
    const authStore = useAuthStore.getState()
    authStore.showPlanLimit('Goals', {
      message: `The ${getActivePlan().name} plan allows up to ${maxGoals} goals. Upgrade to unlock more.`,
      upgradeTier: getRecommendedUpgradeTier()
    })
    return false
  }
  return true
}

const enforceHabitLimit = (currentHabitCount: number) => {
  const limits = getPlanLimits()
  const maxHabits = limits.maxHabits
  if (maxHabits !== undefined && maxHabits !== 'unlimited' && currentHabitCount >= maxHabits) {
    const authStore = useAuthStore.getState()
    authStore.showPlanLimit('Habits', {
      message: `The ${getActivePlan().name} plan allows up to ${maxHabits} habits. Upgrade to keep tracking more.`,
      upgradeTier: getRecommendedUpgradeTier()
    })
    return false
  }
  return true
}

const getTodayDate = () => new Date().toISOString().split('T')[0]

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      mood: {
        emotions: [],
        dominantEmotion: 'calm',
        energyLevel: 50,
        clarity: 50,
      },
      tasks: [],
      reflections: [],
      goals: [],
      systems: [],
      habits: [],
      dayPlans: {},
      weekPlans: {},
  lastSync: null,

      setMood: (mood) => {
        remindSignInIfNeeded('Mood tracking')
        set({ mood })
        get().updateEmotionHue()
      },

      // Tasks
      addTask: (task) => {
        remindSignInIfNeeded('Task planning')
        set((state) => ({ 
          tasks: [...state.tasks, task] 
        }))
      },

      toggleTask: (id) => {
        remindSignInIfNeeded('Task planning')
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        }))
      },

      deleteTask: (id) => {
        remindSignInIfNeeded('Task planning')
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      // Reflections
      addReflection: (reflection) => {
        remindSignInIfNeeded('Reflections')
        set((state) => ({
          reflections: [reflection, ...state.reflections],
        }))
      },

      // Goals
      addGoal: (goal) => set((state) => {
        remindSignInIfNeeded('Goals')
        if (!enforceGoalLimit(state.goals.length)) {
          return {}
        }

        return {
          goals: [...state.goals, goal],
        }
      }),

      updateGoal: (id, updates) => {
        remindSignInIfNeeded('Goals')
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }))
      },

      deleteGoal: (id) => {
        remindSignInIfNeeded('Goals')
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }))
      },

      // Systems
      addSystem: (system) => {
        remindSignInIfNeeded('Systems')
        set((state) => ({
          systems: [...state.systems, system],
        }))
      },

      updateSystem: (id, updates) => {
        remindSignInIfNeeded('Systems')
        set((state) => ({
          systems: state.systems.map((system) =>
            system.id === id ? { ...system, ...updates } : system
          ),
        }))
      },

      deleteSystem: (id) => {
        remindSignInIfNeeded('Systems')
        set((state) => ({
          systems: state.systems.filter((system) => system.id !== id),
        }))
      },

      // Habits
      addHabit: (habit) => set((state) => {
        remindSignInIfNeeded('Habit tracking')
        if (!enforceHabitLimit(state.habits.length)) {
          return {}
        }

        return {
          habits: [...state.habits, habit],
        }
      }),

      updateHabit: (id, updates) => {
        remindSignInIfNeeded('Habit tracking')
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        }))
      },

      completeHabit: (id, date) => {
        remindSignInIfNeeded('Habit tracking')
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit
          
            const completedDates = [...habit.completedDates]
            const dateIndex = completedDates.indexOf(date)
          
            if (dateIndex === -1) {
              completedDates.push(date)
              const newStreak = habit.streak + 1
              return {
                ...habit,
                completedDates,
                streak: newStreak,
                longestStreak: Math.max(habit.longestStreak, newStreak),
                lastCompletedAt: new Date(),
              }
            }

            completedDates.splice(dateIndex, 1)
            return {
              ...habit,
              completedDates,
              streak: Math.max(0, habit.streak - 1),
            }
          }),
        }))
      },

      deleteHabit: (id) => {
        remindSignInIfNeeded('Habit tracking')
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }))
      },

      // Day Planning
      createDayPlan: (dayPlan) => {
        remindSignInIfNeeded('Day planning')
        set((state) => ({
          dayPlans: {
            ...state.dayPlans,
            [dayPlan.date]: dayPlan,
          },
        }))
      },

      updateDayPlan: (date, updates) => {
        remindSignInIfNeeded('Day planning')
        set((state) => ({
          dayPlans: {
            ...state.dayPlans,
            [date]: {
              ...state.dayPlans[date],
              ...updates,
            },
          },
        }))
      },

      addPriority: (date, priority) => set((state) => {
        remindSignInIfNeeded('Priorities')
        const dayPlan = state.dayPlans[date]
        if (!dayPlan) return state

        return {
          dayPlans: {
            ...state.dayPlans,
            [date]: {
              ...dayPlan,
              priorities: [...dayPlan.priorities, priority],
            },
          },
        }
      }),

      togglePriority: (date, priorityId) => set((state) => {
        remindSignInIfNeeded('Priorities')
        const dayPlan = state.dayPlans[date]
        if (!dayPlan) return state

        return {
          dayPlans: {
            ...state.dayPlans,
            [date]: {
              ...dayPlan,
              priorities: dayPlan.priorities.map((p) =>
                p.id === priorityId ? { ...p, completed: !p.completed } : p
              ),
            },
          },
        }
      }),

      removePriority: (date, priorityId) => set((state) => {
        remindSignInIfNeeded('Priorities')
        const dayPlan = state.dayPlans[date]
        if (!dayPlan) return state

        return {
          dayPlans: {
            ...state.dayPlans,
            [date]: {
              ...dayPlan,
              priorities: dayPlan.priorities.filter((p) => p.id !== priorityId),
            },
          },
        }
      }),

      // Week Planning
      createWeekPlan: (weekPlan) => {
        remindSignInIfNeeded('Weekly planning')
        set((state) => ({
          weekPlans: {
            ...state.weekPlans,
            [weekPlan.id]: weekPlan,
          },
        }))
      },

      updateWeekPlan: (weekId, updates) => {
        remindSignInIfNeeded('Weekly planning')
        set((state) => ({
          weekPlans: {
            ...state.weekPlans,
            [weekId]: {
              ...state.weekPlans[weekId],
              ...updates,
            },
          },
        }))
      },

      // Utilities
      updateEmotionHue: () => {
        const { mood } = get()
        const hue = emotionToHue[mood.dominantEmotion]
        
        document.documentElement.style.setProperty('--emotion-hue', hue.toString())
      },

      getTodayPlan: () => {
        const today = getTodayDate()
        return get().dayPlans[today]
      },

      getActiveHabits: () => {
        return get().habits.filter((habit) => {
          const lastCompleted = habit.lastCompletedAt
          if (!lastCompleted) {
            const daysSinceCreated = Math.floor(
              (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            )
            return daysSinceCreated <= 7
          }
          
          const daysSinceCompletion = Math.floor(
            (Date.now() - new Date(lastCompleted).getTime()) / (1000 * 60 * 60 * 24)
          )
          return daysSinceCompletion <= 7
        })
      },

      getGoalProgress: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId)
        if (!goal) return 0
        
        const relatedSystems = get().systems.filter((s) => 
          goal.systems.includes(s.id)
        )
        
        if (relatedSystems.length === 0) return goal.progress
        
        let totalProgress = 0
        relatedSystems.forEach((system) => {
          const systemHabits = get().habits.filter((h) => 
            system.habits.includes(h.id)
          )
          
          if (systemHabits.length > 0) {
            const avgStreak = systemHabits.reduce((sum, h) => sum + h.streak, 0) / systemHabits.length
            totalProgress += Math.min(100, (avgStreak / 30) * 100)
          }
        })
        
        return Math.round(totalProgress / relatedSystems.length)
      },

      activeThemeId: 'default',
      setActiveTheme: (themeId) => {
        remindSignInIfNeeded('Theme customization')
        applyThemeToDocument(themeId)
        set({ activeThemeId: themeId })
      },

  setLastSync: (date: Date | null) => {
    remindSignInIfNeeded('Syncing')
    set({ lastSync: date })
  },
    }),
    {
      name: 'eunonix-storage',
      version: 1,
  storage: createJSONStorage(() => scopedStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        try {
          // defer to ensure DOM is ready before touching documentElement
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
              state.updateEmotionHue()
              applyThemeToDocument(state.activeThemeId ?? 'default')
            })
          } else {
            state.updateEmotionHue()
            applyThemeToDocument(state.activeThemeId ?? 'default')
          }
        } catch (error) {
          console.warn('[Eunonix] Failed to rehydrate emotion hue.', error)
        }
      },
    }
  )
)

useAuthStore.subscribe((state, previousState) => {
  const prevScope = previousState && previousState.isAuthenticated && previousState.activeAccountId
    ? `user:${previousState.activeAccountId}`
    : PREVIEW_SCOPE
  const nextScope = state.isAuthenticated && state.activeAccountId
    ? `user:${state.activeAccountId}`
    : PREVIEW_SCOPE

  if (nextScope === prevScope) {
    return
  }

  if (!state.isAuthenticated) {
    Object.keys(previewMemory).forEach((key) => delete previewMemory[key])
    previewHints.clear()
  }

  if (typeof useAppStore.persist?.rehydrate === 'function') {
    useAppStore.persist.rehydrate()
  }
})

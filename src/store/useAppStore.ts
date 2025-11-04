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
}

const emotionToHue: Record<EmotionType, number> = {
  calm: 210,      // Blue
  motivated: 45,  // Golden
  empathetic: 330, // Pink
  rest: 200,      // Gray-blue
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
      lastSync: new Date(),

      setMood: (mood) => {
        set({ mood })
        get().updateEmotionHue()
      },

      // Tasks
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),

      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ),
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),

      // Reflections
      addReflection: (reflection) => set((state) => ({
        reflections: [reflection, ...state.reflections],
      })),

      // Goals
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal],
      })),

      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id ? { ...goal, ...updates } : goal
        ),
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== id),
      })),

      // Systems
      addSystem: (system) => set((state) => ({
        systems: [...state.systems, system],
      })),

      updateSystem: (id, updates) => set((state) => ({
        systems: state.systems.map((system) =>
          system.id === id ? { ...system, ...updates } : system
        ),
      })),

      deleteSystem: (id) => set((state) => ({
        systems: state.systems.filter((system) => system.id !== id),
      })),

      // Habits
      addHabit: (habit) => set((state) => ({
        habits: [...state.habits, habit],
      })),

      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, ...updates } : habit
        ),
      })),

      completeHabit: (id, date) => set((state) => ({
        habits: state.habits.map((habit) => {
          if (habit.id !== id) return habit
          
          const completedDates = [...habit.completedDates]
          const dateIndex = completedDates.indexOf(date)
          
          if (dateIndex === -1) {
            // Complete the habit
            completedDates.push(date)
            const newStreak = habit.streak + 1
            return {
              ...habit,
              completedDates,
              streak: newStreak,
              longestStreak: Math.max(habit.longestStreak, newStreak),
              lastCompletedAt: new Date(),
            }
          } else {
            // Uncomplete the habit
            completedDates.splice(dateIndex, 1)
            return {
              ...habit,
              completedDates,
              streak: Math.max(0, habit.streak - 1),
            }
          }
        }),
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== id),
      })),

      // Day Planning
      createDayPlan: (dayPlan) => set((state) => ({
        dayPlans: {
          ...state.dayPlans,
          [dayPlan.date]: dayPlan,
        },
      })),

      updateDayPlan: (date, updates) => set((state) => ({
        dayPlans: {
          ...state.dayPlans,
          [date]: {
            ...state.dayPlans[date],
            ...updates,
          },
        },
      })),

      addPriority: (date, priority) => set((state) => {
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
      createWeekPlan: (weekPlan) => set((state) => ({
        weekPlans: {
          ...state.weekPlans,
          [weekPlan.id]: weekPlan,
        },
      })),

      updateWeekPlan: (weekId, updates) => set((state) => ({
        weekPlans: {
          ...state.weekPlans,
          [weekId]: {
            ...state.weekPlans[weekId],
            ...updates,
          },
        },
      })),

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
    }),
    {
      name: 'lifeos-storage',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        try {
          // defer to ensure DOM is ready before touching documentElement
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
              state.updateEmotionHue()
            })
          } else {
            state.updateEmotionHue()
          }
        } catch (error) {
          console.warn('[LifeOS] Failed to rehydrate emotion hue.', error)
        }
      },
    }
  )
)

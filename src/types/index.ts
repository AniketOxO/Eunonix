export type EmotionType = 'calm' | 'motivated' | 'empathetic' | 'rest'

export interface Emotion {
  type: EmotionType
  intensity: number // 0-100
  timestamp: Date
}

export interface MoodData {
  emotions: Emotion[]
  dominantEmotion: EmotionType
  energyLevel: number
  clarity: number
}

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  emotionalContext?: EmotionType
  dueDate?: Date
  streak?: number
  category?: 'quick' | 'deep' | 'creative' | 'rest'
}

export interface Reflection {
  id: string
  content: string
  timestamp: Date
  emotion: EmotionType
  tags: string[]
}

// New types for Goals, Systems & Habits
export interface LifeGoal {
  id: string
  title: string
  description: string
  category: 'health' | 'career' | 'relationships' | 'personal' | 'financial' | 'learning'
  targetDate?: Date
  progress: number // 0-100
  systems: string[] // IDs of related systems
  createdAt: Date
  emotionalWhy?: string // Why this goal matters emotionally
}

export interface System {
  id: string
  title: string
  description: string
  goalId?: string // Related goal
  habits: string[] // IDs of related habits
  frequency: 'daily' | 'weekly' | 'monthly'
  active: boolean
  createdAt: Date
}

export interface Habit {
  id: string
  title: string
  description?: string
  systemId?: string // Related system
  streak: number
  longestStreak: number
  frequency: 'daily' | 'weekly' | 'custom'
  completedDates: string[] // ISO date strings
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime'
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: Date
  lastCompletedAt?: Date
  color?: string
}

// Planning types
export interface DayPlan {
  id: string
  date: string // ISO date string
  focus: string // Main intention for the day
  priorities: Priority[]
  timeBlocks: TimeBlock[]
  reflection?: string
  energyLevel?: number
  completionRate?: number
}

export interface Priority {
  id: string
  title: string
  type: 'must' | 'should' | 'could'
  completed: boolean
  estimatedTime?: number // minutes
  actualTime?: number
  relatedGoalId?: string
  relatedHabitId?: string
}

export interface TimeBlock {
  id: string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  title: string
  type: 'deep' | 'shallow' | 'break' | 'meeting' | 'creative' | 'rest'
  completed: boolean
  color?: string
}

export interface WeekPlan {
  id: string
  weekStart: string // ISO date string (Monday)
  theme: string // Weekly theme/focus
  goals: string[] // What to accomplish this week
  dayPlans: { [date: string]: DayPlan }
  review?: string
}

export interface ThemePalette {
  id: string
  name: string
  description: string
  background: string
  card: string
  accent: string
  glow: string
  text: string
  neutral: string
}

export interface ThemeState {
  activeThemeId: string
}

export interface UserState {
  mood: MoodData
  tasks: Task[]
  reflections: Reflection[]
  
  // New state
  goals: LifeGoal[]
  systems: System[]
  habits: Habit[]
  dayPlans: { [date: string]: DayPlan }
  weekPlans: { [weekId: string]: WeekPlan }
  
  lastSync: Date | null
  activeThemeId: string
}

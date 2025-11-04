import { EmotionType } from '@/types'

export const emotionColors: Record<EmotionType, string> = {
  calm: 'from-blue-400/20 to-blue-500/10',
  motivated: 'from-golden-400/20 to-golden-500/10',
  empathetic: 'from-pink-400/20 to-pink-500/10',
  rest: 'from-gray-400/20 to-gray-500/10',
}

export const emotionGlowColors: Record<EmotionType, string> = {
  calm: 'text-blue-400',
  motivated: 'text-golden-400',
  empathetic: 'text-pink-400',
  rest: 'text-gray-400',
}

export const emotionLabels: Record<EmotionType, string> = {
  calm: 'Calm & Reflective',
  motivated: 'Motivated & Creative',
  empathetic: 'Empathetic & Open',
  rest: 'Resting & Resetting',
}

export const getTimeOfDayGreeting = (): string => {
  const hour = new Date().getHours()
  
  if (hour < 6) return 'Rest well'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  if (hour < 22) return 'Good evening'
  return 'Good night'
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

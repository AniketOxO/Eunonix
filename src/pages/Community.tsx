import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { readJSON, writeJSON, safeStorage } from '@/utils/storage'

type ChannelCategory = 'mindfulness' | 'creativity' | 'growth' | 'philosophy' | 'wellness'

type AvatarIconKey =
  | 'default'
  | 'calm'
  | 'sunrise'
  | 'bloom'
  | 'mentor'
  | 'idea'
  | 'palette'
  | 'writer'
  | 'poem'
  | 'column'
  | 'book'
  | 'notebook'
  | 'run'
  | 'strength'
  | 'yoga'
  | 'target'
  | 'folder'
  | 'mic'
  | 'leaf'
  | 'digital'
  | 'compass'
  | 'trophy'
  | 'bullseye'
  | 'self'

type QuestIconKey =
  | 'mind_reset'
  | 'gratitude'
  | 'creative'
  | 'reading'
  | 'endurance'
  | 'sunrise'
  | 'hydration'
  | 'focus'
  | 'sleep'
  | 'custom'

type CommunityTab = 'channels' | 'reflections' | 'quests' | 'progress'

interface LifeChannel {
  id: string
  name: string
  description: string
  isPrivate: boolean
  category: ChannelCategory
  members: number
  coverGradient: string
  messages: ChannelMessage[]
}

interface ChannelMessage {
  id: string
  author: string
  content: string
  timestamp: Date
  avatar?: AvatarIconKey
}

interface Reflection {
  id: string
  author: string
  content: string
  isAnonymous: boolean
  category: string
  timestamp: Date
  likes: number
  likedBy: string[]
}

interface Quest {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: string
  participants: number
  progress: number
  tasks: QuestTask[]
  joined: boolean
  icon: QuestIconKey
}

interface QuestTask {
  id: string
  text: string
  completed: boolean
}

interface SharedProgress {
  id: string
  author: string
  avatar: AvatarIconKey
  achievement: string
  metric: string
  timestamp: Date
}

const meditationIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="7" r="2.25" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 17.25l2.25-2.25 3-1.5 3 1.5 2.25 2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20.25h6" />
  </svg>
)

const sunriseIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 15.75h13.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.75V4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25L6 6.75" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 8.25L18 6.75" />
  </svg>
)

const targetIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="7.5" strokeWidth={1.5} />
    <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5V3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12h-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h1.5" />
  </svg>
)

const gratitudeIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 11.25l3.75 3.75 3.75-3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 9a3.75 3.75 0 017.5 0v1.5h1.5a2.25 2.25 0 010 4.5H8.25a3 3 0 110-6H9" />
  </svg>
)

const nutritionIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 13.5h15l-1.5 6h-12z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 13.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9c-.75-1.5-.75-3 1.5-3.75" />
  </svg>
)

const learningIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 7.5l7.5-3 7.5 3-7.5 3-7.5-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12l7.5 3 7.5-3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 16.5l7.5 3 7.5-3" />
  </svg>
)

const userIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 9a4 4 0 11-8 0 4 4 0 018 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 19.5a6 6 0 0112 0" />
  </svg>
)

const ideaIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 18.75h6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 15.75h4.5A1.5 1.5 0 0015.75 14v-1.125a6 6 0 10-7.5 0V14a1.5 1.5 0 001.5 1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5V3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 7.5L5.25 6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 7.5L18.75 6" />
  </svg>
)

const paletteIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5a7.5 7.5 0 00-7.5 7.5c0 3.375 2.25 5.25 3.75 5.25h1.125a1.125 1.125 0 011.125 1.125A1.875 1.875 0 0012.375 20c2.625 0 4.875-2.25 4.875-4.875A7.5 7.5 0 0012 4.5z" />
    <circle cx="9" cy="9" r="0.75" fill="currentColor" />
    <circle cx="12" cy="7.5" r="0.75" fill="currentColor" />
    <circle cx="14.5" cy="9" r="0.75" fill="currentColor" />
    <circle cx="11.5" cy="11" r="0.75" fill="currentColor" />
  </svg>
)

const penIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l3.231-.538L18.768 7.924a1.5 1.5 0 000-2.121l-1.571-1.571a1.5 1.5 0 00-2.121 0L6.038 15.771 4.5 19.5z" />
  </svg>
)

const columnIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 6h13.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 6v12.75" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6v12.75" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18.75h12" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 9h12" />
  </svg>
)

const bookIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 5.25h5.25v13.5H6.75A2.25 2.25 0 014.5 16.5V7.5a2.25 2.25 0 012.25-2.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 5.25H12v13.5h5.25a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.75l-1.5.75" />
  </svg>
)

const notebookIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="6" y="4.5" width="12" height="15" rx="2" ry="2" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4.5v15" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 8.25h3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 11.25h3" />
  </svg>
)

const runIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 5.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 21l2.25-4.5 3-2.25 1.5-4.5 3 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12.75l3 3.75h3" />
  </svg>
)

const strengthIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 9.75h2.25v4.5H4.5a1.5 1.5 0 01-1.5-1.5v-1.5a1.5 1.5 0 011.5-1.5zM19.5 9.75h-2.25v4.5h2.25a1.5 1.5 0 001.5-1.5v-1.5a1.5 1.5 0 00-1.5-1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 10.5h10.5v3H6.75z" />
  </svg>
)

const folderIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 7.5h6l1.5 2.25h8.25a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 013.75 7.5z" />
  </svg>
)

const micIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="9" y="4.5" width="6" height="9" rx="3" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 10.5v1.5a5.25 5.25 0 0010.5 0v-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19.5v-3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 19.5h4.5" />
  </svg>
)

const leafIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 18.75c6-1.5 10.5-6 13.5-13.5-7.5 3-12 7.5-13.5 13.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 14.25l3 3" />
  </svg>
)

const digitalIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="7.5" y="3.75" width="9" height="16.5" rx="1.5" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 18h3" />
  </svg>
)

const compassIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="8.25" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75l-1.5 4.5-4.5 1.5 1.5-4.5z" />
  </svg>
)

const trophyIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5h7.5v3a3.75 3.75 0 11-7.5 0v-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25h6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11.25v6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 4.5h-1.5a1.5 1.5 0 00-1.5 1.5v1.5a3 3 0 003 3h1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 4.5h1.5a1.5 1.5 0 011.5 1.5v1.5a3 3 0 01-3 3h-1.5" />
  </svg>
)

const chatIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5c4.142 0 7.5 2.514 7.5 5.625 0 3.111-3.358 5.625-7.5 5.625h-1.5l-3 2.25v-2.25C4.358 15 1 12.486 1 9.375 1 6.264 4.358 4.5 8.5 4.5z" />
  </svg>
)

const maskIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 6.75v5.25c0 4.125 3.375 7.5 7.5 7.5s7.5-3.375 7.5-7.5V6.75c0-3-2.25-5.25-5.25-5.25h-4.5c-3 0-5.25 2.25-5.25 5.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 10.5c.75-.75 1.5-.75 2.25 0" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12.75 10.5c.75-.75 1.5-.75 2.25 0" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 14.25c.75.75 2.25.75 3 0" />
  </svg>
)

const smileIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="7.5" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10.5h.009" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5h.009" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 14.25a3.75 3.75 0 004.5 0" />
  </svg>
)

const heartPulseIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 9.75a3.75 3.75 0 016.75-2.25l.75.75.75-.75a3.75 3.75 0 016.75 2.25c0 4.5-7.5 8.25-7.5 8.25s-7.5-3.75-7.5-8.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 12.75h2.25l1.5-3 1.5 6 1.5-3h2.25" />
  </svg>
)

const CATEGORY_ICONS: Record<ChannelCategory, JSX.Element> = {
  mindfulness: meditationIcon('w-7 h-7 text-lilac-700'),
  creativity: ideaIcon('w-7 h-7 text-lilac-700'),
  growth: leafIcon('w-7 h-7 text-lilac-700'),
  philosophy: columnIcon('w-7 h-7 text-lilac-700'),
  wellness: heartPulseIcon('w-7 h-7 text-lilac-700'),
}

const AVATAR_ICONS: Record<AvatarIconKey, JSX.Element> = {
  default: userIcon('w-5 h-5 text-ink-600'),
  self: userIcon('w-5 h-5 text-lilac-600'),
  calm: meditationIcon('w-5 h-5 text-lilac-600'),
  yoga: meditationIcon('w-5 h-5 text-lilac-600'),
  sunrise: sunriseIcon('w-5 h-5 text-golden-500'),
  bloom: leafIcon('w-5 h-5 text-lilac-600'),
  leaf: leafIcon('w-5 h-5 text-lilac-600'),
  mentor: chatIcon('w-5 h-5 text-lilac-600'),
  idea: ideaIcon('w-5 h-5 text-lilac-600'),
  palette: paletteIcon('w-5 h-5 text-lilac-600'),
  writer: penIcon('w-5 h-5 text-lilac-600'),
  poem: penIcon('w-5 h-5 text-lilac-600'),
  column: columnIcon('w-5 h-5 text-lilac-600'),
  book: bookIcon('w-5 h-5 text-lilac-600'),
  notebook: notebookIcon('w-5 h-5 text-lilac-600'),
  run: runIcon('w-5 h-5 text-lilac-600'),
  strength: strengthIcon('w-5 h-5 text-lilac-600'),
  target: targetIcon('w-5 h-5 text-lilac-600'),
  folder: folderIcon('w-5 h-5 text-lilac-600'),
  mic: micIcon('w-5 h-5 text-lilac-600'),
  digital: digitalIcon('w-5 h-5 text-lilac-600'),
  compass: compassIcon('w-5 h-5 text-lilac-600'),
  trophy: trophyIcon('w-5 h-5 text-lilac-600'),
  bullseye: targetIcon('w-5 h-5 text-lilac-600'),
}

const REFLECTION_AVATARS = {
  anonymous: maskIcon('w-5 h-5 text-ink-600'),
  named: smileIcon('w-5 h-5 text-lilac-600'),
}

const QUEST_ICONS: Record<QuestIconKey, JSX.Element> = {
  mind_reset: meditationIcon('w-6 h-6 text-lilac-600'),
  gratitude: gratitudeIcon('w-6 h-6 text-lilac-600'),
  creative: paletteIcon('w-6 h-6 text-lilac-600'),
  reading: learningIcon('w-6 h-6 text-lilac-600'),
  endurance: runIcon('w-6 h-6 text-lilac-600'),
  sunrise: sunriseIcon('w-6 h-6 text-golden-500'),
  hydration: nutritionIcon('w-6 h-6 text-lilac-600'),
  focus: targetIcon('w-6 h-6 text-lilac-600'),
  sleep: ideaIcon('w-6 h-6 text-lilac-600'),
  custom: userIcon('w-6 h-6 text-lilac-600'),
}

const COMMUNITY_TABS: Array<{ id: CommunityTab; label: string; icon: (isActive: boolean) => JSX.Element }> = [
  {
    id: 'channels',
    label: 'Channels',
    icon: (isActive) => chatIcon(`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`),
  },
  {
    id: 'reflections',
    label: 'Reflections',
    icon: (isActive) => notebookIcon(`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`),
  },
  {
    id: 'quests',
    label: 'Quests',
    icon: (isActive) => targetIcon(`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`),
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: (isActive) => trophyIcon(`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`),
  },
]

// Sample data factories keep the community feeling alive on first load or resets
const createSampleChannels = (): LifeChannel[] => [
  {
    id: '1',
    name: 'Mindful Mornings',
    description: 'Start your day with intention and peace',
    isPrivate: false,
    category: 'mindfulness',
    members: 247,
    coverGradient: 'from-lilac-200 to-sand-200',
    messages: [
      {
        id: 'm1',
        author: 'Sarah',
        content: 'Good morning everyone! Started my day with 10 minutes of meditation and breathwork.',
        timestamp: new Date(Date.now() - 3600000),
        avatar: 'calm'
      },
      {
        id: 'm2',
        author: 'Mike',
        content: 'Morning! Watching the sunrise with coffee and a quiet journal session.',
        timestamp: new Date(Date.now() - 1800000),
        avatar: 'sunrise'
      },
      {
        id: 'm3',
        author: 'Lily',
        content: 'I love this community! Been doing 5-minute breathing exercises every morning this week.',
        timestamp: new Date(Date.now() - 900000),
        avatar: 'bloom'
      },
      {
        id: 'm4',
        author: 'David',
        content: 'Question: Does anyone have tips for staying present throughout the day?',
        timestamp: new Date(Date.now() - 600000),
        avatar: 'mentor'
      },
      {
        id: 'm5',
        author: 'Sarah',
        content: '@David I set hourly reminders on my phone to take three deep breaths. Game changer!',
        timestamp: new Date(Date.now() - 300000),
        avatar: 'calm'
      },
      {
        id: 'm19',
        author: 'Priya',
        content: 'Sharing a five-minute body scan audio I recorded this morning. Let me know if it helps!',
        timestamp: new Date(Date.now() - 240000),
        avatar: 'idea'
      }
    ]
  },
  {
    id: '2',
    name: 'Creative Souls',
    description: 'Share your art, writing, and creative projects',
    isPrivate: false,
    category: 'creativity',
    members: 189,
    coverGradient: 'from-golden-200 to-lilac-200',
    messages: [
      {
        id: 'm6',
        author: 'Emma',
        content: 'Just finished a watercolor painting of the ocean! So therapeutic.',
        timestamp: new Date(Date.now() - 7200000),
        avatar: 'palette'
      },
      {
        id: 'm7',
        author: 'Alex',
        content: 'Working on a short story about letting go. Anyone else writing this week?',
        timestamp: new Date(Date.now() - 5400000),
        avatar: 'writer'
      },
      {
        id: 'm8',
        author: 'Jordan',
        content: "I am! Writing poetry every evening. It's become my favorite ritual.",
        timestamp: new Date(Date.now() - 3600000),
        avatar: 'poem'
      },
      {
        id: 'm20',
        author: 'Nora',
        content: 'Sharing a prompt for today: "Describe joy without using the word joy."',
        timestamp: new Date(Date.now() - 2400000),
        avatar: 'idea'
      }
    ]
  },
  {
    id: '3',
    name: 'Stoic Philosophers',
    description: 'Discuss ancient wisdom and modern applications',
    isPrivate: true,
    category: 'philosophy',
    members: 156,
    coverGradient: 'from-ink-200 to-sand-200',
    messages: [
      {
        id: 'm9',
        author: 'Marcus',
        content: 'Reading Meditations again. "You have power over your mind - not outside events."',
        timestamp: new Date(Date.now() - 10800000),
        avatar: 'column'
      },
      {
        id: 'm10',
        author: 'Elena',
        content: 'That quote hits different every time. Applied it today when my plans changed.',
        timestamp: new Date(Date.now() - 9000000),
        avatar: 'book'
      },
      {
        id: 'm21',
        author: 'Thomas',
        content: 'Trying the morning reflection from Marcus Aurelius. Anyone want to keep each other accountable?',
        timestamp: new Date(Date.now() - 4200000),
        avatar: 'notebook'
      }
    ]
  },
  {
    id: '4',
    name: 'Fitness & Movement',
    description: 'Celebrate movement, health, and physical wellness',
    isPrivate: false,
    category: 'wellness',
    members: 312,
    coverGradient: 'from-green-200 to-blue-200',
    messages: [
      {
        id: 'm11',
        author: 'Ryan',
        content: 'Crushed a 5K this morning! Feeling amazing and energized.',
        timestamp: new Date(Date.now() - 7200000),
        avatar: 'run'
      },
      {
        id: 'm12',
        author: 'Nina',
        content: 'Congrats! I did yoga for 30 minutes. Small wins add up!',
        timestamp: new Date(Date.now() - 5400000),
        avatar: 'yoga'
      },
      {
        id: 'm13',
        author: 'Chris',
        content: 'Starting week three of my workout routine. Consistency is key.',
        timestamp: new Date(Date.now() - 1800000),
        avatar: 'target'
      },
      {
        id: 'm22',
        author: 'Lara',
        content: 'Shared a 20-minute mobility flow in the files tab—perfect for desk workers!',
        timestamp: new Date(Date.now() - 900000),
        avatar: 'folder'
      }
    ]
  },
  {
    id: '5',
    name: 'Book Club',
    description: 'Discuss meaningful books and share recommendations',
    isPrivate: false,
    category: 'growth',
    members: 203,
    coverGradient: 'from-amber-200 to-orange-200',
    messages: [
      {
        id: 'm14',
        author: 'Rachel',
        content: 'Just finished "Atomic Habits"—life changing! Who else has read it?',
        timestamp: new Date(Date.now() - 14400000),
        avatar: 'book'
      },
      {
        id: 'm15',
        author: 'Tom',
        content: 'One of my favorites! The one percent better concept is so powerful.',
        timestamp: new Date(Date.now() - 12600000),
        avatar: 'notebook'
      },
      {
        id: 'm16',
        author: 'Maya',
        content: 'Adding it to my list! Currently reading "The Courage to Be Disliked."',
        timestamp: new Date(Date.now() - 3600000),
        avatar: 'book'
      },
      {
        id: 'm23',
        author: 'Leo',
        content: 'Hosting a live audio chat Sunday on Chapter 3 takeaways. RSVP in events!',
        timestamp: new Date(Date.now() - 2700000),
        avatar: 'mic'
      }
    ]
  },
  {
    id: '6',
    name: 'Digital Minimalists',
    description: 'Less screen time, more life time',
    isPrivate: false,
    category: 'mindfulness',
    members: 178,
    coverGradient: 'from-gray-200 to-slate-200',
    messages: [
      {
        id: 'm17',
        author: 'Kate',
        content: 'Day five of no social media scrolling. Feeling so much more present!',
        timestamp: new Date(Date.now() - 10800000),
        avatar: 'leaf'
      },
      {
        id: 'm18',
        author: 'Ben',
        content: "That's inspiring! I limited my phone to two hours a day. Already seeing benefits.",
        timestamp: new Date(Date.now() - 7200000),
        avatar: 'digital'
      },
      {
        id: 'm24',
        author: 'Mira',
        content: 'Shared a lock-screen reminder template for mindful tech use—check resources!',
        timestamp: new Date(Date.now() - 1800000),
        avatar: 'compass'
      }
    ]
  }
]

const createSampleReflections = (): Reflection[] => [
  {
    id: 'r1',
    author: 'Anonymous',
    content: "Today I realized that growth isn't about being perfect, it's about being consistent. Small steps every day.",
    isAnonymous: true,
    category: 'personal-growth',
    timestamp: new Date(Date.now() - 7200000),
    likes: 24,
    likedBy: []
  },
  {
    id: 'r2',
    author: 'Jordan',
    content: 'Grateful for the quiet moments between chaos. They remind me what matters most.',
    isAnonymous: false,
    category: 'gratitude',
    timestamp: new Date(Date.now() - 14400000),
    likes: 18,
    likedBy: []
  },
  {
    id: 'r3',
    author: 'Anonymous',
    content: "I used to think self-care was selfish. Now I understand it's essential. You can't pour from an empty cup.",
    isAnonymous: true,
    category: 'mindfulness',
    timestamp: new Date(Date.now() - 21600000),
    likes: 31,
    likedBy: []
  },
  {
    id: 'r4',
    author: 'Sofia',
    content: "Started journaling 3 months ago. It's incredible how much clarity comes from just writing things down.",
    isAnonymous: false,
    category: 'personal-growth',
    timestamp: new Date(Date.now() - 28800000),
    likes: 27,
    likedBy: []
  },
  {
    id: 'r5',
    author: 'Anonymous',
    content: "Failure isn't the opposite of success. It's a stepping stone. Every mistake taught me something valuable.",
    isAnonymous: true,
    category: 'philosophy',
    timestamp: new Date(Date.now() - 43200000),
    likes: 45,
    likedBy: []
  },
  {
    id: 'r6',
    author: 'Maya',
    content: "Thankful for my morning coffee ritual. It's not about the caffeine - it's about the peaceful 10 minutes just for me.",
    isAnonymous: false,
    category: 'gratitude',
    timestamp: new Date(Date.now() - 86400000),
    likes: 19,
    likedBy: []
  },
  {
    id: 'r7',
    author: 'Anonymous',
    content: 'Sometimes the bravest thing you can do is ask for help. I finally did, and everything changed.',
    isAnonymous: true,
    category: 'personal-growth',
    timestamp: new Date(Date.now() - 129600000),
    likes: 52,
    likedBy: []
  }
]

const createSampleQuests = (): Quest[] => [
  {
    id: 'q1',
    title: 'Mind Reset Week',
    description: 'Seven days of mindfulness and mental clarity',
    difficulty: 'medium',
    duration: '7 days',
    participants: 89,
    progress: 0,
    joined: false,
    icon: 'mind_reset',
    tasks: [
      { id: 't1', text: 'Day 1: 5-minute morning meditation', completed: false },
      { id: 't2', text: 'Day 2: Digital detox for 2 hours', completed: false },
      { id: 't3', text: 'Day 3: Nature walk without phone', completed: false },
      { id: 't4', text: 'Day 4: Gratitude journaling', completed: false },
      { id: 't5', text: 'Day 5: Breathing exercises', completed: false },
      { id: 't6', text: 'Day 6: Mindful eating practice', completed: false },
      { id: 't7', text: 'Day 7: Reflection & celebration', completed: false }
    ]
  },
  {
    id: 'q2',
    title: '30-Day Gratitude Challenge',
    description: 'Cultivate appreciation and positive mindset',
    difficulty: 'easy',
    duration: '30 days',
    participants: 234,
    progress: 0,
    joined: false,
    icon: 'gratitude',
    tasks: Array.from({ length: 30 }, (_, i) => ({
      id: `t${i + 1}`,
      text: `Day ${i + 1}: Write 3 things you're grateful for`,
      completed: false
    }))
  },
  {
    id: 'q3',
    title: 'Creative Breakthrough Sprint',
    description: 'Unlock your creative potential in 14 days',
    difficulty: 'hard',
    duration: '14 days',
    participants: 67,
    progress: 0,
    joined: false,
    icon: 'creative',
    tasks: [
      { id: 't1', text: 'Day 1: Morning pages - write 3 pages', completed: false },
      { id: 't2', text: 'Day 2: Create without judgment', completed: false },
      { id: 't3', text: 'Day 3: Try a new medium', completed: false },
      { id: 't4', text: 'Day 4: Artist date - solo creative outing', completed: false },
      { id: 't5', text: 'Day 5: Collaborate with someone', completed: false },
      { id: 't6', text: 'Day 6: Study your creative heroes', completed: false },
      { id: 't7', text: 'Day 7: Rest & reflect', completed: false },
      { id: 't8', text: 'Day 8: Create from a prompt', completed: false },
      { id: 't9', text: 'Day 9: Share your work', completed: false },
      { id: 't10', text: 'Day 10: Experiment wildly', completed: false },
      { id: 't11', text: 'Day 11: Create with constraints', completed: false },
      { id: 't12', text: 'Day 12: Teach someone your craft', completed: false },
      { id: 't13', text: 'Day 13: Create your masterpiece', completed: false },
      { id: 't14', text: 'Day 14: Celebrate & plan next steps', completed: false }
    ]
  },
  {
    id: 'q4',
    title: 'Read 1 Book Per Week',
    description: 'Build a consistent reading habit over 4 weeks',
    difficulty: 'medium',
    duration: '30 days',
    participants: 156,
    progress: 0,
    joined: false,
    icon: 'reading',
    tasks: [
      { id: 't1', text: 'Week 1: Choose and finish first book', completed: false },
      { id: 't2', text: 'Week 1: Write a brief reflection', completed: false },
      { id: 't3', text: 'Week 2: Choose and finish second book', completed: false },
      { id: 't4', text: 'Week 2: Share one key insight', completed: false },
      { id: 't5', text: 'Week 3: Choose and finish third book', completed: false },
      { id: 't6', text: 'Week 3: Recommend to a friend', completed: false },
      { id: 't7', text: 'Week 4: Choose and finish fourth book', completed: false },
      { id: 't8', text: 'Week 4: Celebrate your reading habit!', completed: false }
    ]
  },
  {
    id: 'q5',
    title: 'Couch to 5K',
    description: 'Go from zero to running 5 kilometers in 8 weeks',
    difficulty: 'hard',
    duration: '30 days',
    participants: 198,
    progress: 0,
    joined: false,
    icon: 'endurance',
    tasks: [
      { id: 't1', text: 'Week 1: Walk/jog intervals - 3 sessions', completed: false },
      { id: 't2', text: 'Week 2: Increase jogging time - 3 sessions', completed: false },
      { id: 't3', text: 'Week 3: 5-minute continuous jog - 3 sessions', completed: false },
      { id: 't4', text: 'Week 4: 10-minute continuous jog - 3 sessions', completed: false },
      { id: 't5', text: 'Week 5: 15-minute continuous run - 3 sessions', completed: false },
      { id: 't6', text: 'Week 6: 20-minute continuous run - 3 sessions', completed: false },
      { id: 't7', text: 'Week 7: 25-minute continuous run - 3 sessions', completed: false },
      { id: 't8', text: 'Week 8: Complete your first 5K!', completed: false }
    ]
  },
  {
    id: 'q6',
    title: 'Early Riser Challenge',
    description: 'Wake up at 6 AM for 21 days straight',
    difficulty: 'medium',
    duration: '21 days',
    participants: 112,
    progress: 0,
    joined: false,
    icon: 'sunrise',
    tasks: Array.from({ length: 21 }, (_, i) => ({
      id: `t${i + 1}`,
      text: `Day ${i + 1}: Wake up at 6 AM`,
      completed: false
    }))
  },
  {
    id: 'q7',
    title: 'Hydration Hero',
    description: 'Drink 8 glasses of water daily for 14 days',
    difficulty: 'easy',
    duration: '14 days',
    participants: 276,
    progress: 0,
    joined: false,
    icon: 'hydration',
    tasks: Array.from({ length: 14 }, (_, i) => ({
      id: `t${i + 1}`,
      text: `Day ${i + 1}: Drink 8 glasses (64oz) of water`,
      completed: false
    }))
  },
  {
    id: 'q8',
    title: 'Focus Flow - Deep Work',
    description: '2 hours of distraction-free work daily',
    difficulty: 'hard',
    duration: '14 days',
    participants: 145,
    progress: 0,
    joined: false,
    icon: 'focus',
    tasks: Array.from({ length: 14 }, (_, i) => ({
      id: `t${i + 1}`,
      text: `Day ${i + 1}: 2 hours of deep work (no phone/distractions)`,
      completed: false
    }))
  },
  {
    id: 'q9',
    title: 'Sleep Optimizer',
    description: 'Get 8 hours of quality sleep for 21 nights',
    difficulty: 'medium',
    duration: '21 days',
    participants: 203,
    progress: 0,
    joined: false,
    icon: 'sleep',
    tasks: Array.from({ length: 21 }, (_, i) => ({
      id: `t${i + 1}`,
      text: `Night ${i + 1}: Sleep 8 hours (no screens 1hr before bed)`,
      completed: false
    }))
  }
]

const createSampleSharedProgress = (): SharedProgress[] => [
  {
    id: 'p1',
    author: 'Alex',
    avatar: 'trophy',
    achievement: 'Completed 30-day meditation streak',
    metric: '30 days in a row',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 'p2',
    author: 'Taylor',
    avatar: 'book',
    achievement: 'Read 12 books this quarter',
    metric: '4 books/month',
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: 'p3',
    author: 'Sofia',
    avatar: 'run',
    achievement: 'Ran my first 10K race!',
    metric: 'Personal best: 58 minutes',
    timestamp: new Date(Date.now() - 10800000)
  },
  {
    id: 'p4',
    author: 'Marcus',
    avatar: 'writer',
    achievement: 'Journaled every day for 100 days',
    metric: '100 consecutive days',
    timestamp: new Date(Date.now() - 14400000)
  },
  {
    id: 'p5',
    author: 'Nina',
    avatar: 'palette',
    achievement: 'Finished my first oil painting',
    metric: '3 weeks of practice',
    timestamp: new Date(Date.now() - 21600000)
  },
  {
    id: 'p6',
    author: 'Chris',
    avatar: 'strength',
    achievement: 'Lost 15 pounds through consistent exercise',
    metric: '3 months journey',
    timestamp: new Date(Date.now() - 28800000)
  },
  {
    id: 'p7',
    author: 'Emma',
    avatar: 'bloom',
    achievement: 'Started a morning routine and stuck with it',
    metric: '60 days strong',
    timestamp: new Date(Date.now() - 43200000)
  },
  {
    id: 'p8',
    author: 'Ryan',
    avatar: 'yoga',
    achievement: 'Completed 200 hours of yoga',
    metric: 'Over 6 months',
    timestamp: new Date(Date.now() - 86400000)
  }
]

const Community = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CommunityTab>('channels')
  
  // Channels State
  const [channels, setChannels] = useState<LifeChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<LifeChannel | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editMessageContent, setEditMessageContent] = useState('')
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDesc, setNewChannelDesc] = useState('')
  const [newChannelPrivate, setNewChannelPrivate] = useState(false)
  const [newChannelCategory, setNewChannelCategory] = useState<'mindfulness' | 'creativity' | 'growth' | 'philosophy' | 'wellness'>('mindfulness')
  
  // Reflections State
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [showShareReflection, setShowShareReflection] = useState(false)
  const [newReflectionContent, setNewReflectionContent] = useState('')
  const [newReflectionAnonymous, setNewReflectionAnonymous] = useState(false)
  const [newReflectionCategory, setNewReflectionCategory] = useState('personal-growth')
  
  // Quests State
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [showCreateQuest, setShowCreateQuest] = useState(false)
  const [newQuestTitle, setNewQuestTitle] = useState('')
  const [newQuestDesc, setNewQuestDesc] = useState('')
  const [newQuestDifficulty, setNewQuestDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [newQuestDuration, setNewQuestDuration] = useState('7 days')
  const [newQuestTasks, setNewQuestTasks] = useState<string[]>([''])
  
  // Shared Progress State
  const [sharedProgress, setSharedProgress] = useState<SharedProgress[]>([])
  const [showShareProgress, setShowShareProgress] = useState(false)
  const [newProgressAchievement, setNewProgressAchievement] = useState('')
  const [newProgressMetric, setNewProgressMetric] = useState('')

  const currentUser = 'You'
  const COMMUNITY_VERSION = '2.2' // Update this to force reload sample data

  // Load data from storage
  useEffect(() => {
    const savedVersion = safeStorage.getItem('eunonix-community-version')
    const needsReset = savedVersion !== COMMUNITY_VERSION
    
    const savedChannels = readJSON<any[]>('eunonix-channels', [])
    const savedReflections = readJSON<any[]>('eunonix-reflections', [])
    const savedQuests = readJSON<any[]>('eunonix-quests', [])
    const savedProgress = readJSON<any[]>('eunonix-progress', [])

    if (!needsReset && savedChannels.length > 0) {
      setChannels(
        savedChannels.map((ch: any) => ({
          ...ch,
          messages: ch.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
      )
    } else {
      setChannels(createSampleChannels())
    }

    if (!needsReset && savedReflections.length > 0) {
      setReflections(
        savedReflections.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        }))
      )
    } else {
      setReflections(createSampleReflections())
    }

    if (!needsReset && savedQuests.length > 0) {
      setQuests(savedQuests)
    } else {
      setQuests(createSampleQuests())
    }

    if (!needsReset && savedProgress.length > 0) {
      setSharedProgress(
        savedProgress.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp),
        }))
      )
    } else {
      setSharedProgress(createSampleSharedProgress())
    }
    
    // Save version after loading data
    safeStorage.setItem('eunonix-community-version', COMMUNITY_VERSION)
  }, [])

  // Save to storage whenever data changes
  useEffect(() => {
    writeJSON('eunonix-channels', channels)
  }, [channels])

  useEffect(() => {
    writeJSON('eunonix-reflections', reflections)
  }, [reflections])

  useEffect(() => {
    writeJSON('eunonix-quests', quests)
  }, [quests])

  useEffect(() => {
    writeJSON('eunonix-progress', sharedProgress)
  }, [sharedProgress])

  // Channel functions
  const handleSendMessage = () => {
    if (!selectedChannel || !newMessage.trim()) return

    const message: ChannelMessage = {
      id: Date.now().toString(),
      author: currentUser,
      content: newMessage,
      timestamp: new Date(),
      avatar: 'self'
    }

    setChannels(channels.map(ch =>
      ch.id === selectedChannel.id
        ? { ...ch, messages: [...ch.messages, message] }
        : ch
    ))

    setSelectedChannel({
      ...selectedChannel,
      messages: [...selectedChannel.messages, message]
    })

    setNewMessage('')
  }

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedChannel) return

    const updatedMessages = selectedChannel.messages.filter(m => m.id !== messageId)

    setChannels(channels.map(ch =>
      ch.id === selectedChannel.id
        ? { ...ch, messages: updatedMessages }
        : ch
    ))

    setSelectedChannel({
      ...selectedChannel,
      messages: updatedMessages
    })
  }

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setEditMessageContent(content)
  }

  const handleSaveEdit = () => {
    if (!selectedChannel || !editingMessageId || !editMessageContent.trim()) return

    const updatedMessages = selectedChannel.messages.map(m =>
      m.id === editingMessageId
        ? { ...m, content: editMessageContent }
        : m
    )

    setChannels(channels.map(ch =>
      ch.id === selectedChannel.id
        ? { ...ch, messages: updatedMessages }
        : ch
    ))

    setSelectedChannel({
      ...selectedChannel,
      messages: updatedMessages
    })

    setEditingMessageId(null)
    setEditMessageContent('')
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditMessageContent('')
  }

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return

    const channel: LifeChannel = {
      id: Date.now().toString(),
      name: newChannelName,
      description: newChannelDesc,
      isPrivate: newChannelPrivate,
      category: newChannelCategory,
      members: 1,
      coverGradient: 'from-sand-200 to-lilac-200',
      messages: []
    }

    setChannels([...channels, channel])
    setShowCreateChannel(false)
    setNewChannelName('')
    setNewChannelDesc('')
    setNewChannelPrivate(false)
  }

  // Reflection functions
  const handleShareReflection = () => {
    if (!newReflectionContent.trim()) return

    const reflection: Reflection = {
      id: Date.now().toString(),
      author: newReflectionAnonymous ? 'Anonymous' : currentUser,
      content: newReflectionContent,
      isAnonymous: newReflectionAnonymous,
      category: newReflectionCategory,
      timestamp: new Date(),
      likes: 0,
      likedBy: []
    }

    setReflections([reflection, ...reflections])
    setShowShareReflection(false)
    setNewReflectionContent('')
    setNewReflectionAnonymous(false)
  }

  const handleLikeReflection = (reflectionId: string) => {
    setReflections(reflections.map(r =>
      r.id === reflectionId
        ? {
            ...r,
            likes: r.likedBy.includes(currentUser) ? r.likes - 1 : r.likes + 1,
            likedBy: r.likedBy.includes(currentUser)
              ? r.likedBy.filter(u => u !== currentUser)
              : [...r.likedBy, currentUser]
          }
        : r
    ))
  }

  // Quest functions
  const handleJoinQuest = (questId: string) => {
    setQuests(quests.map(q =>
      q.id === questId
        ? { ...q, joined: true, participants: q.participants + 1 }
        : q
    ))
  }

  const handleToggleTask = (questId: string, taskId: string) => {
    setQuests(quests.map(q => {
      if (q.id === questId) {
        const updatedTasks = q.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
        const completedCount = updatedTasks.filter(t => t.completed).length
        const progress = Math.round((completedCount / updatedTasks.length) * 100)
        
        // If quest is completed, automatically share progress
        if (progress === 100 && q.progress < 100) {
          const progressItem: SharedProgress = {
            id: Date.now().toString(),
            author: currentUser,
            avatar: 'trophy',
            achievement: `Completed ${q.title}`,
            metric: `${updatedTasks.length} tasks completed`,
            timestamp: new Date()
          }
          setSharedProgress([progressItem, ...sharedProgress])
        }
        
        return { ...q, tasks: updatedTasks, progress }
      }
      return q
    }))
  }

  const handleCreateQuest = () => {
    if (!newQuestTitle.trim() || newQuestTasks.filter(t => t.trim()).length === 0) return

    const validTasks = newQuestTasks.filter(t => t.trim())
    const quest: Quest = {
      id: Date.now().toString(),
      title: newQuestTitle,
      description: newQuestDesc,
      difficulty: newQuestDifficulty,
      duration: newQuestDuration,
      participants: 1,
      progress: 0,
      joined: true,
      icon: 'custom',
      tasks: validTasks.map((task, index) => ({
        id: `t${index + 1}`,
        text: task,
        completed: false
      }))
    }

    setQuests([...quests, quest])
    setShowCreateQuest(false)
    setNewQuestTitle('')
    setNewQuestDesc('')
    setNewQuestDifficulty('medium')
    setNewQuestDuration('7 days')
    setNewQuestTasks([''])
  }

  const handleAddTask = () => {
    setNewQuestTasks([...newQuestTasks, ''])
  }

  const handleRemoveTask = (index: number) => {
    if (newQuestTasks.length > 1) {
      setNewQuestTasks(newQuestTasks.filter((_, i) => i !== index))
    }
  }

  const handleTaskChange = (index: number, value: string) => {
    const updated = [...newQuestTasks]
    updated[index] = value
    setNewQuestTasks(updated)
  }

  // Progress functions
  const handleShareProgress = () => {
    if (!newProgressAchievement.trim()) return

    const progress: SharedProgress = {
      id: Date.now().toString(),
      author: currentUser,
      avatar: 'bullseye',
      achievement: newProgressAchievement,
      metric: newProgressMetric,
      timestamp: new Date()
    }

    setSharedProgress([progress, ...sharedProgress])
    setShowShareProgress(false)
    setNewProgressAchievement('')
    setNewProgressMetric('')
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const difficultyColors = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-lilac-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sand-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h1 className="text-2xl font-light text-ink-800">Community</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/journal')}>
                Journal
              </Button>
              <Button variant="ghost" onClick={() => navigate('/companion')}>
                AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-8 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-sand-200">
          {COMMUNITY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSelectedChannel(null)
                setSelectedQuest(null)
              }}
              className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-lilac-700 font-medium'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
              type="button"
            >
              {tab.icon(activeTab === tab.id)}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Life Channels Tab */}
        {activeTab === 'channels' && (
          <div>
            {!selectedChannel ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-light text-ink-800">Life Channels</h2>
                  <Button onClick={() => setShowCreateChannel(true)}>
                    + Create Channel
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.map((channel) => (
                    <motion.div
                      key={channel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-gradient-to-br ${channel.coverGradient} p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => setSelectedChannel(channel)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-lilac-700">
                          {CATEGORY_ICONS[channel.category]}
                        </div>
                        {channel.isPrivate && (
                          <span className="text-xs px-2 py-1 bg-ink-800/10 rounded-full">Private</span>
                        )}
                      </div>
                      <h3 className="font-medium text-ink-800 mb-2">{channel.name}</h3>
                      <p className="text-sm text-ink-600 mb-4">{channel.description}</p>
                      <div className="flex items-center justify-between text-sm text-ink-500">
                        <span>{channel.members} members</span>
                        <span>{channel.messages.length} messages</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 overflow-hidden">
                <div className="p-6 border-b border-sand-200 bg-gradient-to-r from-lilac-50 to-sand-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <button
                        onClick={() => setSelectedChannel(null)}
                        className="text-sm text-ink-600 hover:text-ink-800 mb-2 flex items-center gap-1"
                      >
                        ← Back to channels
                      </button>
                      <h2 className="text-2xl font-light text-ink-800">{selectedChannel.name}</h2>
                      <p className="text-sm text-ink-600">{selectedChannel.members} members</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {selectedChannel.messages.length === 0 ? (
                    <div className="text-center py-12 text-ink-400 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center">
                        {AVATAR_ICONS.default}
                      </div>
                      <p>No messages yet. Be the first to say hello!</p>
                    </div>
                  ) : (
                    selectedChannel.messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-3 ${message.author === currentUser ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilac-200 to-golden-200 flex items-center justify-center flex-shrink-0 text-lg">
                          {AVATAR_ICONS[message.avatar ?? 'default']}
                        </div>
                        <div className={`flex-1 ${message.author === currentUser ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 mb-1 ${message.author === currentUser ? 'justify-end' : ''}`}>
                            <span className="text-sm font-medium text-ink-700">{message.author}</span>
                            <span className="text-xs text-ink-400">{formatDate(message.timestamp)}</span>
                          </div>
                          {editingMessageId === message.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editMessageContent}
                                onChange={(e) => setEditMessageContent(e.target.value)}
                                className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-xl focus:outline-none focus:border-lilac-300 transition-colors"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1 bg-lilac-100 text-lilac-700 rounded-lg text-sm hover:bg-lilac-200 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-sand-100 text-ink-600 rounded-lg text-sm hover:bg-sand-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group relative inline-block">
                              <div className={`px-4 py-2 rounded-2xl ${
                                message.author === currentUser
                                  ? 'bg-lilac-100 text-ink-800'
                                  : 'bg-white border border-sand-200 text-ink-700'
                              }`}>
                                {message.content}
                              </div>
                              {message.author === currentUser && (
                                <div className={`absolute ${message.author === currentUser ? 'left-0' : 'right-0'} top-0 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                  <button
                                    onClick={() => handleStartEdit(message.id, message.content)}
                                    className="p-1 bg-white border border-sand-200 rounded-lg hover:bg-sand-50 transition-colors"
                                    title="Edit message"
                                  >
                                    <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="p-1 bg-white border border-sand-200 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete message"
                                  >
                                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                <div className="p-6 border-t border-sand-200 bg-white/80">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl focus:outline-none focus:border-lilac-300 transition-colors"
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shared Reflections Tab */}
        {activeTab === 'reflections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-ink-800">Shared Reflections</h2>
              <Button onClick={() => setShowShareReflection(true)}>
                + Share Reflection
              </Button>
            </div>
            <div className="space-y-4">
              {reflections.map((reflection) => (
                <motion.div
                  key={reflection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-sand-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lilac-200 to-golden-200 flex items-center justify-center">
                        {reflection.isAnonymous ? REFLECTION_AVATARS.anonymous : REFLECTION_AVATARS.named}
                      </div>
                      <div>
                        <p className="font-medium text-ink-800">{reflection.author}</p>
                        <p className="text-xs text-ink-500">{formatDate(reflection.timestamp)}</p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 bg-lilac-50 text-lilac-700 rounded-full">
                      {reflection.category}
                    </span>
                  </div>
                  <p className="text-ink-700 mb-4 leading-relaxed">{reflection.content}</p>
                  <button
                    onClick={() => handleLikeReflection(reflection.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      reflection.likedBy.includes(currentUser)
                        ? 'bg-lilac-100 text-lilac-700'
                        : 'bg-sand-50 text-ink-600 hover:bg-sand-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={reflection.likedBy.includes(currentUser) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{reflection.likes}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Collective Quests Tab */}
        {activeTab === 'quests' && (
          <div>
            {!selectedQuest ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-light text-ink-800">Collective Quests</h2>
                  <Button onClick={() => setShowCreateQuest(true)}>
                    + Create Quest
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quests.map((quest) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-sand-200"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center text-lilac-600">
                          {QUEST_ICONS[quest.icon]}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-ink-800">{quest.title}</h3>
                          <p className="text-sm text-ink-600">{quest.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[quest.difficulty]}`}>
                          {quest.difficulty}
                        </span>
                        <span className="text-xs px-2 py-1 bg-sand-100 text-ink-700 rounded-full">
                          {quest.duration}
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-ink-600">Your Progress</span>
                          <span className="text-lilac-700 font-medium">{quest.progress}%</span>
                        </div>
                        <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-lilac-500 to-golden-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${quest.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-500">{quest.participants} participants</span>
                        {quest.joined ? (
                          <Button variant="secondary" onClick={() => setSelectedQuest(quest)}>
                            Continue
                          </Button>
                        ) : (
                          <Button onClick={() => handleJoinQuest(quest.id)}>
                            Join Quest
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-6">
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="text-sm text-ink-600 hover:text-ink-800 mb-4 flex items-center gap-1"
                >
                  ← Back to quests
                </button>
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center text-lilac-600">
                    {QUEST_ICONS[selectedQuest.icon]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-ink-800">{selectedQuest.title}</h2>
                    <p className="text-ink-600">{selectedQuest.description}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ink-600">Overall Progress</span>
                    <span className="text-lilac-700 font-medium">{selectedQuest.progress}%</span>
                  </div>
                  <div className="h-3 bg-sand-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-lilac-500 to-golden-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedQuest.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedQuest.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-sand-200 hover:border-lilac-300 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(selectedQuest.id, task.id)}
                        className="w-5 h-5 rounded border-sand-300 text-lilac-600 focus:ring-lilac-500"
                      />
                      <span className={`flex-1 ${task.completed ? 'line-through text-ink-400' : 'text-ink-700'}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shared Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-ink-800">Shared Progress</h2>
              <Button onClick={() => setShowShareProgress(true)}>
                + Share Progress
              </Button>
            </div>
            <div className="space-y-4">
              {sharedProgress.map((progress) => (
                <motion.div
                  key={progress.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-sand-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lilac-200 to-golden-200 flex items-center justify-center flex-shrink-0">
                      {AVATAR_ICONS[progress.avatar]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink-800 mb-1">{progress.author}</p>
                      <p className="text-ink-700 mb-2">{progress.achievement}</p>
                      {progress.metric && (
                        <p className="text-sm text-lilac-700 font-medium">{progress.metric}</p>
                      )}
                      <p className="text-xs text-ink-400 mt-2">{formatDate(progress.timestamp)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      <Modal isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} title="Create New Channel">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Channel Name</label>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="e.g., Morning Meditation Circle"
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Description</label>
            <textarea
              value={newChannelDesc}
              onChange={(e) => setNewChannelDesc(e.target.value)}
              placeholder="What's this channel about?"
              rows={3}
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Category</label>
            <select
              value={newChannelCategory}
              onChange={(e) => setNewChannelCategory(e.target.value as any)}
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            >
              <option value="mindfulness">Mindfulness</option>
              <option value="creativity">Creativity</option>
              <option value="growth">Personal Growth</option>
              <option value="philosophy">Philosophy</option>
              <option value="wellness">Wellness</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="private"
              checked={newChannelPrivate}
              onChange={(e) => setNewChannelPrivate(e.target.checked)}
              className="w-4 h-4 rounded border-sand-300 text-lilac-600 focus:ring-lilac-500"
            />
            <label htmlFor="private" className="text-sm text-ink-700">Make this channel private</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateChannel(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel}>Create Channel</Button>
          </div>
        </div>
      </Modal>

      {/* Share Reflection Modal */}
      <Modal isOpen={showShareReflection} onClose={() => setShowShareReflection(false)} title="Share a Reflection">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Your Reflection</label>
            <textarea
              value={newReflectionContent}
              onChange={(e) => setNewReflectionContent(e.target.value)}
              placeholder="Share your thoughts, insights, or experiences..."
              rows={4}
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Category</label>
            <select
              value={newReflectionCategory}
              onChange={(e) => setNewReflectionCategory(e.target.value)}
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            >
              <option value="personal-growth">Personal Growth</option>
              <option value="gratitude">Gratitude</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="creativity">Creativity</option>
              <option value="philosophy">Philosophy</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={newReflectionAnonymous}
              onChange={(e) => setNewReflectionAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-sand-300 text-lilac-600 focus:ring-lilac-500"
            />
            <label htmlFor="anonymous" className="text-sm text-ink-700">Share anonymously</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowShareReflection(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareReflection}>Share Reflection</Button>
          </div>
        </div>
      </Modal>

      {/* Share Progress Modal */}
      <Modal isOpen={showShareProgress} onClose={() => setShowShareProgress(false)} title="Share Your Progress">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Achievement</label>
            <input
              type="text"
              value={newProgressAchievement}
              onChange={(e) => setNewProgressAchievement(e.target.value)}
              placeholder="e.g., Completed my first 5K run"
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Metric (optional)</label>
            <input
              type="text"
              value={newProgressMetric}
              onChange={(e) => setNewProgressMetric(e.target.value)}
              placeholder="e.g., 30 minutes, 5 km"
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowShareProgress(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareProgress}>Share Progress</Button>
          </div>
        </div>
      </Modal>

      {/* Create Quest Modal */}
      <Modal isOpen={showCreateQuest} onClose={() => setShowCreateQuest(false)} title="Create Collective Quest">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Quest Title</label>
            <input
              type="text"
              value={newQuestTitle}
              onChange={(e) => setNewQuestTitle(e.target.value)}
              placeholder="e.g., Sunrise Routine Challenge"
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Description</label>
            <textarea
              value={newQuestDesc}
              onChange={(e) => setNewQuestDesc(e.target.value)}
              placeholder="What will participants achieve in this quest?"
              rows={2}
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Difficulty</label>
              <select
                value={newQuestDifficulty}
                onChange={(e) => setNewQuestDifficulty(e.target.value as any)}
                className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Duration</label>
              <select
                value={newQuestDuration}
                onChange={(e) => setNewQuestDuration(e.target.value)}
                className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
              >
                <option value="3 days">3 days</option>
                <option value="7 days">7 days</option>
                <option value="14 days">14 days</option>
                <option value="21 days">21 days</option>
                <option value="30 days">30 days</option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-ink-700">Quest Tasks</label>
              <button
                onClick={handleAddTask}
                className="text-sm text-lilac-600 hover:text-lilac-700 font-medium"
              >
                + Add Task
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {newQuestTasks.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder={`Task ${index + 1}: e.g., Wake up at 6 AM`}
                    className="flex-1 px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
                  />
                  {newQuestTasks.length > 1 && (
                    <button
                      onClick={() => handleRemoveTask(index)}
                      className="px-3 py-2 text-ink-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateQuest(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuest}>Create Quest</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Community

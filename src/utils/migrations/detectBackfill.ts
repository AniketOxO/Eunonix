import { writeJSON } from '@/utils/storage'
import { detectEmotion, Message, TrainingData } from '@/utils/detectEmotionResponse'

// Local message type with optional detection metadata (UI stores detection on assistant messages)
type LocalMessage = Message & { detection?: { label?: string | null; matched?: { category?: string; trigger?: string } | null } }

// Run a detector backfill for stored conversation data. Returns updated messages and trainingData.
export const runDetectorBackfill = async (
  saved: {
    messages: Message[]
    personality?: string
    trainingData?: TrainingData | null
  },
  habits: any[] = [],
  goals: any[] = [],
  personality: string = 'friend',
  migrationVersion: number = 1
): Promise<{ messages: Message[]; trainingData: TrainingData; migrationVersion: number }> => {
  const rehydrated: LocalMessage[] = saved.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))

  // If migration already applied at or above target version, return early (idempotent)
  const appliedVersion = (saved as any)._detectorMigrationVersion || 0
  if (appliedVersion >= migrationVersion) {
    const currentTraining: TrainingData = saved.trainingData ? saved.trainingData : {
      userPreferences: { conversationStyle: 'balanced', topicsOfInterest: [], commonGreetings: [], emotionalTone: 'supportive' },
      conversationHistory: { totalMessages: 0, frequentTopics: {}, emotionCounts: {}, successfulResponses: [] },
      personalContext: { goals: [], challenges: [], achievements: [] }
    }
    return { messages: rehydrated, trainingData: currentTraining, migrationVersion: appliedVersion }
  }

  const existingTraining = saved.trainingData ? { ...saved.trainingData } : null
  const updatedTrainingData: TrainingData = existingTraining ? {
    ...existingTraining,
    conversationHistory: {
      ...existingTraining.conversationHistory,
      emotionCounts: { ...(existingTraining.conversationHistory?.emotionCounts || {}) }
    },
    userPreferences: { ...existingTraining.userPreferences },
    personalContext: { ...existingTraining.personalContext }
  } : {
    userPreferences: { conversationStyle: 'balanced', topicsOfInterest: [], commonGreetings: [], emotionalTone: 'supportive' },
    conversationHistory: { totalMessages: 0, frequentTopics: {}, emotionCounts: {}, successfulResponses: [] },
    personalContext: { goals: [], challenges: [], achievements: [] }
  }

  const labelMap: Record<string, string> = {
    anger: 'angry',
    confusion: 'confused',
    lonely: 'lonely',
    sad: 'sad',
    stress: 'stress',
    anxiety: 'anxiety',
    overthinking: 'overthinking',
    happy: 'happy',
    hopeless: 'hopeless',
    motivation: 'motivation',
    fun: 'fun',
    calm: 'calm'
  }

  for (let i = 0; i < rehydrated.length; i++) {
    const msg = rehydrated[i]
    if (msg.role === 'assistant' && (!msg.detection || (msg.detection.label === undefined && msg.detection.matched === undefined))) {
      // find previous user message
      let prevUser: Message | undefined
      for (let j = i - 1; j >= 0; j--) {
        if (rehydrated[j].role === 'user') { prevUser = rehydrated[j]; break }
      }
      if (prevUser) {
        try {
          const detected = detectEmotion(prevUser.content, { trainingData: updatedTrainingData, habits, goals, messages: rehydrated, personality })
          const label = (detected as any).label ?? null
          msg.detection = { label, matched: (detected as any).matched ?? null }
          if (label) {
            const key = (labelMap as any)[label] || label
            updatedTrainingData.conversationHistory = updatedTrainingData.conversationHistory || ({} as any)
            updatedTrainingData.conversationHistory.emotionCounts = updatedTrainingData.conversationHistory.emotionCounts || {}
            updatedTrainingData.conversationHistory.emotionCounts[key] = (updatedTrainingData.conversationHistory.emotionCounts[key] || 0) + 1
          }
        } catch (e) {
          msg.detection = { label: null, matched: null }
        }
      } else {
        msg.detection = { label: null, matched: null }
      }
    }
  }

  const toSave = {
    messages: rehydrated,
    personality: saved.personality,
    trainingData: updatedTrainingData,
    _detectorMigrationVersion: migrationVersion
  }
  writeJSON('eunonix-companion', toSave)

  return { messages: rehydrated, trainingData: updatedTrainingData, migrationVersion }
}

export default runDetectorBackfill

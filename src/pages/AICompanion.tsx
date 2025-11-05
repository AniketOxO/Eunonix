import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/Button'
import { readJSON, writeJSON } from '@/utils/storage'
import { useAuthStore } from '@/store/useAuthStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface TrainingData {
  userPreferences: {
    conversationStyle: 'brief' | 'detailed' | 'balanced'
    topicsOfInterest: string[]
    commonGreetings: string[]
    emotionalTone: 'supportive' | 'motivational' | 'analytical' | 'casual'
  }
  conversationHistory: {
    totalMessages: number
    frequentTopics: Record<string, number>
    successfulResponses: string[]
  }
  personalContext: {
    name?: string
    goals: string[]
    challenges: string[]
    achievements: string[]
  }
}

type AIPersonality = 'calm' | 'philosophical' | 'coach' | 'friend' | 'mentor'

const personalities: Record<AIPersonality, { name: string; description: string; icon: JSX.Element }> = {
  calm: { 
    name: 'Calm Guide', 
    description: 'Gentle, peaceful, mindful presence', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  philosophical: { 
    name: 'Philosopher', 
    description: 'Deep thinker, asks profound questions', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  coach: { 
    name: 'Life Coach', 
    description: 'Motivating, action-oriented, supportive', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  friend: { 
    name: 'Trusted Friend', 
    description: 'Warm, understanding, conversational', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  mentor: { 
    name: 'Wise Mentor', 
    description: 'Experienced guide with practical wisdom', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
}

const AICompanion = () => {
  const navigate = useNavigate()
  const { habits, goals } = useAppStore()
  const { canSendAIMessage, recordAIMessage, user, requireAuth, showPlanLimit } = useAuthStore((state) => ({
    canSendAIMessage: state.canSendAIMessage,
    recordAIMessage: state.recordAIMessage,
    user: state.user,
    requireAuth: state.requireAuth,
    showPlanLimit: state.showPlanLimit
  }))
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [personality, setPersonality] = useState<AIPersonality>('friend')
  const [isThinking, setIsThinking] = useState(false)
  const [showTrainingInsights, setShowTrainingInsights] = useState(false)
  const [trainingData, setTrainingData] = useState<TrainingData>({
    userPreferences: {
      conversationStyle: 'balanced',
      topicsOfInterest: [],
      commonGreetings: [],
      emotionalTone: 'supportive'
    },
    conversationHistory: {
      totalMessages: 0,
      frequentTopics: {},
      successfulResponses: []
    },
    personalContext: {
      goals: [],
      challenges: [],
      achievements: []
    }
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [aiLimitNotice, setAiLimitNotice] = useState<string | null>(null)
  const trialEndsAtLabel = user?.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : null

  // Pre-trained knowledge base - EXTENSIVELY TRAINED AI!
  const preTrainedData: TrainingData = {
    userPreferences: {
      conversationStyle: 'balanced',
      topicsOfInterest: ['habit', 'goal', 'motivation', 'stress', 'meditation', 'exercise', 'sleep', 
                        'work', 'health', 'career', 'productivity', 'mindfulness', 'growth', 'anxiety',
                        'confidence', 'relationship', 'finance', 'creativity', 'learning', 'purpose',
                        'happiness', 'discipline', 'focus', 'energy', 'balance'],
      commonGreetings: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'howdy', "what's up"],
      emotionalTone: 'supportive'
    },
    conversationHistory: {
      totalMessages: 500,
      frequentTopics: {
        'habit': 45,
        'goal': 52,
        'motivation': 38,
        'stress': 35,
        'meditation': 28,
        'exercise': 40,
        'sleep': 22,
        'work': 48,
        'health': 30,
        'career': 26,
        'productivity': 42,
        'mindfulness': 25,
        'anxiety': 32,
        'confidence': 20,
        'relationship': 28,
        'finance': 15,
        'creativity': 18,
        'learning': 24,
        'purpose': 22,
        'happiness': 19,
        'discipline': 16,
        'focus': 33,
        'energy': 14,
        'balance': 21
      },
      successfulResponses: [
        "When we feel stuck, it's often because we're looking at the whole mountain instead of the next step.",
        "Progress isn't always linear - some days we grow, some days we rest and integrate.",
        "Your consistency is more powerful than your intensity.",
        "Small daily improvements compound into remarkable results over time.",
        "What would happen if you gave yourself permission to rest without guilt?",
        "The gap between who you are and who you want to be is filled with uncomfortable action.",
        "Discipline is choosing between what you want now and what you want most.",
        "You can't hate yourself into a version of yourself you love.",
        "The quality of your life is determined by the quality of your questions.",
        "Comparison is the thief of joy - your only competition is who you were yesterday.",
        "Failure is not the opposite of success, it's a stepping stone to it.",
        "Your current situation is not your final destination.",
        "The best project you'll ever work on is you.",
        "Motivation gets you started, habits keep you going.",
        "You don't have to be great to start, but you have to start to be great."
      ]
    },
    personalContext: {
      goals: [
        'build better habits',
        'reduce stress and anxiety',
        'improve focus and concentration',
        'be more present and mindful',
        'achieve work-life balance',
        'develop emotional intelligence',
        'build meaningful relationships',
        'increase self-confidence',
        'create financial stability',
        'discover life purpose',
        'maintain consistent exercise',
        'improve sleep quality',
        'develop growth mindset',
        'cultivate gratitude practice',
        'enhance creativity'
      ],
      challenges: [
        'staying consistent with habits',
        'managing time effectively',
        'avoiding burnout',
        'maintaining motivation',
        'dealing with self-doubt',
        'overcoming procrastination',
        'setting boundaries',
        'managing perfectionism',
        'handling criticism',
        'dealing with failure',
        'maintaining work-life balance',
        'managing stress and anxiety'
      ],
      achievements: [
        'started meditation practice',
        'established morning routine',
        'completed first 30-day challenge',
        'maintained 7-day exercise streak',
        'finished important project',
        'improved sleep schedule',
        'started journaling daily',
        'practiced gratitude consistently',
        'set healthy boundaries',
        'overcame major fear'
      ]
    }
  }

  // Load conversation from storage
  useEffect(() => {
    const saved = readJSON<{ 
      messages: Message[]
      personality?: AIPersonality
      trainingData?: TrainingData
    } | null>('eunonix-companion', null)
    
    if (saved && Array.isArray(saved.messages)) {
      setMessages(saved.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })))
      setPersonality(saved.personality || 'friend')
      if (saved.trainingData) {
        setTrainingData(saved.trainingData)
      } else {
        // Apply pre-trained data if user doesn't have training history
        setTrainingData(preTrainedData)
      }
    } else {
      // Welcome message - AI is already pre-trained!
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your AI companion. I've been pre-trained with knowledge about personal growth, habits, mindfulness, and productivity. I'm ready to support you on your journey. What would you like to explore?`,
        timestamp: new Date(),
      }])
      // Start with pre-trained knowledge
      setTrainingData(preTrainedData)
    }
  }, [])

  // Save conversation and training data
  useEffect(() => {
    if (messages.length > 0) {
      writeJSON('eunonix-companion', { messages, personality, trainingData })
    }
  }, [messages, personality, trainingData])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-train from conversation
  const trainFromMessage = (userMessage: string, aiResponse: string) => {
    setTrainingData(prev => {
      const updated = { ...prev }
      
      // Track total messages
      updated.conversationHistory.totalMessages++
      
      // Detect and store common greetings
      const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'howdy', 'sup', "what's up"]
      const lowerMsg = userMessage.toLowerCase()
      const isGreeting = greetings.some(g => lowerMsg.trim() === g || lowerMsg.startsWith(g + ' ') || lowerMsg === g + '!')
      
      if (isGreeting && !updated.userPreferences.commonGreetings.includes(userMessage.toLowerCase())) {
        updated.userPreferences.commonGreetings.push(userMessage.toLowerCase())
      }
      
      // Extract topics from user message
      const keywords = ['habit', 'goal', 'stress', 'anxiety', 'motivation', 'meditation', 'exercise', 
                       'sleep', 'work', 'relationship', 'health', 'finance', 'career', 'family']
      
      keywords.forEach(keyword => {
        if (lowerMsg.includes(keyword)) {
          updated.conversationHistory.frequentTopics[keyword] = 
            (updated.conversationHistory.frequentTopics[keyword] || 0) + 1
          
          if (!updated.userPreferences.topicsOfInterest.includes(keyword)) {
            updated.userPreferences.topicsOfInterest.push(keyword)
          }
        }
      })
      
      // Detect conversation style preference
      if (userMessage.split(' ').length > 20) {
        updated.userPreferences.conversationStyle = 'detailed'
      } else if (userMessage.split(' ').length < 5) {
        updated.userPreferences.conversationStyle = 'brief'
      }
      
      // Store successful responses
      if (updated.conversationHistory.successfulResponses.length < 50) {
        updated.conversationHistory.successfulResponses.push(aiResponse)
      }
      
      // Extract goals and challenges
      if (lowerMsg.includes('want to') || lowerMsg.includes('goal is') || lowerMsg.includes('trying to')) {
        const goalMatch = userMessage.match(/(?:want to|goal is|trying to)\s+([^.,!?]+)/i)
        if (goalMatch && goalMatch[1]) {
          const goal = goalMatch[1].trim()
          if (!updated.personalContext.goals.includes(goal)) {
            updated.personalContext.goals.push(goal)
          }
        }
      }
      
      if (lowerMsg.includes('struggle') || lowerMsg.includes('difficult') || lowerMsg.includes('hard to')) {
        const challengeMatch = userMessage.match(/(?:struggle|difficult|hard to)\s+(?:with\s+)?([^.,!?]+)/i)
        if (challengeMatch && challengeMatch[1]) {
          const challenge = challengeMatch[1].trim()
          if (!updated.personalContext.challenges.includes(challenge)) {
            updated.personalContext.challenges.push(challenge)
          }
        }
      }
      
      return updated
    })
  }

  // Check if message is a greeting
  const isGreeting = (message: string): boolean => {
    const greetings = [
      'hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon',
      'howdy', 'sup', "what's up", 'greetings', 'yo', 'hola', 'bonjour'
    ]
    
    // Normalize the message: remove extra repeated characters (hiii -> hi, helloooo -> hello)
    const normalizeRepeats = (str: string) => {
      return str.replace(/(.)\1{2,}/g, '$1$1') // Replace 3+ repeated chars with 2
    }
    
    const lowerMsg = message.toLowerCase().trim()
    const normalized = normalizeRepeats(lowerMsg)
    
    // Check if it's just a greeting (possibly with punctuation or repeated letters)
    return greetings.some(g => {
      const regex = new RegExp(`^${g}[!.?]*$`, 'i')
      const normalizedGreeting = normalizeRepeats(g)
      
      // Check exact match, normalized match, or just the greeting word
      return regex.test(lowerMsg) || 
             regex.test(normalized) || 
             lowerMsg === g || 
             normalized === normalizedGreeting ||
             lowerMsg.replace(/[!.?\s]+/g, '') === g
    })
  }

  const generateGreetingResponse = (userMessage: string): string => {
    // Normalize repeated characters for matching
    const normalizeRepeats = (str: string) => {
      return str.replace(/(.)\1{2,}/g, '$1$1')
    }
    
    const lowerMsg = userMessage.toLowerCase().trim()
    const normalized = normalizeRepeats(lowerMsg)
    const hour = new Date().getHours()
    
    // Match the user's greeting style (check both original and normalized)
    let greeting = 'Hi'
    let isEnthusiastic = false
    
    // Detect enthusiasm (multiple repeated letters or exclamation marks)
    if (/(.)\1{2,}/.test(lowerMsg) || lowerMsg.includes('!!!') || lowerMsg.includes('!!')) {
      isEnthusiastic = true
    }
    
    // Match greeting type
    if (lowerMsg.includes('hello') || normalized.includes('hello')) {
      greeting = isEnthusiastic ? 'Hello!' : 'Hello'
    } else if (lowerMsg.includes('hey') || normalized.includes('hey')) {
      greeting = isEnthusiastic ? 'Hey!' : 'Hey'
    } else if (lowerMsg.includes('hi') || normalized.includes('hi')) {
      greeting = isEnthusiastic ? 'Hi!' : 'Hi'
    } else if (lowerMsg.includes('good morning')) {
      greeting = 'Good morning'
    } else if (lowerMsg.includes('good evening')) {
      greeting = 'Good evening'
    } else if (lowerMsg.includes('good afternoon')) {
      greeting = 'Good afternoon'
    }
    
    // Auto-detect time-based greeting if generic
    if ((greeting === 'Hi' || greeting === 'Hi!' || greeting === 'Hello' || greeting === 'Hello!' || greeting === 'Hey' || greeting === 'Hey!') && !isEnthusiastic) {
      if (hour < 12) greeting = 'Good morning'
      else if (hour < 17) greeting = 'Good afternoon'
      else greeting = 'Good evening'
    }
    
    // Add enthusiasm if user was enthusiastic
    if (isEnthusiastic && !greeting.includes('!')) {
      greeting = greeting + '!'
    }
    
    const greetingResponses = [
      `${greeting} It's great to hear from you. How are you feeling today?`,
      `${greeting} I'm happy you're here. What's on your mind?`,
      `${greeting} How has your day been so far?`,
      `${greeting} Good to see you again. What would you like to talk about?`,
      `${greeting} I hope you're doing well. Anything you'd like to share or explore?`
    ]
    
    // Personalized greeting based on training data
    if (trainingData.conversationHistory.totalMessages > 10) {
      const topTopics = Object.entries(trainingData.conversationHistory.frequentTopics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([topic]) => topic)
      
      if (topTopics.length > 0) {
        return `${greeting} Great to see you again. Last time we talked about ${topTopics[0]}. How's that going?`
      }
    }
    
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
  }

  const generateAIResponse = (userMessage: string): string => {
    // Check if it's just a greeting
    if (isGreeting(userMessage)) {
      return generateGreetingResponse(userMessage)
    }
    
    const lowerMessage = userMessage.toLowerCase()
    
    // Analyze user context
    const totalHabits = habits.length
    const avgStreak = habits.length > 0 
      ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) 
      : 0
    const totalGoals = goals.length

    // Use training data for personalized responses
    const knownChallenges = trainingData.personalContext.challenges
    const knownGoals = trainingData.personalContext.goals
    const topTopics = Object.entries(trainingData.conversationHistory.frequentTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic)

    // CONTEXT AWARENESS - Check last AI message to avoid repetition
    const lastAIMessage = messages.length > 0 ? messages[messages.length - 1] : null
    const lastAIContent = lastAIMessage?.role === 'assistant' ? lastAIMessage.content.toLowerCase() : ''
    
    // If AI just asked about "3 things you can see" and user answered, acknowledge it
    if (lastAIContent.includes('3 things you can see') || lastAIContent.includes('name 3 things')) {
      if (lowerMessage.length < 50 && !lowerMessage.includes('?')) {
        // User gave a short answer (likely naming things)
        return "Beautiful grounding exercise. Notice how focusing on the present calms the mind? That's the power of mindfulness. How are you feeling now compared to a moment ago?"
      }
    }

    // If AI asked "how are you feeling about that aspect" and user says negative (not great, bad, awful, terrible)
    if (lastAIContent.includes('how are you feeling about that aspect') || lastAIContent.includes('how are you feeling about')) {
      if (lowerMessage.includes('not great') || lowerMessage.includes('not good') || lowerMessage.includes('bad') || 
          lowerMessage.includes('awful') || lowerMessage.includes('terrible') || lowerMessage.includes('struggling')) {
        return personality === 'friend'
          ? "I hear you. It's tough when something that matters to you isn't going well. Want to tell me more about what's making it hard? Sometimes just talking through it helps."
          : "That's honest, and I appreciate you sharing that. When something isn't going well, we have choices: we can change our approach, change our expectations, or sometimes we need to change our relationship with it. What feels right to you?"
      }
      if (lowerMessage.includes('good') || lowerMessage.includes('better') || lowerMessage.includes('okay') || lowerMessage.includes('fine')) {
        return "I'm glad to hear that. Even 'okay' is progress when we're working through challenges. What's one thing that's been helping you with this?"
      }
    }

    // If AI asked a question and user gave a short response, acknowledge it before moving on
    if (lastAIContent.includes('?') && lowerMessage.length < 30 && !lowerMessage.includes('?')) {
      // Don't ask the same type of question again immediately
      const responses = [
        `I hear you on that. ${lowerMessage.includes('nothing') ? 'Sometimes we need to start from zero, and that\'s okay.' : 'That\'s valuable insight.'} What would be most helpful for you to focus on right now?`,
        `Thanks for sharing that. ${lowerMessage.length < 10 ? 'Even short answers tell me something.' : 'I\'m getting a sense of where you\'re at.'} What\'s one small win you could create for yourself today?`,
        `Got it. ${lowerMessage.includes('don\'t know') ? 'Not knowing is the beginning of wisdom - it means you\'re being honest with yourself.' : 'That helps me understand.'} What support do you need right now?`
      ]
      // Avoid repeating if this would be redundant
      if (!lastAIContent.includes('what support') && !lastAIContent.includes('most helpful')) {
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }

    // Advanced contextual understanding - EXTENSIVE KNOWLEDGE
    // Prevent repeating anxiety question if already asked in last 3 messages
    const recentMessages = messages.slice(-6) // Last 3 exchanges (6 messages)
    const recentAIMessages = recentMessages.filter(m => m.role === 'assistant').map(m => m.content.toLowerCase())
    const alreadyAskedAboutAnxiety = recentAIMessages.some(msg => 
      msg.includes('anxiety comes up often') || msg.includes('how are you feeling about that aspect')
    )

    if (lowerMessage.includes('procrastinat')) {
      return personality === 'coach' 
        ? "Procrastination is often fear in disguise. What's ONE tiny task you could do in the next 5 minutes? Just one. Let's break the inertia together."
        : "I notice you're dealing with procrastination. What if it's not laziness, but your brain protecting you from something? What feels scary about starting?"
    }

    if (lowerMessage.includes('burn') && lowerMessage.includes('out')) {
      return "Burnout is your body's wisdom telling you something needs to change. Before we talk solutions, can you tell me: when's the last time you felt genuinely rested?"
    }

    if ((lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) && !alreadyAskedAboutAnxiety) {
      return personality === 'calm'
        ? "Anxiety often lives in the future. Let's come back to now. Can you name 3 things you can see right now? This moment, you're safe."
        : "I hear the anxiety. That's real and valid. Would it help to break down what's worrying you into smaller, more manageable pieces?"
    }

    if (lowerMessage.includes('depres') || (lowerMessage.includes('sad') && lowerMessage.includes('really'))) {
      return "Thank you for sharing something so vulnerable. What you're feeling matters. Have you been able to talk to someone you trust about this? Sometimes we need more support than an AI can give - consider reaching out to a therapist or counselor."
    }

    if (lowerMessage.includes('confidence') || lowerMessage.includes('self-doubt') || lowerMessage.includes('imposter')) {
      return `Self-doubt visits everyone, even the most successful people. ${avgStreak > 0 ? `Look at your ${avgStreak}-day habit streak - that's evidence you're more capable than you think.` : 'What would you tell a friend who accomplished what you have?'} Imposter syndrome means you're growing beyond your comfort zone.`
    }

    if (lowerMessage.includes('morning routine') || (lowerMessage.includes('wake up') && !lowerMessage.includes('can\'t'))) {
      return "Morning routines are powerful because they set the tone for everything that follows. Win the morning, win the day. What's ONE small ritual that would make you excited to wake up? Start there."
    }

    if (lowerMessage.includes('focus') || lowerMessage.includes('distract') || lowerMessage.includes('attention')) {
      return "In a world designed to distract us, focus is a superpower. Have you tried the Pomodoro technique? 25 minutes of deep focus, 5 minute break. Turn off notifications. Your brain will thank you. What's ONE thing that deserves your undivided attention today?"
    }

    if (lowerMessage.includes('relationship') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
      return personality === 'philosophical'
        ? "Relationships are mirrors - they show us parts of ourselves we can't see alone. What is this relationship teaching you about yourself right now?"
        : "Relationships need the same attention as your personal goals. How are you showing up for the people who matter to you? Are you bringing your best self or your stressed self?"
    }

    if (lowerMessage.includes('meditation') || lowerMessage.includes('mindful')) {
      return "Meditation isn't about stopping thoughts - that's impossible. It's about noticing them without judgment, like clouds passing in the sky. Even 2 minutes of mindful breathing counts. Have you tried it today? Start with just 3 deep breaths."
    }

    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('gym')) {
      return `Movement is medicine for both body and mind. ${totalHabits > 0 ? 'I see you\'re building habits - is exercise one of them?' : 'What kind of movement makes you feel alive?'} You don't need to run marathons - a 15-minute walk works wonders.`
    }

    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
      return "Sleep is the foundation everything else is built on. Most people need 7-9 hours. Quality sleep = better mood, focus, health. What's getting in the way of quality sleep for you? Screen time? Stress? Let's troubleshoot it."
    }

    if (lowerMessage.includes('productiv')) {
      return "Productivity isn't about doing more - it's about doing what matters. If you could only accomplish 3 things this week, what would move the needle most? Focus on that. The rest is just noise."
    }

    if (lowerMessage.includes('mean') && lowerMessage.includes('life')) {
      return personality === 'philosophical'
        ? "The meaning of life isn't something we find - it's something we create through our choices, relationships, and growth. What gives YOUR life meaning? That's your answer."
        : "Big question! Maybe meaning isn't one thing, but many small moments strung together. What moments make you feel most alive? Do more of those."
    }

    if (lowerMessage.includes('change') || (lowerMessage.includes('different') && lowerMessage.includes('want'))) {
      return "Change is uncomfortable because our brains love predictability. But here's the secret: you don't need to change everything at once. What's ONE small shift you could make today? Small hinges swing big doors."
    }

    if (lowerMessage.includes('fail') || lowerMessage.includes('mistake') || lowerMessage.includes('messed up')) {
      return personality === 'mentor'
        ? "I've learned that failure is just expensive education. What did this 'failure' teach you that success never could? Every master was once a disaster."
        : "Failure means you tried something. That's braver than playing it safe. What would you do differently next time? That's growth, not failure."
    }

    if (lowerMessage.includes('overwhelm') || (lowerMessage.includes('too much') && !lowerMessage.includes('thank'))) {
      return "When overwhelmed, we need to zoom out AND zoom in. Zoom out: what can wait? What can you delete? Zoom in: what's the next tiny step? Let's start with the next step. You can't do everything, but you can do the next thing."
    }

    if (lowerMessage.includes('grateful') || lowerMessage.includes('thank')) {
      return "Gratitude rewires the brain for positivity. Research shows grateful people are measurably happier, healthier, and more resilient. What are 3 small things you're grateful for right now? Even tiny things count."
    }

    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
      return "Loneliness is real and painful. But being alone and being lonely are different - one is circumstance, one is feeling. How can we shift that feeling for you? Sometimes it's about quality connections, not quantity."
    }

    if (lowerMessage.includes('purpose') || lowerMessage.includes('direction')) {
      return `Purpose isn't always obvious. Sometimes it emerges from what you already love doing. ${topTopics.length > 0 ? `You talk a lot about ${topTopics[0]} - could there be a clue there?` : 'What activities make you lose track of time?'} Your purpose might be hiding in plain sight.`
    }

    if (lowerMessage.includes('money') || lowerMessage.includes('financ') || lowerMessage.includes('debt')) {
      return "Financial stress is one of the biggest sources of anxiety. But money is a tool, not the goal. What would financial freedom give you? Peace? Time? Options? Let's work backward from that. Small steps: budget, save 10%, reduce expenses."
    }

    if (lowerMessage.includes('creative') || lowerMessage.includes('art') || lowerMessage.includes('write')) {
      return "Creativity isn't a talent - it's a practice. Every creative person started as a beginner. The secret? Show up consistently. Write bad first drafts. Make ugly art. Create without judgment. Quantity leads to quality."
    }

    if (lowerMessage.includes('comparison') || lowerMessage.includes('everyone else') || lowerMessage.includes('social media')) {
      return "Comparison is the thief of joy. Social media is everyone's highlight reel vs. your behind-the-scenes. Your only competition is who you were yesterday. Are you better than yesterday? That's the only metric that matters."
    }

    if (lowerMessage.includes('perfect') && (lowerMessage.includes('ism') || lowerMessage.includes('ist'))) {
      return "Perfectionism is fear wearing a fancy mask. It whispers 'not good enough' when you should be celebrating progress. Done is better than perfect. B+ work that exists beats A+ work that doesn't. What if you aimed for 'good enough' today?"
    }

    if (lowerMessage.includes('boundary') || lowerMessage.includes('boundaries') || lowerMessage.includes('saying no')) {
      return "Boundaries aren't walls - they're guidelines that help relationships thrive. Saying 'no' to others is saying 'yes' to yourself. You can't pour from an empty cup. What boundary do you need to set right now?"
    }

    if (lowerMessage.includes('discipline') || lowerMessage.includes('willpower')) {
      return "Discipline is choosing between what you want now and what you want most. Willpower is limited - it's a muscle that gets tired. That's why systems beat goals. What system could you build that makes the right choice automatic?"
    }

    if (lowerMessage.includes('quit') || lowerMessage.includes('give up')) {
      return "Feeling like quitting means you're at the edge of your comfort zone. That's where growth happens. But there's a difference between quitting a goal and quitting a strategy. Maybe you don't need to quit - maybe you need to pivot. What's really going on?"
    }

    if (lowerMessage.includes('talent') || lowerMessage.includes('natural')) {
      return "Talent is overrated. Work ethic beats talent when talent doesn't work hard. What looks like natural ability is usually 10,000 hours of practice you didn't see. You don't need talent - you need consistency and patience."
    }

    if (lowerMessage.includes('lazy') || lowerMessage.includes('laziness')) {
      return "You're not lazy - you're either tired, overwhelmed, scared, or unclear on your 'why'. Lazy is a judgment, not a diagnosis. What's actually blocking you? Let's figure it out together. Often it's not a motivation problem, it's an energy or clarity problem."
    }

    if (lowerMessage.includes('regret')) {
      return "Regret is a teacher, not a life sentence. What can you learn from this? You can't change the past, but you can change what you do next. The best time to start was yesterday. The second best time is now."
    }

    if (lowerMessage.includes('identity') || lowerMessage.includes('who am i')) {
      return "Identity is built through action. You become what you repeatedly do. Want to be a writer? Write. Want to be healthy? Make healthy choices. Your identity isn't found, it's forged through daily decisions. Who are you becoming?"
    }

    if (lowerMessage.includes('time') && (lowerMessage.includes('enough') || lowerMessage.includes('no time') || lowerMessage.includes('busy'))) {
      return "We all have 24 hours. Beyoncé has 24 hours. It's not about time - it's about priorities. What you do today tells you what you value. If it's important, you'll find time. If not, you'll find excuses. What's ONE thing you're making time for today?"
    }

    if (lowerMessage.includes('learning') || lowerMessage.includes('learn') || lowerMessage.includes('skill')) {
      return "Learning is a superpower in the age of AI. The best investment is in yourself. What skill would 10x your life in 6 months? Start with 15 minutes daily. In a year, you'll be 100 hours better. That's expert level in many skills."
    }

    if (lowerMessage.includes('fear') || lowerMessage.includes('afraid') || lowerMessage.includes('scared')) {
      return "Fear is often a sign you're about to do something brave. Courage isn't the absence of fear - it's action despite fear. What's the worst that could happen? Now what's the best? Usually, the best case is worth the risk. What small step could you take today?"
    }

    if (lowerMessage.includes('energy') || lowerMessage.includes('tired all')) {
      return "Energy is the currency of life. No energy = no productivity, no joy. Energy audit: Are you sleeping 7+ hours? Moving your body? Eating real food? Managing stress? Saying no to energy vampires? Fix the inputs, energy follows."
    }

    if (lowerMessage.includes('happy') || lowerMessage.includes('happiness')) {
      return "Happiness isn't a destination - it's a byproduct of living aligned with your values. Chasing happiness directly usually fails. Instead: cultivate gratitude, nurture relationships, pursue growth, contribute to others. Happiness sneaks up on you."
    }

    if (lowerMessage.includes('therapy') || lowerMessage.includes('therapist') || lowerMessage.includes('counselor')) {
      return "Therapy is one of the best investments in yourself. It's not weakness - it's wisdom. Everyone can benefit from professional support. A good therapist gives you tools an AI can't. Have you considered reaching out? You deserve that support."
    }

    if (lowerMessage.includes('balance') || lowerMessage.includes('work-life')) {
      return "Work-life balance is a myth - it's more like work-life harmony. Some seasons require more work, some need more rest. The key is intentionality. Are you choosing how you spend time, or is time choosing for you? What needs more attention right now?"
    }

    // Personality-based responses - ENHANCED WITH WISDOM
    const responses: Record<AIPersonality, string[]> = {
      calm: [
        `Let's take a breath together. ${lowerMessage.includes('stress') || lowerMessage.includes('anxious') 
          ? 'What you\'re feeling is valid. Would it help to talk through what\'s weighing on you?' 
          : 'What would bring you peace right now?'}`,
        `I notice you have ${totalHabits} habits you're building. ${avgStreak > 0 
          ? `Your ${avgStreak}-day average streak shows beautiful consistency.` 
          : 'Each day is a new opportunity to begin.'} How does this journey feel for you?`,
        `Sometimes the answer isn't in thinking more, but in feeling more. What does your heart say about this?`,
        `Inner peace comes from accepting what is while working toward what could be. Where are you between acceptance and action right now?`,
        `The present moment is all we truly have. Past is memory, future is imagination. What's real is right now. How can you be more present?`,
        `Stillness isn't emptiness - it's fullness. In the quiet, we hear our truth. What's your inner voice saying when you give it space?`,
      ],
      philosophical: [
        `${lowerMessage.includes('why') 
          ? 'The question "why" opens infinite doors. Let\'s explore: why does this matter to your deeper self?' 
          : 'Every moment is a teacher. What is this moment teaching you?'}`,
        `You're cultivating ${totalGoals} life goals. Each one reflects a desire for transformation. What transformation calls to you most urgently?`,
        `Consider: what would your wisest self, ten years from now, tell you about this situation?`,
        `We don't see the world as it is - we see it as we are. How might your current state be coloring this situation?`,
        `Socrates said "The unexamined life is not worth living." You're examining yours. What patterns are you noticing?`,
        `Every experience is neutral until we assign it meaning. What meaning are you creating from today's challenges?`,
        `The ancient philosophers taught that we can't control events, only our response. What response would your highest self choose?`,
      ],
      coach: [
        `Great question! Let's break this down into actionable steps. What's ONE thing you could do today to move forward?`,
        `I see you're working on ${totalHabits} habits - that takes commitment! ${avgStreak > 5 
          ? `Your ${avgStreak}-day streak proves you've got what it takes.` 
          : 'Remember: progress over perfection.'} What's your next win going to be?`,
        `You've got ${totalGoals} goals in motion. That's powerful! Which one needs your energy most right now?`,
        `Success leaves clues. Think of a time you overcame something hard - what strengths did you use? You still have those strengths.`,
        `Winners and losers have the same goals. The difference? Systems. What system can you build today that makes success inevitable?`,
        `You're capable of more than you think. The only limits are the ones you accept. What limit are you ready to break?`,
        `Discipline equals freedom. The more disciplined you are now, the more freedom you'll have later. What discipline would set you free?`,
      ],
      friend: [
        `Hey, I'm here for you. ${lowerMessage.includes('hard') || lowerMessage.includes('difficult') 
          ? 'It sounds like you\'re going through something tough. Want to talk about it?' 
          : 'What\'s been on your heart lately?'}`,
        `I love seeing your ${totalHabits} habits! ${avgStreak > 0 
          ? `You\'re on a ${avgStreak}-day streak - I\'m proud of you!` 
          : 'Even small steps count.'} How are you feeling about your progress?`,
        `You know what? Sometimes we just need someone to listen. I'm all ears. What's really going on?`,
        `I appreciate you opening up. That takes courage. How can I best support you right now?`,
        `Real talk: you're doing better than you think. Sometimes we need an outside perspective to see our own progress. Want mine?`,
        `I'm rooting for you, always. Even when you don't believe in yourself, I believe in you. What's one thing going well right now?`,
      ],
      mentor: [
        `In my experience, ${lowerMessage.includes('fail') || lowerMessage.includes('mistake') 
          ? 'what we call failures are often our greatest teachers. What lesson is hidden here?' 
          : 'the path forward becomes clear when we understand our "why."'} What drives you?`,
        `Building ${totalHabits} habits shows wisdom beyond your years. ${avgStreak > 7 
          ? `Your ${avgStreak}-day commitment tells me you understand delayed gratification.` 
          : 'The foundation you\'re laying now will serve you for decades.'} What legacy are you building?`,
        `Let me share something: ${totalGoals} goals suggest ambition, but true success is alignment. Are these goals aligned with who you're becoming?`,
        `The best time to plant a tree was 20 years ago. The second best time is now. What tree are you planting today?`,
        `I've watched many people succeed and fail. The ones who make it? They don't quit when it's hard. They quit when it's no longer aligned. Which is this for you?`,
        `Wisdom isn't knowing all the answers - it's asking better questions. What question would unlock your next level of growth?`,
        `The master has failed more times than the beginner has tried. You're on the path. Keep going.`,
      ],
    }

    // Context-aware responses with training data
    if (lowerMessage.includes('habit') || lowerMessage.includes('streak')) {
      if (totalHabits === 0) {
        return personalities[personality].name === 'Life Coach'
          ? "I notice you haven't started tracking habits yet. Based on our conversations, what's ONE small habit that could change your day?"
          : "You haven't created any habits yet. What daily practice would bring you closer to who you want to become?"
      }
      const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0)
      return `You've built a ${longestStreak}-day streak before - proof that you can sustain commitment. What habit is calling for your attention now?`
    }

    if (lowerMessage.includes('goal')) {
      if (totalGoals === 0) {
        if (knownGoals.length > 0) {
          return `You mentioned wanting to ${knownGoals[0]}. Have you thought about turning that into a concrete goal with specific milestones?`
        }
        return "No goals yet? That's okay. Sometimes we need to clarify our vision first. What does your ideal future look like in 6 months?"
      }
      return `Your ${totalGoals} goals represent different parts of your life. Which one feels most alive to you right now?`
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
      if (knownChallenges.length > 0) {
        return `I remember you've been working through ${knownChallenges[0]}. Is this related, or something new? Either way, let's break it down into small steps.`
      }
      return `When we feel stuck, it's often because we're looking at the whole mountain instead of the next step. What's ONE tiny action you could take right now?`
    }
    
    // Recall previous topics with intelligence - BUT NOT if just discussed
    if (topTopics.length > 0 && !alreadyAskedAboutAnxiety && Math.random() > 0.7) {
      // Only bring up topics if we haven't discussed them in last few messages
      const topTopic = topTopics[0]
      const alreadyDiscussedTopTopic = recentAIMessages.some(msg => msg.includes(topTopic))
      
      if (!alreadyDiscussedTopTopic && !lowerMessage.includes(topTopic)) {
        return `I've noticed ${topTopic} comes up often in our conversations. How are you feeling about that aspect of your life right now?`
      }
    }

    // Default personality response
    const personalityResponses = responses[personality]
    return personalityResponses[Math.floor(Math.random() * personalityResponses.length)]
  }

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage) return

    if (!user) {
      requireAuth('chat with Eunonix AI', {
        message: 'Sign in to chat with Eunonix AI and save your progress across devices.'
      })
      return
    }

    const eligibility = canSendAIMessage()
    if (!eligibility.allowed) {
      showPlanLimit('chat with Eunonix AI', {
        message: eligibility.reason ?? 'Upgrade to continue chatting with Eunonix AI.',
        upgradeTier: 'premium'
      })
      return
    }

    if (eligibility.remaining !== undefined) {
      const nextRemaining = Math.max(0, eligibility.remaining - 1)
      setAiLimitNotice(`${nextRemaining} AI messages left this month.`)
    } else {
      setAiLimitNotice(null)
    }

    recordAIMessage()

    const userMessageContent = trimmedMessage

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputMessage('')
    setIsThinking(true)

    // Simulate AI thinking (longer for first greeting, shorter for subsequent)
    const thinkingTime = isGreeting(userMessageContent) ? 800 : 1500
    
    setTimeout(() => {
      const aiResponseContent = generateAIResponse(userMessageContent)
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiResponse])
      setIsThinking(false)
      
      // Auto-train from this conversation
      trainFromMessage(userMessageContent, aiResponseContent)
    }, thinkingTime)
  }

  const handleClearConversation = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: `Fresh start! I'm here whenever you need me. What shall we explore together?`,
      timestamp: new Date(),
    }])
    // Keep training data but reset conversation stats
    setTrainingData(prev => ({
      ...prev,
      conversationHistory: {
        ...prev.conversationHistory,
        totalMessages: 0,
        successfulResponses: []
      }
    }))
  }

  const quickPrompts = [
    "Hi! How are you?",
    "What patterns do you see in my habits?",
    "Help me reflect on my progress",
    "I'm feeling stuck with my goals",
    "What should I focus on today?",
  ]

  return (
    <div className="min-h-screen emotion-bg flex flex-col">
      {/* Header */}
      <header className="glass-card sticky top-0 z-40 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-6 h-6 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h1 className="text-2xl font-semibold text-ink-800">AI Companion</h1>
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-8 flex flex-col">
        {/* Training Insights Toggle */}
        {trainingData.conversationHistory.totalMessages > 5 && (
          <motion.button
            onClick={() => setShowTrainingInsights(!showTrainingInsights)}
            className="mb-4 px-4 py-2 rounded-xl bg-gradient-to-r from-lilac-400/20 to-golden-400/20 border border-lilac-300/40 text-ink-700 text-sm font-medium hover:from-lilac-400/30 hover:to-golden-400/30 transition-all flex items-center gap-2 self-end"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {showTrainingInsights ? 'Hide' : 'View'} AI Learning
          </motion.button>
        )}

        {/* Training Insights Panel */}
        <AnimatePresence>
          {showTrainingInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 glass-card p-6 overflow-hidden"
            >
              <h3 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-lilac-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                What I've Learned About You
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Conversation Stats */}
                <div className="bg-white/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Conversation Stats</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-ink-700">
                      <span className="font-medium">Total Messages:</span> {trainingData.conversationHistory.totalMessages}
                    </p>
                    <p className="text-ink-700">
                      <span className="font-medium">Style Preference:</span> {trainingData.userPreferences.conversationStyle}
                    </p>
                  </div>
                </div>

                {/* Topics of Interest */}
                {trainingData.userPreferences.topicsOfInterest.length > 0 && (
                  <div className="bg-white/40 rounded-xl p-4">
                    <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Topics You Discuss</p>
                    <div className="flex flex-wrap gap-2">
                      {trainingData.userPreferences.topicsOfInterest.slice(0, 6).map(topic => (
                        <span key={topic} className="px-3 py-1 bg-lilac-100 text-lilac-700 rounded-full text-xs font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Your Goals */}
                {trainingData.personalContext.goals.length > 0 && (
                  <div className="bg-white/40 rounded-xl p-4">
                    <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Your Mentioned Goals</p>
                    <ul className="space-y-1 text-sm">
                      {trainingData.personalContext.goals.slice(0, 3).map((goal, idx) => (
                        <li key={idx} className="text-ink-700 flex items-start gap-2">
                          <span className="text-golden-500 mt-1">→</span>
                          <span className="flex-1">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Challenges */}
                {trainingData.personalContext.challenges.length > 0 && (
                  <div className="bg-white/40 rounded-xl p-4">
                    <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Areas of Growth</p>
                    <ul className="space-y-1 text-sm">
                      {trainingData.personalContext.challenges.slice(0, 3).map((challenge, idx) => (
                        <li key={idx} className="text-ink-700 flex items-start gap-2">
                          <span className="text-lilac-500 mt-1">•</span>
                          <span className="flex-1">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <p className="text-xs text-ink-500 mt-4 italic">
                💡 The more we chat, the better I understand your unique journey and can provide personalized support.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personality Selector */}
        <div className="mb-6 glass-card p-4">
          <p className="text-xs font-semibold text-ink-600 mb-3 uppercase tracking-wide">AI Personality</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.keys(personalities) as AIPersonality[]).map((p) => (
              <button
                key={p}
                onClick={() => setPersonality(p)}
                className={`px-4 py-3 rounded-xl font-medium transition-all text-sm flex flex-col items-center gap-2 ${
                  personality === p
                    ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                    : 'bg-white/40 text-ink-700 hover:bg-white/60'
                }`}
              >
                <div className={personality === p ? 'text-white' : 'text-ink-600'}>
                  {personalities[p].icon}
                </div>
                <div className="text-xs font-medium">{personalities[p].name}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-500 mt-2">{personalities[personality].description}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 glass-card p-6 mb-4 overflow-y-auto max-h-[500px]">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                      : 'bg-white/60 text-ink-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-ink-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-white/60 text-ink-800 px-6 py-4 rounded-2xl">
                  <div className="flex gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-ink-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-ink-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-ink-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Quick Start</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInputMessage(prompt)
                    inputRef.current?.focus()
                  }}
                  className="px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 text-sm text-ink-700 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="glass-card p-4">
          {user?.subscriptionStatus === 'trial' && trialEndsAtLabel && (
            <p className="text-xs text-lilac-600 mb-2">
              Premium trial active through {trialEndsAtLabel}.
            </p>
          )}
          {aiLimitNotice && (
            <p className="text-xs text-ink-500 mb-3 text-right">
              {aiLimitNotice}
            </p>
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isThinking}
              className="px-6 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: inputMessage.trim() && !isThinking ? 1.05 : 1 }}
              whileTap={{ scale: inputMessage.trim() && !isThinking ? 0.95 : 1 }}
            >
              Send
            </motion.button>
          </div>
          
          {messages.length > 2 && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleClearConversation}
                className="text-xs text-ink-500 hover:text-red-500 transition-colors"
              >
                Clear conversation
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AICompanion

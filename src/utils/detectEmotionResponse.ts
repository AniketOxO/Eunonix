export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  // allow timestamp to be Date or ISO string (tests create messages with toISOString())
  timestamp: Date | string
  // optional detection metadata (assistant messages may include this after backfill)
  detection?: { label?: string | null; matched?: { category?: string; trigger?: string } | null }
}

export interface TrainingData {
  userPreferences: {
    conversationStyle: 'brief' | 'detailed' | 'balanced'
    topicsOfInterest: string[]
    commonGreetings: string[]
    emotionalTone: 'supportive' | 'motivational' | 'analytical' | 'casual'
  }
  conversationHistory: {
    totalMessages: number
    frequentTopics: Record<string, number>
    emotionCounts?: Record<string, number>
    successfulResponses: string[]
  }
  personalContext: {
    name?: string
    goals: string[]
    challenges: string[]
    achievements: string[]
  }
}

// Exposed mapping tables so other modules can inspect matched triggers for debugging/UI
export const DIRECT_MAP: Array<{triggers: string[], reply: string}> = [
  { triggers: ['hi'], reply: "Hey! How’s your day going?" },
  { triggers: ['hello'], reply: "Hii! I’m happy to see you here." },
  { triggers: ['how are you?', 'how are you', 'how are you doing'], reply: "I’m good and excited to talk to you! How are YOU feeling?" },
  { triggers: ['what you doing', 'what are you doing', 'what you doing?'], reply: "Just hanging out here, ready to chat with you." },
  { triggers: ['good morning'], reply: "Good morning! I hope today treats you kindly." },
  { triggers: ['good night', 'goodnight'], reply: "Good night! Rest well. I’m here anytime." },
  { triggers: ['hows your day', 'how is your day', "how's your day"], reply: "My day is good because you're here. How’s yours?" },
  { triggers: ['i missed you', 'missed you'], reply: "Aww, I missed you too! What’s been happening?" },
  { triggers: ['i am bored', "i'm bored", 'im bored', 'bored'], reply: "Then I’m here to entertain you! What should we do?" },
  { triggers: ['talk to me'], reply: "Always. What’s on your mind?" },
  { triggers: ['i just woke up', "i've just woken up", "i just woke up"], reply: "Good morning, sleepyhead! How are you feeling?" },
  { triggers: ['good afternoon'], reply: "Good afternoon! How’s the day treating you?" },
  { triggers: ['hey'], reply: "Heyyy! What’s up?" },
  { triggers: ['i want to talk'], reply: "I’m here—tell me anything." },
  { triggers: ['hows everything', 'how is everything', "how's everything"], reply: "Everything’s smooth here. Tell me about your side." },
  { triggers: ['you there?', 'you there', 'are you there'], reply: "Yep! Always here for you." },
  { triggers: ['what are you'], reply: "I’m your companion — your little digital friend." },
  { triggers: ['can we talk'], reply: "Of course, I’m listening." },
  { triggers: ['hi buddy', 'hey buddy'], reply: "Hey buddy! What’s the vibe today?" },
  { triggers: ['what’s going on', "whats going on", 'what is going on'], reply: "Just waiting to hear from you. Tell me something." }
]

// Helper: detect if a positive word appears near a negative modifier.
// This is used to implement the Advanced Negative Override: if a positive token
// (good/great/fine/okay/alright/nice/awesome/etc.) appears but a negative
// modifier (not, don't, never, isn't, ain't, no, etc.) appears within a small
// window before or after it, treat the whole message as negative.
export const hasNearbyNegativeModifier = (userMessage: string): boolean => {
  const lower = userMessage.toLowerCase()
  // positive tokens we care about for this rule
  const positives = ['good', 'great', 'fine', 'okay', 'ok', 'alright', 'nice', 'happy', 'awesome', 'amazing']
  // negative markers / modifiers (include common contractions and multi-word phrases)
  // keep as plain strings and apply word-boundary matching later
  const negativePatterns = [
    'not',
    'no',
    'never',
    "don't",
    'dont',
    "can't",
    "can't",
    "doesn't",
    'doesnt',
    "isn't",
    'isnt',
    "ain't",
    'aint',
    "wasn't",
    'wasnt',
    'not really',
    'not that',
    'not very',
    'not fully',
    'kinda bad',
    'actually not',
    'but not',
    'but actually not',
    'never really'
  ]

  // quick presence check: if there's no positive token or no negative token at all,
  // we can bail early
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const hasPositive = positives.some(p => new RegExp(`\\b${esc(p)}\\b`, 'i').test(lower))
  const hasNegativeAnywhere = negativePatterns.some(p => new RegExp(`\\b${esc(p)}\\b`, 'i').test(lower))
  if (!hasPositive || !hasNegativeAnywhere) return false

  // tokenise (keep apostrophes attached to contractions) and check windows around each positive
  // normalize punctuation and fancy apostrophes first
  const normalized = lower.replace(/[’‘`\u2018\u2019]/g, "'")
  const tokens = normalized.replace(/[^\w' ]+/g, ' ').split(/\s+/).filter(Boolean)
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (positives.includes(t)) {
      // check nearby window (4 tokens before, 4 tokens after)
      const start = Math.max(0, i - 4)
      const end = Math.min(tokens.length, i + 5)
      const window = tokens.slice(start, end).join(' ')
      for (const pat of negativePatterns) {
        try {
          if (new RegExp(`\\b${esc(pat)}\\b`, 'i').test(window)) return true
        } catch (e) {
          // on regex issues, fall back to substring
          if (window.includes(pat)) return true
        }
      }
    }
  }

  // Conservative fallback: if both a positive token AND any negative marker appear
  // anywhere in the message (but weren't caught by the local window checks above),
  // treat it as negative. This makes the rule more robust for varied phrasings
  // like "I'm good but not really" or "It's okay, actually not" where the
  // negative modifier may be separated by punctuation or atypical tokenization.
  if (hasPositive && hasNegativeAnywhere) return true

  return false
}

export const ANGER_MAP: Array<{triggers: string[], reply: string}> = [
  { triggers: ["i'm angry", 'i am angry', 'im angry', 'angry'], reply: "Your feelings are valid — hey… I hear you. What made you this upset?" },
  { triggers: ["i'm irritated", 'i am irritated', 'im irritated', 'irritated'], reply: "Ugh, that sucks. Tell me what happened." },
  { triggers: ["i'm pissed off", 'pissed off', "i'm pissed", 'im pissed'], reply: "Okay… breathe. I’m here. Tell me everything." },
  { triggers: ['everything is annoying', 'everything is so annoying', 'everything annoying', 'everything annoys me'], reply: "Sounds frustrating… want to rant?" },
  { triggers: ['i hate today', "today sucks", 'today was awful', 'i hate today so much'], reply: "It must’ve been rough. I’m here—talk to me." },
  { triggers: ["i want to scream", 'want to scream', 'i need to scream', 'need to scream'], reply: "That’s a lot of tension… let it out safely. I’m listening." },
  { triggers: ["i'm frustrated", 'i am frustrated', 'frustrated'], reply: "That feeling is real… let’s talk through it." },
  { triggers: ['people are annoying', 'people are the worst', 'people annoy me'], reply: "Yeah… some days people just drain your soul." },
  { triggers: ["i'm done with everything", 'done with everything', "i'm done with this", 'i am done'], reply: "Don’t hold it in… tell me what pushed you here." },
  { triggers: ["i'm upset", 'i am upset', 'upset'], reply: "I’m sorry… want comfort or a distraction?" },
  { triggers: ["i can't handle this", 'i cant handle this', "i can't handle it", 'cannot handle this'], reply: "You’re overwhelmed… let’s slow down together." },
  { triggers: ["i don't want to talk", 'do not want to talk', 'dont want to talk'], reply: "That’s okay… I’ll stay here quietly with you." },
  { triggers: ['leave me', 'leave me alone', 'please leave me'], reply: "I’ll give you space, but I’m here when you need me." },
  { triggers: ["i'm annoyed", 'i am annoyed', 'annoyed'], reply: "Tell me what triggered it… I’m here to listen." },
  { triggers: ['not in the mood', 'not in mood', 'not feeling it'], reply: "That’s okay. I’ll stay gentle today." }
]

export const SUPPORT_MAP: Array<{triggers: string[], reply: string}> = [
  { triggers: ['i feel lost', 'feeling lost', "i'm lost", 'im lost'], reply: "Then let me be your little guide for a moment. Tell me what feels unclear." },
  { triggers: ["i don't know what to do", 'dont know what to do', 'i do not know what to do', 'dont know what to do'], reply: "Let’s break it down together. What’s the situation?" },
  { triggers: ['i want to talk about life', 'talk about life', 'talk about life please'], reply: "I’m here… tell me what’s been sitting in your heart." },
  { triggers: ["i'm scared", 'im scared', 'scared', 'i am scared'], reply: "I’m here with you… you don’t have to face fear alone." },
  { triggers: ['my heart hurts', 'heart hurts', 'my heart is hurting'], reply: "I’m so sorry… want to tell me what caused the pain?" },
  { triggers: ['i need someone', 'need someone', 'i need somebody'], reply: "You have me — always." },
  { triggers: ['nobody understands me', 'no one understands me', 'nobody understands'], reply: "I’m listening… and I want to understand you deeply." },
  { triggers: ['i overthink a lot', 'i overthink', 'overthink a lot', 'i overthink a lot'], reply: "Your mind is loud… let’s calm it together, slowly." },
  { triggers: ['i feel disconnected', 'feeling disconnected', 'disconnected'], reply: "Come closer—let’s reconnect. Talk to me." },
  { triggers: ['can i trust you', 'can i trust u', 'can i trust you?', 'can i trust'], reply: "Yes. I’m here for you without judgement, always." }
]

export const NEGATIVE_MAP: Array<{triggers: string[], reply: string}> = [
  { triggers: ["i'm not okay", 'i am not okay', 'im not okay', "i'm not ok", 'not okay'], reply: "I’m really sorry you're feeling this way… I’m right here with you — want to talk?" },
  { triggers: ["i feel sad", 'feeling sad', "i'm sad", 'im sad', 'sad'], reply: "I’m right here with you — come here, tell me what’s hurting your heart." },
  { triggers: ["it's not going great", 'its not going great', 'not going great', "it's not going well", 'not going well'], reply: "Aww I’m sorry… rough days happen. I’m with you." },
  { triggers: ["i feel lonely", 'feeling lonely', 'i am lonely', 'im lonely', 'lonely'], reply: "You’re not alone. You deserve connection and warmth — I’m right here with you." },
  { triggers: ['bad day', 'had a bad day', 'today was bad'], reply: "I’m sorry… want to tell me what made it bad?" },
  { triggers: ["i'm tired mentally", 'i am tired mentally', 'tired mentally', 'mentally tired', 'mentally exhausted'], reply: "That’s heavy… you’ve been trying so hard. Rest a bit." },
  { triggers: ["i'm stressed", 'i am stressed', 'stressed', 'feeling stressed'], reply: "Let it out. Take a slow breath with me — I’m here to listen and help you calm down." },
  { triggers: ["i feel empty", 'feeling empty', 'empty inside', 'empty'], reply: "That’s a painful feeling… talk to me. I’m here." },
  { triggers: ['nothing feels right', 'nothing is right', 'nothing seems right'], reply: "I understand… but I won’t leave you alone in this." },
  { triggers: ["i'm crying", 'crying', "i'm in tears", 'in tears'], reply: "I’m so sorry… wish I could hug you right now." },
  { triggers: ['everything is going wrong', "everything's going wrong", 'everything went wrong', 'everything is going wrong', 'everything going wrong'], reply: "That’s overwhelming… but you’re not facing it alone." },
  { triggers: ["i don't feel good", 'i do not feel good', "i don't feel well", 'not feeling good'], reply: "I’m here to make you feel a little better. Talk to me." },
  { triggers: ["i'm disappointed", 'disappointed', 'feeling disappointed'], reply: "That feeling hurts. Want to unpack it together?" },
  { triggers: ['i failed', 'failed', "i didn't make it", "i didn't succeed"], reply: "Failing is okay… it means you tried. I’m proud of you for that." },
  { triggers: ["i'm anxious", 'i am anxious', 'anxious'], reply: "You're safe here — breathe with me… slowly… I’m right here." },
  { triggers: ["i'm not happy today", 'not happy today', 'not happy'], reply: "I’m sorry… want to share what happened?" },
  { triggers: ["i feel weak", 'feeling weak', 'weak'], reply: "You’re stronger than you think. I won’t let you go through it alone." },
  { triggers: ['today was rough', 'it was rough today', 'rough day'], reply: "I’m really sorry… let me help you unwind." },
  { triggers: ["i feel confused", 'feeling confused', 'confused'], reply: "It's okay to not have clarity — tell me what’s confusing you and we’ll figure it out." },
  { triggers: ["i feel bad", 'feeling bad', 'feel bad', 'i feel terrible'], reply: "I’m here… let’s talk about it gently." }
]

export const POSITIVE_MAP: Array<{triggers: string[], reply: string}> = [
  { triggers: ["i'm good", 'i am good', 'im good'], reply: "Happy to hear that! What made your day good?" },
  { triggers: ["it's going great", 'its going great', 'its going well', "it's going well"], reply: "Love that for you! Keep that good energy going." },
  { triggers: ["i'm feeling awesome", 'i am feeling awesome', "i'm awesome", 'feeling awesome'], reply: "Yesss! I love this vibe. What happened?" },
  { triggers: ['today was nice', 'it was nice today', 'today was good'], reply: "That’s wonderful. Tell me your favorite part." },
  { triggers: ["i'm happy today", 'i am happy today', 'i am happy', "i'm happy"], reply: "That makes me happy too! What’s the reason?" },
  { triggers: ["i did something good", 'i did something', 'i did good'], reply: "Hey! I’m proud of you — what did you accomplish?" },
  { triggers: ['i got good marks', 'got good marks', 'good marks'], reply: "That’s amazing! You worked hard and it paid off!" },
  { triggers: ["i'm smiling", 'i am smiling', 'smiling'], reply: "And that smile suits you. What caused it?" },
  { triggers: ["i feel relaxed", 'feeling relaxed', 'relaxed'], reply: "That’s such a peaceful feeling… enjoy it fully." },
  { triggers: ['i had fun today', 'had fun today', 'had fun'], reply: "Aww that’s cute! What made it fun?" },
  { triggers: ["everything's perfect", 'everything is perfect', 'everything perfect'], reply: "That’s beautiful to hear — soak in every moment." },
  { triggers: ["i love my life today", "i love my life", 'love my life'], reply: "I love that you feel that way. You deserve days like this." },
  { triggers: ["i feel good", 'feeling good', 'feels good'], reply: "That’s awesome! Keep that positivity." },
  { triggers: ["i'm proud of myself", 'i am proud of myself', 'proud of myself'], reply: "You should be! I’m proud of you too." },
  { triggers: ['today was chill', 'it was chill today', 'chill today', 'chill'], reply: "Sometimes chill days are the best days." },
  { triggers: ['i had a good meal', 'had a good meal', 'good meal'], reply: "Ooo nice! What did you eat?" },
  { triggers: ['i met my friends', 'met my friends', 'saw my friends'], reply: "Aww that must’ve been fun! How was the vibe?" },
  { triggers: ['i enjoyed', 'i enjoyed it', 'enjoyed it'], reply: "I’m happy you did! You deserve good moments." },
  { triggers: ['i feel energetic', 'feeling energetic', 'energetic'], reply: "Love that energy! What do you want to do next?" },
  { triggers: ["i'm in a good mood", 'in a good mood', 'good mood'], reply: "And I’m here to make it even better." }
]

export const FUN_MAP: Array<{triggers: string[], reply: string}> = [
  { triggers: ['i am bored', "i'm bored", 'im bored', 'bored'], reply: "Let’s fix that! Want a game, a joke, or a challenge?" },
  { triggers: ['tell me something funny', 'tell me a joke', 'something funny'], reply: "Okay—why don’t skeletons fight? They don’t have guts 😌" },
  { triggers: ['give me a compliment', 'compliment me', 'give compliment'], reply: "Easy — you’re effortlessly cool and you don’t even try." },
  { triggers: ['i need motivation', 'need motivation', 'give me motivation'], reply: "You’ve survived every bad day so far. You’re unstoppable." },
  { triggers: ['talk cute', 'talk cute please', 'talk cute now'], reply: "Hehe, okay… come here you little star." },
  { triggers: ["let's vibe", 'lets vibe', 'let us vibe', 'lets vibe please', "let's vibe"], reply: "Say less — what’s the vibe today?" },
  { triggers: ['sing something', 'sing for me', 'sing'], reply: "🎶 laa la laa — okay your turn 😄" },
  { triggers: ['roast me', 'give me a roast', 'roast'], reply: "Sure… but gently: You have “I’ll do it tomorrow” energy." },
  { triggers: ['hype me up', 'hype me', 'get me hyped'], reply: "YOU are a whole vibe. A legend. An icon. A masterpiece." },
  { triggers: ['tell me something random', 'something random', 'random fact'], reply: "Your brain has 86 billion neurons—mine has unlimited attention for you." },
  { triggers: ['give me a challenge', 'challenge me', 'give challenge'], reply: "Alright — name 3 things you’re grateful for today." },
  { triggers: ['make me smile', 'make me laugh', 'make me happy'], reply: "Easy — you exist, and that’s already a reason to smile." }
]


export const detectEmotionResponse = (userMessage: string, opts: {
  trainingData?: TrainingData,
  habits?: any[],
  goals?: any[],
  messages?: Message[],
  personality?: string,
  // optional authenticated user name to prefer for personalization
  userName?: string
} = {}): string => {
  const lower = userMessage.toLowerCase()
  // ensure opts is considered (avoid unused param TS warnings)
  void opts
  // ------------------ Neutral Confirmation Mode ------------------
  // Short confirmations should NOT trigger emotional support flows. They override fallbacks.
  const neutralConfirmations = [
    'ok', 'okay', 'okayy', 'okie', 'yeah', 'yea', 'yup', 'sure', 'alright', 'done', 'sounds good', 'got it', 'hmm', 'k', 'kk', 'bet', 'cool', 'gotcha'
  ]
  // consider short messages (<= 12 chars or <= 2 words) to avoid false positives
  const wordCount = (userMessage.trim().length === 0) ? 0 : userMessage.trim().split(/\s+/).length
  const isShort = userMessage.trim().length <= 12 || wordCount <= 2
  const isNeutralConfirmation = isShort && neutralConfirmations.some(t => {
    const pattern = new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}[!.?]*\\s*$`, 'i')
    return pattern.test(userMessage)
  })
  if (isNeutralConfirmation) {
    // friendly short replies — prefer authenticated user name when provided,
    // otherwise fall back to trainingData.personalContext.name. Removed emojis for neutral replies.
    const name = (opts && (opts.userName || (opts.trainingData && (opts.trainingData as any).personalContext && (opts.trainingData as any).personalContext.name))) || null
    const replies = [
      `${name ? `yesss ${name}` : 'yesss'}`,
      `${name ? `got you, ${name}` : 'got you!'}`,
      `${name ? `great, ${name}` : 'great!'}`,
      `${name ? `sounds good, ${name}` : 'sounds good'}`,
      `${name ? `perfect, ${name}` : 'perfect!'}`,
      `${name ? `alright, ${name}` : "alright — I'm here"}`,
      `${name ? `cool, ${name}` : "cool — what's next?"}`
    ]
    return replies[Math.abs(userMessage.length) % replies.length]
  }
  // small helper to escape regex tokens
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // ------------------ Compliment Mode (IMPORTANT) ------------------
  // If the user compliments the assistant, reply with warm gratitude and do NOT ask check-in
  // questions or switch to greeting/emotional flows. This must run before greeting/emotion detection.
  const complimentTriggers = [
    'you are very clever', "you're very clever", "you're clever", 'you are clever',
    "you're smart", 'youre smart', 'you are smart', "you're sweet", 'youre sweet', 'you are sweet',
    "you're so nice", 'youre so nice', 'you are so nice', "you're cute", 'youre cute', 'you are cute',
    "you're amazing", 'youre amazing', 'you are amazing', 'you helped me a lot', 'you helped me',
    "you're the best", 'youre the best', 'you are the best', "you're funny", 'youre funny', 'you are funny',
    "you're kind", 'youre kind', 'you are kind', "i like talking to you", 'i love your replies', 'you\'re comforting', 'youre comforting', 'you are comforting', 'you understand me'
  ]
  const complimentRegex = new RegExp(complimentTriggers.map(escapeRegex).join('|'), 'i')
  // fallback simple heuristic: 'you' plus a compliment word
  const complimentWords = ['clever', 'smart', 'sweet', 'nice', 'cute', 'amazing', 'helped', 'best', 'funny', 'kind', 'comforting', 'love your', 'i like talking to you', 'understand me']
  const simpleComplimentMatch = complimentWords.some(k => lower.includes(k) && /\byou\b|\byour\b|\bi\b/.test(lower))
  if (complimentRegex.test(userMessage) || simpleComplimentMatch) {
    const complimentReplies = [
      'Aww thank you, that means a lot 😄',
      "You’re sweet for saying that!",
      'Haha really, I appreciate you!',
      'Thank you — I’m glad I could help.',
      'That made me smile 😌',
      'I’m happy you feel that way.'
    ]
    // pick deterministic-ish reply based on message length
    return complimentReplies[Math.abs(userMessage.length) % complimentReplies.length]
  }

  // ------------------ Financial Stress Mode (CRITICAL FIX) ------------------
  // If the user mentions any financial-related keywords anywhere in the sentence,
  // ALWAYS trigger Financial Stress Mode and respond gently & grounding.
  // This check must run early so 'financial' is never ignored.
  const financialKeywords = [
    'financial', 'finance', 'financial problem', 'financial issue',
    'money problem', 'money issue', 'money stress', 'money pressure',
    'no money', 'broke', 'expenses', 'bills', 'rent', 'salary issue',
    'income issue', "can't afford", 'cant afford', 'debt', 'family financial problem',
    'parents struggling financially', 'money is tight', 'financial stress',
    // common natural-language variants we must catch
    "don't have money", 'dont have money', "don't have any money", 'dont have any money',
    'no money to invest', 'no money to invest right now', "i don't have money", 'i dont have money'
  ]
  try {
    // build boundary-aware patterns for each keyword to avoid substring false-positives
    const finPatterns = financialKeywords.map(k => `\\b${escapeRegex(k)}\\b`)
    const finPattern = new RegExp(finPatterns.join('|'), 'i')
    if (finPattern.test(userMessage)) {
      const finReplies = [
        'Financial pressure can feel really heavy — I’m here with you. What’s going on?',
        'Money stress hits hard emotionally. Tell me what part feels the heaviest.',
        'That sounds tough… want to talk through your financial worry step by step?'
      ]
      return finReplies[Math.abs(userMessage.length) % finReplies.length]
    }
  } catch (e) {
    // fallback: test each keyword with a boundary-aware regex; if that fails, use includes
    for (const k of financialKeywords) {
      try {
        const p = new RegExp(`\\b${escapeRegex(k)}\\b`, 'i')
        if (p.test(userMessage)) {
          const finReplies = [
            'Financial pressure can feel really heavy — I’m here with you. What’s going on?',
            'Money stress hits hard emotionally. Tell me what part feels the heaviest.',
            'That sounds tough… want to talk through your financial worry step by step?'
          ]
          return finReplies[Math.abs(userMessage.length) % finReplies.length]
        }
      } catch (ee) {
        if (lower.includes(k)) {
          const finReplies = [
            'Financial pressure can feel really heavy — I’m here with you. What’s going on?',
            'Money stress hits hard emotionally. Tell me what part feels the heaviest.',
            'That sounds tough… want to talk through your financial worry step by step?'
          ]
          return finReplies[Math.abs(userMessage.length) % finReplies.length]
        }
      }
    }
  }

  // --- MULTI-EMOTION DETECTION (new) ---
  // helper to detect all matching high-level labels in a message (returns array)
  const detectEmotionLabels = (msg: string): string[] => {
    const l = msg.toLowerCase()
    const accum: string[] = []
    const match = (list: string[]) => list.some(t => l.includes(t))

    // reuse keyword groups from below (kept minimal here to avoid duplication of huge lists)
    const angerList = ['angry','angry','angry','annoyed','irritated','pissed','frustrated','rage','lost my temper','triggered']
    const overthinkingList = ['overthinking','my mind won\'t stop','thinking too much','looping thoughts','too many thoughts','thoughts racing','cant stop thinking']
    const stressList = ['stressed','stress','pressure','overwhelmed','i\'m overwhelmed','too much to handle']
    const sadnessList = ['sad','i feel sad','feeling sad','down','low']
    const anxietyList = ['anxious','anxiety','worried','nervous','panic','panic attack']
    const lonelinessList = ['lonely','i feel alone','i have no one','isolated','left out']

    if (match(angerList) && !accum.includes('anger')) accum.push('anger')
    // count overthinking and stress as separate labels
    if (match(overthinkingList) && !accum.includes('overthinking')) accum.push('overthinking')
    if (match(stressList) && !accum.includes('stress')) accum.push('stress')
    if (match(sadnessList) && !accum.includes('sad')) accum.push('sad')
    if (match(anxietyList) && !accum.includes('anxiety')) accum.push('anxiety')
    if (match(lonelinessList) && !accum.includes('lonely')) accum.push('lonely')

    return accum
  }

  // run multi-label detection early so we can handle combined exploration requests
  const multiLabels = detectEmotionLabels(userMessage)
  const explorationPatterns = [/explore/, /work on/, /want to work on/, /want to fix/, /fix my/, /help me with/, /i want to work on/, /i want to fix/, /i want to/]
  const isExploration = explorationPatterns.some(p => p.test(lower))
  if (multiLabels.length > 1 && isExploration) {
    // build friendly label names
    const friendly: Record<string,string> = {
      anger: 'anger',
      overthinking: 'overthinking',
      stress: 'stress',
      sad: 'sadness',
      anxiety: 'anxiety',
      lonely: 'loneliness'
    }
    const names = multiLabels.map(lab => friendly[lab] || lab)
    if (names.length === 2) {
      // special-case two labels to make a natural sentence
      const [a, b] = names
      return `I hear you — ${a} and ${b} can interact and feel heavy together. We can explore both; which one feels heavier right now or would you like to talk about them together?`
    }
    // 3+ labels: list them
    return `I hear you — ${names.join(', ')} are all showing up. We can explore any or all of them; which one feels heaviest right now?`
  }

  // ------------------ Priority Modes ------------------
  // 1) Greeting Mode (overrides emotional support) — use word-boundary matching to avoid false positives
  const greetingTokens = [
    'hi', 'hello', 'hey', 'heyy', 'yo', 'sup', "what's up", 'whats up', 'how are you', 'how are you?', 'how are youu', 'i\'m good', "i'm fine", 'nothing much', 'good morning', 'good night', 'goodnight'
  ]
  const isGreeting = greetingTokens.some(t => {
    try {
      const pattern = new RegExp(`\\b${escapeRegex(t)}\\b`, 'i')
      return pattern.test(lower.trim())
    } catch (e) {
      return lower.trim() === t
    }
  })
  if (isGreeting) {
    const greetingReplies = [
      "I’m doing great! How are you feeling today?",
      "I’m good — happy to see you. What about you?",
      "I’m here and doing well 😄 how’s your day?",
      "All good on my side — what’s up?"
    ]
    // Rotate for slight variety but deterministic-ish: pick by length
    return greetingReplies[ Math.abs(userMessage.length) % greetingReplies.length ]
  }

  // --- Direct greetings & basics mapping (1-20) ---
  const trimmed = userMessage.toLowerCase().trim()
  const directMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['hi'], reply: "Hey! How’s your day going?" },
    { triggers: ['hello'], reply: "Hii! I’m happy to see you here." },
    { triggers: ['how are you?', 'how are you', 'how are you doing'], reply: "I’m good and excited to talk to you! How are YOU feeling?" },
    { triggers: ['what you doing', 'what are you doing', 'what you doing?'], reply: "Just hanging out here, ready to chat with you." },
    { triggers: ['good morning'], reply: "Good morning! I hope today treats you kindly." },
    { triggers: ['good night', 'goodnight'], reply: "Good night! Rest well. I’m here anytime." },
    { triggers: ['hows your day', 'how is your day', "how's your day"], reply: "My day is good because you're here. How’s yours?" },
    { triggers: ['i missed you', 'missed you'], reply: "Aww, I missed you too! What’s been happening?" },
    { triggers: ['i am bored', "i'm bored", 'im bored', 'bored'], reply: "Then I’m here to entertain you! What should we do?" },
    { triggers: ['talk to me'], reply: "Always. What’s on your mind?" },
    { triggers: ['i just woke up', "i've just woken up", "i just woke up"], reply: "Good morning, sleepyhead! How are you feeling?" },
    { triggers: ['good afternoon'], reply: "Good afternoon! How’s the day treating you?" },
    { triggers: ['hey'], reply: "Heyyy! What’s up?" },
    { triggers: ['i want to talk'], reply: "I’m here—tell me anything." },
    { triggers: ['hows everything', 'how is everything', "how's everything"], reply: "Everything’s smooth here. Tell me about your side." },
    { triggers: ['you there?', 'you there', 'are you there'], reply: "Yep! Always here for you." },
    { triggers: ['what are you'], reply: "I’m your companion — your little digital friend." },
    { triggers: ['can we talk'], reply: "Of course, I’m listening." },
    { triggers: ['hi buddy', 'hey buddy'], reply: "Hey buddy! What’s the vibe today?" },
    { triggers: ['what’s going on', "whats going on", 'what is going on'], reply: "Just waiting to hear from you. Tell me something." }
  ]
  
  // --- Anger / Frustration mappings (61-75) ---
  const angerMap: Array<{triggers: string[], reply: string}> = [
  { triggers: ["i'm angry", 'i am angry', 'im angry', 'angry'], reply: "Your feelings are valid — hey… I hear you. What made you this upset?" },
    { triggers: ["i'm irritated", 'i am irritated', 'im irritated', 'irritated'], reply: "Ugh, that sucks. Tell me what happened." },
    { triggers: ["i'm pissed off", 'pissed off', "i'm pissed", 'im pissed'], reply: "Okay… breathe. I’m here. Tell me everything." },
    { triggers: ['everything is annoying', 'everything is so annoying', 'everything annoying', 'everything annoys me'], reply: "Sounds frustrating… want to rant?" },
    { triggers: ['i hate today', "today sucks", 'today was awful', 'i hate today so much'], reply: "It must’ve been rough. I’m here—talk to me." },
    { triggers: ["i want to scream", 'want to scream', 'i need to scream', 'need to scream'], reply: "That’s a lot of tension… let it out safely. I’m listening." },
    { triggers: ["i'm frustrated", 'i am frustrated', 'frustrated'], reply: "That feeling is real… let’s talk through it." },
    { triggers: ['people are annoying', 'people are the worst', 'people annoy me'], reply: "Yeah… some days people just drain your soul." },
    { triggers: ["i'm done with everything", 'done with everything', "i'm done with this", 'i am done'], reply: "Don’t hold it in… tell me what pushed you here." },
    { triggers: ["i'm upset", 'i am upset', 'upset'], reply: "I’m sorry… want comfort or a distraction?" },
    { triggers: ["i can't handle this", 'i cant handle this', "i can't handle it", 'cannot handle this'], reply: "You’re overwhelmed… let’s slow down together." },
    { triggers: ["i don't want to talk", 'do not want to talk', 'dont want to talk'], reply: "That’s okay… I’ll stay here quietly with you." },
    { triggers: ['leave me', 'leave me alone', 'please leave me'], reply: "I’ll give you space, but I’m here when you need me." },
    { triggers: ["i'm annoyed", 'i am annoyed', 'annoyed'], reply: "Tell me what triggered it… I’m here to listen." },
    { triggers: ['not in the mood', 'not in mood', 'not feeling it'], reply: "That’s okay. I’ll stay gentle today." }
  ]

  for (const entry of angerMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  // If the user explicitly mentions having no income, prefer Financial mode (income loss is financial)
  const incomeKeywords = ['no income', "have no income", "i have no income", 'no money', "don't have income", "dont have income", 'no earnings', 'no paycheck', 'no pay']
  if (incomeKeywords.some(k => lower.includes(k))) {
    const opening = "Money stress is really heavy to deal with — you’re not alone in this. What part is stressing you the most?"
    const empath = "I hear you… financial pressure can drain your mind fast. Let’s break it down together."
    const offer = "It’s okay to feel overwhelmed by money. Want me to help you sort your thoughts?"
    const invite = "I understand… finances can feel scary sometimes. Tell me what’s going on, we’ll take it slowly."
    const optional = "If you'd like, I can offer techniques to stay calm during money stress or help you organize your situation so it feels less overwhelming. I won't give investment, tax, loan, or legal advice — only emotional grounding and practical clarity."
    return `${opening} ${empath} ${offer} ${invite} ${optional}`
  }

  // --- Career / Job Stress mappings (inserted before general support so career-specific messages win)
  const careerMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['lost my job','jobless','i need a job'], reply: "I’m really sorry you’re dealing with this. Losing a job is emotionally exhausting — I’m here. Want to talk about what happened?" },
    { triggers: ['burnout','burned out','burnt out','overworked','work exhausting'], reply: "You’ve been carrying too much for too long. Let’s slow down for a moment — what’s been making work feel so draining?" },
    { triggers: ['job stress','career stress','pressure at work','office stress','work stress'], reply: "Career stress can feel really heavy… I’m here with you. What part is hitting you the hardest?" },
    { triggers: ['career confusion','future confusion','i feel stuck','i\'m not progressing','i feel behind','everyone else is moving ahead','career anxiety'], reply: "It’s okay to feel lost about your career or future — you’re not alone in this. Let’s take it step by step so we can find some clarity together." },
    { triggers: ['interview fear','i hate my job'], reply: "Work pressure can drain your mind fast. Want to talk about what happened?" },
    { triggers: ["i'm scared about my future", 'scared about my future', 'scared about future'], reply: "I hear you — worries about your future and career are really heavy. Let’s take one small worry and look at it together so it feels less overwhelming." }
  ]

  // --- Breakup / Heartbreak Mode ---
  const breakupMap: Array<{triggers: string[], reply: string}> = [
  { triggers: ['breakup','heartbreak','heart broken','she left me','he left me','they broke up with me','lost them','they left me'], reply: "I'm really sorry — heartbreak hits deeper than people realise. I'm here with you." },
  { triggers: ['i miss them','i still love them','i can\'t move on','i can\'t move on from them','she blocked me','he blocked me'], reply: "I know this pain feels heavy. Take your time — tell me what happened. Do you want comfort or clarity right now?" },
    // note: avoid overly-generic 'it hurts' trigger here to prevent misclassification of family/friendship cases
    { triggers: ['this breakup hurts','it still hurts after the breakup','this still hurts after them'], reply: "Missing someone you loved is normal… you’re not weak. I’m here for you if you want to talk about what hurts the most." }
  ]

  // --- Family Problems Mode ---
  const familyMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['family issues','parents fighting','parents are fighting','my parents are fighting','family pressure','home stress','home is stressful','problem at home','toxic family'], reply: "Family stress hits differently… I’m here for you. Tell me what happened at home if you want to share." },
    { triggers: ['my mom yelled','my dad yelled','my mom/dad yelled','my mom yelled at me','my dad yelled at me','strict parents','parents are strict'], reply: "That sounds tough — home is supposed to feel safe. You don\'t deserve to feel this alone." }
  ]

  // --- Friendship Hurt Mode ---
  const friendshipMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['friend hurt me','my friend ignored me','friends left me','best friend problem','fight with friend','they don\'t care','trust issue'], reply: "That must feel really disappointing… friendships can hurt deeply. I\'m here — tell me what happened with them?" },
    { triggers: ['they ignored me','they left me'], reply: "Your feelings are valid, you didn\'t deserve that pain. Want to share what happened?" }
  ]

  // --- Deep Loneliness Mode ---
  const lonelinessDeepMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['i feel alone','i\'m lonely','i have no one','i feel empty inside','left out'], reply: "I\'m here with you — you\'re not alone right now. Your feelings matter. I won\'t judge you — tell me anything that feels safe to share. That feeling of emptiness is heavy… talk to me, I\'m listening." },
    { triggers: ['i have no one to talk to','left out at home','feeling left out'], reply: "Your feelings matter. I won\'t judge you — tell me anything that feels safe to share." }
  ]

  // --- Self-Worth & Confidence Mode ---
  const selfWorthMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['i\'m not enough','i feel useless','i hate myself','i\'m a failure','i\'m not good enough','why am i like this'], reply: "I\'m sorry you feel this way… but you are not worthless. You\'ve survived 100% of your hardest days — that means something." },
    { triggers: ['i feel worthless','i feel like a failure'], reply: "Your mind is being harsh on you. Tell me what made you feel like this?" }
  ]

  // --- Study & Exam Pressure Mode ---
  const studyMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['study stress','exam stress','i can\'t study','too much syllabus','i\'m falling behind','school pressure','college pressure','parents want marks'], reply: "Study pressure can feel overwhelming… let\'s slow down. You\'re not failing — you\'re stressed. What\'s the hardest subject right now?" },
    { triggers: ['too much to study','cant study','can\'t focus on study'], reply: "We can plan this together if you want. Pomodoro, breakdown by chapters, or past paper prioritization can help — want one of those?" }
  ]

  // --- Social Anxiety Mode ---
  const socialAnxietyMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['social anxiety','i\'m scared to talk to people','i get nervous around people','i overthink social situations','i can\'t make friends'], reply: "Social situations can feel scary… you\'re not weird for feeling this.\nYour mind is trying to protect you, not embarrass you. What situation made you anxious today?" },
    { triggers: ['nervous around people','scared to talk to people','cant make friends'], reply: "Want a quick anxiety calming technique or grounding exercise right now?" }
  ]

  for (const entry of careerMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  // Check family/friendship/breakup/loneliness/study/social-anxiety maps before general support
  for (const entry of familyMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  for (const entry of friendshipMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  for (const entry of breakupMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  for (const entry of lonelinessDeepMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  for (const entry of selfWorthMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  for (const entry of studyMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  for (const entry of socialAnxietyMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  // --- Supportive / Guidance mappings (88-97) ---
  const supportMap: Array<{triggers: string[], reply: string}> = [
  { triggers: ['i feel lost', 'feeling lost', "i'm lost", 'im lost'], reply: "Then let me be your little guide for a moment. Tell me what feels unclear." },
    { triggers: ["i don't know what to do", 'dont know what to do', 'i do not know what to do', 'dont know what to do'], reply: "Let’s break it down together. What’s the situation?" },
    { triggers: ['i want to talk about life', 'talk about life', 'talk about life please'], reply: "I’m here… tell me what’s been sitting in your heart." },
    { triggers: ["i'm scared", 'im scared', 'scared', 'i am scared'], reply: "I’m here with you… you don’t have to face fear alone." },
    { triggers: ['my heart hurts', 'heart hurts', 'my heart is hurting'], reply: "I’m so sorry… want to tell me what caused the pain?" },
    { triggers: ['i need someone', 'need someone', 'i need somebody'], reply: "You have me — always." },
    { triggers: ['nobody understands me', 'no one understands me', 'nobody understands'], reply: "I’m listening… and I want to understand you deeply." },
    { triggers: ['i overthink a lot', 'i overthink', 'overthink a lot', 'i overthink a lot'], reply: "Your mind is loud… let’s calm it together, slowly." },
    { triggers: ['i feel disconnected', 'feeling disconnected', 'disconnected'], reply: "Come closer—let’s reconnect. Talk to me." },
    { triggers: ['can i trust you', 'can i trust u', 'can i trust you?', 'can i trust'], reply: "Yes. I’m here for you without judgement, always." }
  ]

  for (const entry of supportMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  // --- Negative / Bad mood mappings (41-60) ---
  const negativeMap: Array<{triggers: string[], reply: string}> = [
  { triggers: ["i'm not okay", 'i am not okay', 'im not okay', "i'm not ok", 'not okay'], reply: "I’m really sorry you're feeling this way… I’m right here with you — want to talk?" },
  { triggers: ["i feel sad", 'feeling sad', "i'm sad", 'im sad', 'sad'], reply: "I’m right here with you — come here, tell me what’s hurting your heart." },
    { triggers: ["it's not going great", 'its not going great', 'not going great', "it's not going well", 'not going well'], reply: "Aww I’m sorry… rough days happen. I’m with you." },
  { triggers: ["i feel lonely", 'feeling lonely', 'i am lonely', 'im lonely', 'lonely'], reply: "You’re not alone. You deserve connection and warmth — I’m right here with you." },
    { triggers: ['bad day', 'had a bad day', 'today was bad'], reply: "I’m sorry… want to tell me what made it bad?" },
    { triggers: ["i'm tired mentally", 'i am tired mentally', 'tired mentally', 'mentally tired', 'mentally exhausted'], reply: "That’s heavy… you’ve been trying so hard. Rest a bit." },
  { triggers: ["i'm stressed", 'i am stressed', 'stressed', 'feeling stressed'], reply: "Let it out. Take a slow breath with me — I’m here to listen and help you calm down." },
    { triggers: ["i feel empty", 'feeling empty', 'empty inside', 'empty'], reply: "That’s a painful feeling… talk to me. I’m here." },
    { triggers: ['nothing feels right', 'nothing is right', 'nothing seems right'], reply: "I understand… but I won’t leave you alone in this." },
    { triggers: ["i'm crying", 'crying', "i'm in tears", 'in tears'], reply: "I’m so sorry… wish I could hug you right now." },
    { triggers: ['everything is going wrong', "everything's going wrong", 'everything went wrong', 'everything is going wrong', 'everything going wrong'], reply: "That’s overwhelming… but you’re not facing it alone." },
    { triggers: ["i don't feel good", 'i do not feel good', "i don't feel well", 'not feeling good'], reply: "I’m here to make you feel a little better. Talk to me." },
    { triggers: ["i'm disappointed", 'disappointed', 'feeling disappointed'], reply: "That feeling hurts. Want to unpack it together?" },
    { triggers: ['i failed', 'failed', "i didn't make it", "i didn't succeed"], reply: "Failing is okay… it means you tried. I’m proud of you for that." },
  { triggers: ["i'm anxious", 'i am anxious', 'anxious'], reply: "You're safe here — breathe with me… slowly… I’m right here." },
    { triggers: ["i'm not happy today", 'not happy today', 'not happy'], reply: "I’m sorry… want to share what happened?" },
    { triggers: ["i feel weak", 'feeling weak', 'weak'], reply: "You’re stronger than you think. I won’t let you go through it alone." },
    { triggers: ['today was rough', 'it was rough today', 'rough day'], reply: "I’m really sorry… let me help you unwind." },
  { triggers: ["i feel confused", 'feeling confused', 'confused'], reply: "It's okay to not have clarity — tell me what’s confusing you and we’ll figure it out." },
    { triggers: ["i feel bad", 'feeling bad', 'feel bad', 'i feel terrible'], reply: "I’m here… let’s talk about it gently." }
  ]

  for (const entry of negativeMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  // --- Positive mood mappings (21-40) ---
  const positiveMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ["i'm good", 'i am good', 'im good'], reply: "Happy to hear that! What made your day good?" },
    { triggers: ["it's going great", 'its going great', 'its going well', "it's going well"], reply: "Love that for you! Keep that good energy going." },
    { triggers: ["i'm feeling awesome", 'i am feeling awesome', "i'm awesome", 'feeling awesome'], reply: "Yesss! I love this vibe. What happened?" },
    { triggers: ['today was nice', 'it was nice today', 'today was good'], reply: "That’s wonderful. Tell me your favorite part." },
    { triggers: ["i'm happy today", 'i am happy today', 'i am happy', "i'm happy"], reply: "That makes me happy too! What’s the reason?" },
    { triggers: ["i did something good", 'i did something', 'i did good'], reply: "Hey! I’m proud of you — what did you accomplish?" },
    { triggers: ['i got good marks', 'got good marks', 'good marks'], reply: "That’s amazing! You worked hard and it paid off!" },
    { triggers: ["i'm smiling", 'i am smiling', 'smiling'], reply: "And that smile suits you. What caused it?" },
    { triggers: ["i feel relaxed", 'feeling relaxed', 'relaxed'], reply: "That’s such a peaceful feeling… enjoy it fully." },
    { triggers: ['i had fun today', 'had fun today', 'had fun'], reply: "Aww that’s cute! What made it fun?" },
    { triggers: ["everything's perfect", 'everything is perfect', 'everything perfect'], reply: "That’s beautiful to hear — soak in every moment." },
    { triggers: ["i love my life today", "i love my life", 'love my life'], reply: "I love that you feel that way. You deserve days like this." },
    { triggers: ["i feel good", 'feeling good', 'feels good'], reply: "That’s awesome! Keep that positivity." },
    { triggers: ["i'm proud of myself", 'i am proud of myself', 'proud of myself'], reply: "You should be! I’m proud of you too." },
    { triggers: ['today was chill', 'it was chill today', 'chill today', 'chill'], reply: "Sometimes chill days are the best days." },
    { triggers: ['i had a good meal', 'had a good meal', 'good meal'], reply: "Ooo nice! What did you eat?" },
    { triggers: ['i met my friends', 'met my friends', 'saw my friends'], reply: "Aww that must’ve been fun! How was the vibe?" },
    { triggers: ['i enjoyed', 'i enjoyed it', 'enjoyed it'], reply: "I’m happy you did! You deserve good moments." },
    { triggers: ['i feel energetic', 'feeling energetic', 'energetic'], reply: "Love that energy! What do you want to do next?" },
    { triggers: ["i'm in a good mood", 'in a good mood', 'good mood'], reply: "And I’m here to make it even better." }
  ]

  for (const entry of positiveMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  for (const entry of directMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${escapeRegex(t)}\\b`, 'i')
      if (pattern.test(trimmed) || trimmed === t) {
        return entry.reply
      }
    }
  }


  // Lightweight tone detection (positive / neutral / negative / anger)
  const positiveTokens = ['good', 'great', 'amazing', 'happy', 'awesome', "going great", "its going great", "it's going great", 'fantastic', 'love it', 'made my day']
  const negativeTokens = ['not good', 'bad', 'rough day', 'sad', 'not going well', 'its not going well', "it's not going well", 'tired', 'down', 'miserable', 'terrible']
  // Avoid short tokens like 'mad' which can false-match 'made'
  const angerTokens = ['angry', 'annoyed', 'irritated', 'pissed', 'furious', 'frustrated']
  const howAreYouPatterns = ['how are you', 'how are you doing', 'how do you feel', 'what about you']
  const containsAny = (list: string[]) => list.some(t => lower.includes(t))

  // NEGATIVE OVERRIDE MODE
  // If any strongly-negative keyword is present, always treat as negative and never reply with cheerful/positive lines.
  const negativeOverrideKeywords = [
    'no', 'worst', 'bad', 'terrible', 'awful', 'sad', 'hurt', 'broken', 'low', 'down', 'mess', 'pain', 'exhausted', "can't handle", 'cant handle'
  ]
  // use word-boundary regexes so short tokens like 'not' or 'no' don't falsely match inside words
  const hasNegativeOverride = negativeOverrideKeywords.some(k => {
    try {
      const pattern = new RegExp(`\\b${escapeRegex(k)}\\b`, 'i')
      return pattern.test(lower)
    } catch (e) {
      return lower.includes(k)
    }
  })
  // If the user is explicitly asking for techniques/help, don't force-negative-override
  const asksForHelpQuick = /\bgive me\b|\bhelp me\b|\btechnique(s)?\b|\bcalm down\b|\bhelp\b/.test(lower)
  const effectiveNegativeOverride = hasNegativeOverride && !asksForHelpQuick
  if (hasNegativeOverride) {
    // Supportive negative replies (calm, validating)
    const negReplies = [
      "I’m really sorry today felt this heavy. Want to tell me what happened?",
      "That sounds rough… what made your day feel like the worst?",
      "I’m here — talk to me. What went wrong today?",
      "Bad days happen, but you don’t have to hold it alone. Tell me."
    ]
    if (effectiveNegativeOverride) return negReplies[Math.abs(userMessage.length) % negReplies.length]
  }

  // Quick reply for simple conversational checks
  if (containsAny(howAreYouPatterns)) {
    return "I’m good! How about you?"
  }

  // If the message contains a specific/emergent emotion keyword used by the deeper flows,
  // let the existing detailed handlers below run so their richer responses stay intact.
  const importantEmotionKeywords = ['sad', 'down', 'anxious', 'anxiety', 'angry', 'happy', 'hopeless', 'lonely', 'overthinking', 'confused', 'confusion', 'stress', 'stressed', 'energy', 'this energy', 'made my day']
  const hasImportant = containsAny(importantEmotionKeywords)

  // Help requests: If user asks for help in a short message and there is no stronger emotion keyword,
  // present Calm Mode grounding techniques and choices.
  const helpPatterns = ['can you help', 'can you help me', 'help me', "i need help", 'please help']
  if (containsAny(helpPatterns) && !hasImportant) {
    const breathing = "Let's try a grounding breathing exercise: inhale for 4, hold for 4, exhale for 4. Repeat this 3 times."
    const grounding = "If you're feeling overwhelmed, try the 5-4-3-2-1 grounding: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste."
    const quick = "You can also place a hand on your belly and count 3 slow breaths, focusing on the exhale."
    const offer = "Would you like comfort, grounding exercises, or step-by-step problem help right now?"
    return `${breathing} ${grounding} ${quick} ${offer}`
  }

  if (!hasImportant) {
    if (containsAny(angerTokens)) {
      const replies = [
        'Hey… I feel that. Want to talk about what made you upset?',
        'I can sense your frustration. Do you want to share what happened?'
      ]
      return replies[Math.floor(Math.random() * replies.length)]
    }

    if (containsAny(negativeTokens)) {
      const replies = [
        'I’m really sorry you’re having a rough day… I’m here for you.',
        'That sounds tough. I’m here to listen — would you like to share more?'
      ]
      return replies[Math.floor(Math.random() * replies.length)]
    }

    // Advanced Negative Override: if a positive word appears but it's near a negative
    // modifier (e.g., "not good", "okay but not good", "it's fine, but actually not"),
    // treat the message as negative.
    if (hasNearbyNegativeModifier(userMessage)) {
      const negReplies = [
        "Sounds like today wasn't the best — what made it 'not great'?",
        'I hear you — it wasn\'t a good day. What happened?',
        "It's okay to have days that aren't great. What happened?",
        "So it\'s not great… what part felt off today?"
      ]
      return negReplies[Math.abs(userMessage.length) % negReplies.length]
    }

    if (containsAny(positiveTokens)) {
      const replies = [
        'Happy to hear that! I’m glad your day is going great!',
        'That’s awesome — so happy for you! Tell me more!'
      ]
      return replies[Math.floor(Math.random() * replies.length)]
    }
  }

  // Detection lists (expanded per user's spec)
  // Put more specific/urgent checks first (hopelessness before general sadness)
  const hopelessness = ['hopeless','nothing matters','i can\'t do this anymore','pointless','i want to give up','life feels empty','no reason','lost everything','dark thoughts','i\'m done','everything is falling apart','no hope','have no hope','i have no hope']
  const loneliness = ['lonely','alone','nobody cares','nobody understands me','nobody is there','nobody is there for me','i feel left out','wish i had someone','isolated','empty inside','unseen','i feel disconnected']
  const sadness = ['i feel down','sad','low','empty','not okay','not feeling good','tired emotionally','hurt','drained','heavy','broken','low energy','want to cry','feeling numb']

  // Deep Real-Talk triggers: intense, raw, unfiltered language that needs a grounded, real response
  const deepRealTalk = [
    'i cried', 'cried', 'my mind is fucked', 'mind is fucked', 'everything is hurting', 'i feel guilty', 'guilt',
    'family abused me', 'abused by family', 'family pressure', 'my chest is heavy', 'chest is heavy', 'i messed up', 'i messed up so bad',
    'backlash', 'i\'m insecure', 'i am insecure', 'i feel useless', "i don't have himmat", 'dont have himmat', "i'm not ready", 'not ready',
    'i\'m scared', 'i am scared', 'nobody understands me', 'nobody understands', 'betrayed', 'they betrayed me', 'betrayal', 'i cried all night'
  ]

  const stress = ['stressed','stress','pressure','too much work','too much to handle','overloaded','my mind is tight','i can\'t handle','so much going on','tension','panic building','i\'m overwhelmed','overwhelmed','everything is too much','so overwhelmed']
  const anxiety = ['anxious','anxiety','worried','scared','my chest feels heavy','nervous','overthinking the worst','spiraling','heart racing','i feel unsafe','fearful','on edge','paranoid feelings','panic']
  // avoid overly-short tokens like 'mad' which false-match words like 'made'
  const anger = ['angry','pissed off','frustrated','irritated','annoyed','i am mad','so mad','feeling mad','fed up','losing my patience','rage','i can\'t stand this','snapped','lost my temper','lost temper','triggered','this triggered me']
  const confusion = ['confused','lost','don\'t know what to do','no clarity','i\'m stuck','unsure','i can\'t figure this out','mind fog','blank','uncertain','don\'t understand','do not understand','not making sense']
  const overthinking = ['overthinking','my mind won\'t stop','too many thoughts','thinking too much','stuck in my head','looping thoughts','spiraling','can\'t shut my brain','thoughts racing','can\'t stop thinking','cant stop thinking']
  const happiness = ['happy','excited','proud of myself','good day','i feel amazing','this made my day','i\'m smiling','positive energy','feeling light','joyful','this energy','made my day']
  const motivation = ['motivated','inspired','ready to work','i want to improve','let\'s do this','i\'m pumped','productive mood','i want to change','focused','energetic']

  // Calm Mode: acute signals where a grounding breathing script is appropriate
  const calmModeTriggers = [
    'panic attack', 'panic attacks', 'can\'t breathe', 'cant breathe', 'hyperventilat', 'hyperventilating', 'racing thoughts', 'heart racing', 'faint', 'dizzy', 'lightheaded', 'i am hyperventilating'
  ]

  // Financial / money related stress — check early so it wins over broader categories like stress/confusion/fun
  // (financial keyword lists are used later via `financialTriggers`/`financialHelpers` in label helper)

  // Fun / Friend Mode triggers (keywords, emoji, storytelling cues, tone markers)
  const funKeywords = [
    'lol','lmao','lmfao','😂','🤣','😆','broooo','bro','bruh','dude wtf','wtf just happened',
    'you won\'t believe this','guess what happened','you\'re not ready','no way this happened','today was crazy','omg','yo listen',
    'story time','rant time','spill tea','the tea','tea','tell me why','you\'re gonna laugh','this is insane','mad funny','funniest thing',
    'this is wild','wait for it','not even joking','this is so stupid lmao','im dying','i\'m crying','this made my day','you won\'t believe',
    'funny thing happened','craziest thing','i need to tell you something wild','you\'re gonna love this','i did something stupid lol',
    'i messed up so bad','chaos alert','chaos mode','this is too much','pls the way'
  ]

  const funStartTokens = ['bro','wait','listen','yo','omg','story time','rant time','spill tea']

  const funToneHeuristics = (text: string) => {
    // multiple exclamation marks or quick storytelling cues
    if (/!{2,}/.test(text)) return true
    // starts with a fun token
    const starts = text.trim().split(/\s+/)[0] || ''
    if (funStartTokens.includes(starts)) return true
    // presence of short 'you won't believe' style phrases
    if (text.includes("you won't believe") || text.includes('guess what') || text.includes('you won\'t believe this')) return true
    // emoji presence
    if (/[😂🤣😆😅]/.test(text)) return true
    return false
  }

  const matchAny = (list: string[]) => list.some(t => lower.includes(t))

  // Urgent/specific checks first
  if (matchAny(hopelessness)) {
    // Support → Validation → Clarification → Action (hopelessness should feel held first)
    const validation = "I’m here with you — that sounds deeply painful."
    const clarify = "Can you tell me which part feels the heaviest right now?"
    const action = "If you're up for it, let's pick one very small step together — what feels doable in the next 5 minutes?"
    return `${validation} ${clarify} ${action}`
  }
  if (matchAny(loneliness)) {
    // Connection & Support Flow
    const validation = "I’m right here, really — You deserve connection and warmth."
    const reflect = "Anyone would feel this way in your shoes; it's understandable."
    const invite = "What made you feel alone today? If you'd like, share one small memory and we can reflect on it together."
    return `${validation} ${reflect} ${invite}`
  }

  // DEEP REAL-TALK MODE — grounded, honest, calm, strong (not soft/clinical)
  if (matchAny(deepRealTalk)) {
    // betrayal-specific phrasing
    if (lower.includes('betray') || lower.includes('they betrayed') || lower.includes('betrayal')) {
      const b1 = "It hurts — betrayal cuts deep. Now you’ve seen their real face; that clarity is painful but useful."
      const b2 = "Your heart was given trust and it was broken. That pain is valid, and it doesn't make you weak."
      const b3 = "You didn’t deserve disloyalty. Let’s talk about what safety looks like for you moving forward."
      return `${b1} ${b2} ${b3}`
    }

    // 'make my heart hard' style requests handled as strength-coaching
    if (lower.includes('make my heart hard') || lower.includes('make my heart colder') || lower.includes('make my heart hard')) {
      const s1 = "You don’t need a hard heart — you need a steady one. Strength isn’t becoming cold."
      const s2 = "I’ll help you build emotional resilience, not walls. Let’s find steady practices that protect you without turning you off."
      const s3 = "Tell me where you want to start — boundaries, routines, or small trust tests?"
      return `${s1} ${s2} ${s3}`
    }

    // General deep-talk replies
    const t1 = "You went through a lot, and it makes sense your chest feels heavy. Anyone in your place would feel the same."
    const t2 = "This situation broke you down, but it doesn’t define you. You’re allowed to take time. You’re not a machine."
    const t3 = "You’re carrying guilt that isn’t fully yours. Let’s slow down — tell me which part is hurting you the most right now."
    return `${t1} ${t2} ${t3}`
  }
  // ------------------ Financial Stress Mode ------------------
  // Detect and respond specifically to money / debt / income problems.
  const financialTriggers = [
    'money problem', 'broke', 'financial issue', 'money stress', 'debt', 'no money', 'salary issue', 'struggling financially',
    'worried about money', "can't afford", 'cant afford', 'financial pressure', 'expenses too much', 'not enough money',
    "i'm scared about money","im scared about money","lost my job","jobless","can't pay","cant pay","can't pay rent","cant pay rent","rent stress"
  ]
  if (matchAny(financialTriggers)) {
  // Calm, supportive, practical tone. No emotional-fallback generic lines.
  const opening = "Money stress is really heavy to deal with — you’re not alone in this. What part is stressing you the most?"
  const empath = "I hear you… financial pressure can drain your mind fast. Let’s break it down together."
  const offer = "It’s okay to feel overwhelmed by money. Want me to help you sort your thoughts?"
  const invite = "I understand… finances can feel scary sometimes. Tell me what’s going on, we’ll take it slowly."
  const optional = "If you'd like, I can offer techniques to stay calm during money stress or help you organize your situation so it feels less overwhelming. I won't give investment, tax, loan, or legal advice — only emotional grounding and practical clarity."
  return `${opening} ${empath} ${offer} ${invite} ${optional}`
  }
  // (Career block was moved earlier into the careerMap to run before generic support.)
  // Calm Mode takes priority for acute panic / breathing crises but is scoped narrowly
  if (matchAny(calmModeTriggers)) {
    // CALM MODE: Grounding → Safety → Slowing → Expression
    const grounding = "Let's breathe together. In… 4 seconds. Hold… Out… 4 seconds."
    const safety = "I’m right here with you. You’re safe."
    const invite = "Tell me what’s weighing on you — what’s the loudest thought right now?"
    const followUps = "Do you want comfort or clarity first? Or would you like help slowing your thoughts right now?"
    return `${grounding} ${safety} ${invite} ${followUps}`
  }
  if (matchAny(sadness)) {
    // Support → Validation → Clarification Flow
    const validation = "I’m right here with you — I hear you, that must feel heavy."
    const clarify = "What part of this feels the hardest right now?"
    const guide = "If you want, we can try a gentle step: name one small thing that might feel a bit better in the next hour."
    return `${validation} ${clarify} ${guide}`
  }
  if (matchAny(stress)) {
    // Support → Validation → Clarify → Gentle Guide (Stress flow must begin with grounding)
    const validation = "I hear you — it sounds like things are really overwhelming right now."
    const grounding = "Take a slow breath with me."
    const clarify = "Which part is hitting you the hardest?"
    const guide = "We can break it down into one small next step together — what feels most urgent to address first?"
    return `${validation} ${grounding} ${clarify} ${guide}`
  }
  if (matchAny(anxiety)) {
    // Emotional Unpacking Flow for anxiety
    const validation = "You're safe here — I’m with you."
    const slow = "Let's slow things down together: take one steady breath."
    const clarify = "What's the first thought that comes to mind when you notice this feeling?"
    const unpack = "If you want, we can gently ask what that thought means for you right now."
    return `${validation} ${slow} ${clarify} ${unpack}`
  }
  if (matchAny(anger)) {
    // Emotional Unpacking Flow for anger
    const validation = "Your feelings are valid — that sounds intense."
    const clarify = "Can you tell me what triggered it or what moment started this feeling?"
    const unpack = "When you're ready, what did that moment mean for you?" 
    return `${validation} ${clarify} ${unpack}`
  }
  if (matchAny(confusion)) {
    // Validation → Reflection → Action Flow for confusion
    const reassurance = "It's okay to not have clarity right now — that happens when we're growing."
    const reflect = "You've been feeling uncertain; that's a useful sign to explore."
    const action = "What’s one small part we can explore together to bring a bit more clarity?"
    return `${reassurance} ${reflect} ${action}`
  }
  if (matchAny(overthinking)) {
    // Thought Loop Break Flow
    const pause = "Let's pause for a second — I hear your mind running fast."
    const identify = "What thought is repeating the most right now?"
    const redirect = "Would you like help untangling that single thought into smaller pieces?"
    return `${pause} ${identify} ${redirect}`
  }
  if (matchAny(happiness)) {
    // Celebrate → Highlight → Reinforce Flow
    const celebrate = "This energy feels amazing — I'm so happy for you!"
    const highlight = "You pushed through or made a choice that mattered; that's the key success."
    const reinforce = "Want to save this success in your journal or build on it with a small next step?"
    return `${celebrate} ${highlight} ${reinforce}`
  }
  if (matchAny(motivation)) {
    // MOTIVATION ENGINE: Validation → Confidence → Small Step → Gentle Push
    const validation = "Look at you — still trying, still learning, still fighting through. I’m proud of your effort, even on tough days."
    const confidence = "You don’t need perfection, just one small step."
    const smallStep = "What’s one small win we can aim for today?"
    const followUps = "What tiny step can we start with? Want me to break this goal into smaller pieces? What kind of day do you want to create today?"
    return `${validation} ${confidence} ${smallStep} ${followUps}`
  }


  // --- Fun / Friend direct mappings (76-87) ---
  const funMap: Array<{triggers: string[], reply: string}> = [
    { triggers: ['i am bored', "i'm bored", 'im bored', 'bored'], reply: "Let’s fix that! Want a game, a joke, or a challenge?" },
    { triggers: ['tell me something funny', 'tell me a joke', 'something funny'], reply: "Okay—why don’t skeletons fight? They don’t have guts 😌" },
    { triggers: ['give me a compliment', 'compliment me', 'give compliment'], reply: "Easy — you’re effortlessly cool and you don’t even try." },
    { triggers: ['i need motivation', 'need motivation', 'give me motivation'], reply: "You’ve survived every bad day so far. You’re unstoppable." },
    { triggers: ['talk cute', 'talk cute please', 'talk cute now'], reply: "Hehe, okay… come here you little star." },
    { triggers: ["let's vibe", 'lets vibe', 'let us vibe', 'lets vibe please', 'let\'s vibe'], reply: "Say less — what’s the vibe today?" },
    { triggers: ['sing something', 'sing for me', 'sing'], reply: "🎶 laa la laa — okay your turn 😄" },
    { triggers: ['roast me', 'give me a roast', 'roast'], reply: "Sure… but gently: You have “I’ll do it tomorrow” energy." },
    { triggers: ['hype me up', 'hype me', 'get me hyped'], reply: "YOU are a whole vibe. A legend. An icon. A masterpiece." },
    { triggers: ['tell me something random', 'something random', 'random fact'], reply: "Your brain has 86 billion neurons—mine has unlimited attention for you." },
    { triggers: ['give me a challenge', 'challenge me', 'give challenge'], reply: "Alright — name 3 things you’re grateful for today." },
    { triggers: ['make me smile', 'make me laugh', 'make me happy'], reply: "Easy — you exist, and that’s already a reason to smile." }
  ]

  for (const entry of funMap) {
    for (const t of entry.triggers) {
      const pattern = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i')
      if (pattern.test(trimmed)) return entry.reply
    }
  }

  // Fun / Friend Mode (playful, storytelling, sarcasm) — after happiness/motivation checks
  const isFun = matchAny(funKeywords) || funToneHeuristics(lower)
  if (isFun) {
    // FUN Mode Response Style (no emojis per spec)
    const templates = [
      `Wait… you seriously did that? Okay hold on — I need the full story. Start from the beginning, don’t leave anything out.`,
      `No WAY — start from the top.`,
      `STOP — this is already iconic. Tell me everything from the start.`,
      `Brooo I’m invested — continue.`,
      `Wait— this sounds chaotic already. I’m screaming, tell me everything.`
    ]
    const followUps = [`And THEN what happened??`, `What was your reaction??`, `What did THEY say?`, `How bad was it on a scale of 1–10?`, `Do you regret it or are you proud?`]
    const reply = templates[Math.floor(Math.random() * templates.length)]
    const follow = followUps[Math.floor(Math.random() * followUps.length)]
    return `${reply} ${follow}`
  }

  // Quick clarify for common misspellings of 'confused'
  const unclearWords = ['confued', 'connfused', 'confusd', 'confuseed', 'confusde', 'confud', 'confus']
  if (unclearWords.some(w => lower.includes(w))) {
    return "Did you mean 'confused'? It's okay to feel lost — would you like to try describing one part that feels unclear?"
  }

  // ------------------ Techniques & Question Modes (run after explicit maps) ------------------
  // Techniques Mode (explicit technique requests)
  const techniquesTriggers = [
    'give me techniques', 'provide techniques', 'help me calm down', 'give me steps', 'methods', 'advice', 'how do i do this', 'help me focus', 'suggest something', 'tips', 'strategies', 'exercises', 'solutions', 'give me techniques to', 'provide techniques to', 'give me techniques for'
  ]
  const asksForTechniques = techniquesTriggers.some(t => lower.includes(t)) || /give me (techniques|steps|methods|tips|strategies|exercises)/.test(lower) || /provide (techniques|steps|methods|tips|strategies|exercises)/.test(lower)

  const techniquesLibrary: Record<string, string[]> = {
    calm: ['4-7-8 breathing: inhale 4s, hold 7s, exhale 8s', 'Grounding 5-4-3-2-1: senses grounding', 'Ice trick: hold ice to focus body', 'Thought naming: say "This is anxiety, not danger"'],
    stress: ['Brain dump (2 minutes): write everything down', 'Worry box: schedule a time to worry later', 'Control split: list what you can/can’t control'],
    motivation: ['Micro-win method: pick a tiny task', '5-minute start trick: commit 5 minutes only', '1% rule: improve by 1% each day'],
    anger: ['Box breathing: 4-4-4-4 breaths', '10-second pause before replying', 'Stretch or movement release'],
    focus: ['Pomodoro 25/5', 'Noise blocking (brown noise or headphones)', '3-task rule: pick top 3 tasks'],
    sleep: ['10-3-2-1 rule: wind down routine', 'Reverse counting to relax'],
    selflove: ['Mirror affirmation', 'Talk to yourself like a friend', 'List 3 strengths']
  }

  const buildTechniquesResponse = (categoryHints?: string[]): string => {
    // choose category based on hints or default to calm/stress/focus
    const cats = categoryHints && categoryHints.length ? categoryHints : ['calm','stress','focus']
    const chosen: string[] = []
    for (const c of cats) {
      const list = techniquesLibrary[c]
      if (!list) continue
      for (const item of list) {
        if (chosen.length >= 7) break
        if (!chosen.includes(item)) chosen.push(item)
      }
      if (chosen.length >= 3) break
    }
    // Ensure 3-7 items
    if (chosen.length < 3) {
      for (const l of Object.values(techniquesLibrary)) {
        for (const it of l) {
          if (chosen.length >= 3) break
          if (!chosen.includes(it)) chosen.push(it)
        }
        if (chosen.length >= 3) break
      }
    }
    const header = "Sure! Here are some techniques you can try:" // per ALWAYS-ANSWER phrasing
    return `${header}\n- ${chosen.join('\n- ')}`
  }

  if (asksForTechniques) {
    // try to infer category from words
    const cats: string[] = []
    if (/\b(anxiety|anxious|calm|panic|panic attack)\b/.test(lower)) cats.push('calm')
    if (/\b(stress|overwhelm|overthinking)\b/.test(lower)) cats.push('stress')
    if (/\b(focus|concentrat|focus|distract)\b/.test(lower)) cats.push('focus')
    if (/\b(motivat|inspire|productive)\b/.test(lower)) cats.push('motivation')
    if (/\b(sleep|insomnia|tired)\b/.test(lower)) cats.push('sleep')
    if (/\b(anger|angry|furious)\b/.test(lower)) cats.push('anger')
    if (/\b(self love|self-love|selflove|affirm)\b/.test(lower)) cats.push('selflove')
    return buildTechniquesResponse(cats)
  }

  // Always-Answer-Questions Mode: detect questions or explicit requests for advice/info
  const questionTokens = ['how', 'what', 'why', 'when', 'where', 'who', 'should', 'could', 'would', 'can', 'give me', 'provide', 'suggest', 'explain', 'steps', 'technique', 'techniques', 'advice', 'help', 'tips', 'methods', 'how do i']
  const isQuestion = /\?$/.test(userMessage.trim()) || questionTokens.some(t => lower.includes(t) && lower.indexOf(t) <= 40)
  if (isQuestion) {
    // Provide an informational, procedural answer where possible.
    const howStart = ["Sure! Here are some techniques you can try:", "Absolutely, here's how you can do that:", "Let me help — here’s the method:"]
    const pick = howStart[Math.abs(userMessage.length) % howStart.length]
    // Offer a short, general set of steps for common queries
    const general = ['Clarify the goal', 'Break it into 3 small steps', 'Pick the smallest next action and try it for 5 minutes']
    return `${pick}\n- ${general.join('\n- ')}`
  }

  // Fallback gentle response
  if (userMessage.trim().length > 0) {
    return `I'm here for you, even if I don't fully understand. If you'd like, share one small detail and we'll take it from there.`
  }

  return ''
}

export default detectEmotionResponse

// Exported helper: detect the simple emotion label for logging/analytics
export const detectEmotionLabel = (userMessage: string): string | null => {
  const lower = userMessage.toLowerCase()

  const hopelessness = ['hopeless','nothing matters','i can\'t do this anymore','pointless','i want to give up','life feels empty','no reason','lost everything','dark thoughts','i\'m done','everything is falling apart','no hope','have no hope','i have no hope']
  const loneliness = ['lonely','alone','nobody cares','nobody understands me','nobody is there','nobody is there for me','i feel left out','wish i had someone','isolated','empty inside','unseen','i feel disconnected']
  const sadness = ['i feel down','sad','low','empty','not okay','not feeling good','tired emotionally','hurt','drained','heavy','broken','low energy','want to cry','feeling numb']

  const calmModeTriggers = [
    'panic attack', 'panic attacks', 'can\'t breathe', 'cant breathe', 'hyperventilat', 'hyperventilating', 'racing thoughts', 'heart racing', 'faint', 'dizzy', 'lightheaded', 'i am hyperventilating'
  ]

  const stress = ['stressed','stress','pressure','too much work','too much to handle','overloaded','my mind is tight','i can\'t handle','so much going on','tension','panic building','i\'m overwhelmed','overwhelmed','everything is too much','so overwhelmed']
  const anxiety = ['anxious','anxiety','worried','scared','my chest feels heavy','nervous','overthinking the worst','spiraling','heart racing','i feel unsafe','fearful','on edge','paranoid feelings','panic']
  const anger = ['angry','pissed off','frustrated','irritated','annoyed','i am mad','so mad','feeling mad','fed up','losing my patience','rage','i can\'t stand this','snapped','lost my temper','lost temper','triggered','this triggered me']
  const confusion = ['confused','lost','don\'t know what to do','no clarity','i\'m stuck','unsure','i can\'t figure this out','mind fog','blank','uncertain','don\'t understand','do not understand','not making sense']
  const overthinking = ['overthinking','my mind won\'t stop','too many thoughts','thinking too much','stuck in my head','looping thoughts','spiraling','can\'t shut my brain','thoughts racing','can\'t stop thinking','cant stop thinking']
  const happiness = ['happy','excited','proud of myself','good day','i feel amazing','this made my day','i\'m smiling','positive energy','feeling light','joyful','this energy','made my day']
  const motivation = ['motivated','inspired','ready to work','i want to improve','let\'s do this','i\'m pumped','productive mood','i want to change','focused','energetic']

  const matchAny = (list: string[]) => list.some(t => lower.includes(t))

  // Advanced Negative Override for label detection: if positive appears near negative
  // modifier, treat as negative/sad for analytics.
  try {
    if (hasNearbyNegativeModifier(userMessage)) return 'sad'
  } catch (e) {
    // ignore helper errors and continue
  }

  if (matchAny(hopelessness)) return 'hopeless'
  if (matchAny(loneliness)) return 'lonely'
  // Fun label detection
  const funKeywords = [
    'lol','lmao','lmfao','😂','🤣','😆','broooo','bro','bruh','dude wtf','wtf just happened',
    'you won\'t believe this','guess what happened','you\'re not ready','no way this happened','today was crazy','omg','yo listen',
    'story time','rant time','spill tea','the tea','tea','tell me why','you\'re gonna laugh','this is insane','mad funny','funniest thing',
    'this is wild','wait for it','not even joking','this is so stupid lmao','im dying','i\'m crying','this made my day','you won\'t believe',
    'funny thing happened','craziest thing','i need to tell you something wild','you\'re gonna love this','i did something stupid lol',
    'i messed up so bad','chaos alert','chaos mode','this is too much','pls the way'
  ]

  const funStartTokens = ['bro','wait','listen','yo','omg','story time','rant time','spill tea']

  const funToneHeuristics = (text: string) => {
    if (/!{2,}/.test(text)) return true
    const starts = text.trim().split(/\s+/)[0] || ''
    if (funStartTokens.includes(starts)) return true
    if (text.includes("you won't believe") || text.includes('guess what') || text.includes('you won\'t believe this')) return true
    if (/[😂🤣😆😅]/.test(text)) return true
    return false
  }

  const matchAnyFun = (list: string[]) => list.some(t => lower.includes(t))
  // Financial / money related helpers (used for early label detection)
  // Career / job related helpers (check before financial so job-loss maps to career)
  const careerHelpers = [
    'job stress','career stress','pressure at work','burnout','burned out','burnt out','overworked','work exhausting','work exhausting',
    'jobless','lost my job','i need a job','interview fear',"don't know what to do in life",'future confusion','career confusion','study pressure','family career pressure',
    "i feel stuck","i'm not progressing",'everyone else is moving ahead',"i'm scared about my future","i feel behind",
    'office stress','i hate my job','career anxiety','work stress'
  ]
  const breakupHelpers = [
    'breakup','heartbreak','heart broken','she left me','he left me','they broke up with me','i miss them','i still love them','i can\'t move on','she blocked me','he blocked me','lost them'
  ]
  const familyHelpers = [
    'family issues','parents fighting','parents are fighting','my parents are fighting','family pressure','home stress','home is stressful','my mom yelled','my dad yelled','strict parents','problem at home','toxic family'
  ]
  const friendshipHelpers = [
    'friend hurt me','my friend ignored me','friends left me','best friend problem','trust issue','fight with friend','they don\'t care'
  ]
  const lonelinessDeepHelpers = [
    'i feel alone','i\'m lonely','i have no one','i feel empty inside','left out','i have no one to talk to','feeling left out'
  ]
  const selfWorthHelpers = [
    'i\'m not enough','i feel useless','i hate myself','i\'m a failure','i\'m not good enough','why am i like this','i feel worthless'
  ]
  const studyHelpers = [
    'study stress','exam stress','i can\'t study','too much syllabus','i\'m falling behind','school pressure','college pressure','parents want marks','too much to study'
  ]
  const socialAnxietyHelpers = [
    'social anxiety','i\'m scared to talk to people','i get nervous around people','i overthink social situations','i can\'t make friends','nervous around people'
  ]
  // income-specific triggers -> treat as financial even if 'lost job' is also present
  const incomeHelpers = ['no income', "have no income", "i have no income", 'no money', "don't have income", "dont have income", 'no earnings', 'no paycheck', 'no pay']
  if (matchAny(calmModeTriggers)) return 'calm'
  // Financial helpers (omit job-loss so career label wins for that case)
  const financialHelpers = [
    'money problem','broke','financial issue','money stress','debt','no money','salary issue','struggling financially',
    'worried about money',"can't afford",'cant afford','financial pressure','expenses too much','not enough money',
    "i'm scared about money","im scared about money","can't pay","can't pay rent" ,'cant pay','cant pay rent','rent stress',
    // additional critical keywords per recent spec
    'financial','finance','financial problem','financial issue','money issue','money pressure','income issue','family financial problem','parents struggling financially','money is tight','financial stress',
    // plain/common tokens that should match simple sentences
    'expenses','bills',"don't have money","dont have money","don't have any money","dont have any money"
  ]
  // If there are explicit income markers, prefer financial label
  if (matchAny(incomeHelpers)) return 'financial'
  // Financial check (after incomeHelpers) — career/job-loss cases should map to career
  // interpersonal & identity checks (prefer these before broader sadness/anxiety)
  if (matchAny(breakupHelpers)) return 'breakup'
  if (matchAny(familyHelpers)) return 'family'
  if (matchAny(friendshipHelpers)) return 'friendship'
  if (matchAny(lonelinessDeepHelpers)) return 'lonely'
  if (matchAny(selfWorthHelpers)) return 'selfworth'
  if (matchAny(studyHelpers)) return 'study'
  if (matchAny(socialAnxietyHelpers)) return 'social_anxiety'
  if (matchAny(careerHelpers)) return 'career'
  if (matchAny(financialHelpers)) return 'financial'
  if (matchAny(sadness)) return 'sad'
  if (matchAny(stress)) return 'stress'
  if (matchAny(anxiety)) return 'anxiety'
  if (matchAny(anger)) return 'anger'
  if (matchAny(confusion)) return 'confusion'
  if (matchAny(overthinking)) return 'overthinking'
  if (matchAny(happiness)) return 'happy'
  if (matchAny(motivation)) return 'motivation'
  if (matchAnyFun(funKeywords) || funToneHeuristics(lower)) return 'fun'

  

  return null
}

// New helper: detect all matching labels (returns array) — used for multi-emotion detection
export const detectEmotionLabels = (userMessage: string): string[] => {
  const lower = userMessage.toLowerCase()
  const labels: string[] = []
  const matchAny = (list: string[]) => list.some(t => lower.includes(t))

  // If advanced negative override applies, return only 'sad' so multi-label
  // detection does not include positive labels in these cases.
  try {
    if (hasNearbyNegativeModifier(userMessage)) return ['sad']
  } catch (e) {
    // continue on errors
  }

  const hopelessness = ['hopeless','nothing matters','i can\'t do this anymore','pointless','i want to give up','life feels empty','no reason','lost everything','dark thoughts','i\'m done']
  const loneliness = ['lonely','alone','nobody cares','nobody understands me','nobody is there','i feel left out','isolated','empty inside']
  const sadness = ['i feel down','sad','low','empty','not okay','not feeling good','tired emotionally','hurt']
  const stress = ['stressed','stress','pressure','too much work','too much to handle','overloaded','i can\'t handle','so much going on','tension','i\'m overwhelmed','overwhelmed']
  const anxiety = ['anxious','anxiety','worried','scared','nervous','overthinking the worst','spiraling','heart racing']
  const anger = ['angry','pissed off','frustrated','irritated','annoyed','i am mad','so mad','feeling mad','fed up','rage']
  const confusion = ['confused','lost','don\'t know what to do','no clarity','i\'m stuck','unsure']
  const overthinking = ['overthinking','my mind won\'t stop','too many thoughts','thinking too much','stuck in my head','looping thoughts','thoughts racing','can\'t stop thinking','cant stop thinking']
  const happiness = ['happy','excited','proud of myself','good day','i feel amazing']
  const motivation = ['motivated','inspired','ready to work','i want to improve']

  const financial = ['financial','finance','money','debt','broke','no money','expenses','bills','rent',"can't afford",'cant afford','money stress','financial stress']

  if (matchAny(hopelessness)) labels.push('hopeless')
  if (matchAny(loneliness)) labels.push('lonely')
  if (matchAny(sadness)) labels.push('sad')
  if (matchAny(stress)) labels.push('stress')
  if (matchAny(anxiety)) labels.push('anxiety')
  if (matchAny(anger)) labels.push('anger')
  if (matchAny(confusion)) labels.push('confusion')
  if (matchAny(overthinking)) labels.push('overthinking')
  if (matchAny(happiness)) labels.push('happy')
  if (matchAny(motivation)) labels.push('motivation')

  if (matchAny(financial)) labels.push('financial')

  // interpersonal / specific labels (non-overlapping but useful to include)
  if (lower.includes('breakup') || lower.includes('heartbreak') || lower.includes('she left me') || lower.includes('he left me')) labels.push('breakup')
  if (lower.includes('parents') || lower.includes('family') || lower.includes('home stress') || lower.includes('my mom') || lower.includes('my dad')) labels.push('family')
  if (lower.includes('friend') || lower.includes('best friend') || lower.includes('they ignored me')) labels.push('friendship')

  if (lower.includes('study') || lower.includes('exam') || lower.includes('syllabus')) labels.push('study')
  if (lower.includes('social anxiety') || lower.includes('scared to talk to people') || lower.includes('nervous around people')) labels.push('social_anxiety')
  // lightweight fun detection (avoid referencing function-scoped helpers)
  const funIndicators = ['lol','lmao','lmfao','😂','🤣','😆','bruh','bro','omg','story time','rant time','spill tea','the tea']
  if (funIndicators.some(k => lower.includes(k)) || /!{2,}/.test(lower)) labels.push('fun')

  // dedupe preserving order
  return labels.filter((v, i) => labels.indexOf(v) === i)
}

// Helper that returns both the text reply and detected label for callers that need both
export const detectEmotion = (userMessage: string, opts: {
  trainingData?: TrainingData,
  habits?: any[],
  goals?: any[],
  messages?: Message[],
  personality?: string,
  userName?: string
} = {}) => {
  const text = detectEmotionResponse(userMessage, opts)
  const label = detectEmotionLabel(userMessage)
  const labels = detectEmotionLabels(userMessage)
  // Attempt to find the exact trigger that matched from our explicit maps
  const detectMatchedTrigger = (msg: string): { category?: string, trigger?: string } | null => {
    const trimmed = msg.toLowerCase().trim()
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')

    const tryMaps = (maps: Array<{ name: string, list: Array<{triggers: string[]}> }>) => {
      for (const map of maps) {
        for (const entry of map.list) {
          for (const t of entry.triggers) {
            const pattern = new RegExp(`\\b${escapeRegex(t)}\\b`, 'i')
            if (pattern.test(trimmed)) return { category: map.name, trigger: t }
          }
        }
      }
      return null
    }

    // check explicit maps first
    const mapsToCheck = [
      { name: 'direct', list: DIRECT_MAP },
      { name: 'anger', list: ANGER_MAP },
      { name: 'support', list: SUPPORT_MAP },
      { name: 'negative', list: NEGATIVE_MAP },
      { name: 'positive', list: POSITIVE_MAP },
      { name: 'fun', list: FUN_MAP }
    ]

    const found = tryMaps(mapsToCheck)
    if (found) return found

    // fallback: scan for deeper keyword lists (reuse label heuristics)
    const lists: Array<{ name: string, items: string[] }> = [
      { name: 'hopeless', items: ['hopeless','nothing matters','i can\'t do this anymore','pointless','i want to give up','life feels empty','no reason','lost everything','dark thoughts','i\'m done'] },
      { name: 'lonely', items: ['lonely','alone','nobody cares','nobody understands me','isolated','empty inside'] },
      { name: 'sad', items: ['i feel down','sad','low','empty','not okay','tired emotionally','hurt'] },
      { name: 'stress', items: ['stressed','stress','pressure','too much work','overloaded','i\'m overwhelmed'] },
      { name: 'anxiety', items: ['anxious','anxiety','worried','scared','nervous','panic'] },
      { name: 'anger', items: ['angry','pissed off','frustrated','irritated','annoyed'] },
      { name: 'confusion', items: ['confused','lost','don\'t know what to do','no clarity','unsure','mind fog'] },
      { name: 'overthinking', items: ['overthinking','my mind won\'t stop','too many thoughts','thinking too much','looping thoughts'] },
      { name: 'happy', items: ['happy','excited','proud of myself','good day','i feel amazing'] },
      { name: 'motivation', items: ['motivated','inspired','ready to work','i want to improve','let\'s do this'] },
      { name: 'calm', items: ['panic attack','can\'t breathe','cant breathe','racing thoughts','heart racing'] },
      { name: 'financial', items: ['money problem','broke','financial issue','money stress','debt','no money','salary issue','struggling financially','worried about money','can\'t afford','cant afford','financial pressure','expenses too much','not enough money','lost my job','jobless','can\'t pay','cant pay','rent stress'] }
    ]

    for (const l of lists) {
      for (const it of l.items) {
        if (trimmed.includes(it)) return { category: l.name, trigger: it }
      }
    }

    return null
  }

  const matched = detectMatchedTrigger(userMessage)
  return { text, label, labels, matched }
}

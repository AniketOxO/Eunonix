import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'

const DeveloperPortal = () => {
  const navigate = useNavigate()
  const { user, developerProfile, isAuthenticated, createDeveloperProfile, generateAPIKey, revokeAPIKey } = useAuthStore()
  const { mood, goals, habits } = useAppStore()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [keyPendingRevoke, setKeyPendingRevoke] = useState<string | null>(null)
  const documentationRef = useRef<HTMLDivElement | null>(null)
  const codeRef = useRef<HTMLDivElement | null>(null)
  const playgroundRef = useRef<HTMLDivElement | null>(null)

  const [activeDocSection, setActiveDocSection] = useState<'overview' | 'auth' | 'webhooks' | 'plugins'>('overview')
  const [activeCodeLanguage, setActiveCodeLanguage] = useState<'typescript' | 'python' | 'curl'>('typescript')
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<'currentEmotion' | 'habitMomentum' | 'goalProgress'>('currentEmotion')
  const [playgroundStatus, setPlaygroundStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [playgroundResponse, setPlaygroundResponse] = useState<Record<string, unknown> | null>(null)

  const docSections = useMemo(() => ({
    overview: {
      title: 'API Overview',
      description: 'Eunonix Emotional API lets you surface real-time affective telemetry, behaviour streaks, and goal velocity for custom integrations.',
      bullets: [
        'Latency-optimised streaming channel for mood and energy updates.',
        'REST endpoints expose consolidated emotional state snapshots.',
        'SDKs for TypeScript, Python, and serverless runtimes.'
      ]
    },
    auth: {
      title: 'Authentication & Security',
      description: 'Secure each request with a static API key or short-lived session token issued via OAuth. Rotate keys at any time within this portal.',
      bullets: [
        'Send the key through the `Authorization: Bearer <key>` header.',
        'Keys inherit the same quota as your subscription tier.',
        'Rotate frequently and revoke compromised keys instantly.'
      ]
    },
    webhooks: {
      title: 'Webhooks & Streaming',
      description: 'Subscribe to push notifications instead of polling by registering a webhook endpoint.',
      bullets: [
        'Receive mood and energy deltas in under 3 seconds.',
        'Replay missed events by providing the `since` cursor.',
        'Verify signatures with the shared secret stored alongside your key.'
      ]
    },
    plugins: {
      title: 'Publishing Plugins',
      description: 'Ship your own marketplace plugin by packaging a manifest and onboarding checklist.',
      bullets: [
        'Submit plugin metadata from the Marketplace Publisher form.',
        'Attach telemetry scopes to request the data you require.',
        'Automated review takes <48h and surfaces required fixes.'
      ]
    }
  }), [])

  const codeExamples = useMemo(() => ({
    typescript: `import { EunonixEmotionalAPI } from '@eunonix/emotional-api'

const client = new EunonixEmotionalAPI({
  apiKey: process.env.EUNONIX_KEY!,
  webhookUrl: 'https://your-app.com/webhook'
})

const emotion = await client.getCurrentEmotion()
console.log('Dominant emotion:', emotion.emotion)
console.log('Energy level:', emotion.energyLevel)
`,
    python: `from eunonix import EunonixEmotionalAPI

client = EunonixEmotionalAPI(
    api_key=os.environ['EUNONIX_KEY'],
    webhook_url='https://your-app.com/webhook'
)

emotion = client.current_emotion()
print('Dominant emotion:', emotion['emotion'])
print('Energy level:', emotion['energyLevel'])
`,
    curl: `curl https://api.eunonix.app/v1/emotion/current \\
  -H "Authorization: Bearer $EUNONIX_KEY" \\
  -H "Content-Type: application/json"`
  }), [])

  const playbookResponseForEndpoint = (endpoint: typeof playgroundEndpoint) => {
    if (endpoint === 'currentEmotion') {
      return {
        emotion: mood.dominantEmotion,
        energyLevel: mood.energyLevel,
        clarity: mood.clarity,
        timestamp: new Date().toISOString()
      }
    }

    if (endpoint === 'habitMomentum') {
      const totalHabits = habits.length
      const activeStreaks = habits.filter((habit) => habit.streak > 0)
      const avgStreak = activeStreaks.length > 0
        ? Math.round(activeStreaks.reduce((sum, habit) => sum + habit.streak, 0) / activeStreaks.length)
        : 0
      return {
        totalHabits,
        activeStreaks: activeStreaks.length,
        averageStreakDays: avgStreak,
        longestStreak: habits.reduce((max, habit) => Math.max(max, habit.longestStreak), 0)
      }
    }

    const goalCount = goals.length
    const inProgress = goals.filter((goal) => goal.progress < 100)
    const completed = goals.filter((goal) => goal.progress >= 100)
    const averageProgress = goalCount > 0
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goalCount)
      : 0

    return {
      totalGoals: goalCount,
      activeGoals: inProgress.length,
      completedGoals: completed.length,
      averageProgress,
      lastUpdated: new Date().toISOString()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-lilac-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-light text-ink-900 mb-4">Sign in required</h2>
          <p className="text-ink-600 mb-8">You need to be signed in to access the Developer Portal</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  const handleCreateProfile = () => {
    createDeveloperProfile()
  }

  const handleGenerateKey = () => {
    const newKey = generateAPIKey()
    setShowNewKey(newKey)
  }

  const fallbackClipboardCopy = (value: string) => {
    if (typeof document === 'undefined') return false
    const temp = document.createElement('textarea')
    temp.value = value
    temp.style.position = 'fixed'
    temp.style.opacity = '0'
    document.body.appendChild(temp)
    temp.focus()
    temp.select()
    const success = document.execCommand('copy')
    document.body.removeChild(temp)
    return success
  }

  const copyToClipboard = async (value: string, setFlag: (value: string | null) => void, identifier: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const success = fallbackClipboardCopy(value)
        if (!success) throw new Error('Clipboard copy unsupported')
      }
      setFlag(identifier)
      window.setTimeout(() => setFlag(null), 2000)
    } catch (error) {
      console.warn('[DeveloperPortal] clipboard copy failed', error)
    }
  }

  const handleCopyKey = (key: string) => {
    copyToClipboard(key, setCopiedKey, key)
  }

  const handleRevokeKey = (key: string) => {
    setKeyPendingRevoke(key)
  }

  const handleConfirmRevoke = () => {
    if (!keyPendingRevoke) return
    revokeAPIKey(keyPendingRevoke)
    setKeyPendingRevoke(null)
  }

  const handleCancelRevoke = () => {
    setKeyPendingRevoke(null)
  }

  const handleCopySnippet = (language: string) => {
    const snippet = codeExamples[language as keyof typeof codeExamples]
    if (!snippet) return
    copyToClipboard(snippet, setCopiedSnippet, language)
  }

  const runPlayground = () => {
    setPlaygroundStatus('loading')
    setPlaygroundResponse(null)

    window.setTimeout(() => {
      const response = playbookResponseForEndpoint(playgroundEndpoint)
      setPlaygroundResponse(response)
      setPlaygroundStatus('success')
    }, 700)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-lilac-50">
      {/* Header */}
      <header className="border-b border-ink-200/20 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="cursor-pointer flex items-center gap-3"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
            >
              <h1 className="text-2xl font-semibold text-ink-800">Eunonix</h1>
              <span className="text-sm text-ink-500 font-light">Developer Portal</span>
            </motion.div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
                  <Button
                    variant="outline"
                    onClick={() => documentationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    Full Documentation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => codeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    Code Examples
                  </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilac-400 to-pink-400 flex items-center justify-center text-white font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-ink-600">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {!developerProfile ? (
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-ink-200/30 p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h1 className="text-4xl font-light text-ink-900 mb-4">
                Welcome to the <span className="text-gradient font-medium">Developer Portal</span>
              </h1>
              <p className="text-lg text-ink-600 mb-8">
                Build on top of Eunonix's Emotional API and publish plugins to our marketplace
              </p>
              <Button onClick={handleCreateProfile} size="lg">
                Create Developer Profile
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <motion.div
                className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-sm text-ink-600 font-medium">Published Plugins</span>
                </div>
                <p className="text-3xl font-semibold text-ink-900">{developerProfile.publishedPlugins.length}</p>
              </motion.div>

              <motion.div
                className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-sm text-ink-600 font-medium">Total Downloads</span>
                </div>
                <p className="text-3xl font-semibold text-ink-900">{developerProfile.totalDownloads.toLocaleString()}</p>
              </motion.div>

              <motion.div
                className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-ink-600 font-medium">Revenue</span>
                </div>
                <p className="text-3xl font-semibold text-ink-900">${developerProfile.revenue.toFixed(2)}</p>
              </motion.div>

              <motion.div
                className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-ink-600 font-medium">API Calls</span>
                </div>
                <p className="text-3xl font-semibold text-ink-900">
                  {developerProfile.apiUsage.calls.toLocaleString()}
                  <span className="text-sm text-ink-500 font-normal">/{developerProfile.apiUsage.limit.toLocaleString()}</span>
                </p>
              </motion.div>
            </div>

            {/* API Keys Section */}
            <motion.div
              className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-ink-900 mb-2">API Keys</h2>
                  <p className="text-ink-600">Manage your Emotional API access keys</p>
                </div>
                <Button onClick={handleGenerateKey}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Generate New Key
                </Button>
              </div>

              {showNewKey && (
                <motion.div
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-green-900 mb-1">New API key generated!</p>
                      <p className="text-sm text-green-700 mb-3">Make sure to copy it now. You won't be able to see it again.</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-mono text-ink-900 border border-green-300">
                          {showNewKey}
                        </code>
                        <Button size="sm" onClick={() => {
                          handleCopyKey(showNewKey)
                          setShowNewKey(null)
                        }}>
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {user?.apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <p className="text-ink-600">No API keys yet. Generate one to get started.</p>
                  </div>
                ) : (
                  user?.apiKeys.map((key, index) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-ink-200/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400/20 to-blue-400/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">API Key #{index + 1}</p>
                          <code className="text-sm text-ink-600 font-mono">
                            {key.substring(0, 20)}...{key.substring(key.length - 4)}
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyKey(key)}
                        >
                          {copiedKey === key ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeKey(key)}
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Documentation Section */}
            <motion.div
              className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              ref={documentationRef}
            >
              <h2 className="text-2xl font-semibold text-ink-900 mb-6">Quick Start</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-ink-800 mb-3">1. Install the SDK</h3>
                  <div className="bg-ink-900 rounded-xl p-4 font-mono text-sm text-green-400">
                    npm install @eunonix/emotional-api
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-ink-800 mb-3">2. Initialize the Client</h3>
                  <div className="bg-ink-900 rounded-xl p-4 font-mono text-sm">
                    <pre className="text-green-400">{`import { EunonixEmotionalAPI } from '@eunonix/emotional-api'

const client = new EunonixEmotionalAPI({
  apiKey: 'your_api_key_here',
  webhookUrl: 'https://your-app.com/webhook'
})`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-ink-800 mb-3">3. Access Emotional Data</h3>
                  <div className="bg-ink-900 rounded-xl p-4 font-mono text-sm">
                    <pre className="text-green-400">{`// Get current emotional state
const emotion = await client.getCurrentEmotion()

// Subscribe to real-time updates
client.subscribe((data) => {
  console.log('Emotion changed:', data.emotion)
  console.log('Energy level:', data.energyLevel)
})`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-ink-800 mb-4">4. Explore the Platform</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['overview', 'auth', 'webhooks', 'plugins'] as const).map((section) => (
                      <button
                        key={section}
                        onClick={() => setActiveDocSection(section)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeDocSection === section
                            ? 'bg-gradient-to-r from-ink-600 to-lilac-500 text-white shadow'
                            : 'bg-white/70 text-ink-600 hover:bg-white'
                        }`}
                      >
                        {docSections[section].title}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-ink-200/40 bg-white/80 p-6">
                    <h4 className="text-xl font-semibold text-ink-800 mb-2">{docSections[activeDocSection].title}</h4>
                    <p className="text-sm text-ink-600 mb-4">{docSections[activeDocSection].description}</p>
                    <ul className="space-y-2 text-sm text-ink-600 list-disc list-inside">
                      {docSections[activeDocSection].bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" ref={codeRef}>
                  <div className="rounded-2xl border border-ink-200/40 bg-white/80 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-ink-800">Language Samples</h4>
                      <div className="flex gap-2">
                        {(['typescript', 'python', 'curl'] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setActiveCodeLanguage(lang)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              activeCodeLanguage === lang
                                ? 'bg-ink-900 text-white'
                                : 'bg-white/70 text-ink-600 hover:bg-white'
                            }`}
                          >
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative bg-ink-900 text-green-400 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                      <pre>{codeExamples[activeCodeLanguage]}</pre>
                      <button
                        onClick={() => handleCopySnippet(activeCodeLanguage)}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs bg-white/10 text-white hover:bg-white/20"
                      >
                        {copiedSnippet === activeCodeLanguage ? 'Copied' : 'Copy' }
                      </button>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl border border-ink-200/40 bg-white/80 p-6"
                    ref={playgroundRef}
                  >
                    <h4 className="text-lg font-semibold text-ink-800 mb-4">API Playground</h4>
                    <p className="text-sm text-ink-600 mb-4">Run simulated requests against your current workspace data to understand response shapes.</p>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-ink-400 mb-2">Endpoint</label>
                    <select
                      value={playgroundEndpoint}
                      onChange={(event) => setPlaygroundEndpoint(event.target.value as typeof playgroundEndpoint)}
                      className="w-full mb-4 rounded-xl border border-ink-200/40 bg-white/70 px-4 py-3 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-lilac-400"
                    >
                      <option value="currentEmotion">GET /v1/emotion/current</option>
                      <option value="habitMomentum">GET /v1/habits/momentum</option>
                      <option value="goalProgress">GET /v1/goals/summary</option>
                    </select>
                    <Button onClick={runPlayground} disabled={playgroundStatus === 'loading'} className="w-full mb-4">
                      {playgroundStatus === 'loading' ? 'Requesting…' : 'Run Request'}
                    </Button>
                    <div className="bg-ink-900 text-green-400 rounded-xl p-4 font-mono text-xs min-h-[160px]">
                      {playgroundStatus === 'idle' && <span>// Response will appear here</span>}
                      {playgroundStatus === 'loading' && <span>// Gathering telemetry…</span>}
                      {playgroundStatus === 'success' && (
                        <pre>{JSON.stringify(playgroundResponse, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </main>

        {/* Confirmation modal for API key revocation */}
        <Modal
          isOpen={Boolean(keyPendingRevoke)}
          onClose={handleCancelRevoke}
          title="Revoke API Key"
        >
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                Revoking this key immediately cuts off any integrations using it. This action cannot be undone.
              </p>
            </div>
            {keyPendingRevoke && (
              <div className="p-4 bg-white border border-ink-200/60 rounded-xl">
                <p className="text-xs uppercase text-ink-500 tracking-wide mb-1">Key</p>
                <code className="text-sm font-mono text-ink-800 break-all">
                  {keyPendingRevoke.substring(0, 16)}...{keyPendingRevoke.substring(keyPendingRevoke.length - 4)}
                </code>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="ghost" onClick={handleCancelRevoke}>
                Keep Key Active
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmRevoke}>
                Revoke Key
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  )
}

export default DeveloperPortal

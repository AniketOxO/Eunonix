import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/Button'

const DeveloperPortal = () => {
  const navigate = useNavigate()
  const { user, developerProfile, isAuthenticated, createDeveloperProfile, generateAPIKey, revokeAPIKey } = useAuthStore()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)

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

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleRevokeKey = (key: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      revokeAPIKey(key)
    }
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
              <h1 className="text-2xl font-semibold text-ink-800">LifeOS</h1>
              <span className="text-sm text-ink-500 font-light">Developer Portal</span>
            </motion.div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
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
                Build on top of LifeOS's Emotional API and publish plugins to our marketplace
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
            >
              <h2 className="text-2xl font-semibold text-ink-900 mb-6">Quick Start</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-ink-800 mb-3">1. Install the SDK</h3>
                  <div className="bg-ink-900 rounded-xl p-4 font-mono text-sm text-green-400">
                    npm install @lifeos/emotional-api
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-ink-800 mb-3">2. Initialize the Client</h3>
                  <div className="bg-ink-900 rounded-xl p-4 font-mono text-sm">
                    <pre className="text-green-400">{`import { LifeOSEmotionalAPI } from '@lifeos/emotional-api'

const client = new LifeOSEmotionalAPI({
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

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => window.open('https://docs.lifeos.app', '_blank')}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Full Documentation
                  </Button>
                  <Button variant="outline" onClick={() => window.open('https://github.com/lifeos/examples', '_blank')}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Code Examples
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DeveloperPortal

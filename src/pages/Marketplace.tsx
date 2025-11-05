import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PluginCategory } from '@/types/subscription'
import { useAuthStore } from '@/store/useAuthStore'
import { MoodMelodyCard } from '@/components/plugins/MoodMelodyCard'
import { FocusFlowCard } from '@/components/plugins/FocusFlowCard'
import { BreatheAICard } from '@/components/plugins/BreatheAICard'
import { ToneTunerCard } from '@/components/plugins/ToneTunerCard'
import { EmotionChartsCard } from '@/components/plugins/EmotionChartsCard'
import { AuroraThemePackCard } from '@/components/plugins/AuroraThemePackCard'
import { NotionSyncCard } from '@/components/plugins/NotionSyncCard'
import { PatternPredictorCard } from '@/components/plugins/PatternPredictorCard'

interface MarketplacePlugin {
  id: string
  name: string
  description: string
  developer: string
  category: PluginCategory
  price: number
  rating: number
  downloads: number
  icon: JSX.Element
  verified: boolean
  featured?: boolean
  launchPath?: string
}

const SAMPLE_PLUGINS: MarketplacePlugin[] = [
  {
    id: '1',
    name: 'Mood Melody',
    description: 'Spotify integration that adapts playlists to your emotional state in real-time',
    developer: 'AudioFlow Inc.',
    category: 'integration',
    price: 0,
    rating: 4.8,
    downloads: 12500,
    verified: true,
    featured: true,
    launchPath: '/dashboard?plugin=1',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    )
  },
  {
    id: '2',
    name: 'Focus Flow',
    description: 'Pomodoro timer that pulls your current mental mode from Eunonix',
    developer: 'ProductiveMind',
    category: 'productivity',
    price: 4.99,
    rating: 4.9,
    downloads: 8900,
    verified: true,
    featured: true,
    launchPath: '/dashboard?plugin=2',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: '3',
    name: 'Tone Tuner',
    description: 'Writing assistant that adapts tone and complexity based on your mindset',
    developer: 'WriteWell AI',
    category: 'productivity',
    price: 9.99,
    rating: 4.7,
    downloads: 5600,
    verified: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    id: '4',
    name: 'Emotion Charts Pro',
    description: 'Advanced visualization toolkit for emotional data with custom dashboards',
    developer: 'DataViz Studio',
    category: 'visualization',
    price: 14.99,
    rating: 4.6,
    downloads: 3200,
    verified: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: '5',
    name: 'Breathe AI',
    description: 'Guided breathing exercises that adapt to your stress levels',
    developer: 'CalmTech',
    category: 'wellbeing',
    price: 0,
    rating: 4.9,
    downloads: 15300,
    verified: true,
    featured: true,
    launchPath: '/dashboard?plugin=5',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: '6',
    name: 'Notion Sync',
    description: 'Automatically sync your journal entries and goals to Notion',
    developer: 'SyncWorks',
    category: 'integration',
    price: 7.99,
    rating: 4.5,
    downloads: 4800,
    verified: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    id: '7',
    name: 'Aurora Theme Pack',
    description: 'Beautiful theme collection with emotion-reactive gradients',
    developer: 'DesignForge',
    category: 'theme',
    price: 2.99,
    rating: 4.8,
    downloads: 9200,
    verified: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    )
  },
  {
    id: '8',
    name: 'Pattern Predictor',
    description: 'ML-powered prediction engine for your emotional patterns',
    developer: 'ML Insights',
    category: 'ai-enhancement',
    price: 19.99,
    rating: 4.4,
    downloads: 1800,
    verified: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
]

const Marketplace = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, installPlugin, uninstallPlugin, isPluginInstalled } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [activePluginId, setActivePluginId] = useState<string | null>(null)

  const handlePluginAction = (pluginId: string) => {
    if (!isAuthenticated) {
      navigate('/dashboard')
      return
    }

    const plugin = SAMPLE_PLUGINS.find(p => p.id === pluginId)
    if (!plugin) return

    if (isPluginInstalled(pluginId)) {
      uninstallPlugin(pluginId)
      setToastMessage(`${plugin.name} uninstalled`)
    } else {
      installPlugin(pluginId)
      setToastMessage(`${plugin.name} installed successfully!`)
    }
    
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleLaunchPlugin = (pluginId: string) => {
    if (!isPluginInstalled(pluginId)) {
      return
    }

    // All plugins now navigate directly to dashboard
    navigate('/dashboard')
  }

  const activePlugin = activePluginId ? SAMPLE_PLUGINS.find(p => p.id === activePluginId) : null

  const closePluginModal = () => {
    setActivePluginId(null)
  }

  const categories: Array<{ id: PluginCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Plugins' },
    { id: 'visualization', label: 'Visualizations' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'ai-enhancement', label: 'AI Enhancement' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'wellbeing', label: 'Wellbeing' },
    { id: 'integration', label: 'Integrations' },
    { id: 'theme', label: 'Themes' }
  ]

  const filteredPlugins = SAMPLE_PLUGINS.filter(plugin => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPlugins = SAMPLE_PLUGINS.filter(p => p.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-lilac-50">
      {/* Header */}
      <header className="border-b border-ink-200/20 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="cursor-pointer flex items-center gap-3"
              onClick={() => navigate('/home')}
              whileHover={{ scale: 1.02 }}
            >
              <h1 className="text-2xl font-semibold text-ink-800">Eunonix Marketplace</h1>
            </motion.div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/developer')}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Developer Portal
              </Button>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-xl border border-ink-200/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilac-400 to-pink-400 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="text-sm text-ink-600">{user?.name}</span>
                  </div>
                  <Button onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/dashboard')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-light text-ink-900 mb-4">
            Expand Your <span className="text-gradient font-medium">Emotional Intelligence</span>
          </h1>
          <p className="text-xl text-ink-600 mb-6">
            Plugins that integrate with your emotional data
          </p>

          {/* Developer CTA Banner */}
          <motion.div
            className="max-w-3xl mx-auto mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-ink-800">Build on Eunonix</p>
                  <p className="text-sm text-ink-600">Access our Emotional API and publish your plugins</p>
                </div>
              </div>
              <Button onClick={() => navigate('/developer')} size="sm">
                Developer Portal →
              </Button>
            </div>
          </motion.div>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search plugins by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-ink-200/30 bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lilac-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink-100 hover:bg-ink-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Active Filters */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-ink-600">Active filters:</span>
              {searchQuery && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-lilac-100 text-lilac-800 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:bg-lilac-200 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedCategory !== 'all' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-lilac-100 text-lilac-800 rounded-full text-sm">
                  Category: {categories.find(c => c.id === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory('all')} className="hover:bg-lilac-200 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category Pills */}
          <div className="flex gap-3 mb-12 overflow-x-auto pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-lilac-500 to-ink-600 text-white shadow-md'
                  : 'bg-white/60 text-ink-600 hover:bg-white border border-ink-200/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
          </div>
        </motion.div>

        {/* Featured */}
        {selectedCategory === 'all' && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-medium text-ink-800 mb-6">Featured Plugins</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPlugins.map((plugin, index) => (
                <motion.div
                  key={plugin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-gradient-to-br from-white/80 to-lilac-50/50 backdrop-blur-sm rounded-2xl border-2 border-lilac-200/50 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 flex items-center justify-center text-white flex-shrink-0">
                      {plugin.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-ink-800">{plugin.name}</h3>
                        {plugin.verified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-ink-500">{plugin.developer}</p>
                    </div>
                  </div>
                  <p className="text-sm text-ink-600 mb-4">{plugin.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-ink-700">{plugin.rating}</span>
                    </div>
                    <span className="text-sm text-ink-500">{plugin.downloads.toLocaleString()} installs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-ink-800">
                      {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
                    </span>
                    <div className="flex items-center gap-2">
                      {isPluginInstalled(plugin.id) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLaunchPlugin(plugin.id)}
                        >
                          Open
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => handlePluginAction(plugin.id)}
                        variant={isPluginInstalled(plugin.id) ? 'ghost' : 'primary'}
                      >
                        {isPluginInstalled(plugin.id) ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Installed
                          </>
                        ) : (
                          'Install'
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Plugins */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-ink-800">
              {selectedCategory === 'all' ? 'All Plugins' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            {(searchQuery || selectedCategory !== 'all') && (
              <div className="text-sm text-ink-600">
                {filteredPlugins.length} {filteredPlugins.length === 1 ? 'result' : 'results'} found
              </div>
            )}
          </div>

          {filteredPlugins.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sand-100 to-lilac-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-ink-800 mb-2">No plugins found</h3>
              <p className="text-ink-600 mb-6">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : 'No plugins in this category yet.'
                }
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPlugins.map((plugin, index) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sand-200 to-lilac-200 flex items-center justify-center text-ink-600">
                    {plugin.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-ink-800 text-sm truncate">{plugin.name}</h3>
                      {plugin.verified && (
                        <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-ink-600 mb-3 line-clamp-2">{plugin.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-medium text-ink-700">{plugin.rating}</span>
                  </div>
                  <span className="text-xs text-ink-500">·</span>
                  <span className="text-xs text-ink-500">{(plugin.downloads / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-800">
                    {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPluginInstalled(plugin.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLaunchPlugin(plugin.id)}
                      >
                        Open
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant={isPluginInstalled(plugin.id) ? 'ghost' : 'primary'}
                      onClick={() => handlePluginAction(plugin.id)}
                    >
                      {isPluginInstalled(plugin.id) ? (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Installed
                        </>
                      ) : (
                        'Install'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </motion.div>

        {/* Developer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 bg-gradient-to-r from-ink-700 to-lilac-700 rounded-3xl p-12 text-white text-center shadow-xl"
        >
          <h2 className="text-3xl font-light mb-4 text-white">
            Build Your Own Plugin
          </h2>
          <p className="text-lg text-white mb-6 max-w-2xl mx-auto">
            Join our developer community and create plugins that help people understand themselves better.
          </p>
          <motion.button
            onClick={() => navigate('/developer')}
            className="px-8 py-4 bg-white text-ink-800 rounded-full font-medium hover:bg-white/90 transition-all shadow-lg min-h-[44px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Building
          </motion.button>
        </motion.div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-ink-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">{toastMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plugin Modal */}
      <AnimatePresence>
        {activePlugin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 210, damping: 24 }}
              className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200/30 bg-white/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-ink-900">{activePlugin.name}</h3>
                    {activePlugin.verified && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-ink-500">{activePlugin.developer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                    Open Dashboard
                  </Button>
                  <button
                    onClick={closePluginModal}
                    className="w-9 h-9 rounded-full bg-ink-100 hover:bg-ink-200 flex items-center justify-center"
                    aria-label="Close plugin"
                  >
                    <svg className="w-5 h-5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-white/70 via-white/40 to-lilac-100/40">
                {activePlugin.id === '1' && (
                  <MoodMelodyCard
                    onNavigateToSensory={() => {
                      closePluginModal()
                      navigate('/sensory-expansion')
                    }}
                  />
                )}
                {activePlugin.id === '2' && <FocusFlowCard />}
                {activePlugin.id === '3' && <ToneTunerCard />}
                {activePlugin.id === '4' && <EmotionChartsCard />}
                {activePlugin.id === '5' && <BreatheAICard />}
                {activePlugin.id === '6' && <NotionSyncCard />}
                {activePlugin.id === '7' && (
                  <AuroraThemePackCard
                    onThemeActivated={(themeId) => {
                      closePluginModal()
                      navigate(`/dashboard?plugin=7&theme=${themeId}`)
                    }}
                  />
                )}
                {activePlugin.id === '8' && <PatternPredictorCard />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Marketplace


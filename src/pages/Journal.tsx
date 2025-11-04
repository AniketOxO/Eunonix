import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/Button'
import { EmotionIndicator } from '@/components/EmotionIndicator'
import { formatDate } from '@/utils/emotions'
import { readJSON, writeJSON, removeItem } from '@/utils/storage'

interface JournalEntry {
  id: string
  date: Date
  title: string
  content: string
  tags: string[]
  emotions: string[]
  voiceNote?: string
}

const sparklesIcon = (className: string) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.813 15.904l-.024.012-.027.01a.564.564 0 01-.335 0l-.027-.01-.024-.012a4.105 4.105 0 01-2.178-2.178l-.012-.024-.01-.027a.564.564 0 010-.335l.01-.027.012-.024a4.105 4.105 0 012.178-2.178l.024-.012.027-.01a.564.564 0 01.335 0l.027.01.024.012a4.105 4.105 0 012.178 2.178l.012.024.01.027c.07.221.07.444 0 .666l-.01.027-.012.024a4.105 4.105 0 01-2.178 2.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16.5 8.25l-.005.011-.016.032a2.815 2.815 0 01-1.55 1.55l-.032.016-.011.005a.423.423 0 01-.31 0l-.011-.005-.032-.016a2.815 2.815 0 01-1.55-1.55l-.016-.032-.005-.011a.423.423 0 010-.31l.005-.011.016-.032a2.815 2.815 0 011.55-1.55l.032-.016.011-.005a.423.423 0 01.31 0l.011.005.032.016a2.815 2.815 0 011.55 1.55l.016.032.005.011a.423.423 0 010 .31z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6.5 8.25l-.005.011-.016.032a2.815 2.815 0 01-1.55 1.55l-.032.016-.011.005a.423.423 0 01-.31 0l-.011-.005-.032-.016a2.815 2.815 0 01-1.55-1.55l-.016-.032-.005-.011a.423.423 0 010-.31l.005-.011.016-.032a2.815 2.815 0 011.55-1.55l.032-.016.011-.005a.423.423 0 01.31 0l.011.005.032.016a2.815 2.815 0 011.55 1.55l.016.032.005.011a.423.423 0 010 .31z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.399 15.449l-.006.013-.016.031a1.997 1.997 0 01-1.002 1.002l-.031.016-.013.006a.3.3 0 01-.213 0l-.012-.006-.031-.016a1.997 1.997 0 01-1.002-1.002l-.016-.031-.006-.013a.3.3 0 010-.213l.006-.012.016-.031a1.997 1.997 0 011.002-1.002l.031-.016.012-.006a.3.3 0 01.213 0l.013.006.031.016a1.997 1.997 0 011.002 1.002l.016.031.006.012a.3.3 0 010 .213z"
    />
  </svg>
)

const Journal = () => {
  const navigate = useNavigate()
  const { mood } = useAppStore()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isWriting, setIsWriting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  
  // New entry form
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const [newEmotions, setNewEmotions] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Load entries from storage
  useEffect(() => {
  const saved = readJSON<Array<Omit<JournalEntry, 'date'> & { date: string }>>('lifeos-journal', [])
    if (saved.length > 0) {
      setEntries(saved.map((entry) => ({ ...entry, date: new Date(entry.date) })))
    }
  }, [])

  // Save entries to storage
  useEffect(() => {
    if (entries.length > 0) {
      writeJSON('lifeos-journal', entries)
    } else {
      removeItem('lifeos-journal')
    }
  }, [entries])

  const allTags = Array.from(new Set(entries.flatMap(e => e.tags)))
  const emotionOptions = ['peace', 'joy', 'gratitude', 'anxiety', 'creativity', 'calm', 'inspired', 'reflective', 'energized', 'tired']

  const handleSaveEntry = () => {
    if (!newTitle.trim() && !newContent.trim()) return

    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: new Date(),
      title: newTitle.trim() || 'Untitled',
      content: newContent.trim(),
      tags: newTags,
      emotions: newEmotions,
    }

    setEntries([entry, ...entries])
    
    // Reset form
    setNewTitle('')
    setNewContent('')
    setNewTags([])
    setNewEmotions([])
    setIsWriting(false)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
    if (selectedEntry?.id === id) {
      setSelectedEntry(null)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !newTags.includes(tagInput.trim().toLowerCase())) {
      setNewTags([...newTags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  const toggleEmotion = (emotion: string) => {
    if (newEmotions.includes(emotion)) {
      setNewEmotions(newEmotions.filter(e => e !== emotion))
    } else {
      setNewEmotions([...newEmotions, emotion])
    }
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTag = !filterTag || entry.tags.includes(filterTag)
    
    return matchesSearch && matchesTag
  })

  return (
    <div className="min-h-screen emotion-bg">
      {/* Header */}
      <header className="glass-card sticky top-0 z-40 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-6 h-6 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h1 className="text-2xl font-semibold text-ink-800">Journal & Reflection</h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/mind-map')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Mind Map
            </Button>
            <Button variant="ghost" onClick={() => navigate('/ai-companion')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Companion
            </Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Entry List */}
          <div className="lg:col-span-1 space-y-4">
            {/* New Entry Button */}
            <motion.button
              onClick={() => {
                setIsWriting(true)
                setSelectedEntry(null)
              }}
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Entry
            </motion.button>

            {/* Search */}
            <div className="glass-card p-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="w-full px-4 py-2 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
              />
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="glass-card p-4">
                <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Filter by Tag</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterTag(null)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      !filterTag 
                        ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white' 
                        : 'bg-white/40 text-ink-600 hover:bg-white/60'
                    }`}
                  >
                    All
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterTag === tag 
                          ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white' 
                          : 'bg-white/40 text-ink-600 hover:bg-white/60'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entries List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-ink-500">
                    {searchQuery || filterTag ? 'No matching entries' : 'No entries yet'}
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry, index) => (
                  <motion.button
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntry(entry)
                      setIsWriting(false)
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedEntry?.id === entry.id 
                        ? 'bg-gradient-to-br from-lilac-100/80 to-sand-100/80 ring-2 ring-lilac-400/50' 
                        : 'glass-card hover:bg-white/60'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-medium text-ink-800 mb-1">{entry.title}</h3>
                    <p className="text-xs text-ink-500 mb-2">{formatDate(entry.date)}</p>
                    <p className="text-sm text-ink-600 line-clamp-2">{entry.content}</p>
                    {entry.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.emotions.slice(0, 3).map(emotion => (
                          <span key={emotion} className="px-2 py-0.5 rounded-full bg-golden-100/60 text-xs text-golden-700">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {isWriting ? (
                <motion.div
                  key="writing"
                  className="glass-card p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-semibold text-ink-800 mb-6">New Entry</h2>
                  
                  {/* Title */}
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Entry title..."
                    className="w-full px-4 py-3 mb-4 rounded-xl bg-white/60 border border-ink-200/40 text-xl font-medium text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
                    autoFocus
                  />

                  {/* Content */}
                  <textarea
                    ref={contentRef}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="What's on your mind? Write freely..."
                    rows={12}
                    className="w-full px-4 py-3 mb-4 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50 resize-none"
                  />

                  {/* Emotions */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-ink-700 mb-2">How are you feeling?</label>
                    <div className="flex flex-wrap gap-2">
                      {emotionOptions.map(emotion => (
                        <button
                          key={emotion}
                          type="button"
                          onClick={() => toggleEmotion(emotion)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            newEmotions.includes(emotion)
                              ? 'bg-gradient-to-br from-golden-400 to-golden-500 text-white'
                              : 'bg-white/40 text-ink-700 hover:bg-white/60'
                          }`}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-ink-700 mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add a tag..."
                        className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 text-ink-700 font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newTags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-lilac-100/60 text-sm text-lilac-700 flex items-center gap-2"
                        >
                          #{tag}
                          <button
                            onClick={() => setNewTags(newTags.filter(t => t !== tag))}
                            className="hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setIsWriting(false)}
                      className="flex-1 px-6 py-3 rounded-xl bg-white/60 text-ink-700 font-medium hover:bg-white/80 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSaveEntry}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Save Entry
                    </motion.button>
                  </div>
                </motion.div>
              ) : selectedEntry ? (
                <motion.div
                  key={selectedEntry.id}
                  className="glass-card p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-semibold text-ink-800 mb-2">{selectedEntry.title}</h2>
                      <p className="text-sm text-ink-500">{formatDate(selectedEntry.date)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      className="px-4 py-2 rounded-lg hover:bg-red-100/60 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {selectedEntry.emotions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Emotions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.emotions.map(emotion => (
                          <span key={emotion} className="px-3 py-1 rounded-full bg-golden-100/60 text-sm text-golden-700">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.tags.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-ink-600 mb-2 uppercase tracking-wide">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-lilac-100/60 text-sm text-lilac-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prose prose-lg max-w-none">
                    <p className="text-ink-700 whitespace-pre-wrap leading-relaxed">{selectedEntry.content}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="glass-card p-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-4 flex justify-center">
                    {sparklesIcon('w-16 h-16 text-lilac-500')}
                  </div>
                  <h3 className="text-2xl font-semibold text-ink-800 mb-2">Your Digital Mind</h3>
                  <p className="text-ink-600 mb-6">
                    Capture your thoughts, reflect on your journey, and discover patterns in your inner world.
                  </p>
                  <motion.button
                    onClick={() => setIsWriting(true)}
                    className="px-8 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Writing
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Emotion Indicator */}
      <EmotionIndicator 
        emotion={mood.dominantEmotion} 
        intensity={mood.energyLevel} 
        className="fixed bottom-8 right-8" 
      />
    </div>
  )
}

export default Journal

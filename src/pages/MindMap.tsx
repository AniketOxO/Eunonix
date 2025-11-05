import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/Button'
import { readJSON } from '@/utils/storage'

interface Node {
  id: string
  type: 'goal' | 'habit' | 'journal' | 'insight' | 'emotion'
  label: string
  x: number
  y: number
  color: string
  size: number
  connections: string[]
  data?: any
}

interface Connection {
  from: string
  to: string
  strength: number
}

const MindMap = () => {
  const navigate = useNavigate()
  const { goals, habits, mood } = useAppStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'network' | 'timeline' | 'cluster'>('network')

  // Load journal entries from storage
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  useEffect(() => {
    const saved = readJSON<Array<Record<string, any> & { date: string }>>('eunonix-journal', [])
    if (saved.length > 0) {
      setJournalEntries(saved.map((entry) => ({ ...entry, date: new Date(entry.date) })))
    }
  }, [])

  // Generate nodes and connections from data
  useEffect(() => {
    const newNodes: Node[] = []
    const newConnections: Connection[] = []
    let nodeId = 0

    // Center point - You
    newNodes.push({
      id: 'center',
      type: 'emotion',
      label: 'You',
      x: 400,
      y: 300,
      color: 'from-golden-400 to-golden-600',
      size: 80,
      connections: [],
      data: { emotion: mood.dominantEmotion }
    })

    // Goals as primary nodes
    goals.forEach((goal, i) => {
      const angle = (i / goals.length) * 2 * Math.PI
      const radius = 200
      const id = `goal-${nodeId++}`
      
      newNodes.push({
        id,
        type: 'goal',
        label: goal.title,
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        color: getCategoryColor(goal.category),
        size: 60 + goal.progress / 2,
        connections: ['center'],
        data: goal
      })

      newConnections.push({
        from: 'center',
        to: id,
        strength: goal.progress / 100
      })

      // Connect to related habits
      const relatedHabits = habits.filter(h => 
        h.title.toLowerCase().includes(goal.category.toLowerCase()) ||
        goal.title.toLowerCase().includes(h.title.toLowerCase())
      )

      relatedHabits.forEach((habit, j) => {
        const habitId = `habit-${goal.id}-${j}`
        const subAngle = angle + (j - relatedHabits.length / 2) * 0.3
        const subRadius = radius + 100

        newNodes.push({
          id: habitId,
          type: 'habit',
          label: habit.title,
          x: 400 + Math.cos(subAngle) * subRadius,
          y: 300 + Math.sin(subAngle) * subRadius,
          color: 'from-lilac-400 to-lilac-600',
          size: 40 + habit.streak,
          connections: [id],
          data: habit
        })

        newConnections.push({
          from: id,
          to: habitId,
          strength: habit.streak / 30
        })
      })
    })

    // Journal entries as memory nodes
    const recentEntries = journalEntries.slice(0, 12)
    recentEntries.forEach((entry, i) => {
      const angle = (i / recentEntries.length) * 2 * Math.PI + Math.PI / 6
      const radius = 280
      const id = `journal-${i}`

      newNodes.push({
        id,
        type: 'journal',
        label: entry.title || 'Memory',
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        color: 'from-sand-400 to-sand-600',
        size: 35,
        connections: [],
        data: entry
      })

      // Connect journal to goals with matching tags
      entry.tags?.forEach((tag: string) => {
        const matchingGoal = newNodes.find(n => 
          n.type === 'goal' && 
          n.label.toLowerCase().includes(tag.toLowerCase())
        )
        if (matchingGoal) {
          newConnections.push({
            from: id,
            to: matchingGoal.id,
            strength: 0.5
          })
        }
      })

      // Connect journal to center based on emotions
      if (entry.emotions?.length > 0) {
        newConnections.push({
          from: id,
          to: 'center',
          strength: 0.3
        })
      }
    })

    setNodes(newNodes)
    setConnections(newConnections)

    // Generate insights
    generateInsights(newNodes, journalEntries)
  }, [goals, habits, journalEntries, mood])

  const generateInsights = (nodes: Node[], entries: any[]) => {
    const newInsights: string[] = []

    // Most connected goal
    const goalNodes = nodes.filter(n => n.type === 'goal')
    const mostConnectedGoal = goalNodes.reduce((max, node) => {
      const connectionCount = connections.filter(c => c.from === node.id || c.to === node.id).length
      const maxCount = connections.filter(c => c.from === max.id || c.to === max.id).length
      return connectionCount > maxCount ? node : max
    }, goalNodes[0])

    if (mostConnectedGoal) {
      newInsights.push(`Your "${mostConnectedGoal.label}" goal has the strongest connections to your daily habits.`)
    }

    // Emotion patterns in journal
    const emotionCounts: Record<string, number> = {}
    entries.forEach(entry => {
      entry.emotions?.forEach((emotion: string) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      })
    })

    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]
    if (topEmotion) {
      newInsights.push(`You've written most often about feeling "${topEmotion[0]}" (${topEmotion[1]} entries).`)
    }

    // Tag patterns
    const tagCounts: Record<string, number> = {}
    entries.forEach(entry => {
      entry.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]
    if (topTag) {
      newInsights.push(`"${topTag[0]}" appears in ${topTag[1]} journal entries - it's a recurring theme.`)
    }

    // Habit strength
    const strongestHabit = habits.reduce((max, h) => h.streak > max.streak ? h : max, habits[0])
    if (strongestHabit && strongestHabit.streak > 0) {
      newInsights.push(`Your "${strongestHabit.title}" habit (${strongestHabit.streak} day streak) shows remarkable consistency.`)
    }

    // Goal progress
    const avgProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0
    if (avgProgress > 70) {
      newInsights.push(`You're making excellent progress across all goals (${avgProgress}% average).`)
    } else if (avgProgress > 40) {
      newInsights.push(`Your goals are ${avgProgress}% complete on average - steady progress!`)
    }

    // Network density
    const totalNodes = nodes.length
    const totalConnections = connections.length
    if (totalConnections > totalNodes * 1.5) {
      newInsights.push(`Your life map is richly interconnected - you see relationships between different areas.`)
    }

    setInsights(newInsights.slice(0, 5))
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: 'from-green-400 to-green-600',
      career: 'from-blue-400 to-blue-600',
      relationships: 'from-pink-400 to-pink-600',
      personal: 'from-purple-400 to-purple-600',
      financial: 'from-yellow-400 to-yellow-600',
      learning: 'from-indigo-400 to-indigo-600',
    }
    return colors[category] || 'from-gray-400 to-gray-600'
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        )
      case 'habit':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'journal':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'emotion':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h1 className="text-2xl font-semibold text-ink-800">Mind Map & Visualization</h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/journal')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Journal
            </Button>
            <Button variant="ghost" onClick={() => navigate('/companion')}>
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

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* View Mode Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('network')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                viewMode === 'network'
                  ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                  : 'bg-white/40 text-ink-700 hover:bg-white/60'
              }`}
            >
              Network View
            </button>
            <button
              onClick={() => setViewMode('cluster')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                viewMode === 'cluster'
                  ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                  : 'bg-white/40 text-ink-700 hover:bg-white/60'
              }`}
            >
              Cluster View
            </button>
          </div>

          <div className="text-sm text-ink-600">
            {nodes.length} nodes • {connections.length} connections
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Canvas */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 rounded-3xl">
              <div 
                ref={canvasRef}
                className="relative w-full h-[600px] bg-gradient-to-br from-sand-50/30 via-white/40 to-lilac-50/20 rounded-3xl overflow-hidden border border-sand-200/30"
              >
                {/* Background decorative circles */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <motion.div 
                    className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-lilac-200/20 to-transparent blur-2xl"
                    style={{ top: '10%', left: '15%' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-golden-200/20 to-transparent blur-2xl"
                    style={{ top: '60%', right: '20%' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  />
                </div>

                {/* Cluster View - Category Groups */}
                {viewMode === 'cluster' && (
                  <div className="absolute inset-0 p-8">
                    <div className="grid grid-cols-2 gap-6 h-full">
                      {/* Goals Cluster */}
                      <motion.div 
                        className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-lilac-300/30"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilac-400 to-ink-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-semibold text-ink-800">Goals ({nodes.filter(n => n.type === 'goal').length})</h3>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[220px]">
                          {nodes.filter(n => n.type === 'goal').map((node, i) => (
                            <motion.div
                              key={node.id}
                              className="p-3 bg-white/60 rounded-xl border border-ink-200/20 cursor-pointer hover:bg-white/80 transition-all"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedNode(node)}
                            >
                              <p className="text-sm font-medium text-ink-800">{node.label}</p>
                              {node.data && (
                                <div className="mt-2">
                                  <div className="w-full bg-sand-200/50 rounded-full h-1.5">
                                    <div 
                                      className="bg-gradient-to-r from-lilac-400 to-ink-500 h-1.5 rounded-full"
                                      style={{ width: `${node.data.progress}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-ink-500 mt-1">{node.data.progress}% complete</p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {nodes.filter(n => n.type === 'goal').length === 0 && (
                            <p className="text-xs text-ink-500 text-center py-4">No goals yet</p>
                          )}
                        </div>
                      </motion.div>

                      {/* Habits Cluster */}
                      <motion.div 
                        className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-lilac-300/30"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilac-400 to-lilac-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-semibold text-ink-800">Habits ({nodes.filter(n => n.type === 'habit').length})</h3>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[220px]">
                          {nodes.filter(n => n.type === 'habit').map((node, i) => (
                            <motion.div
                              key={node.id}
                              className="p-3 bg-white/60 rounded-xl border border-ink-200/20 cursor-pointer hover:bg-white/80 transition-all"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedNode(node)}
                            >
                              <p className="text-sm font-medium text-ink-800">{node.label}</p>
                              {node.data && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-ink-500">🔥 {node.data.streak} day streak</span>
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {nodes.filter(n => n.type === 'habit').length === 0 && (
                            <p className="text-xs text-ink-500 text-center py-4">No habits tracked yet</p>
                          )}
                        </div>
                      </motion.div>

                      {/* Journal/Memories Cluster */}
                      <motion.div 
                        className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-sand-300/30"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sand-400 to-sand-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-semibold text-ink-800">Memories ({nodes.filter(n => n.type === 'journal').length})</h3>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[220px]">
                          {nodes.filter(n => n.type === 'journal').slice(0, 8).map((node, i) => (
                            <motion.div
                              key={node.id}
                              className="p-3 bg-white/60 rounded-xl border border-ink-200/20 cursor-pointer hover:bg-white/80 transition-all"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedNode(node)}
                            >
                              <p className="text-sm font-medium text-ink-800">{node.label}</p>
                              {node.data?.date && (
                                <p className="text-xs text-ink-500 mt-1">
                                  {new Date(node.data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              )}
                            </motion.div>
                          ))}
                          {nodes.filter(n => n.type === 'journal').length === 0 && (
                            <p className="text-xs text-ink-500 text-center py-4">No journal entries yet</p>
                          )}
                        </div>
                      </motion.div>

                      {/* Emotional Center */}
                      <motion.div 
                        className="bg-gradient-to-br from-golden-50/60 to-white/40 backdrop-blur-sm rounded-2xl p-6 border border-golden-300/30 flex flex-col items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <motion.div 
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-golden-400 to-golden-600 flex items-center justify-center mb-4 shadow-xl"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              '0 8px 24px rgba(201, 165, 92, 0.3)',
                              '0 12px 32px rgba(201, 165, 92, 0.4)',
                              '0 8px 24px rgba(201, 165, 92, 0.3)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </motion.div>
                        <h3 className="text-xl font-semibold text-ink-800 mb-2">You</h3>
                        <p className="text-sm text-ink-600 capitalize">{mood.dominantEmotion || 'Neutral'}</p>
                        <div className="mt-4 text-center">
                          <p className="text-xs text-ink-500 mb-1">Total Connections</p>
                          <p className="text-2xl font-semibold text-gradient">{connections.length}</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* SVG for connections - Only show in network view */}
                {viewMode === 'network' && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c9b8a8" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#9d7bca" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9d7bca" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#c9a55c" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  {connections.map((conn, i) => {
                    const fromNode = nodes.find(n => n.id === conn.from)
                    const toNode = nodes.find(n => n.id === conn.to)
                    if (!fromNode || !toNode) return null

                    const isHighlighted = 
                      selectedNode?.id === conn.from || 
                      selectedNode?.id === conn.to ||
                      hoveredNode?.id === conn.from ||
                      hoveredNode?.id === conn.to

                    return (
                      <motion.line
                        key={i}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isHighlighted ? 'url(#highlightGradient)' : 'url(#connectionGradient)'}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: i * 0.03, ease: "easeOut" }}
                      />
                    )
                  })}
                </svg>
                )}

                {/* Nodes - Only show in network view */}
                {viewMode === 'network' && nodes.map((node, i) => {
                  const isSelected = selectedNode?.id === node.id
                  const isHovered = hoveredNode?.id === node.id
                  const isConnected = selectedNode && connections.some(
                    c => (c.from === selectedNode.id && c.to === node.id) ||
                         (c.to === selectedNode.id && c.from === node.id)
                  )

                  return (
                    <motion.div
                      key={node.id}
                      className="absolute cursor-pointer group"
                      style={{
                        left: node.x,
                        top: node.y,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: isSelected || isHovered ? 1.15 : 1,
                        opacity: selectedNode && !isSelected && !isConnected ? 0.25 : 1
                      }}
                      transition={{ 
                        duration: 0.4, 
                        delay: i * 0.04,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
                      onClick={() => setSelectedNode(node)}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Outer glow ring */}
                      <motion.div
                        className={`absolute inset-0 rounded-full blur-md`}
                        style={{
                          width: node.size,
                          height: node.size,
                          background: isSelected || isHovered 
                            ? 'radial-gradient(circle, rgba(157, 123, 202, 0.4) 0%, transparent 70%)'
                            : 'transparent',
                        }}
                        animate={{
                          scale: isSelected || isHovered ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      {/* Main node */}
                      <div
                        className={`relative backdrop-blur-sm border-2 rounded-full shadow-xl flex items-center justify-center transition-all duration-300`}
                        style={{
                          width: node.size,
                          height: node.size,
                          background: node.id === 'center'
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 245, 235, 0.95) 100%)'
                            : node.type === 'goal'
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(243, 238, 229, 0.9) 100%)'
                            : node.type === 'habit'
                            ? 'linear-gradient(135deg, rgba(247, 243, 255, 0.85) 0%, rgba(237, 230, 250, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 254, 251, 0.85) 0%, rgba(249, 245, 235, 0.9) 100%)',
                          borderColor: node.id === 'center'
                            ? 'rgba(201, 165, 92, 0.5)'
                            : node.type === 'goal'
                            ? 'rgba(157, 123, 202, 0.3)'
                            : node.type === 'habit'
                            ? 'rgba(157, 123, 202, 0.25)'
                            : 'rgba(201, 180, 168, 0.3)',
                          boxShadow: isSelected || isHovered
                            ? '0 8px 32px rgba(157, 123, 202, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1)'
                            : '0 4px 16px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        {/* Icon container */}
                        <div className={`${
                          node.id === 'center' ? 'text-golden-600' :
                          node.type === 'goal' ? 'text-lilac-600' :
                          node.type === 'habit' ? 'text-lilac-500' :
                          'text-sand-600'
                        } transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                          {getNodeIcon(node.type)}
                        </div>
                        
                        {/* Pulse animation for center node */}
                        {node.id === 'center' && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{
                                border: '2px solid rgba(201, 165, 92, 0.3)',
                              }}
                              animate={{ 
                                scale: [1, 1.4, 1],
                                opacity: [0.5, 0, 0.5]
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{
                                border: '2px solid rgba(201, 165, 92, 0.2)',
                              }}
                              animate={{ 
                                scale: [1, 1.6, 1],
                                opacity: [0.3, 0, 0.3]
                              }}
                              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                            />
                          </>
                        )}
                      </div>

                      {/* Label */}
                      {(isSelected || isHovered || node.size > 60) && (
                        <motion.div
                          className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/80 border border-ink-200/30 text-xs font-medium text-ink-700 whitespace-nowrap shadow-lg"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {node.label}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-sand-100 border-2 border-golden-400/50 shadow-sm" />
                  <span className="text-ink-600 font-medium">You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-sand-50 border-2 border-lilac-400/40 shadow-sm" />
                  <span className="text-ink-600 font-medium">Goals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-lilac-50 to-lilac-100/50 border-2 border-lilac-400/30 shadow-sm" />
                  <span className="text-ink-600 font-medium">Habits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-sand-50/80 border-2 border-sand-400/30 shadow-sm" />
                  <span className="text-ink-600 font-medium">Memories</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Details & Insights */}
          <div className="space-y-6">
            {/* Selected Node Details */}
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key="details"
                  className="glass-card p-6 rounded-3xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedNode.color} flex items-center justify-center text-white`}>
                      {getNodeIcon(selectedNode.type)}
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-ink-400 hover:text-ink-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-ink-800 mb-2">{selectedNode.label}</h3>
                  <p className="text-xs text-ink-500 uppercase tracking-wide mb-4">{selectedNode.type}</p>

                  {selectedNode.type === 'goal' && selectedNode.data && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-ink-500 mb-1">Progress</p>
                        <div className="w-full bg-sand-200/50 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-lilac-400 to-ink-500 h-2 rounded-full"
                            style={{ width: `${selectedNode.data.progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-ink-700 mt-1">{selectedNode.data.progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-500 mb-1">Why it matters</p>
                        <p className="text-sm text-ink-700">{selectedNode.data.emotionalWhy}</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'habit' && selectedNode.data && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-ink-500 mb-1">Current Streak</p>
                        <p className="text-2xl font-semibold text-gradient">{selectedNode.data.streak} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-500 mb-1">Frequency</p>
                        <p className="text-sm text-ink-700 capitalize">{selectedNode.data.frequency}</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'journal' && selectedNode.data && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-ink-500 mb-1">Date</p>
                        <p className="text-sm text-ink-700">
                          {new Date(selectedNode.data.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      {selectedNode.data.emotions?.length > 0 && (
                        <div>
                          <p className="text-xs text-ink-500 mb-2">Emotions</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedNode.data.emotions.map((emotion: string) => (
                              <span 
                                key={emotion}
                                className="px-2 py-1 bg-lilac-100 text-lilac-700 rounded-full text-xs"
                              >
                                {emotion}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedNode.data.content && (
                        <div>
                          <p className="text-xs text-ink-500 mb-1">Excerpt</p>
                          <p className="text-sm text-ink-700 line-clamp-3">{selectedNode.data.content}</p>
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        onClick={() => navigate('/journal')}
                        className="w-full mt-2"
                      >
                        View in Journal
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-ink-200/20">
                    <p className="text-xs text-ink-500 mb-2">Connections</p>
                    <p className="text-sm text-ink-700">
                      {connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).length} relationships
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="glass-card p-6 rounded-3xl text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-sand-200 to-sand-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-sand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink-600">Click any node to explore</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Insights Panel */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-golden-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-semibold text-ink-800">Insights</h3>
              </div>

              <div className="space-y-3">
                {insights.length > 0 ? (
                  insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      className="p-3 bg-gradient-to-br from-golden-50 to-sand-50 rounded-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <p className="text-sm text-ink-700">{insight}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-ink-500 text-center py-4">
                    Create goals, habits, and journal entries to discover insights
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default MindMap

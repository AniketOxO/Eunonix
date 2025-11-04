import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

const getTodayDate = () => new Date().toISOString().split('T')[0]

export const DayPlanner = () => {
  const { getTodayPlan, togglePriority, addPriority, removePriority, createDayPlan } = useAppStore()
  const [newPriority, setNewPriority] = useState('')
  const [priorityType, setPriorityType] = useState<'must' | 'should' | 'could'>('must')
  const [priorityToDelete, setPriorityToDelete] = useState<{ id: string; title: string } | null>(null)
  
  const today = getTodayDate()
  const todayPlan = getTodayPlan()

  const handleCreatePlan = () => {
    if (!todayPlan) {
      createDayPlan({
        id: `plan-${Date.now()}`,
        date: today,
        focus: "Today's focus...",
        priorities: [],
        timeBlocks: [],
      })
    }
  }

  const handleAddPriority = () => {
    if (!newPriority.trim() || !todayPlan) return
    
    addPriority(today, {
      id: `priority-${Date.now()}`,
      title: newPriority,
      type: priorityType,
      completed: false,
    })
    
    setNewPriority('')
  }

  const priorityColors = {
    must: { bg: 'from-red-400/20 to-red-500/10', border: 'border-red-400/40', text: 'text-red-700' },
    should: { bg: 'from-golden-400/20 to-golden-500/10', border: 'border-golden-400/40', text: 'text-golden-700' },
    could: { bg: 'from-blue-400/20 to-blue-500/10', border: 'border-blue-400/40', text: 'text-blue-700' },
  }

  const priorityLabels = {
    must: 'Must Do',
    should: 'Should Do',
    could: 'Could Do',
  }

  if (!todayPlan) {
    return (
      <div className="text-center py-12">
        <motion.button
          onClick={handleCreatePlan}
          className="px-8 py-4 rounded-full bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Plan Today
        </motion.button>
      </div>
    )
  }

  const mustDos = todayPlan.priorities.filter(p => p.type === 'must')
  const shouldDos = todayPlan.priorities.filter(p => p.type === 'should')
  const couldDos = todayPlan.priorities.filter(p => p.type === 'could')

  const completedCount = todayPlan.priorities.filter(p => p.completed).length
  const totalCount = todayPlan.priorities.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-ink-800">Today's Plan</h3>
          <div className="text-right">
            <div className="text-3xl font-light text-ink-800">{completionRate}%</div>
            <div className="text-sm text-ink-500">{completedCount} of {totalCount}</div>
          </div>
        </div>
        
        <div className="h-2 bg-ink-200/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-lilac-400 to-golden-400"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Add Priority */}
      <div className="glass-card p-4">
        <div className="flex gap-2">
          <select
            value={priorityType}
            onChange={(e) => setPriorityType(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white/60 border border-ink-200/40 text-ink-700 text-sm focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
          >
            <option value="must">Must</option>
            <option value="should">Should</option>
            <option value="could">Could</option>
          </select>
          
          <input
            type="text"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPriority()}
            placeholder="Add a priority..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
          />
          
          <motion.button
            onClick={handleAddPriority}
            className="px-6 py-2 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add
          </motion.button>
        </div>
      </div>

      {/* Priority Lists */}
      <div className="space-y-4">
        {/* Must Do */}
        {mustDos.length > 0 && (
          <PrioritySection
            title={priorityLabels.must}
            priorities={mustDos}
            colors={priorityColors.must}
            onToggle={(id) => togglePriority(today, id)}
            onDelete={(id, title) => setPriorityToDelete({ id, title })}
          />
        )}

        {/* Should Do */}
        {shouldDos.length > 0 && (
          <PrioritySection
            title={priorityLabels.should}
            priorities={shouldDos}
            colors={priorityColors.should}
            onToggle={(id) => togglePriority(today, id)}
            onDelete={(id, title) => setPriorityToDelete({ id, title })}
          />
        )}

        {/* Could Do */}
        {couldDos.length > 0 && (
          <PrioritySection
            title={priorityLabels.could}
            priorities={couldDos}
            colors={priorityColors.could}
            onToggle={(id) => togglePriority(today, id)}
            onDelete={(id, title) => setPriorityToDelete({ id, title })}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {priorityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setPriorityToDelete(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div
            className="relative glass-card p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100/60 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-ink-800 mb-2">Remove Priority?</h3>
              <p className="text-ink-600 mb-6">
                Remove <strong>"{priorityToDelete.title}"</strong> from today's plan?
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setPriorityToDelete(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/60 text-ink-700 font-medium hover:bg-white/80 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    removePriority(today, priorityToDelete.id)
                    setPriorityToDelete(null)
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-red-400 to-red-500 text-white font-medium shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Remove
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

interface PrioritySectionProps {
  title: string
  priorities: any[]
  colors: { bg: string; border: string; text: string }
  onToggle: (id: string) => void
  onDelete: (id: string, title: string) => void
}

const PrioritySection = ({ title, priorities, colors, onToggle, onDelete }: PrioritySectionProps) => {
  return (
    <div>
      <h4 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${colors.text}`}>
        {title}
      </h4>
      <div className="space-y-2">
        {priorities.map((priority, index) => (
          <motion.div
            key={priority.id}
            className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => onToggle(priority.id)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  priority.completed 
                    ? 'bg-gradient-to-br from-lilac-400 to-ink-400 border-lilac-400' 
                    : 'border-ink-300 hover:border-lilac-400'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {priority.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.button>
              
              <span className={`flex-1 ${priority.completed ? 'line-through text-ink-500' : 'text-ink-800'}`}>
                {priority.title}
              </span>
              
              {priority.estimatedTime && (
                <span className="text-xs text-ink-500">{priority.estimatedTime}m</span>
              )}

              {/* Delete Button */}
              <motion.button
                onClick={() => onDelete(priority.id, priority.title)}
                className="w-6 h-6 rounded-full hover:bg-red-100/60 flex items-center justify-center transition-colors group flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-3 h-3 text-ink-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

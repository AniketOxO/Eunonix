import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { CreateGoalModal } from './CreateGoalModal'

export const GoalsOverview = () => {
  const { goals, getGoalProgress, deleteGoal } = useAppStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<{ id: string; title: string } | null>(null)

  const categoryColors: Record<string, string> = {
    health: 'from-green-400/20 to-green-500/10 border-green-400/30',
    career: 'from-golden-400/20 to-golden-500/10 border-golden-400/30',
    relationships: 'from-pink-400/20 to-pink-500/10 border-pink-400/30',
    personal: 'from-lilac-400/20 to-lilac-500/10 border-lilac-400/30',
    financial: 'from-blue-400/20 to-blue-500/10 border-blue-400/30',
    learning: 'from-ink-400/20 to-ink-500/10 border-ink-400/30',
  }

  const categoryIcons: Record<string, string> = {
    health: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    career: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    relationships: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    personal: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    financial: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    learning: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  }

  if (goals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-ink-800">Life Goals</h2>
            <p className="text-ink-600 text-sm mt-1">Shape your future with intention</p>
          </div>
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + New Goal
          </motion.button>
        </div>

        <div className="glass-card p-12 text-center">
          <motion.div 
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-lilac-400/10 to-purple-400/10 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold text-ink-800 mb-2">No goals yet</h3>
          <p className="text-ink-600 mb-6">Set your first life goal and start building your future</p>
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your First Goal
          </motion.button>
        </div>

        <CreateGoalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-ink-800">Life Goals</h2>
          <p className="text-ink-600 text-sm mt-1">Shape your future with intention</p>
        </div>
        <motion.button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + New Goal
        </motion.button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {goals.map((goal, index) => {
        const progress = getGoalProgress(goal.id)
        const colorClass = categoryColors[goal.category]
        
        return (
          <motion.div
            key={goal.id}
            className={`p-6 rounded-2xl bg-gradient-to-br ${colorClass} border`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center">
                <svg className="w-6 h-6 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={categoryIcons[goal.category]} />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-ink-800 mb-1">{goal.title}</h3>
                <p className="text-sm text-ink-600 line-clamp-2">{goal.description}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Progress</span>
                <span className="font-semibold text-ink-800">{progress}%</span>
              </div>
              
              <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-lilac-500 to-ink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>

            {/* Systems Count */}
            {goal.systems.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{goal.systems.length} active system{goal.systems.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Delete Button */}
            <div className="mt-4 pt-4 border-t border-white/30">
              <motion.button
                onClick={() => setGoalToDelete({ id: goal.id, title: goal.title })}
                className="w-full px-4 py-2 rounded-lg hover:bg-red-100/40 text-red-600 hover:text-red-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Goal
              </motion.button>
            </div>
          </motion.div>
        )
      })}

      <CreateGoalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      {/* Delete Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setGoalToDelete(null)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-ink-800 mb-2">Delete Goal?</h3>
              <p className="text-ink-600 mb-6">
                Are you sure you want to delete <strong>"{goalToDelete.title}"</strong>? 
                <br />
                <span className="text-sm">This will also remove all connected systems.</span>
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setGoalToDelete(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/60 text-ink-700 font-medium hover:bg-white/80 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    deleteGoal(goalToDelete.id)
                    setGoalToDelete(null)
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-red-400 to-red-500 text-white font-medium shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { CreateHabitModal } from './CreateHabitModal'

const getTodayDate = () => new Date().toISOString().split('T')[0]

export const HabitTracker = () => {
  const { habits, completeHabit, deleteHabit } = useAppStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; title: string } | null>(null)
  const today = getTodayDate()

  const habitColors = {
    easy: 'from-green-400/20 to-green-500/10',
    medium: 'from-golden-400/20 to-golden-500/10',
    hard: 'from-lilac-400/20 to-lilac-500/10',
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-ink-800">Daily Habits</h2>
          <p className="text-ink-600 text-sm mt-1">Build consistency, one day at a time</p>
        </div>
        <motion.button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + New Habit
        </motion.button>
      </div>

      {habits.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <motion.div 
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400/10 to-emerald-400/10 mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold text-ink-800 mb-2">No habits yet</h3>
          <p className="text-ink-600 mb-6">Start building your life, one habit at a time</p>
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your First Habit
          </motion.button>
        </div>
      ) : (
        habits.map((habit, index) => {
          const isCompletedToday = habit.completedDates.includes(today)
          
          return (
            <motion.div
              key={habit.id}
              className={`glass-card p-4 ${isCompletedToday ? 'ring-2 ring-lilac-400/50' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-1">
                  {/* Checkbox */}
                  <motion.button
                    onClick={() => completeHabit(habit.id, today)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompletedToday 
                        ? 'bg-gradient-to-br from-lilac-400 to-ink-400 border-lilac-400' 
                        : 'border-ink-300 hover:border-lilac-400'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isCompletedToday && (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.button>

                  {/* Habit Info */}
                  <div className="flex-1">
                    <h4 className="font-medium text-ink-800">{habit.title}</h4>
                    {habit.description && (
                      <p className="text-sm text-ink-600">{habit.description}</p>
                    )}
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-br ${habitColors[habit.difficulty]}`}>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-golden-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-ink-700">{habit.streak}</span>
                    </div>
                  </div>

                  {habit.longestStreak > 0 && habit.longestStreak > habit.streak && (
                    <div className="text-xs text-ink-500">
                      Best: {habit.longestStreak}
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <motion.button
                  onClick={() => setHabitToDelete({ id: habit.id, title: habit.title })}
                  className="w-8 h-8 rounded-full hover:bg-red-100/60 flex items-center justify-center transition-colors group flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4 text-ink-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-1 bg-ink-200/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${habitColors[habit.difficulty]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (habit.streak / 30) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          )
        })
      )}

      <CreateHabitModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      {/* Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setHabitToDelete(null)}
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
              
              <h3 className="text-xl font-semibold text-ink-800 mb-2">Delete Habit?</h3>
              <p className="text-ink-600 mb-6">
                Are you sure you want to delete <strong>"{habitToDelete.title}"</strong>? 
                <br />
                <span className="text-sm">This cannot be undone.</span>
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setHabitToDelete(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/60 text-ink-700 font-medium hover:bg-white/80 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    deleteHabit(habitToDelete.id)
                    setHabitToDelete(null)
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
  )
}

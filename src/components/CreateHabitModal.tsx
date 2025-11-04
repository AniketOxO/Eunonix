import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Modal } from './Modal'

interface CreateHabitModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateHabitModal = ({ isOpen, onClose }: CreateHabitModalProps) => {
  const { addHabit } = useAppStore()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    addHabit({
      id: `habit-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      streak: 0,
      longestStreak: 0,
      frequency,
      completedDates: [],
      timeOfDay,
      difficulty,
      createdAt: new Date(),
    })

    // Reset form
    setTitle('')
    setDescription('')
    setFrequency('daily')
    setTimeOfDay('anytime')
    setDifficulty('easy')
    
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Habit">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Habit Name *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Exercise for 30 minutes"
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why this habit matters to you..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50 resize-none"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['daily', 'weekly', 'custom'].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  frequency === freq
                    ? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white'
                    : 'bg-white/40 text-ink-700 hover:bg-white/60'
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Best Time
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'morning', label: 'Morning', icon: '🌅' },
              { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
              { value: 'evening', label: 'Evening', icon: '🌙' },
              { value: 'anytime', label: 'Anytime', icon: '⏰' },
            ].map((time) => (
              <button
                key={time.value}
                type="button"
                onClick={() => setTimeOfDay(time.value as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  timeOfDay === time.value
                    ? 'bg-gradient-to-br from-golden-400 to-golden-500 text-white'
                    : 'bg-white/40 text-ink-700 hover:bg-white/60'
                }`}
              >
                <span>{time.icon}</span>
                <span>{time.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'easy', label: 'Easy', color: 'from-green-400 to-green-500' },
              { value: 'medium', label: 'Medium', color: 'from-golden-400 to-golden-500' },
              { value: 'hard', label: 'Hard', color: 'from-lilac-400 to-lilac-500' },
            ].map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setDifficulty(diff.value as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  difficulty === diff.value
                    ? `bg-gradient-to-br ${diff.color} text-white`
                    : 'bg-white/40 text-ink-700 hover:bg-white/60'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-white/40 text-ink-700 font-medium hover:bg-white/60 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={!title.trim()}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: title.trim() ? 1.02 : 1 }}
            whileTap={{ scale: title.trim() ? 0.98 : 1 }}
          >
            Create Habit
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}

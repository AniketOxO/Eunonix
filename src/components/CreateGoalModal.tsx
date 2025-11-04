import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Modal } from './Modal'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateGoalModal = ({ isOpen, onClose }: CreateGoalModalProps) => {
  const { addGoal } = useAppStore()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'health' | 'career' | 'relationships' | 'personal' | 'financial' | 'learning'>('personal')
  const [emotionalWhy, setEmotionalWhy] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const categories = [
    { value: 'health', label: 'Health', icon: '💚', color: 'from-green-400/20 to-green-500/10' },
    { value: 'career', label: 'Career', icon: '💼', color: 'from-golden-400/20 to-golden-500/10' },
    { value: 'relationships', label: 'Relationships', icon: '💗', color: 'from-pink-400/20 to-pink-500/10' },
    { value: 'personal', label: 'Personal', icon: '🌟', color: 'from-lilac-400/20 to-lilac-500/10' },
    { value: 'financial', label: 'Financial', icon: '💰', color: 'from-blue-400/20 to-blue-500/10' },
    { value: 'learning', label: 'Learning', icon: '📚', color: 'from-ink-400/20 to-ink-500/10' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    addGoal({
      id: `goal-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      progress: 0,
      systems: [],
      createdAt: new Date(),
      emotionalWhy: emotionalWhy.trim() || undefined,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setCategory('personal')
    setEmotionalWhy('')
    setTargetDate('')
    
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Goal">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Goal Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Run a marathon in 2026"
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this goal mean to you?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50 resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-3">
            Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  category === cat.value
                    ? `bg-gradient-to-br ${cat.color} ring-2 ring-offset-2 ring-lilac-400/50`
                    : 'bg-white/40 text-ink-700 hover:bg-white/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emotional Why */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Why does this matter to you?
          </label>
          <textarea
            value={emotionalWhy}
            onChange={(e) => setEmotionalWhy(e.target.value)}
            placeholder="The deeper reason behind this goal..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-lilac-400/50 resize-none"
          />
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Target Date (Optional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-ink-200/40 text-ink-800 focus:outline-none focus:ring-2 focus:ring-lilac-400/50"
          />
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
            disabled={!title.trim() || !description.trim()}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-lilac-400 to-ink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: title.trim() && description.trim() ? 1.02 : 1 }}
            whileTap={{ scale: title.trim() && description.trim() ? 0.98 : 1 }}
          >
            Create Goal
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}

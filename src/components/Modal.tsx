import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title: string
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-ink-800">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-ink-100/40 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

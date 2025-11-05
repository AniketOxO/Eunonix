import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { useAuthStore } from '@/store/useAuthStore'

export function AuthPrompt() {
  const navigate = useNavigate()
  const { authPrompt, clearAuthPrompt } = useAuthStore((state) => ({
    authPrompt: state.authPrompt,
    clearAuthPrompt: state.clearAuthPrompt
  }))

  if (!authPrompt) {
    return null
  }

  const handleAction = (route?: string) => {
    clearAuthPrompt()
    if (!route) {
      return
    }
    navigate(route)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-xl border border-ink-100/20 shadow-2xl overflow-hidden"
        >
          <div className="p-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-lilac-500 font-semibold mb-2">
                  {authPrompt.mode === 'auth' ? 'Preview Mode' : 'Plan Limitation'}
                </p>
                <h2 className="text-3xl font-light text-ink-900">
                  {authPrompt.title}
                </h2>
              </div>
              <button
                onClick={() => clearAuthPrompt()}
                className="text-ink-400 hover:text-ink-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-ink-600 text-base leading-relaxed">
              {authPrompt.message}
            </p>

            <div className="bg-lilac-50/60 border border-lilac-100/50 rounded-2xl p-4">
              <p className="text-sm text-ink-600">
                {authPrompt.mode === 'auth'
                  ? 'Sign in to unlock saving, syncing, and personalized insights.'
                  : 'Upgrade your plan to continue growing without limits.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <Button
                variant={authPrompt.secondaryAction?.variant ?? 'ghost'}
                onClick={() => handleAction(authPrompt.secondaryAction?.route)}
                className="w-full sm:w-auto"
              >
                {authPrompt.secondaryAction?.label ?? 'Maybe later'}
              </Button>
              <Button
                variant={authPrompt.primaryAction?.variant ?? 'primary'}
                onClick={() => handleAction(authPrompt.primaryAction?.route ?? '/login')}
                className="w-full sm:w-auto"
              >
                {authPrompt.primaryAction?.label ?? 'Sign In'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

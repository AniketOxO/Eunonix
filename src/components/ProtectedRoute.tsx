import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { useAuthStore } from '@/store/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [showModal, setShowModal] = useState(!isAuthenticated)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setShowModal(!isAuthenticated)
  }, [isAuthenticated])

  const handleSignInClick = () => {
    navigate('/login')
  }

  const handlePreview = () => {
    setShowPreview(true)
    setShowModal(false)
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show preview mode with banner
  if (showPreview) {
    return (
      <>
        {/* Preview Banner */}
        <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-lilac-200/30 py-4 px-6 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-lilac-100 to-purple-100 rounded-full">
                <svg className="w-4 h-4 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium text-lilac-700 text-sm">Preview Mode</span>
              </div>
              <span className="text-ink-600 text-sm hidden sm:block">Sign in to unlock all features</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/login')}
                size="sm"
                className="bg-gradient-to-r from-lilac-500 to-purple-500 hover:from-lilac-600 hover:to-purple-600 text-white shadow-md"
              >
                Sign In
              </Button>
              <button
                onClick={() => {
                  setShowPreview(false)
                  navigate('/')
                }}
                className="text-ink-400 hover:text-ink-600 transition-colors p-1"
                aria-label="Close preview"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Dashboard with top padding for banner */}
        <div className="pt-16">
          {children}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Show dashboard in background with blur */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>

      {/* Sign-in Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 max-w-md w-full border border-ink-100/20 shadow-2xl"
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-lilac-400 via-sand-300 to-golden-400 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Content */}
              <h2 className="text-3xl font-light text-ink-900 text-center mb-3">
                Welcome to LifeOS
              </h2>
              <p className="text-ink-600 text-center mb-8">
                Your journey to self-discovery awaits
              </p>

              {/* Preview message */}
              <div className="bg-lilac-50/50 rounded-2xl p-4 mb-8 border border-lilac-100/30">
                <p className="text-sm text-ink-700 text-center">
                  Sign in to unlock all features, or preview the dashboard to explore.
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSignInClick}
                  className="w-full"
                >
                  Sign In & Continue
                </Button>
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


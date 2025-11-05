import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { useAuthStore } from '@/store/useAuthStore'

export default function Signup() {
  const navigate = useNavigate()
  const signUp = useAuthStore((state) => state.signUp)
  const socialSignIn = useAuthStore((state) => state.socialSignIn)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState<'google' | 'github' | null>(null)
  const [socialEmail, setSocialEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setErrorMessage('')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match!')
      return
    }

    if (!agreedToTerms) {
      setErrorMessage('Please agree to the terms and conditions')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    try {
      const displayName = formData.name.trim() || 'Explorer'
      await signUp(formData.email, formData.password, displayName, { remember: true })
      navigate('/dashboard')
    } catch (error) {
      console.error('Signup failed:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setShowSocialModal('google')
  }

  const handleGitHubSignIn = async () => {
    setShowSocialModal('github')
  }

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socialEmail) return
    
    setIsLoading(true)
    setErrorMessage('')
    try {
      const emailName = socialEmail.split('@')[0]
      const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ')
      
      const userData = {
        email: socialEmail,
        name: displayName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
      }
      await socialSignIn(showSocialModal!, userData, { remember: true })
      navigate('/dashboard')
    } catch (error) {
      console.error('Social sign-in failed:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in with that provider. Please try again.')
    } finally {
      setIsLoading(false)
      setShowSocialModal(null)
      setSocialEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-lilac-50 to-golden-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-lilac-400 via-sand-300 to-golden-400 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-3xl font-light text-ink-900 mb-2">Create your account</h1>
          <p className="text-ink-600">Start your journey to self-improvement</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-ink-100/20 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-lilac-400 focus:border-transparent transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-lilac-400 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-lilac-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-ink-500">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-lilac-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-ink-300 text-lilac-500 focus:ring-lilac-400"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-ink-700">
                I agree to the{' '}
                <button type="button" className="text-lilac-600 hover:text-lilac-700">
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button type="button" className="text-lilac-600 hover:text-lilac-700">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {errorMessage}
              </div>
            )}

            {/* Signup Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/60 text-ink-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-3 rounded-xl border border-ink-200 bg-white/50 hover:bg-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm text-ink-700">Google</span>
              </button>
              <button
                type="button"
                onClick={handleGitHubSignIn}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-3 rounded-xl border border-ink-200 bg-white/50 hover:bg-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm text-ink-700">GitHub</span>
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-ink-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-lilac-600 hover:text-lilac-700 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-ink-600 hover:text-ink-900 transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </motion.div>

      {/* Social Sign-In Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              {showSocialModal === 'google' ? (
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              <h2 className="text-2xl font-light text-ink-900">
                Sign in with {showSocialModal === 'google' ? 'Google' : 'GitHub'}
              </h2>
            </div>
            
            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div>
                <label htmlFor="social-email" className="block text-sm font-medium text-ink-700 mb-2">
                  Enter your {showSocialModal === 'google' ? 'Google' : 'GitHub'} email
                </label>
                <input
                  type="email"
                  id="social-email"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-lilac-400 focus:border-transparent transition-all"
                  placeholder={showSocialModal === 'google' ? 'you@gmail.com' : 'you@github.com'}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowSocialModal(null)
                    setSocialEmail('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Continue'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}


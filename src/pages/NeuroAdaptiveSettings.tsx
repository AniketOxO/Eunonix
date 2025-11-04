import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNeuroAdaptive } from '@/hooks/useNeuroAdaptive'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'

const NeuroAdaptiveSettings = () => {
  const navigate = useNavigate()
  const {
    emotionMetrics,
    adaptiveTheme,
    isEnabled,
    toggleNeuroAdaptive,
    setPermission,
    getPermissions,
    resetDetection,
    emotionalState,
    cognitiveLoad,
    isAdapting
  } = useNeuroAdaptive()

  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const permissions = getPermissions()

  const emotionColors: Record<string, string> = {
    calm: 'from-blue-400 to-indigo-400',
    anxious: 'from-teal-400 to-green-400',
    focused: 'from-slate-400 to-gray-400',
    stressed: 'from-emerald-400 to-lime-400',
    excited: 'from-amber-400 to-orange-400',
    fatigued: 'from-stone-400 to-neutral-400',
    neutral: 'from-lilac-400 to-golden-400'
  }

  const emotionDescriptions: Record<string, string> = {
    calm: 'Relaxed and at peace',
    anxious: 'Experiencing heightened alertness',
    focused: 'Deep concentration mode',
    stressed: 'High cognitive load detected',
    excited: 'Energized and engaged',
    fatigued: 'Low energy levels',
    neutral: 'Balanced baseline state'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-lilac-50 to-sand-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sand-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.75v.75h4.5v-.75a2.25 2.25 0 014.5 0v.75h2.25a.75.75 0 01.75.75v15a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-15a.75.75 0 01.75-.75H6v-.75a2.25 2.25 0 014.5 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 15.75c.621-1.5 2.074-2.25 3.75-2.25s3.129.75 3.75 2.25" />
              </svg>
              <h1 className="text-2xl font-light text-ink-800">Neuro-Adaptive Interface</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`bg-gradient-to-r ${emotionColors[emotionalState]} p-6 rounded-2xl text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-light mb-1">
                  {isEnabled ? 'Interface Synchronized' : 'Neuro-Adaptive Disabled'}
                </h2>
                <p className="text-white/90 text-sm">
                  {isEnabled ? emotionDescriptions[emotionalState] : 'System is in manual mode'}
                </p>
              </div>
              <button
                onClick={toggleNeuroAdaptive}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isEnabled
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-white text-ink-800 hover:bg-white/90'
                }`}
              >
                {isEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            
            {isEnabled && emotionMetrics && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs text-white/70 mb-1">Emotional State</p>
                  <p className="text-lg font-medium capitalize">{emotionalState}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs text-white/70 mb-1">Cognitive Load</p>
                  <p className="text-lg font-medium capitalize">{emotionMetrics.cognitiveLoad}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs text-white/70 mb-1">Confidence</p>
                  <p className="text-lg font-medium">{Math.round(cognitiveLoad * 100)}%</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Privacy & Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-medium text-ink-800 mb-2">Privacy Controls</h3>
              <p className="text-sm text-ink-600">
                All processing happens locally on your device. No data is ever sent to servers.
              </p>
            </div>
            <Button variant="ghost" onClick={() => setShowPermissionsModal(true)}>
              Manage
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border-2 transition-all ${
              permissions.typing
                ? 'border-green-200 bg-green-50'
                : 'border-sand-200 bg-sand-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink-800">Typing Analysis</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  permissions.typing ? 'bg-green-200 text-green-800' : 'bg-sand-200 text-ink-600'
                }`}>
                  {permissions.typing ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-ink-600">Analyzes typing rhythm and patterns</p>
            </div>

            <div className={`p-4 rounded-xl border-2 transition-all ${
              permissions.interaction
                ? 'border-green-200 bg-green-50'
                : 'border-sand-200 bg-sand-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink-800">Interaction Tracking</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  permissions.interaction ? 'bg-green-200 text-green-800' : 'bg-sand-200 text-ink-600'
                }`}>
                  {permissions.interaction ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-ink-600">Monitors mouse and scroll behavior</p>
            </div>

            <div className={`p-4 rounded-xl border-2 transition-all ${
              permissions.audio
                ? 'border-green-200 bg-green-50'
                : 'border-sand-200 bg-sand-50 opacity-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink-800">Audio Analysis</span>
                <span className="text-xs px-2 py-1 rounded-full bg-sand-200 text-ink-600">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-ink-600">Detects vocal patterns and tone</p>
            </div>

            <div className={`p-4 rounded-xl border-2 transition-all ${
              permissions.webcam
                ? 'border-green-200 bg-green-50'
                : 'border-sand-200 bg-sand-50 opacity-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink-800">Facial Analysis</span>
                <span className="text-xs px-2 py-1 rounded-full bg-sand-200 text-ink-600">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-ink-600">Reads facial expressions (optional)</p>
            </div>
          </div>
        </motion.div>

        {/* Current Adaptations */}
        {isEnabled && isAdapting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-6 mb-6"
          >
            <h3 className="text-xl font-medium text-ink-800 mb-4">Active Adaptations</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                <div>
                  <p className="font-medium text-ink-800">Interface Spacing</p>
                  <p className="text-sm text-ink-600">Layout density adjusted for comfort</p>
                </div>
                <span className="px-3 py-1 bg-lilac-100 text-lilac-700 rounded-full text-sm font-medium capitalize">
                  {adaptiveTheme.spacing}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                <div>
                  <p className="font-medium text-ink-800">Animation Speed</p>
                  <p className="text-sm text-ink-600">Transitions match your cognitive load</p>
                </div>
                <span className="px-3 py-1 bg-lilac-100 text-lilac-700 rounded-full text-sm font-medium capitalize">
                  {adaptiveTheme.animationSpeed}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                <div>
                  <p className="font-medium text-ink-800">Minimal Mode</p>
                  <p className="text-sm text-ink-600">Reducing distractions when needed</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  adaptiveTheme.minimalMode
                    ? 'bg-green-100 text-green-700'
                    : 'bg-sand-100 text-ink-600'
                }`}>
                  {adaptiveTheme.minimalMode ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                <div>
                  <p className="font-medium text-ink-800">Sound Volume</p>
                  <p className="text-sm text-ink-600">Adjusted for your current state</p>
                </div>
                <span className="px-3 py-1 bg-lilac-100 text-lilac-700 rounded-full text-sm font-medium">
                  {Math.round(adaptiveTheme.soundVolume * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                <div>
                  <p className="font-medium text-ink-800">Notifications</p>
                  <p className="text-sm text-ink-600">Auto-disabled during focus</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  adaptiveTheme.showNotifications
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {adaptiveTheme.showNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-6"
        >
          <h3 className="text-xl font-medium text-ink-800 mb-4">How It Works</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-lilac-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-ink-800 mb-1">Continuous Analysis</p>
                <p className="text-sm text-ink-600">
                  Monitors your typing rhythm, mouse movements, and interaction patterns in real-time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-lilac-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-ink-800 mb-1">Emotion Detection</p>
                <p className="text-sm text-ink-600">
                  Uses behavioral patterns to infer your emotional and cognitive state with high accuracy.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-lilac-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-ink-800 mb-1">Adaptive Response</p>
                <p className="text-sm text-ink-600">
                  Automatically adjusts colors, spacing, sounds, and features to support your current needs.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-lilac-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-ink-800 mb-1">Privacy First</p>
                <p className="text-sm text-ink-600">
                  All processing happens locally on your device. Zero data transmission. Full control.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-sand-200">
            <Button variant="ghost" onClick={resetDetection} className="w-full">
              Reset Detection & Calibrate
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title="Privacy & Permissions"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-600 mb-4">
            Control what data sources the Neuro-Adaptive system can access. All processing is local.
          </p>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-sand-50 rounded-xl cursor-pointer hover:bg-sand-100 transition-colors">
              <div>
                <p className="font-medium text-ink-800">Typing Analysis</p>
                <p className="text-xs text-ink-600">Monitor keystroke patterns</p>
              </div>
              <input
                type="checkbox"
                checked={permissions.typing}
                onChange={(e) => setPermission('typing', e.target.checked)}
                className="w-5 h-5 rounded border-sand-300 text-lilac-600 focus:ring-lilac-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-sand-50 rounded-xl cursor-pointer hover:bg-sand-100 transition-colors">
              <div>
                <p className="font-medium text-ink-800">Interaction Tracking</p>
                <p className="text-xs text-ink-600">Monitor mouse and scroll behavior</p>
              </div>
              <input
                type="checkbox"
                checked={permissions.interaction}
                onChange={(e) => setPermission('interaction', e.target.checked)}
                className="w-5 h-5 rounded border-sand-300 text-lilac-600 focus:ring-lilac-500"
              />
            </label>

            <div className="p-4 bg-sand-50 rounded-xl opacity-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-800">Audio Analysis</p>
                  <p className="text-xs text-ink-600">Coming soon</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  className="w-5 h-5 rounded border-sand-300"
                />
              </div>
            </div>

            <div className="p-4 bg-sand-50 rounded-xl opacity-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-800">Facial Analysis</p>
                  <p className="text-xs text-ink-600">Coming soon</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  className="w-5 h-5 rounded border-sand-300"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-sand-200">
            <Button onClick={() => setShowPermissionsModal(false)} className="w-full">
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default NeuroAdaptiveSettings

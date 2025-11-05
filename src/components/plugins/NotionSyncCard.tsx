import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

interface SyncTargets {
  journal: boolean
  goals: boolean
  habits: boolean
  plans: boolean
}

const initialTargets: SyncTargets = {
  journal: true,
  goals: true,
  habits: false,
  plans: false,
}

interface NotionSyncCardProps {
  highlighted?: boolean
}

export const NotionSyncCard = ({ highlighted = false }: NotionSyncCardProps) => {
  const { reflections, goals, habits, dayPlans, lastSync, setLastSync } = useAppStore()
  const [workspaceUrl, setWorkspaceUrl] = useState('https://www.notion.so/eunonix/command-center')
  const [databaseId, setDatabaseId] = useState('Eunonix-Emotional-Graph')
  const [targets, setTargets] = useState(initialTargets)
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success'>('idle')
  const [log, setLog] = useState<string[]>([])

  const planEntries = useMemo(() => Object.values(dayPlans), [dayPlans])
  const pendingCounts = useMemo(() => ({
    journal: reflections.length,
    goals: goals.length,
    habits: habits.length,
    plans: planEntries.length,
  }), [reflections.length, goals.length, habits.length, planEntries.length])

  const formattedLastSync = useMemo(() => {
    if (!lastSync) return 'Never'
    const parsed = new Date(lastSync)
    return Number.isNaN(parsed.getTime()) ? 'Never' : parsed.toLocaleString()
  }, [lastSync])

  const toggleTarget = (key: keyof SyncTargets) => {
    setTargets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSync = () => {
    if (status === 'syncing') return

    const enabledTargets = Object.entries(targets).filter(([, enabled]) => enabled)
    if (enabledTargets.length === 0) {
      setLog((prev) => ['Select at least one data stream to sync.', ...prev])
      return
    }

    setStatus('syncing')
    const start = new Date()
    setLog((prev) => [`Sync started at ${start.toLocaleTimeString()}`, ...prev])

    window.setTimeout(() => {
      const successLines = enabledTargets.map(([key]) => `• ${key} → pushed ${pendingCounts[key as keyof SyncTargets]} entries`)
      const nextSync = new Date()
      setLastSync(nextSync)
      setLog((prev) => [
        `Sync completed at ${nextSync.toLocaleTimeString()}`,
        ...successLines,
        ...prev,
      ])
      setStatus('success')
      window.setTimeout(() => setStatus('idle'), 2400)
    }, 1500)
  }

  return (
    <motion.div
      className={`bg-white/55 backdrop-blur-md rounded-2xl border border-ink-200/30 p-6 flex flex-col gap-5 ${highlighted ? 'ring-2 ring-lilac-400/70 shadow-xl animate-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Notion Sync</p>
          <h3 className="text-xl font-medium text-ink-900">Bi-directional Knowledge Link</h3>
          <p className="text-sm text-ink-500 mt-1 max-w-md">Push your Eunonix reflections, goals, and habit telemetry directly into your Notion workspace.</p>
        </div>
        <div className="px-3 py-2 rounded-xl bg-white/70 border border-ink-200/40 text-xs text-ink-500">
          Last sync:{' '}
          <span className="font-semibold text-ink-700">{formattedLastSync}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink-400">Workspace URL</label>
          <input
            value={workspaceUrl}
            onChange={(event) => setWorkspaceUrl(event.target.value)}
            className="w-full rounded-xl border border-ink-200/30 bg-white/70 px-4 py-3 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-lilac-400"
          />
          <label className="text-xs font-semibold uppercase tracking-widest text-ink-400">Database reference</label>
          <input
            value={databaseId}
            onChange={(event) => setDatabaseId(event.target.value)}
            className="w-full rounded-xl border border-ink-200/30 bg-white/70 px-4 py-3 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-lilac-400"
          />
        </div>

        <div className="rounded-2xl bg-white/70 border border-ink-200/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Data streams</p>
          <div className="space-y-3 text-sm text-ink-600">
            {(['journal', 'goals', 'habits', 'plans'] as Array<keyof SyncTargets>).map((key) => (
              <label key={key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-800 capitalize">{key}</p>
                  <p className="text-xs text-ink-400">{pendingCounts[key]} entries ready</p>
                </div>
                <button
                  onClick={() => toggleTarget(key)}
                  className={`w-12 h-6 rounded-full border transition-all ${targets[key] ? 'bg-gradient-to-r from-ink-600 to-lilac-500 border-transparent' : 'bg-white border-ink-200/40'}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transform transition-all ${targets[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-ink-500">
        <div className="flex items-center gap-2">
          <span className={`inline-flex w-2 h-2 rounded-full ${status === 'syncing' ? 'bg-amber-400 animate-pulse' : status === 'success' ? 'bg-emerald-500' : 'bg-ink-200'}`} />
          <span>{status === 'syncing' ? 'Sync in progress...' : status === 'success' ? 'Workspace updated' : 'Ready to sync'}</span>
        </div>
        <button
          onClick={handleSync}
          className={`px-5 py-3 rounded-xl text-sm font-medium text-white transition-shadow ${status === 'syncing' ? 'bg-gradient-to-r from-ink-500 to-ink-600 opacity-80 cursor-not-allowed' : 'bg-gradient-to-r from-ink-600 via-lilac-500 to-lilac-400 shadow-lg hover:shadow-xl'}`}
          disabled={status === 'syncing'}
        >
          {status === 'syncing' ? 'Synchronising...' : 'Sync to Notion'}
        </button>
      </div>

      <div className="rounded-2xl bg-white/70 border border-ink-200/30 p-4 max-h-48 overflow-y-auto text-xs text-ink-500">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Activity log</p>
        <AnimatePresence initial={false}>
          {log.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No sync events yet. Your next sync will appear here.
            </motion.p>
          ) : (
            log.map((entry, index) => (
              <motion.p
                key={`${entry}-${index}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-1"
              >
                {entry}
              </motion.p>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

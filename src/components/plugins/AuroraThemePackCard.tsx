import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { THEME_PRESETS, applyThemeToDocument } from '@/config/themes'

interface AuroraThemePackCardProps {
  highlighted?: boolean
  onThemeActivated?: (themeId: string) => void
}

export const AuroraThemePackCard = ({ highlighted = false, onThemeActivated }: AuroraThemePackCardProps) => {
  const { activeThemeId, setActiveTheme } = useAppStore()

  const activeTheme = useMemo(() => THEME_PRESETS.find((theme) => theme.id === activeThemeId) ?? THEME_PRESETS[0], [activeThemeId])

  return (
    <motion.div
      className={`bg-white/55 backdrop-blur-md rounded-2xl border border-ink-200/30 p-6 flex flex-col gap-4 ${highlighted ? 'ring-2 ring-lilac-400/70 shadow-xl' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Aurora Theme Pack</p>
          <h3 className="text-xl font-medium text-ink-900">Bio-responsive Visual Skins</h3>
          <p className="text-sm text-ink-500 mt-1 max-w-md">Swap the entire Eunonix atmosphere with live gradients, glass textures, and accent hues tuned to your current intent.</p>
        </div>
        <div className="px-3 py-2 rounded-xl bg-white/70 border border-ink-200/40 text-xs text-ink-500">
          Active: <span className="font-semibold text-ink-700">{activeTheme.name}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {THEME_PRESETS.map((theme) => {
          const isActive = theme.id === activeThemeId
          return (
            <button
              key={theme.id}
              onClick={() => {
                setActiveTheme(theme.id)
                onThemeActivated?.(theme.id)
              }}
              onMouseEnter={() => applyThemeToDocument(theme.id)}
              onMouseLeave={() => applyThemeToDocument(activeThemeId)}
              className={`relative overflow-hidden rounded-2xl border px-4 py-5 text-left transition-all ${isActive ? 'border-lilac-400 shadow-lg' : 'border-transparent bg-white/70 hover:border-lilac-200/60'}`}
            >
              <div
                className="absolute inset-0 opacity-80"
                style={{ background: theme.background }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 mix-blend-soft-light" />
              <div className="relative z-10 flex flex-col gap-2 text-white drop-shadow-lg">
                <span className="text-xs uppercase tracking-[0.3em]">{theme.name}</span>
                <p className="text-sm opacity-90 max-w-[220px] leading-relaxed">{theme.description}</p>
              </div>
              {isActive && (
                <span className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-white/80 text-ink-700">Active</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
        <button
          onClick={() => {
            setActiveTheme('default')
            onThemeActivated?.('default')
          }}
          className="px-4 py-3 rounded-xl bg-white/70 hover:bg-white border border-ink-200/40 text-ink-600"
        >
          Reset to default mix
        </button>
        <span>Each palette sets global background, card glass, accent gradients, and glow trails.</span>
      </div>
    </motion.div>
  )
}

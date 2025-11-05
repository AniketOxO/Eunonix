interface ThemePreset {
  id: string
  name: string
  description: string
  background: string
  card: string
  accent: string
  accentGradient: string
  text: string
  neutral: string
  glow: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Soft Daybreak',
    description: 'Calm lilac tones with gentle daylight haze.',
    background: 'linear-gradient(160deg, #f8f5ff 0%, #ffffff 50%, #f3f6ff 100%)',
    card: 'rgba(255, 255, 255, 0.6)',
    accent: '#5b4bb7',
    accentGradient: 'linear-gradient(135deg, #556d8f 0%, #a082c4 100%)',
    text: '#1f2845',
    neutral: '#e3e8f7',
    glow: 'rgba(90, 75, 183, 0.25)'
  },
  {
    id: 'aurora-dawn',
    name: 'Aurora Dawn',
    description: 'Rose-gold horizon with dawn sparkles and warm highlights.',
    background: 'linear-gradient(165deg, #ffe7f3 0%, #fff5e7 45%, #f7f9ff 100%)',
    card: 'rgba(255, 248, 243, 0.65)',
    accent: '#f06292',
    accentGradient: 'linear-gradient(130deg, #ff7ca3 0%, #ffb677 100%)',
    text: '#43283a',
    neutral: '#ffe3ef',
    glow: 'rgba(255, 140, 180, 0.28)'
  },
  {
    id: 'aurora-nocturne',
    name: 'Aurora Nocturne',
    description: 'Midnight indigo with aurora greens for deep focus.',
    background: 'linear-gradient(155deg, #0f172a 0%, #1e2b4e 55%, #102b3f 100%)',
    card: 'rgba(20, 32, 56, 0.72)',
    accent: '#38bdf8',
    accentGradient: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)',
    text: '#e0f2fe',
    neutral: '#1f2937',
    glow: 'rgba(56, 189, 248, 0.32)'
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Glacial teal with violet arcs inspired by polar light.',
    background: 'linear-gradient(150deg, #0d2537 0%, #123b55 45%, #1f1b3a 100%)',
    card: 'rgba(16, 42, 64, 0.7)',
    accent: '#67e8f9',
    accentGradient: 'linear-gradient(135deg, #34d399 0%, #8b5cf6 100%)',
    text: '#e2f8fb',
    neutral: '#102a40',
    glow: 'rgba(103, 232, 249, 0.35)'
  },
  {
    id: 'aurora-solstice',
    name: 'Aurora Solstice',
    description: 'Golden sunset meeting lavender dusk for reflective evenings.',
    background: 'linear-gradient(165deg, #fff1db 0%, #f6e0ff 50%, #e3f0ff 100%)',
    card: 'rgba(255, 245, 233, 0.68)',
    accent: '#f97316',
    accentGradient: 'linear-gradient(130deg, #f97316 0%, #b453ff 100%)',
    text: '#3b2d30',
    neutral: '#fde7cc',
    glow: 'rgba(249, 115, 22, 0.28)'
  }
]

export const applyThemeToDocument = (themeId: string) => {
  if (typeof document === 'undefined') return

  const theme = THEME_PRESETS.find((preset) => preset.id === themeId) ?? THEME_PRESETS[0]
  const root = document.documentElement

  root.style.setProperty('--eunonix-background', theme.background)
  root.style.setProperty('--eunonix-card', theme.card)
  root.style.setProperty('--eunonix-accent', theme.accent)
  root.style.setProperty('--eunonix-accent-gradient', theme.accentGradient)
  root.style.setProperty('--eunonix-text', theme.text)
  root.style.setProperty('--eunonix-neutral', theme.neutral)
  root.style.setProperty('--eunonix-glow', theme.glow)
  root.setAttribute('data-eunonix-theme', theme.id)
}

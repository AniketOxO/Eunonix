import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TONE_PRESETS = [
  {
    id: 'calm',
    label: 'Calm & Reassuring',
    description: 'Soften commands into invitations, emphasise steadiness and safety.',
    lead: 'Here is a gentler framing you can use:',
    replacements: new Map<string, string>([
      ['need', 'could'],
      ['must', 'might want to'],
      ['now', 'in this moment'],
      ['urgent', 'important'],
      ['problem', 'situation']
    ]),
    addOns: ['Take a slow breath with me.', 'We can move at a comfortable pace.']
  },
  {
    id: 'direct',
    label: 'Direct & Focused',
    description: 'Remove fluff, highlight action verbs, keep sentences punchy.',
    lead: 'Use this concise version:',
    replacements: new Map<string, string>([
      ['maybe', ''],
      ['try to', ''],
      ['perhaps', ''],
      ['I think', ''],
      ['would', 'will']
    ]),
    addOns: ['Here is the next concrete step.', 'Let’s move this forward.']
  },
  {
    id: 'empathetic',
    label: 'Empathetic & Supportive',
    description: 'Mirror feelings, validate effort, and invite collaboration.',
    lead: 'Try this compassionate rewrite:',
    replacements: new Map<string, string>([
      ['deadline', 'milestone'],
      ['delay', 'pause'],
      ['concern', 'question'],
      ['issue', 'moment'],
      ['task', 'step']
    ]),
    addOns: ['I’m right here with you.', 'Your effort really matters and it shows.']
  },
  {
    id: 'bold',
    label: 'Bold & Energetic',
    description: 'Increase intensity, add power verbs, amplify confidence.',
    lead: 'Tap into this energetic phrasing:',
    replacements: new Map<string, string>([
      ['try', 'ignite'],
      ['improve', 'elevate'],
      ['start', 'launch'],
      ['help', 'power'],
      ['plan', 'master plan']
    ]),
    addOns: ['Let’s light this up.', 'Momentum is already building.']
  },
  {
    id: 'professional',
    label: 'Professional & Polished',
    description: 'Follow executive tone, stay precise, sign off with clarity.',
    lead: 'Here is the polished revision:',
    replacements: new Map<string, string>([
      ['fix', 'resolve'],
      ['get', 'secure'],
      ['deal with', 'address'],
      ['fast', 'prompt'],
      ['soon', 'at your earliest convenience']
    ]),
    addOns: ['Please let me know if any additional detail is required.', 'Thank you for the thoughtful collaboration.']
  }
] as const

type ToneId = typeof TONE_PRESETS[number]['id']

type ComplexityLevel = 1 | 2 | 3 | 4 | 5

const SAMPLE_TEXT = 'Hey team, we need the launch copy tightened up. It feels too formal and I am worried it may not connect. Can we make it clearer without losing the main points?'

const sanitizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

const toSentences = (input: string) => sanitizeWhitespace(input)
  .split(/(?<=[.!?])\s+/)
  .filter(Boolean)

const applyReplacementMap = (text: string, map: Map<string, string>) => {
  let output = text
  map.forEach((replacement, target) => {
    const regex = new RegExp(`\\b${target}\\b`, 'gi')
    output = output.replace(regex, (match) => {
      if (!replacement) return ''
      const isCapitalized = match[0] === match[0].toUpperCase()
      return isCapitalized
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement
    })
  })
  return output
}

const softenForComplexity = (sentence: string, complexity: ComplexityLevel) => {
  if (complexity >= 3) return sentence

  // Lower complexity: shorten average sentence length
  const trimmed = sentence.replace(/,/g, ' and')
  if (complexity === 1) {
    return trimmed.replace(/\b(that|which|because)\b/gi, '').trim()
  }
  return trimmed
}

const enrichForComplexity = (sentence: string, complexity: ComplexityLevel) => {
  if (complexity <= 3) return sentence
  const modifiers = [
    'with intention',
    'in practical terms',
    'with a clear next action',
    'with measurable progress',
    'supported by the data'
  ]
  const addOn = modifiers[(complexity - 3) % modifiers.length]
  if (sentence.toLowerCase().includes(addOn)) return sentence
  return `${sentence.replace(/[.?!]+$/, '')}, ${addOn}.`
}

const generateRewrite = (text: string, toneId: ToneId, complexity: ComplexityLevel) => {
  const preset = TONE_PRESETS.find((item) => item.id === toneId) ?? TONE_PRESETS[0]
  const sentences = toSentences(text)
  if (sentences.length === 0) return ''

  const transformed = sentences.map((sentence, index) => {
    let working = sentence

    working = applyReplacementMap(working, preset.replacements)
    working = complexity <= 3 ? softenForComplexity(working, complexity) : enrichForComplexity(working, complexity)

    if (toneId === 'empathetic' && index === 0) {
      working = `I hear what you are sensing. ${working}`
    }

    if (toneId === 'bold') {
      working = working.replace(/\b(can|could|might)\b/gi, 'will')
      working = working.replace(/\bmaybe\b/gi, 'absolutely')
    }

    if (toneId === 'professional') {
      working = working.replace(/\bhey\b/gi, 'Hello')
      working = working.replace(/\bguys\b/gi, 'team')
    }

    // Ensure terminal punctuation
    if (!/[.!?]$/.test(working)) {
      working = `${working}.`
    }

    return working.replace(/\s+/g, ' ').trim()
  })

  const assembled = transformed.join(' ')
  const outro = preset.addOns[complexity % preset.addOns.length]
  return `${preset.lead}\n\n${assembled}\n\n${outro}`
}

const countWords = (input: string) => sanitizeWhitespace(input).split(' ').filter(Boolean).length

const calcReadingTime = (words: number) => Math.max(1, Math.round(words / 200))

const calcSentenceLength = (input: string) => {
  const sentences = toSentences(input)
  if (!sentences.length) return 0
  return Math.round(countWords(input) / sentences.length)
}

interface ToneTunerCardProps {
  highlighted?: boolean
}

export const ToneTunerCard = ({ highlighted = false }: ToneTunerCardProps) => {
  const [tone, setTone] = useState<ToneId>('calm')
  const [complexity, setComplexity] = useState<ComplexityLevel>(3)
  const [input, setInput] = useState(SAMPLE_TEXT)
  const [output, setOutput] = useState(() => generateRewrite(SAMPLE_TEXT, 'calm', 3))

  const metrics = useMemo(() => {
    const words = countWords(input)
    return {
      words,
      readingTime: calcReadingTime(words),
      sentenceLength: calcSentenceLength(input)
    }
  }, [input])

  const handleRewrite = () => {
    if (!input.trim()) return
    setOutput(generateRewrite(input, tone, complexity))
  }

  const tonePreset = useMemo(() => TONE_PRESETS.find((item) => item.id === tone) ?? TONE_PRESETS[0], [tone])

  return (
    <motion.div
      className={`bg-white/50 backdrop-blur-md rounded-2xl border border-ink-200/30 p-6 flex flex-col ${highlighted ? 'ring-2 ring-lilac-400/70 shadow-xl' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-400">Tone Tuner</p>
          <h3 className="text-xl font-medium text-ink-900">Adaptive Copy Refinement</h3>
          <p className="text-sm text-ink-500 mt-1 max-w-sm">Select a tone and complexity to instantly reshape your writing.</p>
        </div>
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-ink-400/20 to-lilac-400/20 flex items-center justify-center"
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          <svg className="w-6 h-6 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-4 mb-4">
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-400">Original message</label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full min-h-[140px] rounded-xl border border-ink-200/40 bg-white/70 px-4 py-3 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-lilac-400"
            placeholder="Paste the message you want to reshape..."
          />
          <div className="flex items-center gap-4 text-xs text-ink-500">
            <span>{metrics.words} words</span>
            <span>•</span>
            <span>{metrics.sentenceLength} words / sentence</span>
            <span>•</span>
            <span>{metrics.readingTime} min read</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-400">Tone palette</label>
          <div className="grid grid-cols-2 gap-2">
            {TONE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setTone(preset.id)}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${tone === preset.id ? 'border-lilac-400 bg-white shadow-md' : 'border-transparent bg-white/70 hover:border-lilac-200'}`}
              >
                <p className="text-sm font-medium text-ink-800">{preset.label}</p>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">{preset.description}</p>
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-ink-400">Complexity</label>
              <span className="text-xs text-ink-500">{complexity} / 5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={complexity}
              onChange={(event) => setComplexity(Number(event.target.value) as ComplexityLevel)}
              className="w-full accent-lilac-500"
            />
            <p className="text-xs text-ink-500 mt-2">
              {complexity <= 2 && 'Simplify phrasing and shorten sentences.'}
              {complexity === 3 && 'Balanced clarity with natural cadence.'}
              {complexity >= 4 && 'Add structure, nuance, and strategic detail.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleRewrite}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-ink-600 via-lilac-500 to-lilac-400 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Generate rewrite
        </button>
        <button
          onClick={() => {
            setInput(SAMPLE_TEXT)
            setOutput(generateRewrite(SAMPLE_TEXT, tone, complexity))
          }}
          className="px-4 py-3 rounded-xl text-sm text-ink-400 hover:text-ink-600"
        >
          Load example
        </button>
      </div>

      <div className="relative bg-white/70 border border-ink-200/30 rounded-2xl p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${tone}-${complexity}-${output}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-sm leading-relaxed text-ink-700 whitespace-pre-line"
          >
            {output}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs text-ink-500">
        <div className="rounded-xl bg-white/60 border border-ink-200/30 p-3">
          <p className="font-semibold text-ink-700">Suggested opener</p>
          <p className="mt-1">{tonePreset.addOns[0]}</p>
        </div>
        <div className="rounded-xl bg-white/60 border border-ink-200/30 p-3">
          <p className="font-semibold text-ink-700">Suggested closer</p>
          <p className="mt-1">{tonePreset.addOns[1 % tonePreset.addOns.length]}</p>
        </div>
        <div className="rounded-xl bg-white/60 border border-ink-200/30 p-3">
          <p className="font-semibold text-ink-700">Clarity focus</p>
          <p className="mt-1">{tonePreset.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

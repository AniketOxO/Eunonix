import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '@/components/GlassCard'
import { BreathingOrb } from '@/components/BreathingOrb'
import { PulseLine } from '@/components/PulseLine'
import { Button } from '@/components/Button'
import { ProfileDropdown } from '@/components/ProfileDropdown'
import { BreatheAICard } from '@/components/plugins/BreatheAICard'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { deriveEnergyLevel } from '@/utils/energy'
import { emotionEngine, EmotionMetrics, EmotionalState } from '@/utils/emotionDetection'
import { emotionLabels, formatDate, getTimeOfDayGreeting } from '@/utils/emotions'
import type { EmotionType } from '@/types'

type ActionId = 'breathing' | 'plan' | 'journal' | 'restore' | 'focus' | 'connect'

interface GuidanceAction {
	id: ActionId
	label: string
	annotation: string
}

interface GuidanceProfile {
	headline: string
	description: string
	keyNeed: string
	loadMessage: string
	caution?: string
	actions: GuidanceAction[]
}

const ACTION_LABELS: Record<ActionId, string> = {
	breathing: 'Guided breathing',
	plan: 'Re-align plan',
	journal: 'Micro reflection',
	restore: 'Sensory reset',
	focus: 'Focus sprint',
	connect: 'Talk it through',
}

const EMOTION_BLUEPRINT: Record<EmotionalState, { headline: string; keyNeed: string; description: string; actions: ActionId[] }> = {
	stressed: {
		headline: 'Stabilise the nervous system first',
		keyNeed: 'Downshift the stress response before making decisions.',
		description: 'Typing rhythm and interaction spikes suggest sympathetic activation. Ground yourself, then tidy the day plan.',
		actions: ['breathing', 'plan', 'journal'],
	},
	anxious: {
		headline: 'Create safety and clarity',
		keyNeed: 'Soothe the nervous system and name the worry to reduce mental loops.',
		description: 'Erratic inputs point to anticipatory tension. Pair breathwork with a brief reflection to regain agency.',
		actions: ['breathing', 'journal', 'plan'],
	},
	focused: {
		headline: 'Protect the current flow-state',
		keyNeed: 'Channel focus into the most leverage work while momentum is high.',
		description: 'Signals show clean cadence and steady interaction. Direct that clarity into one defined outcome.',
		actions: ['focus', 'plan', 'breathing'],
	},
	fatigued: {
		headline: 'Prioritise recovery cues',
		keyNeed: 'Introduce micro-rest or sensory resets to restore baseline energy.',
		description: 'Extended pauses and reduced interaction speed indicate energy debt. Reset before pushing further.',
		actions: ['restore', 'breathing', 'plan'],
	},
	excited: {
		headline: 'Capture and structure momentum',
		keyNeed: 'Translate excitement into a grounded plan to avoid burnout.',
		description: 'High tempo inputs suggest creative surge. Anchor it with a clear focus target and quick journaling.',
		actions: ['focus', 'plan', 'journal'],
	},
	calm: {
		headline: 'Lean into steady presence',
		keyNeed: 'Use calm energy for restorative or meaningful work.',
		description: 'Signals show relaxed cadence. Either deepen recovery or ease into gentle creation.',
		actions: ['restore', 'focus', 'plan'],
	},
	neutral: {
		headline: 'Choose an intentional direction',
		keyNeed: 'Nudge the system toward either focus or nourishment.',
		description: 'Signals are balanced. Decide whether to activate or replenish to keep momentum intentional.',
		actions: ['plan', 'focus', 'breathing'],
	},
}

const cognitiveLoadMessage: Record<EmotionMetrics['cognitiveLoad'], string> = {
	low: 'Cognitive load is light—ideal for reflection or gentle creativity.',
	medium: 'Cognitive load is balanced—direct it toward meaningful work.',
	high: 'Cognitive load is high—clear space or break work into smaller moves.',
}

const EMOTION_BRIDGE: Record<EmotionalState, { dominantEmotion: EmotionType; baseEnergy: number; baseClarity: number }> = {
	stressed: { dominantEmotion: 'rest', baseEnergy: 38, baseClarity: 42 },
	anxious: { dominantEmotion: 'rest', baseEnergy: 42, baseClarity: 48 },
	focused: { dominantEmotion: 'motivated', baseEnergy: 68, baseClarity: 74 },
	fatigued: { dominantEmotion: 'rest', baseEnergy: 32, baseClarity: 46 },
	excited: { dominantEmotion: 'motivated', baseEnergy: 64, baseClarity: 60 },
	calm: { dominantEmotion: 'calm', baseEnergy: 56, baseClarity: 62 },
	neutral: { dominantEmotion: 'empathetic', baseEnergy: 50, baseClarity: 55 },
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const formatRelativeTime = (input: Date | string): string => {
	const date = typeof input === 'string' ? new Date(input) : input
	if (Number.isNaN(date.getTime())) {
		return 'unknown'
	}

	const diffMs = Date.now() - date.getTime()
	const diffMinutes = Math.round(diffMs / 60000)

	if (diffMinutes < 1) return 'just now'
	if (diffMinutes < 60) return `${diffMinutes}m ago`

	const diffHours = Math.round(diffMinutes / 60)
	if (diffHours < 24) return `${diffHours}h ago`

	const diffDays = Math.round(diffHours / 24)
	return `${diffDays}d ago`
}

const Dashboard = () => {
	const navigate = useNavigate()
	const { user, isAuthenticated, requireAuth } = useAuthStore((state) => ({
		user: state.user,
		isAuthenticated: state.isAuthenticated,
		requireAuth: state.requireAuth,
	}))

	const {
		mood,
		tasks,
		habits,
		reflections,
		getTodayPlan,
		createDayPlan,
		updateEmotionHue,
		setMood,
	} = useAppStore()

	const todayPlan = getTodayPlan()
	const [metrics, setMetrics] = useState<EmotionMetrics | null>(null)
	const [activeAction, setActiveAction] = useState<ActionId>('breathing')
	const lastKeystrokeRef = useRef<number | null>(null)

	useEffect(() => {
		updateEmotionHue()
	}, [updateEmotionHue])

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const now = Date.now()
			const last = lastKeystrokeRef.current

			if (last && now - last > 2000) {
				emotionEngine.recordPause(now - last)
			}

			emotionEngine.recordKeystroke(now, event.key === 'Backspace' || event.key === 'Delete')
			lastKeystrokeRef.current = now
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		const updateMetrics = () => {
			setMetrics(emotionEngine.getSmoothedEmotion())
		}

		updateMetrics()
		const intervalId = window.setInterval(updateMetrics, 5000)
		return () => window.clearInterval(intervalId)
	}, [])

	const energyInsights = useMemo(() => deriveEnergyLevel({
		mood,
		tasks,
		habits,
		dayPlan: todayPlan ?? undefined,
		reflections,
	}), [mood, tasks, habits, todayPlan, reflections])

		const openTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks])
		const priorityOrder: Record<'high' | 'medium' | 'low', number> = {
			high: 0,
			medium: 1,
			low: 2,
		}
	const topTasks = useMemo(() => {
		return [...openTasks]
			.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3))
			.slice(0, 3)
	}, [openTasks, priorityOrder])

	const topHabits = useMemo(() => {
		return [...habits]
			.sort((a, b) => b.streak - a.streak)
			.slice(0, 3)
	}, [habits])

	const recentReflection = reflections[0] ?? null
	const totalPriorities = todayPlan?.priorities.length ?? 0
	const completedPriorities = todayPlan?.priorities.filter((priority) => priority.completed).length ?? 0
	const planCompletion = totalPriorities > 0
		? Math.round((completedPriorities / totalPriorities) * 100)
		: 0

		const translatedMood = useMemo(() => {
			if (!metrics) {
				return null
			}

				const bridge = EMOTION_BRIDGE[metrics.state]
			const loadAdjustment = metrics.cognitiveLoad === 'low' ? 6 : metrics.cognitiveLoad === 'high' ? -6 : 0
			const confidenceAdjustment = Math.round((metrics.confidence - 0.5) * 18)

			const energyLevel = clamp(bridge.baseEnergy + loadAdjustment + confidenceAdjustment, 20, 90)
			const clarity = clamp(bridge.baseClarity + (metrics.cognitiveLoad === 'high' ? -8 : 0) + confidenceAdjustment, 25, 95)

			return {
				dominantEmotion: bridge.dominantEmotion,
				energyLevel,
				clarity,
				emotions: [
					{
						type: bridge.dominantEmotion,
						intensity: clamp(Math.round(metrics.confidence * 100), 20, 100),
						timestamp: new Date(),
					},
				],
			}
			}, [metrics])

		useEffect(() => {
			if (!translatedMood) {
				return
			}

			const energyDelta = Math.abs(translatedMood.energyLevel - mood.energyLevel)
			const clarityDelta = Math.abs(translatedMood.clarity - mood.clarity)
			const emotionChanged = translatedMood.dominantEmotion !== mood.dominantEmotion

			if (!emotionChanged && energyDelta < 4 && clarityDelta < 6) {
				return
			}

			setMood({
				...translatedMood,
				emotions: [
					...translatedMood.emotions,
					...mood.emotions.slice(0, 4),
				],
			})
		}, [translatedMood, mood, setMood])

	const guidanceProfile: GuidanceProfile = useMemo(() => {
		if (!metrics) {
			return {
				headline: 'Calibrating your emotional pulse',
				description: 'Give it a moment while Eunonix senses your current rhythm.',
				keyNeed: 'Stay curious while signals settle.',
				loadMessage: 'Awaiting cognitive load readout…',
				actions: [
					{
						id: 'breathing',
						label: ACTION_LABELS.breathing,
						annotation: 'Start with a 2 minute Coherent Breathing cycle.',
					},
				],
			}
		}

		const blueprint = EMOTION_BLUEPRINT[metrics.state]
		const baseActions = [...blueprint.actions]

		if (metrics.cognitiveLoad === 'high' && !baseActions.includes('restore')) {
			baseActions.push('restore')
		}

		if (metrics.state !== 'focused' && metrics.state !== 'excited' && !baseActions.includes('connect') && metrics.confidence >= 0.75 && energyInsights.level < 45) {
			baseActions.push('connect')
		}

		const actions: GuidanceAction[] = baseActions.slice(0, 4).map((id) => {
			let annotation = ''
			switch (id) {
				case 'plan': {
					annotation = totalPriorities > 0
						? `${completedPriorities}/${totalPriorities} priorities anchored`
						: 'No priorities logged yet—sketch the top 3 moves.'
					break
				}
				case 'journal': {
					annotation = recentReflection
						? `Last entry ${formatRelativeTime(recentReflection.timestamp)}`
						: 'No reflections today—capture one feeling in 60 seconds.'
					break
				}
				case 'restore': {
					const fatigue = energyInsights.contributions.fatigue
					annotation = fatigue >= 8
						? 'Fatigue markers are high—take a sensory reset.'
						: 'Schedule a 5 minute sensory break to stay even.'
					break
				}
				case 'focus': {
					annotation = openTasks.length
						? `Next up: ${openTasks[0].title}`
						: 'No active tasks—define one clear outcome.'
					break
				}
				case 'connect': {
					annotation = 'Voice what you need with the AI Companion.'
					break
				}
				default: {
					annotation = 'Drop into a guided cadence to reset your baseline.'
				}
			}

			return {
				id,
				label: ACTION_LABELS[id],
				annotation,
			}
		})

		return {
			headline: blueprint.headline,
			description: blueprint.description,
			keyNeed: blueprint.keyNeed,
			loadMessage: cognitiveLoadMessage[metrics.cognitiveLoad],
			caution: metrics.confidence < 0.6
				? 'Signal confidence is still aligning—check back after a few interactions.'
				: undefined,
			actions,
		}
		}, [metrics, energyInsights.contributions.fatigue, energyInsights.level, completedPriorities, totalPriorities, recentReflection, openTasks])

	useEffect(() => {
		if (!guidanceProfile.actions.length) {
			return
		}

		const hasActive = guidanceProfile.actions.some((action) => action.id === activeAction)
		if (!hasActive) {
			setActiveAction(guidanceProfile.actions[0].id)
		}
	}, [guidanceProfile.actions, activeAction])

	const handleNavigation = (path: string, featureName: string) => {
		if (!isAuthenticated) {
			requireAuth(featureName, {
				title: 'Sign in to keep your progress',
				message: `You are in preview mode. Sign in to save your ${featureName.toLowerCase()} data across sessions.`,
			})
		}

		navigate(path)
	}

	const handleActionSelect = (id: ActionId) => {
		if (id === 'connect') {
			handleNavigation('/ai-companion', 'AI Companion')
			return
		}

		if (id === 'restore' && !guidanceProfile.actions.some((action) => action.id === id)) {
			return
		}

		setActiveAction(id)
	}

	const ensureTodayPlan = () => {
		if (todayPlan) {
			return
		}

		const today = new Date().toISOString().split('T')[0]
		createDayPlan({
			id: `plan-${Date.now()}`,
			date: today,
			focus: "Today's focus...",
			priorities: [],
			timeBlocks: [],
		})
	}

	const sensors = metrics
		? [
				{ id: 'typing', label: 'Typing cadence', active: metrics.sources.typing },
				{ id: 'interaction', label: 'Interaction flow', active: metrics.sources.interaction },
				{ id: 'audio', label: 'Audio', active: metrics.sources.audio },
				{ id: 'webcam', label: 'Webcam', active: metrics.sources.webcam },
			]
		: []

	return (
		<div className="min-h-screen emotion-bg transition-colors duration-[2000ms]">
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<BreathingOrb
					size={360}
					color="bg-gradient-to-br from-lilac-300/15 to-transparent"
					className="absolute top-0 right-0"
				/>
				<BreathingOrb
					size={260}
					color="bg-gradient-to-br from-golden-300/10 to-transparent"
					className="absolute bottom-0 left-0"
				/>
			</div>

			<div className="relative z-10">
				<header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-ink-200/20 backdrop-blur-sm bg-white/30">
					<div className="max-w-[1800px] mx-auto flex justify-between items-center">
						<motion.div
							className="cursor-pointer"
							onClick={() => navigate('/home')}
							whileHover={{ scale: 1.05 }}
						>
							<h1 className="text-xl sm:text-2xl font-semibold text-ink-800">Eunonix</h1>
						</motion.div>

						<div className="hidden lg:flex items-center gap-4 xl:gap-6">
							<Button variant="ghost" onClick={() => handleNavigation('/timeline', 'Timeline')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Timeline
							</Button>
							<Button variant="ghost" onClick={() => handleNavigation('/mind-architect', 'Mind Architect')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
								Architect
							</Button>
							<Button variant="ghost" onClick={() => handleNavigation('/community', 'Community')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
								Community
							</Button>
							<Button variant="ghost" onClick={() => handleNavigation('/digital-soul', 'Digital Soul')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
								Soul
							</Button>
							<Button variant="ghost" onClick={() => handleNavigation('/mind-map', 'Mind Map')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
								</svg>
								MindMap
							</Button>
							<Button variant="ghost" onClick={() => handleNavigation('/journal', 'Journal')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
								</svg>
								Journal
							</Button>
							<Button variant="ghost" onClick={() => handleNavigation('/ai-companion', 'AI Companion')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
								</svg>
								Companion
							</Button>
							<Button variant="ghost" onClick={() => handleNavigation('/sensory-expansion', 'Sensory Expansion')}>
								<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
								</svg>
								Sensory
							</Button>

							<div className="h-6 w-px bg-ink-200/30" />

							<ProfileDropdown />
						</div>

						<div className="lg:hidden flex items-center gap-3">
							<ProfileDropdown />
						</div>
					</div>
				</header>

				<main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
					<motion.div
						className="mb-8"
						initial={{ opacity: 0, y: -12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-ink-900 mb-2">
							{getTimeOfDayGreeting()}, <span className="text-gradient font-medium">{user?.name || 'Explorer'}</span>
						</h2>
						<p className="text-sm sm:text-base text-ink-600 mb-1">
							Dominant state: <span className="text-gradient font-medium">{emotionLabels[mood.dominantEmotion].toLowerCase()}</span>
						</p>
						<p className="text-xs sm:text-sm text-ink-500">{formatDate(new Date())}</p>
					</motion.div>

					<div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
						<div className="space-y-6">
							<GlassCard className="space-y-6">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div>
										<h3 className="text-xl sm:text-2xl font-medium text-ink-800">Neuro-adaptive pulse</h3>
										<p className="text-sm text-ink-500">Live synthesis of your emotional and cognitive state.</p>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs uppercase tracking-wide text-ink-500">state</span>
										<span className="px-3 py-1 rounded-full bg-ink-900/80 text-white text-sm">
											{metrics?.state || 'calibrating'}
										</span>
									</div>
								</div>

								<div className="grid lg:grid-cols-2 gap-4">
									<div className="p-4 rounded-2xl bg-white/50 border border-white/40">
										<div className="flex justify-between items-center mb-2">
											<span className="text-sm text-ink-500">Confidence</span>
											<span className="text-sm font-medium text-ink-800">{Math.round((metrics?.confidence ?? 0) * 100)}%</span>
										</div>
										<div className="h-2 w-full rounded-full bg-ink-200/40 overflow-hidden">
											<div
												className="h-full bg-gradient-to-r from-lilac-400 to-ink-500"
												style={{ width: `${Math.max(8, Math.round((metrics?.confidence ?? 0) * 100))}%` }}
											/>
										</div>
										<p className="mt-2 text-xs text-ink-500">
											{metrics?.confidence
												? metrics.confidence < 0.6
													? 'Signals stabilising—keep interacting for richer insight.'
													: 'Confidence is high. Recommendations are tuned to you.'
												: 'Gathering signal fidelity…'}
										</p>
									</div>

									<div className="p-4 rounded-2xl bg-white/50 border border-white/40">
										<div className="flex justify-between items-center mb-2">
											<span className="text-sm text-ink-500">Cognitive load</span>
											<span className="text-sm font-medium text-ink-800">{metrics?.cognitiveLoad ?? '—'}</span>
										</div>
										<p className="text-xs text-ink-500 leading-relaxed">
											{metrics ? cognitiveLoadMessage[metrics.cognitiveLoad] : 'Awaiting cognitive load readout…'}
										</p>
									</div>
								</div>

								<div className="p-4 rounded-2xl bg-white/40 border border-white/30">
									<h4 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">Signal mix</h4>
									{sensors.length ? (
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
											{sensors.map((sensor) => (
												<div
													key={sensor.id}
													className={`rounded-xl border px-3 py-2 text-xs ${
														sensor.active
															? 'border-emerald-300/60 bg-emerald-300/10 text-emerald-700'
															: 'border-ink-200/50 bg-white/30 text-ink-400'
													}`}
												>
													{sensor.label}
												</div>
											))}
										</div>
									) : (
										<p className="text-xs text-ink-500">Sensors warming up…</p>
									)}
								</div>
							</GlassCard>

							<GlassCard className="space-y-5">
								<div className="flex items-start justify-between gap-4">
									<div>
										<h3 className="text-xl font-medium text-ink-800">What you need right now</h3>
										<p className="text-sm text-ink-500 leading-relaxed">{guidanceProfile.keyNeed}</p>
									</div>
									<span className="px-3 py-1 rounded-full bg-ink-900/10 text-ink-700 text-xs uppercase tracking-wide">
										{metrics?.state || 'calibrating'}
									</span>
								</div>
								<p className="text-sm text-ink-600 leading-relaxed">{guidanceProfile.description}</p>
								<p className="text-xs text-ink-500">{guidanceProfile.loadMessage}</p>
								{guidanceProfile.caution && (
									<p className="text-xs text-rose-500 bg-rose-100/60 border border-rose-200/60 rounded-xl px-4 py-2">
										{guidanceProfile.caution}
									</p>
								)}

								<div className="flex flex-wrap gap-3">
									{guidanceProfile.actions.map((action) => (
										<button
											key={action.id}
											onClick={() => handleActionSelect(action.id)}
											className={`px-4 py-3 rounded-2xl text-left transition-all border backdrop-blur-sm ${
												activeAction === action.id
													? 'bg-gradient-to-br from-lilac-400 to-ink-500 text-white border-transparent shadow-lg shadow-lilac-400/30'
													: 'bg-white/50 text-ink-700 border-white/70 hover:border-lilac-400/60'
											}`}
										>
											<div className="text-sm font-semibold">{action.label}</div>
											<div className="text-xs opacity-80 mt-1 leading-snug">{action.annotation}</div>
										</button>
									))}
								</div>
							</GlassCard>

							<GlassCard className="space-y-6">
								<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
									<div>
										<h3 className="text-xl font-medium text-ink-800">Daily alignment</h3>
										<p className="text-sm text-ink-500">Energy, clarity, and progress touchpoints.</p>
									</div>
									<div className="text-right">
										<div className="text-3xl font-light text-ink-800">{energyInsights.level}%</div>
										<div className="text-xs text-ink-500">Energy · {energyInsights.trend}</div>
									</div>
								</div>

								<PulseLine intensity={energyInsights.level} className="h-28" />

								<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="rounded-2xl bg-white/40 border border-white/40 px-4 py-3">
										<div className="text-xs text-ink-500 uppercase tracking-wide mb-1">Clarity</div>
										<div className="text-lg font-semibold text-ink-800">{energyInsights.clarity}%</div>
									</div>
									<div className="rounded-2xl bg-white/40 border border-white/40 px-4 py-3">
										<div className="text-xs text-ink-500 uppercase tracking-wide mb-1">Priorities</div>
										<div className="text-lg font-semibold text-ink-800">
											{totalPriorities > 0 ? `${completedPriorities}/${totalPriorities}` : 'Set today'}
										</div>
										<div className="text-[11px] text-ink-500">{planCompletion}% complete</div>
									</div>
									<div className="rounded-2xl bg-white/40 border border-white/40 px-4 py-3">
										<div className="text-xs text-ink-500 uppercase tracking-wide mb-1">Habits</div>
										<div className="text-lg font-semibold text-ink-800">{topHabits.length ? `${topHabits[0].streak} day streak` : 'Start one'}</div>
									</div>
								</div>

								<div className="grid lg:grid-cols-2 gap-4">
									<div className="rounded-2xl bg-white/30 border border-white/40 p-4">
										<h4 className="text-sm font-semibold text-ink-700 mb-3">Top tasks</h4>
										{topTasks.length ? (
											<ul className="space-y-2 text-sm text-ink-700">
												{topTasks.map((task) => (
													<li key={task.id} className="flex items-center justify-between gap-3">
														<span className="truncate">{task.title}</span>
														<span className="text-xs uppercase tracking-wide text-ink-400">{task.priority}</span>
													</li>
												))}
											</ul>
										) : (
											<p className="text-xs text-ink-500">No active tasks. Define the next small move.</p>
										)}
									</div>
									<div className="rounded-2xl bg-white/30 border border-white/40 p-4">
										<h4 className="text-sm font-semibold text-ink-700 mb-3">Momentum habits</h4>
										{topHabits.length ? (
											<ul className="space-y-2 text-sm text-ink-700">
												{topHabits.map((habit) => (
													<li key={habit.id} className="flex items-center justify-between gap-3">
														<span className="truncate">{habit.title}</span>
														<span className="text-xs text-ink-500">{habit.streak} day streak</span>
													</li>
												))}
											</ul>
										) : (
											<p className="text-xs text-ink-500">No active habits yet. Start with one repeating action.</p>
										)}
									</div>
								</div>
							</GlassCard>
						</div>

						<div className="space-y-6">
							<GlassCard className="space-y-6" hover={false}>
								<div className="flex items-start justify-between gap-4">
									<div>
										<h3 className="text-xl font-medium text-ink-800">Guided response</h3>
										<p className="text-sm text-ink-500">Tools adapt to the action you choose.</p>
									</div>
									{activeAction === 'plan' && (
										<Button size="sm" variant="ghost" onClick={ensureTodayPlan}>
											{todayPlan ? 'Review plan' : 'Create plan'}
										</Button>
									)}
									{activeAction === 'journal' && (
										<Button size="sm" variant="ghost" onClick={() => handleNavigation('/journal', 'Journal')}>
											Open journal
										</Button>
									)}
									{activeAction === 'restore' && (
										<Button size="sm" variant="ghost" onClick={() => handleNavigation('/sensory-expansion', 'Sensory Expansion')}>
											Launch sensory
										</Button>
									)}
									{activeAction === 'focus' && (
										<Button size="sm" variant="ghost" onClick={() => handleNavigation('/mind-architect', 'Mind Architect')}>
											Deep work tools
										</Button>
									)}
								</div>

								<div className="rounded-2xl bg-white/40 border border-white/30 p-4 sm:p-6">
									{activeAction === 'breathing' && (
										<BreatheAICard highlighted />
									)}

									{activeAction === 'plan' && (
										<div className="space-y-4">
											{todayPlan ? (
												<>
													<div>
														<h4 className="text-sm font-semibold text-ink-700 mb-1">Today&apos;s focus</h4>
														<p className="text-sm text-ink-600">{todayPlan.focus || 'Set an intention for today.'}</p>
													</div>
													<div>
														<h4 className="text-sm font-semibold text-ink-700 mb-2">Priorities</h4>
														<ul className="space-y-2 text-sm text-ink-700">
															{todayPlan.priorities.slice(0, 4).map((priority) => (
																<li key={priority.id} className="flex items-center justify-between gap-3">
																	<span className="truncate">{priority.title}</span>
																	<span className={`text-xs uppercase tracking-wide ${priority.completed ? 'text-emerald-500' : 'text-ink-400'}`}>
																		{priority.type}
																	</span>
																</li>
															))}
														</ul>
														{todayPlan.priorities.length > 4 && (
															<p className="text-xs text-ink-400 mt-2">+{todayPlan.priorities.length - 4} more logged for today.</p>
														)}
													</div>
												</>
											) : (
												<div className="text-center space-y-4">
													<p className="text-sm text-ink-600">No plan captured yet. Anchor today by defining your top moves.</p>
													<Button onClick={ensureTodayPlan}>Create today&apos;s plan</Button>
												</div>
											)}
										</div>
									)}

									{activeAction === 'journal' && (
										<div className="space-y-4">
											{recentReflection ? (
												<div className="p-4 rounded-2xl bg-white/60 border border-white/60">
													<div className="text-xs text-ink-500 mb-1">Last captured {formatRelativeTime(recentReflection.timestamp)}</div>
													<p className="text-sm text-ink-700 leading-relaxed">{recentReflection.content}</p>
												</div>
											) : (
												<p className="text-sm text-ink-600">No reflections yet today. Name one feeling or observation to clear mental space.</p>
											)}
											<Button onClick={() => handleNavigation('/journal', 'Journal')}>Open journal</Button>
										</div>
									)}

									{activeAction === 'restore' && (
										<div className="space-y-4">
											<p className="text-sm text-ink-600 leading-relaxed">
												{energyInsights.contributions.fatigue >= 8
													? 'Your schedule shows heavy load. Take five minutes for a sensory reset or a breathing loop.'
													: 'Light fatigue detected. Integrate a short break or ambient soundscape to stay even.'}
											</p>
											<Button variant="secondary" onClick={() => handleNavigation('/sensory-expansion', 'Sensory Expansion')}>
												Explore sensory expansion
											</Button>
										</div>
									)}

									{activeAction === 'focus' && (
										<div className="space-y-4">
											<p className="text-sm text-ink-600">Channel your clarity into one defined move.</p>
											{topTasks.length ? (
												<ul className="space-y-2 text-sm text-ink-700">
													{topTasks.map((task) => (
														<li key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2">
															<span className="truncate">{task.title}</span>
															<span className="text-xs uppercase tracking-wide text-ink-400">{task.priority}</span>
														</li>
													))}
												</ul>
											) : (
												<p className="text-xs text-ink-500">No focus targets yet—log a must-do to direct momentum.</p>
											)}
											<Button variant="secondary" onClick={() => handleNavigation('/mind-architect', 'Mind Architect')}>
												Launch focus tools
											</Button>
										</div>
									)}
								</div>
							</GlassCard>

							<GlassCard className="space-y-4">
								<h3 className="text-xl font-medium text-ink-800">Recent reflections</h3>
								{reflections.length ? (
									<ul className="space-y-3">
										{reflections.slice(0, 3).map((reflection) => (
											<li key={reflection.id} className="rounded-xl bg-white/40 border border-white/40 p-4 text-sm text-ink-700">
												<div className="flex items-center justify-between text-xs text-ink-400 mb-2">
													<span>{formatRelativeTime(reflection.timestamp)}</span>
													<span>{reflection.emotion}</span>
												</div>
												<p className="leading-relaxed">{reflection.content}</p>
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-ink-600">Capture a quick note in the journal to help Eunonix understand your inner climate.</p>
								)}
							</GlassCard>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}

export default Dashboard

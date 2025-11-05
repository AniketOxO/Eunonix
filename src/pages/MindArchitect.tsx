import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { useAppStore } from '../store/useAppStore'
import { readJSON, writeJSON } from '@/utils/storage'

interface SystemFile {
  id: string
  name: string
  type: 'habit' | 'belief' | 'environment' | 'skill'
  status: 'running' | 'corrupted' | 'updating' | 'installing'
  version: string
  health: number
  impact: string
  description: string
  dependencies: string[]
  lastModified: Date
}

interface UpgradeTask {
  id: string
  title: string
  description: string
  currentState: string
  desiredState: string
  steps: UpgradeStep[]
  progress: number
  status: 'pending' | 'in-progress' | 'completed'
}

interface UpgradeStep {
  id: string
  text: string
  completed: boolean
  dueDate?: Date
}

interface Blueprint {
  id: string
  name: string
  vision: string
  createdAt: Date
  systemFiles: SystemFile[]
  upgrades: UpgradeTask[]
}

type TabType = 'blueprint' | 'system' | 'upgrades' | 'install'

type ProgramIconKey =
  | 'meditation'
  | 'morning'
  | 'deepwork'
  | 'gratitude'
  | 'nutrition'
  | 'learning'

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: (isActive: boolean) => JSX.Element }> = [
  {
    id: 'blueprint',
    label: 'Blueprint',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7.5 5.25h9a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 11.25h6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 14.25h3" />
      </svg>
    ),
  },
  {
    id: 'system',
    label: 'System Files',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 8.5L12 12.75 20 8.5 12 4.25 4 8.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 12.75L12 17 20 12.75"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 12.75V16.5L12 20.75 20 16.5V12.75"
        />
      </svg>
    ),
  },
  {
    id: 'upgrades',
    label: 'Upgrades',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 20.25a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 14.25V9.75"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 12l2.25-2.25L14.25 12"
        />
      </svg>
    ),
  },
  {
    id: 'install',
    label: 'Install New',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-colors ${isActive ? 'text-lilac-600' : 'text-ink-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M6.75 19.5h10.5a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 00-1.5-1.5H6.75a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 11.25L12 13.5l2.25-2.25"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6v7.5"
        />
      </svg>
    ),
  },
]

const SYSTEM_TYPE_ICONS: Record<SystemFile['type'], JSX.Element> = {
  habit: (
    <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 3.75V6.75H19.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 20.25V17.25H4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 7.5a7.5 7.5 0 0012.75-3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 16.5a7.5 7.5 0 00-12.75 3.75" />
    </svg>
  ),
  belief: (
    <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6.75 14.25a3 3 0 01.176-5.994A4.5 4.5 0 1118 10.5a2.25 2.25 0 01-.75 4.375H6.75z"
      />
      <circle cx="7" cy="18" r="0.9" fill="currentColor" />
    </svg>
  ),
  environment: (
    <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9h16.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 15h16.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3.75c2.25 3 2.25 13.5 0 16.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3.75c-2.25 3-2.25 13.5 0 16.5" />
    </svg>
  ),
  skill: (
    <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 3.75L4.5 12h7.5l-1.5 8.25L19.5 12h-7.5L13 3.75z"
      />
    </svg>
  ),
}

const PROGRAM_ICONS: Record<ProgramIconKey, JSX.Element> = {
  meditation: (
    <svg className="w-7 h-7 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="7" r="2.25" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 17.25l2.25-2.25 3-1.5 3 1.5 2.25 2.25" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20.25h6" />
    </svg>
  ),
  morning: (
    <svg className="w-7 h-7 text-golden-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 15.75h13.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.75V4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25L6 6.75" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 8.25L18 6.75" />
    </svg>
  ),
  deepwork: (
    <svg className="w-7 h-7 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="6" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="2" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12h3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h3" />
    </svg>
  ),
  gratitude: (
    <svg className="w-7 h-7 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 11.25l3.75 3.75 3.75-3.75" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6.75 9a3.75 3.75 0 017.5 0v1.5h1.5a2.25 2.25 0 010 4.5H8.25a3 3 0 110-6H9"
      />
    </svg>
  ),
  nutrition: (
    <svg className="w-7 h-7 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 13.5h15l-1.5 6h-12z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 13.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9c-.75-1.5-.75-3 1.5-3.75" />
    </svg>
  ),
  learning: (
    <svg className="w-7 h-7 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 7.5l7.5-3 7.5 3-7.5 3-7.5-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12l7.5 3 7.5-3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 16.5l7.5 3 7.5-3" />
    </svg>
  ),
}

const INSTALL_PROGRAMS: Array<{ name: string; desc: string; icon: ProgramIconKey }> = [
  { name: 'meditation.app', desc: 'Daily mindfulness practice', icon: 'meditation' },
  { name: 'morning_routine.exe', desc: 'Optimized morning ritual', icon: 'morning' },
  { name: 'deep_work.sys', desc: 'Extended focus sessions', icon: 'deepwork' },
  { name: 'gratitude_journal.dll', desc: 'Daily appreciation practice', icon: 'gratitude' },
  { name: 'healthy_eating.app', desc: 'Nutrition optimization', icon: 'nutrition' },
  { name: 'learning_system.exe', desc: 'Continuous skill development', icon: 'learning' },
]

const MindArchitect = () => {
  const navigate = useNavigate()
  const { habits, goals } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('blueprint')
  const [currentBlueprint, setCurrentBlueprint] = useState<Blueprint | null>(null)
  const [showDesignWizard, setShowDesignWizard] = useState(false)
  const [futureVision, setFutureVision] = useState('')
  const [systemFiles, setSystemFiles] = useState<SystemFile[]>([])
  const [upgradeTasks, setUpgradeTasks] = useState<UpgradeTask[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [newUpgradeTitle, setNewUpgradeTitle] = useState('')
  const [newUpgradeCurrent, setNewUpgradeCurrent] = useState('')
  const [newUpgradeDesired, setNewUpgradeDesired] = useState('')
  const [aiAnalyzing, setAiAnalyzing] = useState(false)

  // Load data
  useEffect(() => {
    const data = readJSON<any>('eunonix-mind-architect', null)
    if (data) {
      if (data.blueprint) {
        setCurrentBlueprint({
          ...data.blueprint,
          createdAt: new Date(data.blueprint.createdAt),
          systemFiles: (data.blueprint.systemFiles || []).map((file: any) => ({
            ...file,
            lastModified: new Date(file.lastModified),
          })),
          upgrades: (data.blueprint.upgrades || []).map((upgrade: any) => ({
            ...upgrade,
            steps: (upgrade.steps || []).map((step: any) => ({
              ...step,
              dueDate: step.dueDate ? new Date(step.dueDate) : undefined,
            })),
          })),
        })
      }

      setSystemFiles((data.systemFiles || []).map((file: any) => ({
        ...file,
        lastModified: new Date(file.lastModified),
      })))

      setUpgradeTasks((data.upgradeTasks || []).map((task: any) => ({
        ...task,
        steps: (task.steps || []).map((step: any) => ({
          ...step,
          dueDate: step.dueDate ? new Date(step.dueDate) : undefined,
        })),
      })))
    } else {
      // Initialize with analyzed data from habits/goals
      analyzeCurrentSystem()
    }
  }, [habits, goals])

  // Save data
  useEffect(() => {
    if (currentBlueprint) {
      writeJSON('eunonix-mind-architect', {
        blueprint: currentBlueprint,
        systemFiles,
        upgradeTasks,
      })
    }
  }, [currentBlueprint, systemFiles, upgradeTasks])

  const analyzeCurrentSystem = () => {
    setAiAnalyzing(true)
    setTimeout(() => {
      const files: SystemFile[] = [
        {
          id: 'sleep-1',
          name: 'sleep_schedule.sys',
          type: 'habit',
          status: 'corrupted',
          version: '1.0',
          health: 45,
          impact: 'Critical: Affecting focus.exe, energy.dll, mood_regulation.sys',
          description: 'Inconsistent sleep patterns detected. Going to bed at different times.',
          dependencies: ['focus.exe', 'energy.dll', 'productivity.app'],
          lastModified: new Date()
        },
        {
          id: 'focus-1',
          name: 'focus.exe',
          type: 'skill',
          status: 'running',
          version: '2.1',
          health: 68,
          impact: 'Moderate: Could be optimized with better sleep and meditation',
          description: 'Functional but not optimized. Requires system upgrades.',
          dependencies: ['sleep_schedule.sys', 'meditation.app'],
          lastModified: new Date()
        },
        {
          id: 'growth-1',
          name: 'growth_mindset.belief',
          type: 'belief',
          status: 'running',
          version: '3.0',
          health: 82,
          impact: 'Positive: Enabling learning and resilience',
          description: 'Strong belief system supporting continuous improvement.',
          dependencies: [],
          lastModified: new Date()
        },
        {
          id: 'env-1',
          name: 'workspace_environment.env',
          type: 'environment',
          status: 'corrupted',
          version: '1.5',
          health: 55,
          impact: 'Moderate: Cluttered space reducing productivity',
          description: 'Physical environment needs optimization for focus.',
          dependencies: ['focus.exe', 'creativity.dll'],
          lastModified: new Date()
        },
        {
          id: 'exercise-1',
          name: 'exercise_routine.app',
          type: 'habit',
          status: 'running',
          version: '2.0',
          health: 75,
          impact: 'Positive: Supporting energy and mental health',
          description: 'Consistent workout routine, 3x per week.',
          dependencies: ['energy.dll', 'mood_regulation.sys'],
          lastModified: new Date()
        },
        {
          id: 'social-1',
          name: 'social_connection.dll',
          type: 'environment',
          status: 'updating',
          version: '2.5',
          health: 70,
          impact: 'Positive: Building meaningful relationships',
          description: 'Actively cultivating deeper connections.',
          dependencies: ['emotional_intelligence.sys'],
          lastModified: new Date()
        }
      ]

      setSystemFiles(files)
      setAiAnalyzing(false)
    }, 2000)
  }

  const handleCreateBlueprint = () => {
    if (!futureVision.trim()) return

    const blueprint: Blueprint = {
      id: Date.now().toString(),
      name: 'My Future Self v2.0',
      vision: futureVision,
      createdAt: new Date(),
      systemFiles: [],
      upgrades: []
    }

  setCurrentBlueprint(blueprint)
  setShowDesignWizard(false)
    setFutureVision('')
    
    // Generate AI suggestions
    generateUpgradeSuggestions()
  }

  const generateUpgradeSuggestions = () => {
    const suggestions: UpgradeTask[] = [
      {
        id: 'u1',
        title: 'Fix Sleep Schedule Corruption',
        description: 'Repair sleep_schedule.sys to restore optimal performance',
        currentState: 'Random bedtimes, poor sleep quality',
        desiredState: 'Consistent 10 PM - 6 AM schedule, 8 hours quality sleep',
        progress: 0,
        status: 'pending',
        steps: [
          { id: 's1', text: 'Set bedtime alarm for 9:45 PM', completed: false },
          { id: 's2', text: 'No screens 1 hour before bed', completed: false },
          { id: 's3', text: 'Create evening wind-down routine', completed: false },
          { id: 's4', text: 'Track sleep for 7 days', completed: false },
          { id: 's5', text: 'Optimize bedroom environment', completed: false }
        ]
      },
      {
        id: 'u2',
        title: 'Upgrade Focus.exe to v3.0',
        description: 'Enhance concentration and deep work capabilities',
        currentState: 'Distracted, multitasking, 60-minute focus max',
        desiredState: 'Laser-focused, 2-hour deep work sessions, minimal distractions',
        progress: 0,
        status: 'pending',
        steps: [
          { id: 's1', text: 'Install Pomodoro Technique protocol', completed: false },
          { id: 's2', text: 'Remove distracting apps from phone', completed: false },
          { id: 's3', text: 'Create distraction-free workspace', completed: false },
          { id: 's4', text: 'Practice daily meditation (10 min)', completed: false },
          { id: 's5', text: 'Time-block calendar for deep work', completed: false }
        ]
      },
      {
        id: 'u3',
        title: 'Optimize Workspace Environment',
        description: 'Transform physical space for peak productivity',
        currentState: 'Cluttered desk, poor lighting, distractions',
        desiredState: 'Minimalist setup, natural light, organized systems',
        progress: 0,
        status: 'pending',
        steps: [
          { id: 's1', text: 'Declutter desk - remove 80% of items', completed: false },
          { id: 's2', text: 'Add proper lighting (desk lamp)', completed: false },
          { id: 's3', text: 'Organize cables and tech', completed: false },
          { id: 's4', text: 'Add plant for air quality', completed: false },
          { id: 's5', text: 'Create "focus zone" rules', completed: false }
        ]
      }
    ]

    setUpgradeTasks(suggestions)
  }

  const handleToggleStep = (taskId: string, stepId: string) => {
    setUpgradeTasks(upgradeTasks.map(task => {
      if (task.id === taskId) {
        const updatedSteps = task.steps.map(step =>
          step.id === stepId ? { ...step, completed: !step.completed } : step
        )
        const completedCount = updatedSteps.filter(s => s.completed).length
        const progress = Math.round((completedCount / updatedSteps.length) * 100)
        const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending'
        
        // Update system file health when task progresses
        if (progress > 0) {
          updateSystemHealth(task.title, progress)
        }
        
        return { ...task, steps: updatedSteps, progress, status }
      }
      return task
    }))
  }

  const updateSystemHealth = (taskTitle: string, progress: number) => {
    if (taskTitle.includes('Sleep')) {
      setSystemFiles(files => files.map(f =>
        f.name === 'sleep_schedule.sys'
          ? { ...f, health: Math.min(45 + progress / 2, 95), status: progress === 100 ? 'running' : 'updating' }
          : f
      ))
    } else if (taskTitle.includes('Focus')) {
      setSystemFiles(files => files.map(f =>
        f.name === 'focus.exe'
          ? { ...f, health: Math.min(68 + progress / 3, 95), status: progress === 100 ? 'running' : 'updating' }
          : f
      ))
    } else if (taskTitle.includes('Workspace')) {
      setSystemFiles(files => files.map(f =>
        f.name === 'workspace_environment.env'
          ? { ...f, health: Math.min(55 + progress / 2, 95), status: progress === 100 ? 'running' : 'updating' }
          : f
      ))
    }
  }

  const handleCreateCustomUpgrade = () => {
    if (!newUpgradeTitle.trim() || !newUpgradeCurrent.trim() || !newUpgradeDesired.trim()) return

    const newTask: UpgradeTask = {
      id: Date.now().toString(),
      title: newUpgradeTitle,
      description: `Transform from current state to desired state`,
      currentState: newUpgradeCurrent,
      desiredState: newUpgradeDesired,
      progress: 0,
      status: 'pending',
      steps: [
        { id: 's1', text: 'Define specific action plan', completed: false },
        { id: 's2', text: 'Set weekly milestones', completed: false },
        { id: 's3', text: 'Track progress daily', completed: false },
        { id: 's4', text: 'Review and adjust weekly', completed: false },
        { id: 's5', text: 'Celebrate completion', completed: false }
      ]
    }

    setUpgradeTasks([...upgradeTasks, newTask])
    setShowUpgradeModal(false)
    setNewUpgradeTitle('')
    setNewUpgradeCurrent('')
    setNewUpgradeDesired('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50'
      case 'corrupted': return 'text-red-600 bg-red-50'
      case 'updating': return 'text-yellow-600 bg-yellow-50'
      case 'installing': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'from-green-500 to-emerald-500'
    if (health >= 60) return 'from-yellow-500 to-amber-500'
    return 'from-red-500 to-orange-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-lilac-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sand-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h1 className="text-2xl font-light text-ink-800">AI Mind Architect</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/community')}>
                Community
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Welcome Section */}
        {!currentBlueprint ? (
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-lilac-200 to-golden-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-lilac-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-3xl font-light text-ink-800 mb-4">Design Your Future Self</h2>
              <p className="text-ink-600 mb-8 leading-relaxed">
                Your mind is like software. Your habits are running programs. Your beliefs are system files.
                <br />
                <strong>What needs upgrading?</strong>
              </p>
              <Button onClick={() => setShowDesignWizard(true)} className="px-8 py-3">
                Start Designing →
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-sand-200">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-lilac-700 font-medium'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                  type="button"
                >
                  {tab.icon(activeTab === tab.id)}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Blueprint Tab */}
            {activeTab === 'blueprint' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-light text-ink-800 mb-2">{currentBlueprint.name}</h2>
                    <p className="text-sm text-ink-500">Created {new Date(currentBlueprint.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" onClick={() => setShowDesignWizard(true)}>
                    Redesign
                  </Button>
                </div>

                <div className="mb-8 p-6 bg-gradient-to-br from-lilac-50 to-sand-50 rounded-xl border border-lilac-200">
                  <h3 className="text-sm font-medium text-ink-600 mb-2">Future Vision</h3>
                  <p className="text-ink-800 leading-relaxed">{currentBlueprint.vision}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-white rounded-xl border border-sand-200">
                    <div className="text-3xl font-light text-lilac-700 mb-2">
                      {systemFiles.filter(f => f.status === 'running').length}/{systemFiles.length}
                    </div>
                    <div className="text-sm text-ink-600">Files Running</div>
                  </div>
                  <div className="p-6 bg-white rounded-xl border border-sand-200">
                    <div className="text-3xl font-light text-red-600 mb-2">
                      {systemFiles.filter(f => f.status === 'corrupted').length}
                    </div>
                    <div className="text-sm text-ink-600">Needs Repair</div>
                  </div>
                  <div className="p-6 bg-white rounded-xl border border-sand-200">
                    <div className="text-3xl font-light text-green-600 mb-2">
                      {upgradeTasks.filter(u => u.status === 'completed').length}/{upgradeTasks.length}
                    </div>
                    <div className="text-sm text-ink-600">Upgrades Complete</div>
                  </div>
                </div>
              </div>
            )}

            {/* System Files Tab */}
            {activeTab === 'system' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light text-ink-800">System Files</h2>
                  <Button variant="ghost" onClick={analyzeCurrentSystem}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Rescan System
                  </Button>
                </div>

                {aiAnalyzing ? (
                  <div className="text-center py-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 mx-auto mb-4 border-4 border-lilac-200 border-t-lilac-600 rounded-full"
                    />
                    <p className="text-ink-600">Analyzing your mind system...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {systemFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-lilac-100 to-golden-100 flex items-center justify-center text-lilac-600">
                              {SYSTEM_TYPE_ICONS[file.type]}
                            </div>
                            <div>
                              <h3 className="font-mono text-ink-800 font-medium">{file.name}</h3>
                              <p className="text-sm text-ink-500">v{file.version} • {file.type}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                            {file.status}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-ink-600">System Health</span>
                            <span className={`font-medium ${
                              file.health >= 80 ? 'text-green-600' :
                              file.health >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {file.health}%
                            </span>
                          </div>
                          <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${getHealthColor(file.health)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${file.health}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        <p className="text-sm text-ink-600 mb-3">{file.description}</p>
                        
                        <div className="p-3 bg-sand-50 rounded-lg">
                          <p className="text-xs text-ink-500 font-medium mb-1">Impact Analysis:</p>
                          <p className="text-sm text-ink-700">{file.impact}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upgrades Tab */}
            {activeTab === 'upgrades' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light text-ink-800">Active Upgrades</h2>
                  <Button onClick={() => setShowUpgradeModal(true)}>
                    + Create Custom Upgrade
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {upgradeTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-ink-800 mb-2">{task.title}</h3>
                          <p className="text-sm text-ink-600 mb-3">{task.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-xs text-red-600 font-medium mb-1">Current State:</p>
                              <p className="text-sm text-ink-700">{task.currentState}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs text-green-600 font-medium mb-1">Desired State:</p>
                              <p className="text-sm text-ink-700">{task.desiredState}</p>
                            </div>
                          </div>
                        </div>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-ink-600">Progress</span>
                          <span className="text-lilac-700 font-medium">{task.progress}%</span>
                        </div>
                        <div className="h-3 bg-sand-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-lilac-500 to-golden-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-ink-700 mb-3">Installation Steps:</p>
                        {task.steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-sand-200 hover:border-lilac-300 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={step.completed}
                              onChange={() => handleToggleStep(task.id, step.id)}
                              className="w-5 h-5 rounded border-sand-300 text-lilac-600 focus:ring-lilac-500"
                            />
                            <span className={`flex-1 ${step.completed ? 'line-through text-ink-400' : 'text-ink-700'}`}>
                              {step.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Install New Tab */}
            {activeTab === 'install' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand-200 p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-light text-ink-800 mb-4">Install New Programs</h2>
                  <p className="text-ink-600 mb-8">
                    Ready to add new capabilities to your system? Choose what you want to install.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {INSTALL_PROGRAMS.map((program) => (
                      <div
                        key={program.name}
                        className="p-4 bg-white rounded-xl border border-sand-200 hover:border-lilac-300 transition-colors cursor-pointer group"
                        onClick={() => setShowUpgradeModal(true)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-lilac-100 to-golden-100 flex items-center justify-center group-hover:scale-110 transition-transform text-lilac-600">
                            {PROGRAM_ICONS[program.icon]}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-mono text-sm text-ink-800 font-medium">{program.name}</p>
                            <p className="text-xs text-ink-500">{program.desc}</p>
                          </div>
                          <svg className="w-5 h-5 text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Design Wizard Modal */}
      <Modal isOpen={showDesignWizard} onClose={() => setShowDesignWizard(false)} title="Design Your Future Self">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              Who do you want to become?
            </label>
            <p className="text-sm text-ink-500 mb-3">
              Describe your ideal future self in detail. What habits do you have? How do you spend your time? What do you believe about yourself?
            </p>
            <textarea
              value={futureVision}
              onChange={(e) => setFutureVision(e.target.value)}
              placeholder="In 6 months, I wake up at 6 AM feeling energized. I meditate for 20 minutes, then work on my most important project for 2 hours. I exercise daily, eat healthy, and spend quality time with loved ones. I'm confident, focused, and making meaningful progress toward my goals..."
              rows={8}
              className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300 resize-none"
            />
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowDesignWizard(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBlueprint}>
              Generate Blueprint →
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Custom Upgrade Modal */}
      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Create Custom Upgrade">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Upgrade Name</label>
            <input
              type="text"
              value={newUpgradeTitle}
              onChange={(e) => setNewUpgradeTitle(e.target.value)}
              placeholder="e.g., Install Morning Meditation Practice"
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Current State</label>
            <input
              type="text"
              value={newUpgradeCurrent}
              onChange={(e) => setNewUpgradeCurrent(e.target.value)}
              placeholder="e.g., No meditation practice, stressed mornings"
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Desired State</label>
            <input
              type="text"
              value={newUpgradeDesired}
              onChange={(e) => setNewUpgradeDesired(e.target.value)}
              placeholder="e.g., Daily 15-minute meditation, calm focused mornings"
              className="w-full px-4 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:outline-none focus:border-lilac-300"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowUpgradeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomUpgrade}>
              Create Upgrade
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MindArchitect

/**
 * Subscription & Monetization Types
 * Freemium → Premium → Pro → Enterprise
 */

export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'enterprise'

export interface SubscriptionPlan {
  id: string
  tier: SubscriptionTier
  name: string
  price: {
    monthly: number
    yearly: number
    currency: string
  }
  features: PlanFeature[]
  limits: PlanLimits
  badge?: string
  trial?: PlanTrial
}

export interface PlanFeature {
  id: string
  name: string
  description: string
  enabled: boolean
  category: 'core' | 'ai' | 'analytics' | 'api' | 'premium'
}

export interface PlanLimits {
  // AI Features
  aiReflectionsPerMonth: number | 'unlimited'
  aiCompanionMessages: number | 'unlimited'
  emotionalInsights: 'basic' | 'advanced' | 'pro'
  
  // Data & Analytics
  journalEntries: number | 'unlimited'
  emotionHistory: number | 'unlimited'
  exportData: boolean
  advancedAnalytics: boolean
  
  // Collaboration
  sharedGoals: number | 'unlimited'
  communityAccess: 'view' | 'participate' | 'create'
  
  // Platform
  apiAccess: boolean
  pluginInstalls: number | 'unlimited'
  customVisualizations: boolean
  
  // Storage
  mediaStorage: number | 'unlimited'
  backupHistory: number | 'unlimited'

  // App Objects
  maxGoals?: number | 'unlimited'
  maxHabits?: number | 'unlimited'
}

export interface PlanTrial {
  durationMonths: number
  label?: string
  description?: string
}

export interface UserSubscription {
  userId: string
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: Date
  endDate: Date
  autoRenew: boolean
  paymentMethod?: PaymentMethod
  usage: UsageMetrics
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'bank'
  last4?: string
  expiryDate?: string
}

export interface UsageMetrics {
  aiReflectionsUsed: number
  aiMessagesUsed: number
  journalEntriesCount: number
  storageUsed: number // MB
  apiCallsUsed: number
  lastUpdated: string | null
}

// Marketplace Types

export interface MarketplacePlugin {
  id: string
  name: string
  description: string
  developer: Developer
  category: PluginCategory
  price: number // 0 for free
  rating: number
  downloads: number
  screenshots: string[]
  features: string[]
  permissions: PluginPermission[]
  version: string
  lastUpdated: Date
  verified: boolean
}

export type PluginCategory = 
  | 'visualization'
  | 'analytics'
  | 'ai-enhancement'
  | 'productivity'
  | 'wellbeing'
  | 'integration'
  | 'theme'
  | 'export'

export interface PluginPermission {
  type: 'emotion_data' | 'journal_read' | 'journal_write' | 'analytics' | 'api_access'
  reason: string
  required: boolean
}

export interface Developer {
  id: string
  name: string
  company?: string
  verified: boolean
  website?: string
  support?: string
}

export interface InstalledPlugin {
  pluginId: string
  installedDate: Date
  enabled: boolean
  settings: Record<string, any>
}

// Emotional API Types

export interface EmotionalAPIKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: APIPermission[]
  rateLimit: RateLimit
  status: 'active' | 'revoked'
  createdDate: Date
  lastUsed?: Date
  usage: APIUsageStats
}

export interface APIPermission {
  scope: APIScope
  access: 'read' | 'write'
}

export type APIScope = 
  | 'emotion.current'
  | 'emotion.history'
  | 'cognitive.load'
  | 'focus.state'
  | 'energy.level'
  | 'mood.trends'
  | 'journal.read'
  | 'goals.read'
  | 'habits.read'

export interface RateLimit {
  requestsPerMinute: number
  requestsPerDay: number
  burstSize: number
}

export interface APIUsageStats {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  lastCallTimestamp?: Date
  callsByEndpoint: Record<string, number>
}

// B2B Enterprise Types

export interface EnterpriseAccount {
  id: string
  companyName: string
  industry: string
  employeeCount: number
  adminUsers: string[]
  features: EnterpriseFeature[]
  billing: EnterpriseBilling
  settings: EnterpriseSettings
}

export interface EnterpriseFeature {
  name: string
  enabled: boolean
  config?: Record<string, any>
}

export interface EnterpriseBilling {
  plan: 'starter' | 'growth' | 'enterprise'
  seatsLicensed: number
  seatsUsed: number
  monthlyPrice: number
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: Date
}

export interface EnterpriseSettings {
  ssoEnabled: boolean
  dataRetentionDays: number
  companyBranding: boolean
  customDomain?: string
  apiQuota: number
  analytics: {
    aggregateReports: boolean
    anonymization: 'full' | 'partial' | 'none'
    exportSchedule?: 'daily' | 'weekly' | 'monthly'
  }
  wellbeing: {
    burnoutAlerts: boolean
    teamHealthScores: boolean
    interventionSuggestions: boolean
  }
}

// Guided Growth Experiences

export interface GuidedExperience {
  id: string
  title: string
  description: string
  duration: number // days
  category: 'anxiety' | 'focus' | 'creativity' | 'habits' | 'relationships' | 'career'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  mentor?: Mentor
  modules: ExperienceModule[]
  pricing: {
    tier: 'free' | 'premium' | 'pro'
    price?: number
  }
  enrolledCount: number
  rating: number
  preview: boolean
}

export interface ExperienceModule {
  id: string
  title: string
  type: 'reflection' | 'exercise' | 'meditation' | 'challenge' | 'assessment'
  content: string
  estimatedTime: number // minutes
  unlockAfter: number // days from start
  completed?: boolean
  aiSupport: boolean
}

export interface Mentor {
  id: string
  name: string
  title: string
  bio: string
  avatar: string
  specialties: string[]
  verified: boolean
}

export interface UserEnrollment {
  experienceId: string
  startDate: Date
  currentModule: number
  progress: number // percentage
  completedModules: string[]
  aiReflections: string[]
  status: 'active' | 'paused' | 'completed'
}

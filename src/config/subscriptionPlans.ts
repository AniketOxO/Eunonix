import { SubscriptionPlan, SubscriptionTier } from '@/types/subscription'

/**
 * Subscription Plans Configuration
 * Freemium → Premium → Pro → Enterprise
 */

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    tier: 'free',
    name: 'Free',
    price: {
      monthly: 0,
      yearly: 0,
      currency: 'USD'
    },
    features: [
      {
        id: 'basic-journal',
        name: 'Basic Journaling',
        description: 'Write and track your daily thoughts',
        enabled: true,
        category: 'core'
      },
      {
        id: 'emotion-tracking',
        name: 'Emotion Tracking',
        description: 'Log your emotional states',
        enabled: true,
        category: 'core'
      },
      {
        id: 'basic-goals',
        name: 'Goal Setting',
        description: 'Create and track up to 3 goals',
        enabled: true,
        category: 'core'
      },
      {
        id: 'habit-tracker',
        name: 'Habit Tracking',
        description: 'Track up to 5 habits',
        enabled: true,
        category: 'core'
      },
      {
        id: 'community-view',
        name: 'Community Access',
        description: 'View community posts and reflections',
        enabled: true,
        category: 'core'
      },
      {
        id: 'basic-ai',
        name: 'AI Reflections',
        description: '5 AI reflections per month',
        enabled: true,
        category: 'ai'
      }
    ],
    limits: {
      aiReflectionsPerMonth: 5,
      aiCompanionMessages: 20,
      emotionalInsights: 'basic',
      journalEntries: 'unlimited',
      emotionHistory: 30,
      exportData: false,
      advancedAnalytics: false,
      sharedGoals: 1,
      communityAccess: 'view',
      apiAccess: false,
      pluginInstalls: 0,
      customVisualizations: false,
      mediaStorage: 50,
      backupHistory: 7
    }
  },

  premium: {
    id: 'premium',
    tier: 'premium',
    name: 'Premium',
    badge: '✨ Most Popular',
    price: {
      monthly: 9.99,
      yearly: 99,
      currency: 'USD'
    },
    features: [
      {
        id: 'unlimited-ai',
        name: 'Unlimited AI Reflections',
        description: 'Get unlimited AI-powered insights and reflections',
        enabled: true,
        category: 'ai'
      },
      {
        id: 'ai-companion',
        name: 'AI Companion Chat',
        description: 'Unlimited conversations with your AI companion',
        enabled: true,
        category: 'ai'
      },
      {
        id: 'advanced-insights',
        name: 'Advanced Emotional Insights',
        description: 'Deep pattern recognition and trend analysis',
        enabled: true,
        category: 'analytics'
      },
      {
        id: 'full-history',
        name: 'Full History Access',
        description: 'Access your complete emotional journey',
        enabled: true,
        category: 'analytics'
      },
      {
        id: 'data-export',
        name: 'Data Export',
        description: 'Export your data anytime in multiple formats',
        enabled: true,
        category: 'core'
      },
      {
        id: 'unlimited-goals',
        name: 'Unlimited Goals',
        description: 'Create as many goals as you need',
        enabled: true,
        category: 'core'
      },
      {
        id: 'unlimited-habits',
        name: 'Unlimited Habits',
        description: 'Track unlimited habits',
        enabled: true,
        category: 'core'
      },
      {
        id: 'community-create',
        name: 'Community Creation',
        description: 'Create channels, quests, and share reflections',
        enabled: true,
        category: 'core'
      },
      {
        id: 'plugins',
        name: 'Plugin Marketplace',
        description: 'Install up to 5 plugins from marketplace',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'guided-experiences',
        name: 'Guided Growth Experiences',
        description: 'Access to premium growth programs',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'priority-support',
        name: 'Priority Support',
        description: '24/7 priority customer support',
        enabled: true,
        category: 'premium'
      }
    ],
    limits: {
      aiReflectionsPerMonth: 'unlimited',
      aiCompanionMessages: 'unlimited',
      emotionalInsights: 'advanced',
      journalEntries: 'unlimited',
      emotionHistory: 365,
      exportData: true,
      advancedAnalytics: false,
      sharedGoals: 10,
      communityAccess: 'create',
      apiAccess: false,
      pluginInstalls: 5,
      customVisualizations: false,
      mediaStorage: 500,
      backupHistory: 30
    }
  },

  pro: {
    id: 'pro',
    tier: 'pro',
    name: 'Pro',
    badge: '🚀 For Creators',
    price: {
      monthly: 29.99,
      yearly: 299,
      currency: 'USD'
    },
    features: [
      {
        id: 'pro-analytics',
        name: 'Pro Analytics Dashboard',
        description: 'Advanced analytics, trends, and predictions',
        enabled: true,
        category: 'analytics'
      },
      {
        id: 'custom-visualizations',
        name: 'Custom Visualizations',
        description: 'Create custom charts and visual reports',
        enabled: true,
        category: 'analytics'
      },
      {
        id: 'api-access',
        name: 'Emotional API Access',
        description: 'Build integrations with your emotional data',
        enabled: true,
        category: 'api'
      },
      {
        id: 'unlimited-plugins',
        name: 'Unlimited Plugins',
        description: 'Install unlimited marketplace plugins',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'developer-tools',
        name: 'Developer Tools',
        description: 'Build and publish your own plugins',
        enabled: true,
        category: 'api'
      },
      {
        id: 'white-label',
        name: 'White Label Options',
        description: 'Customize branding and interface',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'advanced-automation',
        name: 'Advanced Automation',
        description: 'Create complex workflows and triggers',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'mentorship',
        name: 'Expert Mentorship',
        description: '1-on-1 sessions with growth experts',
        enabled: true,
        category: 'premium'
      }
    ],
    limits: {
      aiReflectionsPerMonth: 'unlimited',
      aiCompanionMessages: 'unlimited',
      emotionalInsights: 'pro',
      journalEntries: 'unlimited',
      emotionHistory: 'unlimited' as any,
      exportData: true,
      advancedAnalytics: true,
      sharedGoals: 'unlimited' as any,
      communityAccess: 'create',
      apiAccess: true,
      pluginInstalls: 'unlimited' as any,
      customVisualizations: true,
      mediaStorage: 5000,
      backupHistory: 365
    }
  },

  enterprise: {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    badge: '🏢 For Teams',
    price: {
      monthly: 0, // Custom pricing
      yearly: 0,
      currency: 'USD'
    },
    features: [
      {
        id: 'team-wellbeing',
        name: 'Team Wellbeing Dashboard',
        description: 'Aggregate team health metrics and insights',
        enabled: true,
        category: 'analytics'
      },
      {
        id: 'burnout-detection',
        name: 'Burnout Detection',
        description: 'AI-powered early warning system',
        enabled: true,
        category: 'ai'
      },
      {
        id: 'sso',
        name: 'SSO Integration',
        description: 'Enterprise single sign-on',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'custom-domain',
        name: 'Custom Domain',
        description: 'Host on your own domain',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'dedicated-support',
        name: 'Dedicated Support',
        description: 'Dedicated account manager',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'unlimited-api',
        name: 'Unlimited API Calls',
        description: 'No rate limits on Emotional API',
        enabled: true,
        category: 'api'
      },
      {
        id: 'compliance',
        name: 'Compliance & Security',
        description: 'HIPAA, SOC2, GDPR compliance',
        enabled: true,
        category: 'premium'
      },
      {
        id: 'custom-integration',
        name: 'Custom Integrations',
        description: 'Build custom integrations with our team',
        enabled: true,
        category: 'api'
      }
    ],
    limits: {
      aiReflectionsPerMonth: 'unlimited',
      aiCompanionMessages: 'unlimited',
      emotionalInsights: 'pro',
      journalEntries: 'unlimited',
      emotionHistory: 'unlimited' as any,
      exportData: true,
      advancedAnalytics: true,
      sharedGoals: 'unlimited' as any,
      communityAccess: 'create',
      apiAccess: true,
      pluginInstalls: 'unlimited' as any,
      customVisualizations: true,
      mediaStorage: 'unlimited' as any,
      backupHistory: 'unlimited' as any
    }
  }
}

export const FEATURE_COMPARISON = [
  {
    category: 'Core Features',
    features: [
      { name: 'Journal Entries', free: 'Unlimited', premium: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Emotion Tracking', free: '✓', premium: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Goals', free: '3', premium: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Habits', free: '5', premium: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Data Export', free: '✗', premium: '✓', pro: '✓', enterprise: '✓' },
      { name: 'History Access', free: '30 days', premium: '1 year', pro: 'Forever', enterprise: 'Forever' }
    ]
  },
  {
    category: 'AI Features',
    features: [
      { name: 'AI Reflections', free: '5/month', premium: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'AI Companion Chat', free: '20/month', premium: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Emotional Insights', free: 'Basic', premium: 'Advanced', pro: 'Pro', enterprise: 'Pro' },
      { name: 'Pattern Recognition', free: '✗', premium: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Predictive Analytics', free: '✗', premium: '✗', pro: '✓', enterprise: '✓' }
    ]
  },
  {
    category: 'Platform',
    features: [
      { name: 'Plugin Marketplace', free: '✗', premium: '5 plugins', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Emotional API', free: '✗', premium: '✗', pro: '✓', enterprise: 'Unlimited' },
      { name: 'Custom Visualizations', free: '✗', premium: '✗', pro: '✓', enterprise: '✓' },
      { name: 'Developer Tools', free: '✗', premium: '✗', pro: '✓', enterprise: '✓' }
    ]
  },
  {
    category: 'Growth',
    features: [
      { name: 'Guided Experiences', free: 'Preview', premium: 'Full Access', pro: 'Full Access', enterprise: 'Custom' },
      { name: 'Community Access', free: 'View Only', premium: 'Create', pro: 'Create', enterprise: 'Private Teams' },
      { name: 'Expert Mentorship', free: '✗', premium: '✗', pro: '✓', enterprise: '✓' }
    ]
  },
  {
    category: 'Enterprise',
    features: [
      { name: 'Team Dashboard', free: '✗', premium: '✗', pro: '✗', enterprise: '✓' },
      { name: 'SSO Integration', free: '✗', premium: '✗', pro: '✗', enterprise: '✓' },
      { name: 'Compliance', free: '✗', premium: '✗', pro: '✗', enterprise: '✓' },
      { name: 'Dedicated Support', free: '✗', premium: '✗', pro: '✗', enterprise: '✓' }
    ]
  }
]

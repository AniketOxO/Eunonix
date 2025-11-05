import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SubscriptionTier, MarketplacePlugin } from '@/types/subscription'
import { safeStorage } from '@/utils/storage'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscriptionTier: SubscriptionTier
  apiKeys: string[]
  installedPlugins: string[]
  createdAt: Date
}

interface DeveloperProfile {
  userId: string
  publishedPlugins: string[]
  totalDownloads: number
  revenue: number
  apiUsage: {
    calls: number
    limit: number
  }
}

interface AuthStore {
  user: User | null
  developerProfile: DeveloperProfile | null
  isAuthenticated: boolean
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
  socialSignIn: (provider: 'google' | 'github', userData: { email: string; name: string; avatar?: string }) => Promise<void>
  
  // Profile actions
  updateProfile: (updates: { name?: string; email?: string; avatar?: string }) => void
  
  // Subscription actions
  upgradeSubscription: (tier: SubscriptionTier) => void
  
  // Plugin actions
  installPlugin: (pluginId: string) => void
  uninstallPlugin: (pluginId: string) => void
  isPluginInstalled: (pluginId: string) => boolean
  
  // Developer actions
  createDeveloperProfile: () => void
  generateAPIKey: () => string
  revokeAPIKey: (key: string) => void
  publishPlugin: (plugin: MarketplacePlugin) => void
}

// Mock user data (in production, this would come from a backend)
const DEMO_USER: User = {
  id: 'demo-user-1',
  email: 'demo@eunonix.app',
  name: 'Demo User',
  subscriptionTier: 'free',
  apiKeys: [],
  installedPlugins: [],
  createdAt: new Date('2024-01-01')
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      developerProfile: null,
      isAuthenticated: false,

      signIn: async (email: string, _password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Extract name from email (before @)
        const emailName = email.split('@')[0]
        const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ')
        
        set({
          user: { ...DEMO_USER, email, name: displayName },
          isAuthenticated: true
        })
      },

      signUp: async (email: string, _password: string, name: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        set({
          user: { ...DEMO_USER, email, name },
          isAuthenticated: true
        })
      },

  socialSignIn: async (_provider: 'google' | 'github', userData: { email: string; name: string; avatar?: string }) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        set({
          user: { 
            ...DEMO_USER, 
            email: userData.email, 
            name: userData.name,
            avatar: userData.avatar 
          },
          isAuthenticated: true
        })
      },

      signOut: () => {
        set({
          user: null,
          developerProfile: null,
          isAuthenticated: false
        })
      },

      updateProfile: (updates: { name?: string; email?: string; avatar?: string }) => {
        const user = get().user
        if (!user) return

        set({
          user: { 
            ...user,
            ...updates
          }
        })
      },

      upgradeSubscription: (tier: SubscriptionTier) => {
        const user = get().user
        if (!user) return

        set({
          user: { ...user, subscriptionTier: tier }
        })
      },

      installPlugin: (pluginId: string) => {
        const user = get().user
        if (!user) return

        if (!user.installedPlugins.includes(pluginId)) {
          set({
            user: {
              ...user,
              installedPlugins: [...user.installedPlugins, pluginId]
            }
          })
        }
      },

      uninstallPlugin: (pluginId: string) => {
        const user = get().user
        if (!user) return

        set({
          user: {
            ...user,
            installedPlugins: user.installedPlugins.filter(id => id !== pluginId)
          }
        })
      },

      isPluginInstalled: (pluginId: string) => {
        const user = get().user
        return user ? user.installedPlugins.includes(pluginId) : false
      },

      createDeveloperProfile: () => {
        const user = get().user
        if (!user || get().developerProfile) return

        set({
          developerProfile: {
            userId: user.id,
            publishedPlugins: [],
            totalDownloads: 0,
            revenue: 0,
            apiUsage: {
              calls: 0,
              limit: user.subscriptionTier === 'free' ? 1000 : 100000
            }
          }
        })
      },

      generateAPIKey: () => {
        const user = get().user
        if (!user) return ''

        const key = `eunonix_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        
        set({
          user: {
            ...user,
            apiKeys: [...user.apiKeys, key]
          }
        })

        return key
      },

      revokeAPIKey: (key: string) => {
        const user = get().user
        if (!user) return

        set({
          user: {
            ...user,
            apiKeys: user.apiKeys.filter(k => k !== key)
          }
        })
      },

      publishPlugin: (plugin: MarketplacePlugin) => {
        const developerProfile = get().developerProfile
        if (!developerProfile) return

        set({
          developerProfile: {
            ...developerProfile,
            publishedPlugins: [...developerProfile.publishedPlugins, plugin.id]
          }
        })
      }
    }),
    {
      name: 'eunonix-auth',
      version: 1,
      storage: createJSONStorage(() => safeStorage)
    }
  )
)

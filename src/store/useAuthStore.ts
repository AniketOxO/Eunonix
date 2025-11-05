import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SubscriptionTier, MarketplacePlugin, UsageMetrics, SubscriptionPlan } from '@/types/subscription'
import { safeStorage } from '@/utils/storage'
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscriptionTier: SubscriptionTier
  subscriptionStatus: 'active' | 'trial' | 'cancelled' | 'expired'
  subscriptionStartedAt: string
  subscriptionRenewalDate?: string | null
  trialEndsAt?: string | null
  billingCycle: 'monthly' | 'yearly'
  claimedPremiumTrial: boolean
  apiKeys: string[]
  installedPlugins: string[]
  usage: UsageMetrics
  createdAt: string
}

type AuthPromptMode = 'auth' | 'limit'

interface AuthPromptAction {
  label: string
  route: string
  variant?: 'primary' | 'secondary'
}

interface AuthPrompt {
  title: string
  message: string
  feature?: string
  mode: AuthPromptMode
  primaryAction?: AuthPromptAction
  secondaryAction?: AuthPromptAction
}

interface RequireAuthOptions {
  title?: string
  message?: string
}

interface PlanLimitOptions {
  message?: string
  upgradeTier?: SubscriptionTier
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

type AuthProvider = 'email' | 'google' | 'github'

interface StoredAccount {
  id: string
  provider: AuthProvider
  passwordHash: string | null
  rememberSession: boolean
  createdAt: string
  lastLoginAt: string | null
  user: User
}

interface AuthStoreState {
  user: User | null
  developerProfile: DeveloperProfile | null
  isAuthenticated: boolean
  activeAccountId: string | null
  accounts: Record<string, StoredAccount>
  developerProfiles: Record<string, DeveloperProfile>
  rememberedEmail: string | null
  authPrompt: AuthPrompt | null
}

interface AuthStore extends AuthStoreState {
  signIn: (email: string, password: string, options?: AuthOptions) => Promise<void>
  signUp: (email: string, password: string, name: string, options?: AuthOptions) => Promise<void>
  signOut: () => void
  socialSignIn: (
    provider: 'google' | 'github',
    userData: { email: string; name: string; avatar?: string },
    options?: AuthOptions
  ) => Promise<void>
  updateProfile: (updates: { name?: string; email?: string; avatar?: string }) => void
  upgradeSubscription: (tier: SubscriptionTier, options?: UpgradeOptions) => void
  hasFeature: (featureId: string) => boolean
  getCurrentPlan: () => SubscriptionPlan
  canSendAIMessage: () => { allowed: boolean; remaining?: number; reason?: string }
  recordAIMessage: () => void
  installPlugin: (pluginId: string) => void
  uninstallPlugin: (pluginId: string) => void
  isPluginInstalled: (pluginId: string) => boolean
  createDeveloperProfile: () => void
  generateAPIKey: () => string
  revokeAPIKey: (key: string) => void
  publishPlugin: (plugin: MarketplacePlugin) => void
  setRememberedEmail: (email: string | null) => void
  requireAuth: (feature: string, options?: RequireAuthOptions) => boolean
  clearAuthPrompt: () => void
  showPlanLimit: (feature: string, options?: PlanLimitOptions) => void
}

interface UpgradeOptions {
  startTrial?: boolean
  billingCycle?: 'monthly' | 'yearly'
  trialDurationMonths?: number
}

interface AuthOptions {
  remember?: boolean
}

const createUsageMetrics = (overrides?: Partial<UsageMetrics>): UsageMetrics => ({
  aiReflectionsUsed: overrides?.aiReflectionsUsed ?? 0,
  aiMessagesUsed: overrides?.aiMessagesUsed ?? 0,
  journalEntriesCount: overrides?.journalEntriesCount ?? 0,
  storageUsed: overrides?.storageUsed ?? 0,
  apiCallsUsed: overrides?.apiCallsUsed ?? 0,
  lastUpdated: overrides?.lastUpdated ?? new Date().toISOString()
})

const addMonths = (date: Date, months: number) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const calculateRenewalDate = (billingCycle: 'monthly' | 'yearly', start: Date) => {
  const monthsToAdd = billingCycle === 'monthly' ? 1 : 12
  return addMonths(start, monthsToAdd).toISOString()
}

const getPlanForTier = (tier: SubscriptionTier): SubscriptionPlan => SUBSCRIPTION_PLANS[tier]

const hasPlanFeature = (tier: SubscriptionTier, featureId: string) => {
  const plan = getPlanForTier(tier)
  return plan.features.some((feature) => feature.id === featureId && feature.enabled)
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `usr_${Math.random().toString(36).slice(2, 10)}`
}

const normalizeEmail = (email: string): string | null => {
  if (!email) return null
  const trimmed = email.trim()
  return trimmed ? trimmed.toLowerCase() : null
}

const emailsMatch = (a?: string | null, b?: string | null) => {
  if (!a || !b) return false
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

const fallbackHash = (input: string) => {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}

const hashPassword = async (password: string): Promise<string> => {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (!cryptoApi?.subtle) {
    return fallbackHash(password)
  }
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const digest = await cryptoApi.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const verifyPassword = async (password: string, storedHash: string | null) => {
  if (!storedHash) return false
  const hash = await hashPassword(password)
  return hash === storedHash
}

const createBaseUser = (email: string, name: string, overrides?: Partial<User>): User => {
  const nowIso = new Date().toISOString()
  const { usage: usageOverride, ...restOverrides } = overrides ?? {}

  return {
    id: restOverrides.id ?? generateId(),
    email: restOverrides.email ?? email.trim(),
    name: restOverrides.name ?? name,
    avatar: restOverrides.avatar,
    subscriptionTier: restOverrides.subscriptionTier ?? 'free',
    subscriptionStatus: restOverrides.subscriptionStatus ?? 'active',
    subscriptionStartedAt: restOverrides.subscriptionStartedAt ?? nowIso,
    subscriptionRenewalDate: restOverrides.subscriptionRenewalDate ?? null,
    trialEndsAt: restOverrides.trialEndsAt ?? null,
    billingCycle: restOverrides.billingCycle ?? 'monthly',
    claimedPremiumTrial: restOverrides.claimedPremiumTrial ?? false,
    apiKeys: restOverrides.apiKeys ?? [],
    installedPlugins: restOverrides.installedPlugins ?? [],
    usage: createUsageMetrics(usageOverride ?? undefined),
    createdAt: restOverrides.createdAt ?? nowIso
  }
}

const createAccount = (user: User, options?: Partial<Omit<StoredAccount, 'user'>>): StoredAccount => ({
  id: options?.id ?? user.id,
  provider: options?.provider ?? 'email',
  passwordHash: options?.passwordHash ?? null,
  rememberSession: options?.rememberSession ?? false,
  createdAt: options?.createdAt ?? user.createdAt,
  lastLoginAt: options?.lastLoginAt ?? null,
  user
})

const ensureUsageFreshness = (account: StoredAccount): StoredAccount => {
  const now = new Date()
  const lastUpdatedStr = account.user.usage.lastUpdated
  const lastUpdated = lastUpdatedStr ? new Date(lastUpdatedStr) : null

  if (!lastUpdated || lastUpdated.getMonth() !== now.getMonth() || lastUpdated.getFullYear() !== now.getFullYear()) {
    return {
      ...account,
      user: {
        ...account.user,
        usage: {
          ...account.user.usage,
          aiReflectionsUsed: 0,
          aiMessagesUsed: 0,
          apiCallsUsed: 0,
          lastUpdated: now.toISOString()
        }
      }
    }
  }

  return account
}

const createInitialState = (): AuthStoreState => ({
  user: null,
  developerProfile: null,
  isAuthenticated: false,
  activeAccountId: null,
  accounts: {},
  developerProfiles: {},
  rememberedEmail: null,
  authPrompt: null
})

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      const commitAccountChange = (accountId: string, updatedAccount: StoredAccount, extraUpdates?: Partial<AuthStoreState>) => {
        set((state) => {
          if (!state.accounts[accountId]) {
            return {}
          }

          const accounts = { ...state.accounts, [accountId]: updatedAccount }
          const updates: Partial<AuthStoreState> = { accounts }

          if (state.activeAccountId === accountId) {
            updates.user = updatedAccount.user
            updates.developerProfile = state.developerProfiles[updatedAccount.user.id] ?? null
          }

          if (extraUpdates) {
            Object.assign(updates, extraUpdates)
          }

          return updates
        })
      }

      const refreshActiveAccountUsage = (): StoredAccount | null => {
        const state = get()
        const accountId = state.activeAccountId
        if (!accountId) return null

        const account = state.accounts[accountId]
        if (!account) return null

        const refreshed = ensureUsageFreshness(account)
        if (refreshed !== account) {
          commitAccountChange(accountId, refreshed)
          return refreshed
        }

        return account
      }

      return {
        ...createInitialState(),

        async signIn(email, password, options) {
          const normalizedEmail = normalizeEmail(email)
          if (!normalizedEmail) {
            throw new Error('Email is required.')
          }

          const account = get().accounts[normalizedEmail]
          if (!account) {
            throw new Error('No account found for that email. Please create an account first.')
          }

          if (account.provider !== 'email' || !account.passwordHash) {
            throw new Error('Use the social sign-in option associated with this account.')
          }

          const passwordMatches = await verifyPassword(password, account.passwordHash)
          if (!passwordMatches) {
            throw new Error('Incorrect password. Please try again.')
          }

          const remember = options?.remember ?? account.rememberSession
          const nowIso = new Date().toISOString()
          const refreshedAccount = ensureUsageFreshness(account)
          const updatedAccount: StoredAccount = {
            ...refreshedAccount,
            rememberSession: remember,
            lastLoginAt: nowIso,
            user: {
              ...refreshedAccount.user,
              email: email.trim()
            }
          }

          set((state) => ({
            user: updatedAccount.user,
            developerProfile: state.developerProfiles[updatedAccount.user.id] ?? null,
            isAuthenticated: true,
            activeAccountId: normalizedEmail,
            accounts: {
              ...state.accounts,
              [normalizedEmail]: updatedAccount
            },
            rememberedEmail: remember ? email.trim() : null,
            authPrompt: null
          }))
        },

        async signUp(email, password, name, options) {
          const normalizedEmail = normalizeEmail(email)
          if (!normalizedEmail) {
            throw new Error('Email is required.')
          }

          const trimmedName = name.trim()
          if (!trimmedName) {
            throw new Error('Name is required.')
          }

          const existingAccount = get().accounts[normalizedEmail]
          if (existingAccount) {
            throw new Error('An account with this email already exists. Please sign in instead.')
          }

          const passwordHash = await hashPassword(password)
          const remember = options?.remember ?? true
          const nowIso = new Date().toISOString()
          const user = createBaseUser(email.trim(), trimmedName)
          const account = createAccount(user, {
            provider: 'email',
            passwordHash,
            rememberSession: remember,
            createdAt: nowIso,
            lastLoginAt: nowIso
          })

          set((state) => ({
            user,
            developerProfile: null,
            isAuthenticated: true,
            activeAccountId: normalizedEmail,
            accounts: {
              ...state.accounts,
              [normalizedEmail]: account
            },
            rememberedEmail: remember ? email.trim() : null,
            authPrompt: null
          }))
        },

        signOut() {
          const state = get()
          const accountId = state.activeAccountId
          if (accountId) {
            const account = state.accounts[accountId]
            if (account) {
              commitAccountChange(accountId, { ...account, rememberSession: false })
            }
          }

          set({
            user: null,
            developerProfile: null,
            isAuthenticated: false,
            activeAccountId: null,
            authPrompt: null
          })
        },

        async socialSignIn(provider, userData, options) {
          const normalizedEmail = normalizeEmail(userData.email)
          if (!normalizedEmail) {
            throw new Error('Email is required.')
          }

          const remember = options?.remember ?? true
          const nowIso = new Date().toISOString()
          const state = get()
          const account = state.accounts[normalizedEmail]

          if (account) {
            const refreshedAccount = ensureUsageFreshness(account)
            const updatedAccount: StoredAccount = {
              ...refreshedAccount,
              provider: account.provider === 'email' && account.passwordHash ? account.provider : provider,
              rememberSession: remember,
              lastLoginAt: nowIso,
              user: {
                ...refreshedAccount.user,
                email: userData.email.trim(),
                name: userData.name,
                avatar: userData.avatar ?? refreshedAccount.user.avatar
              }
            }

            set((prevState) => ({
              user: updatedAccount.user,
              developerProfile: prevState.developerProfiles[updatedAccount.user.id] ?? null,
              isAuthenticated: true,
              activeAccountId: normalizedEmail,
              accounts: {
                ...prevState.accounts,
                [normalizedEmail]: updatedAccount
              },
              rememberedEmail: remember ? userData.email.trim() : null,
              authPrompt: null
            }))
            return
          }

          const user = createBaseUser(userData.email.trim(), userData.name, {
            avatar: userData.avatar
          })

          const newAccount = createAccount(user, {
            provider,
            passwordHash: null,
            rememberSession: remember,
            createdAt: nowIso,
            lastLoginAt: nowIso
          })

          set((prevState) => ({
            user,
            developerProfile: null,
            isAuthenticated: true,
            activeAccountId: normalizedEmail,
            accounts: {
              ...prevState.accounts,
              [normalizedEmail]: newAccount
            },
            rememberedEmail: remember ? userData.email.trim() : null,
            authPrompt: null
          }))
        },

        updateProfile(updates) {
          const state = get()
          const accountId = state.activeAccountId
          if (!accountId) return

          const account = state.accounts[accountId]
          if (!account) return

          const previousEmail = account.user.email
          const trimmedEmail = updates.email?.trim()
          const normalizedNewEmail = trimmedEmail ? normalizeEmail(trimmedEmail) : null

          if (normalizedNewEmail && normalizedNewEmail !== accountId && state.accounts[normalizedNewEmail]) {
            console.warn('Email update aborted: another account already uses that address.')
            return
          }

          const updatedUser: User = {
            ...account.user,
            ...updates,
            email: trimmedEmail ?? account.user.email
          }

          if (normalizedNewEmail && normalizedNewEmail !== accountId) {
            set((prevState) => {
              const accounts = { ...prevState.accounts }
              delete accounts[accountId]
              accounts[normalizedNewEmail] = { ...account, user: updatedUser }

              return {
                accounts,
                user: updatedUser,
                activeAccountId: normalizedNewEmail,
                rememberedEmail: emailsMatch(prevState.rememberedEmail, previousEmail)
                  ? trimmedEmail ?? previousEmail
                  : prevState.rememberedEmail
              }
            })
            return
          }

          commitAccountChange(accountId, { ...account, user: updatedUser })

          if (trimmedEmail && !emailsMatch(previousEmail, trimmedEmail)) {
            set((prevState) => (
              emailsMatch(prevState.rememberedEmail, previousEmail)
                ? { rememberedEmail: trimmedEmail }
                : {}
            ))
          }
        },

        upgradeSubscription(tier, options = {}) {
          const state = get()
          const accountId = state.activeAccountId
          if (!accountId) return

          const account = state.accounts[accountId]
          if (!account) return

          const now = new Date()
          const plan = getPlanForTier(tier)
          const canStartTrial = Boolean(plan.trial) && options.startTrial && tier === 'premium' && !account.user.claimedPremiumTrial
          const trialDurationMonths = options.trialDurationMonths ?? plan.trial?.durationMonths ?? 0
          const billingCycle = options.billingCycle ?? account.user.billingCycle ?? 'monthly'

          const trialEndsAt = canStartTrial ? addMonths(now, trialDurationMonths || 1).toISOString() : null
          const subscriptionStatus: User['subscriptionStatus'] = canStartTrial ? 'trial' : 'active'
          const renewalDate = tier === 'free'
            ? null
            : canStartTrial
              ? trialEndsAt
              : calculateRenewalDate(billingCycle, now)

          const updatedAccount: StoredAccount = {
            ...account,
            user: {
              ...account.user,
              subscriptionTier: tier,
              subscriptionStatus,
              subscriptionStartedAt: account.user.subscriptionStartedAt || now.toISOString(),
              subscriptionRenewalDate: renewalDate,
              trialEndsAt,
              billingCycle,
              claimedPremiumTrial: tier === 'premium'
                ? account.user.claimedPremiumTrial || Boolean(canStartTrial)
                : account.user.claimedPremiumTrial,
              usage: {
                ...account.user.usage,
                aiReflectionsUsed: 0,
                aiMessagesUsed: 0,
                apiCallsUsed: 0,
                lastUpdated: now.toISOString()
              }
            }
          }

          commitAccountChange(accountId, updatedAccount)
        },

        hasFeature(featureId) {
          const tier = get().user?.subscriptionTier ?? 'free'
          return hasPlanFeature(tier, featureId)
        },

        getCurrentPlan() {
          const tier = get().user?.subscriptionTier ?? 'free'
          return getPlanForTier(tier)
        },

        canSendAIMessage() {
          const state = get()
          if (!state.user) {
            return {
              allowed: false,
              reason: 'Please sign in to chat with Eunonix AI.'
            }
          }

          const account = refreshActiveAccountUsage()
          if (!account) {
            return { allowed: false, reason: 'User session not found.' }
          }

          const plan = getPlanForTier(account.user.subscriptionTier)
          const limit = plan.limits.aiCompanionMessages
          if (limit === 'unlimited') {
            return { allowed: true }
          }

          const remaining = limit - account.user.usage.aiMessagesUsed
          if (remaining <= 0) {
            return {
              allowed: false,
              reason: 'You have used all monthly AI companion messages. Upgrade to Premium for unlimited access.'
            }
          }

          return { allowed: true, remaining }
        },

        recordAIMessage() {
          const state = get()
          const accountId = state.activeAccountId
          if (!accountId) return

          const account = refreshActiveAccountUsage()
          if (!account) return

          const updatedAccount: StoredAccount = {
            ...account,
            user: {
              ...account.user,
              usage: {
                ...account.user.usage,
                aiMessagesUsed: account.user.usage.aiMessagesUsed + 1
              }
            }
          }

          commitAccountChange(accountId, updatedAccount)
        },

        installPlugin(pluginId) {
          const store = get()

          if (!store.isAuthenticated) {
            store.requireAuth('install marketplace plugins', {
              message: 'Sign in to install marketplace plugins.'
            })
            return
          }

          const accountId = store.activeAccountId
          if (!accountId) {
            store.requireAuth('install marketplace plugins', {
              message: 'Sign in to install marketplace plugins.'
            })
            return
          }

          const account = store.accounts[accountId]
          if (!account) {
            store.requireAuth('install marketplace plugins', {
              message: 'Sign in to install marketplace plugins.'
            })
            return
          }

          const plan = getPlanForTier(account.user.subscriptionTier)
          const pluginFeatureEnabled = hasPlanFeature(account.user.subscriptionTier, 'plugins') || hasPlanFeature(account.user.subscriptionTier, 'unlimited-plugins')

          if (!pluginFeatureEnabled) {
            store.showPlanLimit('access the plugin marketplace', {
              upgradeTier: 'premium',
              message: 'Upgrade to Premium to install plugins from the marketplace.'
            })
            return
          }

          const limit = plan.limits.pluginInstalls
          if (limit !== 'unlimited' && account.user.installedPlugins.length >= limit) {
            store.showPlanLimit('install more plugins', {
              upgradeTier: 'pro',
              message: `You have reached your plugin limit on the ${plan.name} plan. Upgrade to Pro for unlimited installs.`
            })
            return
          }

          if (account.user.installedPlugins.includes(pluginId)) {
            return
          }

          const updatedAccount: StoredAccount = {
            ...account,
            user: {
              ...account.user,
              installedPlugins: [...account.user.installedPlugins, pluginId]
            }
          }

          commitAccountChange(accountId, updatedAccount)
        },

        uninstallPlugin(pluginId) {
          const state = get()
          const accountId = state.activeAccountId
          if (!accountId) return

          const account = state.accounts[accountId]
          if (!account) return

          if (!account.user.installedPlugins.includes(pluginId)) {
            return
          }

          const updatedAccount: StoredAccount = {
            ...account,
            user: {
              ...account.user,
              installedPlugins: account.user.installedPlugins.filter((id) => id !== pluginId)
            }
          }

          commitAccountChange(accountId, updatedAccount)
        },

        isPluginInstalled(pluginId) {
          const state = get()
          const accountId = state.activeAccountId
          if (!accountId) return false

          const account = state.accounts[accountId]
          return account ? account.user.installedPlugins.includes(pluginId) : false
        },

        createDeveloperProfile() {
          const store = get()
          const accountId = store.activeAccountId

          if (!store.isAuthenticated || !accountId) {
            store.requireAuth('activate developer tools', {
              message: 'Sign in to activate developer tools.'
            })
            return
          }

          const account = store.accounts[accountId]
          if (!account) {
            store.requireAuth('activate developer tools', {
              message: 'Sign in to activate developer tools.'
            })
            return
          }

          if (store.developerProfile) {
            return
          }

          if (!hasPlanFeature(account.user.subscriptionTier, 'developer-tools')) {
            store.showPlanLimit('access developer tools', {
              upgradeTier: 'pro',
              message: 'Developer tools are included with the Pro plan and above.'
            })
            return
          }

          const plan = getPlanForTier(account.user.subscriptionTier)
          const profile: DeveloperProfile = {
            userId: account.user.id,
            publishedPlugins: [],
            totalDownloads: 0,
            revenue: 0,
            apiUsage: {
              calls: 0,
              limit: plan.limits.apiAccess ? 100000 : 0
            }
          }

          set((prevState) => ({
            developerProfiles: {
              ...prevState.developerProfiles,
              [account.user.id]: profile
            },
            developerProfile: profile
          }))
        },

        generateAPIKey() {
          const store = get()
          const accountId = store.activeAccountId
          if (!store.isAuthenticated || !accountId) {
            store.requireAuth('generate API keys', {
              message: 'Sign in to generate API keys.'
            })
            return ''
          }

          const account = store.accounts[accountId]
          if (!account) {
            store.requireAuth('generate API keys', {
              message: 'Sign in to generate API keys.'
            })
            return ''
          }

          const plan = getPlanForTier(account.user.subscriptionTier)
          if (!plan.limits.apiAccess) {
            store.showPlanLimit('generate API keys', {
              upgradeTier: 'pro',
              message: 'API access is available on the Pro plan and above.'
            })
            return ''
          }

          const refreshed = ensureUsageFreshness(account)
          const key = `eunonix_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`

          const updatedAccount: StoredAccount = {
            ...refreshed,
            user: {
              ...refreshed.user,
              apiKeys: [...refreshed.user.apiKeys, key]
            }
          }

          commitAccountChange(accountId, updatedAccount)

          return key
        },

        revokeAPIKey(key) {
          const state = get()
          const accountId = state.activeAccountId
          if (!accountId) return

          const account = state.accounts[accountId]
          if (!account) return

          if (!account.user.apiKeys.includes(key)) {
            return
          }

          const updatedAccount: StoredAccount = {
            ...account,
            user: {
              ...account.user,
              apiKeys: account.user.apiKeys.filter((existingKey) => existingKey !== key)
            }
          }

          commitAccountChange(accountId, updatedAccount)
        },

        publishPlugin(plugin) {
          const store = get()
          const profile = store.developerProfile
          if (!profile) return

          if (profile.publishedPlugins.includes(plugin.id)) {
            return
          }

          const accountId = store.activeAccountId
          if (!accountId) return

          const account = store.accounts[accountId]
          if (!account) return

          if (!hasPlanFeature(account.user.subscriptionTier, 'developer-tools')) {
            store.showPlanLimit('publish marketplace plugins', {
              upgradeTier: 'pro',
              message: 'Upgrade to the Pro plan to publish plugins to the marketplace.'
            })
            return
          }

          const updatedProfile: DeveloperProfile = {
            ...profile,
            publishedPlugins: [...profile.publishedPlugins, plugin.id]
          }

          set((prevState) => ({
            developerProfiles: {
              ...prevState.developerProfiles,
              [profile.userId]: updatedProfile
            },
            developerProfile: updatedProfile
          }))
        },

        setRememberedEmail(email) {
          set({ rememberedEmail: email ? email.trim() : null })
        },

        requireAuth(feature, options) {
          const state = get()
          if (state.isAuthenticated) {
            return true
          }

          const title = options?.title ?? 'Sign in to continue'
          const message = options?.message ?? `Create a free account to ${feature.toLowerCase()}.`

          set({
            authPrompt: {
              feature,
              title,
              message,
              mode: 'auth',
              primaryAction: {
                label: 'Sign In',
                route: '/login',
                variant: 'primary'
              },
              secondaryAction: {
                label: 'Create free account',
                route: '/signup',
                variant: 'secondary'
              }
            }
          })

          return false
        },

        clearAuthPrompt() {
          set((state) => (state.authPrompt ? { authPrompt: null } : {}))
        },

        showPlanLimit(feature, options = {}) {
          const tier = get().user?.subscriptionTier ?? 'free'
          const upgradeTier = options.upgradeTier ?? (tier === 'free' ? 'premium' : 'pro')
          const plan = SUBSCRIPTION_PLANS[upgradeTier]
          const title = 'Unlock more with Eunonix Premium'
          const message = options.message ?? `Upgrade to ${plan.name} to unlock unlimited ${feature.toLowerCase()}.`

          set({
            authPrompt: {
              feature,
              title,
              message,
              mode: 'limit',
              primaryAction: {
                label: 'View plans',
                route: '/pricing',
                variant: 'primary'
              },
              secondaryAction: {
                label: 'Maybe later',
                route: '',
                variant: 'secondary'
              }
            }
          })
        }
      }
    },
    {
      name: 'eunonix-auth',
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        user: state.user,
        developerProfile: state.developerProfile,
        isAuthenticated: state.isAuthenticated,
        activeAccountId: state.activeAccountId,
        accounts: state.accounts,
        developerProfiles: state.developerProfiles,
        rememberedEmail: state.rememberedEmail
      }),
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return createInitialState()
        }

        if (version <= 1) {
          return createInitialState()
        }

        return persistedState as AuthStoreState
      }
    }
  )
)

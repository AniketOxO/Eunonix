import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUBSCRIPTION_PLANS, FEATURE_COMPARISON } from '@/config/subscriptionPlans'
import { SubscriptionTier } from '@/types/subscription'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { PaymentModal } from '@/components/PaymentModal'

type NoticeTone = 'info' | 'success' | 'warning'

interface PlanNoticeAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

interface PlanNotice {
  title: string
  message: string
  tone: NoticeTone
  actions?: PlanNoticeAction[]
}

const TONE_GRADIENTS: Record<NoticeTone, string> = {
  info: 'from-lilac-500/95 to-ink-700/95',
  success: 'from-emerald-400/95 to-emerald-600/95',
  warning: 'from-amber-400/95 to-rose-500/95'
}

const renderNoticeIcon = (tone: NoticeTone) => {
  if (tone === 'success') {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  if (tone === 'warning') {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A1 1 0 002.64 20h18.72a1 1 0 00.86-1.44l-8.48-14.7a1 1 0 00-1.72 0z" />
      </svg>
    )
  }

  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
  )
}

const PlanNoticeToast = ({ notice, onClose }: { notice: PlanNotice; onClose: () => void }) => (
  <motion.div
    key={`${notice.title}-${notice.message}`}
    initial={{ opacity: 0, y: 24, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 12, scale: 0.95 }}
    transition={{ type: 'spring', damping: 18, stiffness: 220 }}
    className={`pointer-events-auto w-full max-w-md rounded-3xl bg-gradient-to-br ${TONE_GRADIENTS[notice.tone]} text-white shadow-2xl p-6 flex gap-4`}
  >
    <div className="shrink-0 flex items-start justify-center pt-0.5 text-white">
      {renderNoticeIcon(notice.tone)}
    </div>
    <div className="flex-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{notice.title}</h3>
          <p className="text-sm text-white/85 mt-2 leading-relaxed">{notice.message}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/15 hover:bg-white/25 transition-colors w-8 h-8 flex items-center justify-center"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {notice.actions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {notice.actions.map((action, index) => (
            <button
              key={`${action.label}-${index}`}
              onClick={() => {
                action.onClick()
                onClose()
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                action.variant === 'primary'
                  ? 'bg-white text-ink-800 hover:bg-white/90'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  </motion.div>
)

const Pricing = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, upgradeSubscription, requireAuth } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [planNotice, setPlanNotice] = useState<PlanNotice | null>(null)

  const plans = Object.values(SUBSCRIPTION_PLANS)

  const handleUpgrade = (tier: SubscriptionTier) => {
    const isAuthorized = requireAuth('choose a plan', {
      message: 'Create a free Eunonix account to pick the plan that fits you best.'
    })

    if (!isAuthorized) {
      return
    }

    if (user?.subscriptionTier === tier) {
      setPlanNotice({
        tone: 'warning',
        title: 'Already on this plan',
        message: `You are already enjoying the ${SUBSCRIPTION_PLANS[tier].name} plan. Explore other tiers to experience more features.`
      })
      return
    }
    
    if (tier === 'enterprise') {
      window.location.href = 'mailto:enterprise@eunonix.app?subject=Enterprise Plan Inquiry'
      return
    }

    if (tier === 'free') {
      upgradeSubscription(tier)
      setPlanNotice({
        tone: 'info',
        title: 'Switched to Free',
        message: 'You are back on the Free plan. Premium features will pause, but your data stays safe.'
      })
      return
    }

    if (tier === 'premium') {
      const trialAvailable = SUBSCRIPTION_PLANS.premium.trial && !user?.claimedPremiumTrial
      const alreadyOnTrial = user?.subscriptionTier === 'premium' && user?.subscriptionStatus === 'trial'

      if (trialAvailable && !alreadyOnTrial) {
        upgradeSubscription('premium', {
          startTrial: true,
          billingCycle,
          trialDurationMonths: SUBSCRIPTION_PLANS.premium.trial?.durationMonths
        })
        setPlanNotice({
          tone: 'success',
          title: 'Premium trial activated',
          message: 'Enjoy your first month of Premium on us. Unlock unlimited AI reflections, advanced insights, and more for the next 30 days.'
        })
        return
      }

      if (alreadyOnTrial && user?.trialEndsAt) {
        setPlanNotice({
          tone: 'info',
          title: 'Trial already active',
          message: `Your Premium trial is active until ${new Date(user.trialEndsAt).toLocaleDateString()}. Explore the full experience before it ends.`
        })
        return
      }
    }
    
    // Open payment modal for paid plans
    setSelectedTier(tier)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    if (selectedTier) {
      const tier = selectedTier
      upgradeSubscription(tier, { billingCycle })
      setPlanNotice({
        tone: 'success',
        title: 'Plan upgraded',
        message: `Successfully upgraded to ${SUBSCRIPTION_PLANS[tier].name}. Your new benefits are ready to explore.`
      })
      setSelectedTier(null)
    }
  }

  const getPrice = (tier: SubscriptionTier) => {
    const plan = SUBSCRIPTION_PLANS[tier]
    if (tier === 'enterprise') return 'Custom'

    if (plan.trial && tier === 'premium') {
      if (user?.subscriptionTier === 'premium' && user?.subscriptionStatus === 'trial' && user?.trialEndsAt) {
        return 'Trial Active'
      }

      if (!user || !user.claimedPremiumTrial) {
        return plan.trial.label || 'Free Trial'
      }
    }

    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly
    return billingCycle === 'monthly' ? `$${price}/mo` : `$${price}/yr`
  }

  const getPriceSubtitle = (tier: SubscriptionTier) => {
    const plan = SUBSCRIPTION_PLANS[tier]
    if (tier === 'enterprise') return 'Contact Sales'

    const baseLabel = billingCycle === 'monthly' ? `$${plan.price.monthly}/mo` : `$${plan.price.yearly}/yr`

    if (plan.trial && tier === 'premium') {
      if (user?.subscriptionTier === 'premium' && user?.subscriptionStatus === 'trial' && user?.trialEndsAt) {
        return `Ends ${new Date(user.trialEndsAt).toLocaleDateString()} · Then ${baseLabel}`
      }

      if (!user || !user.claimedPremiumTrial) {
        return `Then ${baseLabel}`
      }
    }

    return null
  }

  const getSavings = (tier: SubscriptionTier) => {
    const plan = SUBSCRIPTION_PLANS[tier]
    if (tier === 'free' || tier === 'enterprise') return null
    if (plan.trial && tier === 'premium') {
      if (!user || !user.claimedPremiumTrial) return null
  if (user?.subscriptionStatus === 'trial') return null
    }
    const monthlyCost = plan.price.monthly * 12
    const yearlyCost = plan.price.yearly
    const saved = monthlyCost - yearlyCost
    return saved > 0 ? `Save $${saved.toFixed(2)}` : null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-lilac-50">
      {/* Header */}
      <header className="border-b border-ink-200/20 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="cursor-pointer flex items-center gap-3"
              onClick={() => navigate('/home')}
              whileHover={{ scale: 1.02 }}
            >
              <h1 className="text-2xl font-semibold text-ink-800">Eunonix</h1>
            </motion.div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-xl border border-ink-200/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilac-400 to-pink-400 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-ink-800">{user?.name || 'User'}</p>
                      <p className="text-xs text-ink-500 capitalize">{user?.subscriptionTier || 'free'} Plan</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-light text-ink-900 mb-4">
            Choose Your <span className="text-gradient font-medium">Growth Path</span>
          </h1>
          <p className="text-xl text-ink-600 mb-8">
            From free exploration to enterprise transformation
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-lilac-500 to-ink-600 text-white shadow-md'
                  : 'text-ink-600 hover:text-ink-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-lilac-500 to-ink-600 text-white shadow-md'
                  : 'text-ink-600 hover:text-ink-800'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan, index) => {
            const isCurrentPlan = isAuthenticated && user?.subscriptionTier === plan.tier

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/60 backdrop-blur-sm rounded-3xl border-2 p-8 hover:shadow-xl transition-all ${
                  plan.tier === 'premium'
                    ? 'border-gradient from-lilac-400 to-golden-400 shadow-lg scale-105'
                    : 'border-ink-200/30'
                }`}
              >
                {/* Badge/Label at top */}
              {plan.tier === 'free' && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">Get Started</span>
                </div>
              )}
              {plan.tier === 'premium' && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-700">Most Popular</span>
                </div>
              )}
              {plan.tier === 'pro' && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="text-sm font-medium text-orange-700">For Creators</span>
                </div>
              )}
              {plan.tier === 'enterprise' && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium text-indigo-700">For Teams</span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-medium text-ink-800 mb-2">{plan.name}</h3>
                <div className="text-4xl font-light text-ink-900 mb-1">
                  {getPrice(plan.tier)}
                </div>
                {getPriceSubtitle(plan.tier) && (
                  <p className="text-sm text-ink-600 mb-1">
                    {getPriceSubtitle(plan.tier)}
                  </p>
                )}
                {billingCycle === 'yearly' && getSavings(plan.tier) && (
                  <p className="text-sm text-green-600 font-medium">
                    {getSavings(plan.tier)}
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.slice(0, 6).map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3">
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                      <svg className="w-full h-full text-lilac-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-ink-700">{feature.name}</span>
                  </div>
                ))}
                {plan.features.length > 6 && (
                  <p className="text-xs text-ink-500 pl-8">
                    + {plan.features.length - 6} more features
                  </p>
                )}
              </div>

              <Button
                onClick={() => handleUpgrade(plan.tier)}
                variant={plan.tier === 'premium' ? 'primary' : isCurrentPlan ? 'secondary' : 'ghost'}
                className={`w-full ${isCurrentPlan ? 'opacity-90' : ''}`}
              >
                {isCurrentPlan
                  ? 'Current Plan'
                  : plan.tier === 'free'
                    ? 'Start Free'
                    : plan.tier === 'enterprise'
                      ? 'Contact Sales'
                      : plan.tier === 'premium' && (!user || !user.claimedPremiumTrial) && user?.subscriptionStatus !== 'trial'
                        ? 'Start 1-Month Free'
                        : 'Get Started'}
              </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl border border-ink-200/30 p-8"
        >
          <h2 className="text-3xl font-light text-ink-900 mb-8 text-center">
            Detailed Comparison
          </h2>

          {FEATURE_COMPARISON.map((category, catIndex) => (
            <div key={catIndex} className="mb-8 last:mb-0">
              <h3 className="text-lg font-medium text-ink-800 mb-4 pb-2 border-b border-ink-200/30">
                {category.category}
              </h3>
              
              <div className="space-y-3">
                {category.features.map((feature, featIndex) => (
                  <div
                    key={featIndex}
                    className="grid grid-cols-5 gap-4 items-center py-3 hover:bg-sand-50/50 rounded-xl px-4 transition-colors"
                  >
                    <div className="col-span-1 text-sm text-ink-600 font-medium">
                      {feature.name}
                    </div>
                    <div className="text-center text-sm text-ink-700">
                      {feature.free === '✓' ? (
                        <svg className="w-5 h-5 text-lilac-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : feature.free === '✗' ? (
                        <span className="text-ink-400">—</span>
                      ) : (
                        feature.free
                      )}
                    </div>
                    <div className="text-center text-sm text-ink-700 font-medium">
                      {feature.premium === '✓' ? (
                        <svg className="w-5 h-5 text-lilac-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : feature.premium === '✗' ? (
                        <span className="text-ink-400">—</span>
                      ) : (
                        feature.premium
                      )}
                    </div>
                    <div className="text-center text-sm text-ink-700 font-medium">
                      {feature.pro === '✓' ? (
                        <svg className="w-5 h-5 text-lilac-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : feature.pro === '✗' ? (
                        <span className="text-ink-400">—</span>
                      ) : (
                        feature.pro
                      )}
                    </div>
                    <div className="text-center text-sm text-ink-700 font-medium">
                      {feature.enterprise === '✓' ? (
                        <svg className="w-5 h-5 text-lilac-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : feature.enterprise === '✗' ? (
                        <span className="text-ink-400">—</span>
                      ) : (
                        feature.enterprise
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Emotional API CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 bg-gradient-to-r from-lilac-500 to-ink-600 rounded-3xl p-12 text-white text-center"
        >
          <h2 className="text-3xl font-light mb-4">
            Build on the Emotional API
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Developers: integrate emotional intelligence into your apps with our privacy-first API.
            The infrastructure layer of emotional technology.
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/api-docs')}
              className="px-8 py-4 bg-white text-ink-800 rounded-full font-medium hover:bg-white/90 transition-all shadow-lg min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              View API Docs
            </motion.button>
            <motion.button
              onClick={() => navigate('/developer')}
              className="px-8 py-4 border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition-all min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Developer Portal
            </motion.button>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-light text-ink-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! Upgrade or downgrade anytime. Changes take effect immediately with prorated billing.'
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data is yours forever. Export everything anytime. We keep it for 90 days after cancellation.'
              },
              {
                q: 'Is the Emotional API free to try?',
                a: 'Pro plan includes 10,000 API calls/day. Start with a 14-day free trial to test integrations.'
              },
              {
                q: 'Do you offer student discounts?',
                a: 'Yes! Students get 50% off Premium and Pro plans with valid student ID verification.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ink-200/30 p-6">
                <h3 className="font-medium text-ink-800 mb-2">{faq.q}</h3>
                <p className="text-sm text-ink-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Payment Modal */}
      {selectedTier && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          tier={selectedTier}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <AnimatePresence>
        {planNotice && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <PlanNoticeToast notice={planNotice} onClose={() => setPlanNotice(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Pricing


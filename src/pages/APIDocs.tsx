import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { useNavigate } from 'react-router-dom'

const sections = [
  {
    title: 'Quickstart',
    description: 'Generate an API key, authenticate requests, and stream live emotional telemetry in under five minutes.',
    items: ['Create a developer account', 'Install the Eunonix SDK', 'Authenticate with your API key', 'Send your first emotion snapshot']
  },
  {
    title: 'Endpoints',
    description: 'Discover REST and WebSocket surfaces that power Eunonix experiences.',
    items: ['POST /v1/emotions — submit practitioner-labelled emotions', 'GET /v1/insights — retrieve adaptive guidance', 'WS /v1/stream — subscribe to real-time energy changes']
  },
  {
    title: 'SDK Guides',
    description: 'Drop in prebuilt helpers and typing for TypeScript, Swift, and Kotlin apps.',
    items: ['TypeScript SDK — plug straight into Vite/React apps', 'Swift SDK — integrate with iOS and visionOS clients', 'Kotlin SDK — build mindful Android experiences']
  }
]

const APIDocs = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-breath-blue/10">
      <header className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.p
          className="text-sm uppercase tracking-[0.35em] text-lilac-500 font-semibold mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Eunonix Emotional API
        </motion.p>
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-light text-ink-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Documentation & SDK Guides
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-ink-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Build neuroadaptive experiences with Eunonix. Explore endpoints, authentication patterns, and starter kits designed for emotional intelligence at scale.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Button onClick={() => navigate('/developer')} variant="secondary">
            Developer Portal
          </Button>
          <Button onClick={() => navigate('/home')} variant="ghost">
            Back to Eunonix
          </Button>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-24 space-y-12">
        {sections.map((section, index) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            className="rounded-3xl bg-white/70 backdrop-blur-xl border border-ink-200/30 shadow-[0_18px_40px_rgba(90,75,183,0.08)] p-8 sm:p-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-ink-900 mb-3">{section.title}</h2>
                <p className="text-ink-600 text-base sm:text-lg max-w-2xl">{section.description}</p>
              </div>
              <div className="flex items-center gap-2 text-lilac-500/80 text-sm uppercase tracking-[0.35em]">
                <span>Guide</span>
                <span className="block h-px w-12 bg-lilac-200" />
              </div>
            </div>
            <ul className="space-y-4 text-base text-ink-700">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-lilac-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        ))}

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: sections.length * 0.1 }}
          className="rounded-3xl bg-white/80 backdrop-blur-xl border border-ink-200/30 shadow-[0_18px_40px_rgba(90,75,183,0.08)] p-8 sm:p-12"
        >
          <h2 className="text-2xl sm:text-3xl font-light text-ink-900 mb-4">Support & Sandbox Access</h2>
          <p className="text-ink-600 text-base sm:text-lg mb-6 max-w-3xl">
            Need a dedicated sandbox environment or enterprise access tokens? Reach out to our integrations team and we will bootstrap your workspace within one business day.
          </p>
          <Button variant="primary" onClick={() => navigate('/developer')}>
            Contact Integrations Team
          </Button>
        </motion.section>
      </main>
    </div>
  )
}

export default APIDocs

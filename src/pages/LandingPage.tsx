import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Ripple } from '@/components/Ripple'
import { GlassCard } from '@/components/GlassCard'
import { Button } from '@/components/Button'
import { PulseLine } from '@/components/PulseLine'
import { InnerGuideAnimation } from '@/components/InnerGuideAnimation'
import { BreathingOrb } from '@/components/BreathingOrb'
import { ThreeDBrain } from '@/components/ThreeDBrain'

const LandingPage = () => {
  const navigate = useNavigate()

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-breath-blue to-sand-100 overflow-hidden">
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <BreathingOrb 
          size={400} 
          color="bg-gradient-to-br from-lilac-300/20 to-transparent"
          className="absolute -top-20 -right-20"
        />
        <BreathingOrb 
          size={300} 
          color="bg-gradient-to-br from-golden-300/15 to-transparent"
          className="absolute top-1/2 -left-20"
        />
        <BreathingOrb 
          size={350} 
          color="bg-gradient-to-br from-ink-300/10 to-transparent"
          className="absolute bottom-0 right-1/4"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="text-xl sm:text-2xl font-semibold text-ink-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            Eunonix
          </motion.div>
          
          <motion.div 
            className="flex gap-3 sm:gap-6 items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <a
              href="#features"
              className="hidden sm:inline text-ink-600 hover:text-ink-800 transition-colors text-sm sm:text-base"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('features')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              Features
            </a>
            <Link to="/pricing" className="hidden sm:inline text-ink-600 hover:text-ink-800 transition-colors text-sm sm:text-base">
              Pricing
            </Link>
            <Link to="/marketplace" className="hidden sm:inline text-ink-600 hover:text-ink-800 transition-colors text-sm sm:text-base">
              Marketplace
            </Link>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-sm sm:text-base px-4 sm:px-8 py-2 sm:py-4">
              Dashboard
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section - "Meet Your Mind" */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <Ripple className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto mb-8 sm:mb-12">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/60 to-lilac-200/40 backdrop-blur-sm flex items-center justify-center">
              <PulseLine intensity={60} className="w-32 sm:w-40 lg:w-48" />
            </div>
          </Ripple>

          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-ink-900 mb-4 sm:mb-6 leading-tight px-4"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Your mind is <span className="text-gradient font-medium">alive</span>.
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-ink-600 mb-8 sm:mb-12 font-light px-4"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Eunonix helps you understand it — one thought at a time.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button onClick={() => navigate('/dashboard')} className="text-sm sm:text-base">
              Start Free
            </Button>
            <Button onClick={() => navigate('/pricing')} variant="ghost" className="text-sm sm:text-base">
              View Pricing
            </Button>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="mt-12 sm:mt-16 text-xs sm:text-sm text-ink-400 font-medium tracking-wide uppercase px-4"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Upgrade yourself, one thought at a time
          </motion.p>

        </div>
      </section>

      {/* Section 2 - "Understand. Sync. Evolve." */}
      <section id="features" className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-light text-center text-ink-900 mb-12 sm:mb-16 lg:mb-20 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Understand. Sync. Evolve.
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Understand */}
            <GlassCard>
              <div className="mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-500/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-ink-800 mb-3">Understand</h3>
                <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                  Mood & thought insights visualized like pulse lines. See the rhythm of your mind in real-time.
                </p>
              </div>
              <PulseLine intensity={40} />
            </GlassCard>

            {/* Sync */}
            <GlassCard>
              <div className="mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-golden-400/20 to-golden-500/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-golden-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-ink-800 mb-3">Sync</h3>
                <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                  Connect tasks, notes, health data, and schedule. Everything flows together seamlessly.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                {[60, 40, 80, 50, 70].map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-golden-400/30 to-golden-300/10 rounded-t-lg"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  />
                ))}
              </div>
            </GlassCard>

            {/* Evolve */}
            <GlassCard>
              <div className="mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lilac-400/20 to-lilac-500/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-lilac-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-ink-800 mb-3">Evolve</h3>
                <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                  Guidance + reflections suggested by AI. Grow with insights tailored to your journey.
                </p>
              </div>
              <motion.div 
                className="mt-4 space-y-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[100, 75, 90].map((width, i) => (
                  <motion.div
                    key={i}
                    className="h-2 bg-gradient-to-r from-lilac-400/30 to-transparent rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${width}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  />
                ))}
              </motion.div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Section 3 - "Your Inner Flow Dashboard" */}
      <section className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-breath-blue/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-ink-900 mb-4 sm:mb-6 px-4">
              Your Inner Flow Dashboard
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-ink-600 max-w-2xl mx-auto px-4">
              A living organism — soft modular cards that breathe with you, colors that adapt to your mood.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <GlassCard className="sm:col-span-2">
              <h3 className="text-lg sm:text-xl font-medium text-ink-800 mb-4">Real-time Emotion Pulse</h3>
              <PulseLine intensity={70} className="h-24 sm:h-32" />
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg sm:text-xl font-medium text-ink-800 mb-4">Focus Map</h3>
              <div className="space-y-3">
                {['Deep Work', 'Creative Flow', 'Rest & Reflect'].map((label, i) => (
                  <motion.div 
                    key={label}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-lilac-400 to-ink-400 animate-pulse-slow" />
                    <span className="text-ink-600">{label}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg sm:text-xl font-medium text-ink-800 mb-4">Daily Reflection</h3>
              <p className="text-sm sm:text-base text-ink-600 italic mb-4">
                "Today I noticed..."
              </p>
              <motion.div
                className="text-sm text-ink-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Start writing to capture this moment
              </motion.div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Section 4 - "Your Inner Guide" */}
      <section id="guide" className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <InnerGuideAnimation />
          
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-light text-ink-900 mb-6 sm:mb-8 mt-8 sm:mt-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Your Inner Guide
          </motion.h2>

          <motion.div
            className="space-y-3 sm:space-y-4 text-lg sm:text-xl lg:text-2xl text-ink-600 font-light leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p>An AI that listens like a <span className="text-lilac-500">friend</span>,</p>
            <p>learns like a <span className="text-golden-500">mentor</span>,</p>
            <p>and guides like your <span className="text-ink-700 font-medium">future self</span>.</p>
          </motion.div>
        </div>
      </section>

      {/* Section 5 - "Private. Human. Evolving." */}
      <section className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-breath-pink/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center" hover={false}>
            <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-ink-400/20 to-lilac-400/20 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.div>
              
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-400/20 to-golden-400/20 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-ink-900 mb-4 sm:mb-6 px-4">
              Private. Human. Evolving.
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-ink-600 font-light mb-3 sm:mb-4 px-4">
              Your data never leaves you.
            </p>
            
            <p className="text-base sm:text-lg lg:text-xl text-ink-500 px-4">
              Eunonix runs privately, learning only what helps you grow.
            </p>

            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-ink-200/30">
              <p className="text-sm sm:text-base text-ink-400 italic px-4">
                "Technology should feel like therapy, not pressure."
              </p>
            </div>
          </GlassCard>
        </div>
      </section>
      {/* Section - Neural Growth Visualizer */}
      <section className="relative z-10 overflow-hidden py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-lilac-200/35 via-white/20 to-breath-blue/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-12%] bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/25 via-white/10 to-transparent blur-3xl" />

        <div className="relative max-w-6xl mx-auto grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 lg:order-1 text-center lg:text-left space-y-6 px-2">
            <motion.span
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/50 px-4 py-1 text-xs sm:text-sm uppercase tracking-[0.3em] text-ink-400"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              Neural Growth Visualizer
            </motion.span>

            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-ink-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              See your mind expand in <span className="text-gradient font-medium">living 3D</span>
            </motion.h2>

            <motion.p
              className="text-base sm:text-lg lg:text-xl text-ink-600 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Layered lobes, neural currents, and glowing synapses responding to your focus, energy, and emotions in real-time.
            </motion.p>

            <motion.div
              className="grid gap-4 sm:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {[{
                label: 'Emotion Layers',
                description: 'Soft gradients reveal the interplay of calm, curiosity, and drive.',
                icon: (
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                gradient: 'from-purple-400/10 to-pink-400/10',
                hoverGradient: 'from-purple-400/20 to-pink-400/20',
                borderColor: 'border-purple-400/30',
                textColor: 'text-purple-600'
              }, {
                label: 'Synapse Trails',
                description: 'Animated neural paths highlight your most active mental loops.',
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                gradient: 'from-blue-400/10 to-cyan-400/10',
                hoverGradient: 'from-blue-400/20 to-cyan-400/20',
                borderColor: 'border-blue-400/30',
                textColor: 'text-blue-600'
              }, {
                label: 'Coherence Score',
                description: 'Track mind-body alignment with real-time resonance pulses.',
                icon: (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                gradient: 'from-green-400/10 to-emerald-400/10',
                hoverGradient: 'from-green-400/20 to-emerald-400/20',
                borderColor: 'border-green-400/30',
                textColor: 'text-green-600'
              }, {
                label: 'Focus Halo',
                description: 'Adaptive glow intensifies during deep concentration blocks.',
                icon: (
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                gradient: 'from-orange-400/10 to-amber-400/10',
                hoverGradient: 'from-orange-400/20 to-amber-400/20',
                borderColor: 'border-orange-400/30',
                textColor: 'text-orange-600'
              }].map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => navigate('/sensory-expansion')}
                  className="group/card relative rounded-2xl border border-white/40 bg-white/60 p-4 text-left shadow-[0_16px_48px_rgba(85,109,143,0.15)] backdrop-blur-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {/* Animated gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Animated border glow */}
                  <div className={`absolute inset-0 rounded-2xl border-2 ${item.borderColor} opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Pulsing dot indicator */}
                  <motion.div
                    className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-gradient-to-br ${item.gradient.replace('/10', '/60')}`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div 
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                    </motion.div>
                    
                    {/* Title with interactive badge */}
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-xs font-semibold uppercase tracking-widest text-ink-400 group-hover/card:${item.textColor} transition-colors duration-300`}>
                        {item.label}
                      </p>
                      <motion.span
                        className={`px-2 py-0.5 bg-gradient-to-r ${item.gradient.replace('/10', '/40')} text-xs rounded-full text-ink-600 font-medium opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`}
                        initial={{ x: 10 }}
                        whileHover={{ x: 0 }}
                      >
                        Try it
                      </motion.span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm sm:text-base text-ink-600 group-hover/card:text-ink-700 transition-colors duration-300">
                      {item.description}
                    </p>
                    
                    {/* Interactive arrow */}
                    <motion.div 
                      className="flex items-center mt-3 text-xs font-medium text-ink-400 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <span className={item.textColor}>Experience Now</span>
                      <svg className="w-4 h-4 ml-1 group-hover/card:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button onClick={() => navigate('/dashboard')} className="text-sm sm:text-base">
                Explore Dashboard
              </Button>
              <p className="text-xs sm:text-sm text-ink-400">Real-time visualization inside Eunonix Studio.</p>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <ThreeDBrain />
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-ink-900 mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Built for Growth
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-ink-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              From personal insights to professional integrations
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Premium Plans */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="group relative p-8 sm:p-10 h-full hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-lilac-400/5 via-purple-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lilac-400/10 to-purple-400/10 mb-6 group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </motion.div>
                  
                  <h3 className="text-2xl sm:text-3xl font-light text-ink-900 mb-3">Premium Plans</h3>
                  <p className="text-ink-600 mb-8 leading-relaxed">
                    Advanced AI reflections, unlimited storage, and priority support
                  </p>
                  
                  <motion.button
                    onClick={() => navigate('/pricing')}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">View Pricing</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Plugin Marketplace */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="group relative p-8 sm:p-10 h-full hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-emerald-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400/10 to-cyan-400/10 mb-6 group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </motion.div>
                  
                  <h3 className="text-2xl sm:text-3xl font-light text-ink-900 mb-3">Plugin Marketplace</h3>
                  <p className="text-ink-600 mb-8 leading-relaxed">
                    Extend Eunonix with integrations for Notion, Spotify, fitness trackers, and more
                  </p>
                  
                  <motion.button
                    onClick={() => navigate('/marketplace')}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Browse Plugins</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-emerald-500 to-green-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Emotional API */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="group relative p-8 sm:p-10 h-full hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 via-rose-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400/10 to-orange-400/10 mb-6 group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </motion.div>
                  
                  <h3 className="text-2xl sm:text-3xl font-light text-ink-900 mb-3">Emotional API</h3>
                  <p className="text-ink-600 mb-8 leading-relaxed">
                    Access real-time emotional intelligence data for your apps and research
                  </p>
                  
                  <motion.button
                    onClick={() => navigate('/pricing')}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Get API Access</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-rose-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-ink-200/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-ink-800 mb-3 sm:mb-4">Eunonix</h3>
              <p className="text-sm sm:text-base text-ink-600">
                Where your mind meets clarity.
              </p>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-medium text-ink-800 mb-3 sm:mb-4">Philosophy</h4>
              <ul className="space-y-2 text-sm sm:text-base text-ink-600">
                <li>Understand your patterns</li>
                <li>Sync with intention</li>
                <li>Evolve consciously</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-medium text-ink-800 mb-3 sm:mb-4">Platform</h4>
              <ul className="space-y-2 text-sm sm:text-base text-ink-600">
                <li><button onClick={() => navigate('/pricing')} className="hover:text-ink-800 transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/marketplace')} className="hover:text-ink-800 transition-colors">Marketplace</button></li>
                <li><button onClick={() => navigate('/neuro-adaptive')} className="hover:text-ink-800 transition-colors">Neuro-Adaptive</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-medium text-ink-800 mb-3 sm:mb-4">Values</h4>
              <ul className="space-y-2 text-sm sm:text-base text-ink-600">
                <li>Privacy first</li>
                <li>Human-centered</li>
                <li>Quietly powerful</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-ink-400 text-sm">
            <p>© 2025 Eunonix. Your mind deserves peace, not performance.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

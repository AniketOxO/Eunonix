# 🧬 LifeOS Development Guide

## 🚀 Quick Start

### Installation

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start at `http://localhost:5173`

## 🎨 Design System

### Color Palette

- **Sand** (`sand-50` to `sand-500`): Warm neutrals for backgrounds
- **Lilac** (`lilac-50` to `lilac-500`): Gentle purple tones for highlights
- **Ink** (`ink-50` to `ink-900`): Deep blue-grays for text and UI
- **Golden** (`golden-50` to `golden-500`): Warm accent for motivation
- **Breath Colors**: Special emotional states
  - `breath-blue`: Calm & reflection
  - `breath-gold`: Motivation & creativity
  - `breath-pink`: Empathy & openness
  - `breath-gray`: Rest & reset

### Typography

- **Font**: Inter (humanistic, rounded)
- **Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Animations

All animations follow the "breathing" metaphor:
- **Breathe**: 4s ease-in-out cycle
- **Ripple**: 3s expanding waves
- **Float**: 6s gentle vertical motion
- **Glow**: 3s pulsing light effect

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Ripple.tsx     # Expanding ripple animation
│   ├── BreathingOrb.tsx  # Floating background orbs
│   ├── GlassCard.tsx  # Glassmorphism cards
│   ├── PulseLine.tsx  # Emotion pulse visualization
│   ├── Button.tsx     # Animated buttons
│   └── InnerGuideAnimation.tsx  # AI guide visualization
├── pages/
│   ├── LandingPage.tsx  # Marketing site
│   └── Dashboard.tsx    # Main app interface
├── store/
│   └── useAppStore.ts   # Zustand state management
├── types/
│   └── index.ts         # TypeScript types
├── utils/
│   └── emotions.ts      # Emotion system utilities
├── App.tsx              # Router setup
├── main.tsx             # React entry point
└── index.css            # Global styles & design tokens
```

## 🧠 Emotion System

The interface adapts to user emotions:

- **Calm** (Blue tones): Reflection, clarity
- **Motivated** (Golden tones): Creativity, energy
- **Empathetic** (Pink tones): Connection, openness
- **Rest** (Gray tones): Recovery, reset

The `--emotion-hue` CSS variable changes dynamically based on the dominant emotion.

## 🎭 Key Components

### Ripple
Expanding ripple effect for hero sections and focus points.

### BreathingOrb
Floating background gradients that pulse and breathe.

### GlassCard
Glassmorphism cards with hover animations and subtle shadows.

### PulseLine
SVG-based visualization of emotional rhythm and intensity.

### InnerGuideAnimation
Animated AI guide with rotating halos and pulse particles.

## 🌊 Motion Principles

1. **Everything breathes** - Subtle scale and opacity changes
2. **Smooth transitions** - 0.6-1s durations with ease curves
3. **Purposeful motion** - Every animation has meaning
4. **Rest states** - UI slows down when user is idle

## 🔧 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Zustand** - State management
- **React Router** - Navigation

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Touch-friendly interactions
- Adaptive layouts

## 🎯 Next Steps

1. **Add authentication** - User accounts and data persistence
2. **Implement AI assistant** - Natural language processing for guidance
3. **Connect data sources** - Calendar, health apps, notes
4. **Build mobile apps** - React Native version
5. **Add voice interface** - Voice-based reflections

## 💡 Philosophy

> "Technology should feel like therapy, not pressure."

Every design decision prioritizes:
- **Calm** over excitement
- **Clarity** over complexity
- **Growth** over productivity
- **Privacy** over features

---

**LifeOS** - Your mind deserves peace, not performance.

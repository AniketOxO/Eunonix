# 🎨 LifeOS Visual Language Guide
## "The Calm Future"

---

## 🔹 Core Mood

**Elegant, soft minimalism** — A hybrid between Apple, Calm, and Muji.

The interface is a **breathing organism** with smooth motion, glowing lines, liquid gradients, and natural textures that evolve with emotions.

---

## 🔹 Design Metaphor

> **"The mind as a flowing interface — like water adapting to its container."**

### Instead of...

- ❌ Stars → ✅ Fluid waves, mist, ripples, light particles
- ❌ Planets → ✅ Organic modules that expand on interaction
- ❌ Outer space → ✅ Living "inner space" — your digital sanctuary

---

## 🎨 Color System

### Primary Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Sand 50** | `#faf9f7` | Main background |
| **Sand 100** | `#f5f3ef` | Secondary background |
| **Lilac 300** | `#d4c3e3` | Accent highlights |
| **Ink 800** | `#2d3749` | Primary text |
| **Ink 600** | `#445775` | Secondary text |
| **Golden 400** | `#e5b671` | Motivation state |

### Emotion Colors

| Emotion | Color | Meaning |
|---------|-------|---------|
| **Calm** | Blue tones (`#e8f1fa`) | Reflection, clarity, peace |
| **Motivated** | Golden tones (`#faf5eb`) | Creativity, energy, drive |
| **Empathetic** | Pale pink (`#fbeef3`) | Openness, connection, care |
| **Rest** | Muted gray (`#f1f3f5`) | Recovery, pause, reset |

---

## ✍️ Typography

### Font Family
- **Primary**: Inter (rounded, humanistic)
- **Fallbacks**: System UI, -apple-system, sans-serif

### Type Scale

```css
Hero Title:      text-6xl (60px) / font-light
Section Title:   text-5xl (48px) / font-light
Card Title:      text-2xl (24px) / font-medium
Body Text:       text-base (16px) / font-normal
Small Text:      text-sm (14px) / font-normal
```

### Font Weights
- **Light (300)**: Large headlines, gentle emphasis
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Subheadings, labels
- **Semibold (600)**: Important UI elements
- **Bold (700)**: Strong emphasis (rare)

---

## 🌊 Motion Design

### Animation Principles

1. **Everything breathes** — Gentle scale (1 → 1.05 → 1) over 4-6s
2. **Smooth transitions** — 0.6-1s durations with easeInOut
3. **Purposeful motion** — Every animation conveys meaning
4. **Respect rest** — UI slows when user is idle

### Core Animations

| Name | Duration | Effect |
|------|----------|--------|
| **Breathe** | 4s | Scale + opacity pulse |
| **Ripple** | 3s | Expanding circles from center |
| **Float** | 6s | Gentle vertical movement |
| **Glow** | 3s | Pulsing light/blur effect |

### Timing Functions
- **Default**: `ease-in-out` (smooth start and end)
- **Entrance**: `ease-out` (fast start, gentle end)
- **Exit**: `ease-in` (gentle start, fast end)

---

## 🪞 Interface Motion Patterns

### On Hover
- Cards: `scale(1.02)` + enhanced shadow
- Buttons: `scale(1.05)` + brightness shift
- Text links: Color transition (300ms)

### On Scroll
- Elements fade in with `opacity: 0 → 1`
- Slight upward motion `y: 20 → 0`
- Stagger delays for lists (0.1s per item)

### Background
- Orbs pulse and breathe continuously
- Subtle position shifts based on time of day
- Color shifts based on dominant emotion

---

## 🎭 Component Patterns

### Glass Cards
```
Background: white/40% opacity
Backdrop blur: 12px
Border: white/60% with 1px
Border radius: 24px (rounded-3xl)
Shadow: 0 8px 32px rgba(0,0,0,0.04)
```

### Buttons
```
Primary: Dark ink background, white text
Secondary: Lilac/40% background, ink text
Ghost: Transparent, hover shows subtle background
Border radius: Full (rounded-full)
Padding: 1rem 2rem (px-8 py-4)
```

### Pulse Lines
- SVG polyline visualization
- Amplitude based on intensity (0-100)
- Dual layers: solid + glowing overlay
- Sine wave pattern for organic feel

---

## 🌱 Brand Voice

### Writing Tone
- **Calm**, not urgent
- **Encouraging**, not pushy
- **Wise**, not preachy
- **Personal**, not corporate

### Example Copy

✅ **Good**: "Your mind is alive. LifeOS helps you understand it."  
❌ **Avoid**: "Maximize productivity! Track everything now!"

✅ **Good**: "Today I noticed..."  
❌ **Avoid**: "Daily Log Entry #47"

✅ **Good**: "The calm way to evolve."  
❌ **Avoid**: "Revolutionary personal growth platform"

---

## 💎 Tagline Options

1. **"Upgrade yourself — one thought at a time."** ⭐ Primary
2. "The calm way to evolve."
3. "Where your mind meets clarity."

---

## 📐 Layout Principles

### Spacing
- **Tight**: 4px, 8px (gap-1, gap-2)
- **Medium**: 16px, 24px (gap-4, gap-6)
- **Generous**: 32px, 48px, 64px (gap-8, gap-12, gap-16)

### Grids
- **Mobile**: Single column
- **Tablet**: 2 columns
- **Desktop**: 3 columns with max-width container

### Max Widths
- **Hero sections**: max-w-4xl (896px)
- **Content sections**: max-w-6xl (1152px)
- **Full-width sections**: max-w-7xl (1280px)

---

## 🎯 Interaction States

### Hover States
- Subtle scale increase (2-5%)
- Enhanced shadow/glow
- Color brightness shift
- Smooth transitions (200-300ms)

### Active/Pressed States
- Scale decrease (98%)
- Reduced shadow
- Instant feedback (<100ms)

### Focus States
- Visible outline for accessibility
- Lilac-400 ring with 2px offset
- Never remove focus indicators

---

## 🌙 Dark Mode (Future)

When implementing dark mode:
- Invert sand → ink palette
- Reduce saturation by 20%
- Increase blur effects
- Soften all glows
- Maintain emotion color hues

---

## ♿ Accessibility

### Color Contrast
- Text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

### Motion
- Respect `prefers-reduced-motion`
- Provide static alternatives
- Never rely solely on motion to convey info

### Keyboard Navigation
- Logical tab order
- Visible focus indicators
- All actions keyboard accessible

---

## 📱 Responsive Breakpoints

| Size | Width | Notes |
|------|-------|-------|
| **Mobile** | < 640px | Single column, larger tap targets |
| **Tablet** | 640-1024px | 2 columns, medium spacing |
| **Desktop** | > 1024px | 3 columns, generous spacing |

---

## 🎨 Usage Examples

### Hero Section
```tsx
<Ripple className="w-80 h-80">
  <div className="rounded-full bg-gradient-to-br from-white/60 to-lilac-200/40">
    <PulseLine intensity={60} />
  </div>
</Ripple>
```

### Emotion-Adaptive Background
```css
.emotion-bg {
  background: hsl(var(--emotion-hue), 60%, 95%);
  transition: background 2s ease;
}
```

### Glass Card
```tsx
<GlassCard className="p-8">
  <h3>Your content here</h3>
</GlassCard>
```

---

## 🎭 Philosophy Reminders

> "Technology should feel like therapy, not pressure."

> "Your mind deserves peace, not performance."

> "This is the quiet revolution in self-technology."

---

**LifeOS** — Upgrade yourself, one thought at a time. 🧬

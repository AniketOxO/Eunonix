# 🎧 Sensory Expansion - 5D Experience Layer

## Overview
**"Where emotion meets sensory tech."**

The Sensory Expansion feature transforms your LifeOS environment into a living, breathing multi-sensory experience that adapts to your emotional state in real-time.

---

## Features

### 1. **Multi-Sensory Integration**
- 🎵 **Sound**: Adaptive soundscapes (nature, ambient, binaural beats, white noise, music)
- 💡 **Light**: Smart ambient lighting with color and pattern control
- 📱 **Touch**: Haptic feedback for emotional grounding
- 🌌 **3D Space**: Immersive visual environments that represent your inner state
- 🎨 **Color**: Dynamic color schemes based on emotional detection

### 2. **Preset Sensory Profiles**

#### Calm Sanctuary
- **Emotion**: Calm
- **Light**: Blue, 40% brightness, breathing pattern
- **Sound**: Nature sounds at 30% volume
- **Haptics**: Gentle calming vibrations (20% intensity)
- **Environment**: Ocean theme in 3D

#### Focused Flow
- **Emotion**: Focused
- **Light**: Purple, 60% brightness, steady
- **Sound**: Binaural beats at 40% volume
- **Haptics**: Focus-enhancing pattern (30% intensity)
- **Environment**: Cosmos theme in 3D

#### Energized Boost
- **Emotion**: Excited
- **Light**: Red, 80% brightness, pulse pattern
- **Sound**: Upbeat music at 60% volume
- **Haptics**: Energizing vibrations (70% intensity)
- **Environment**: Aurora theme in 3D

#### Grounded Earth
- **Emotion**: Anxious
- **Light**: Brown/Earth, 50% brightness, wave pattern
- **Sound**: Nature sounds at 35% volume
- **Haptics**: Grounding pattern (50% intensity)
- **Environment**: Forest theme in 3D

#### Creative Surge
- **Emotion**: Motivated
- **Light**: Orange/Red, 70% brightness, wave pattern
- **Sound**: Ambient music at 45% volume
- **Haptics**: Disabled
- **Environment**: Abstract theme in 3D

### 3. **Real-Time Adaptation**
- Automatically detects your emotional state using:
  - Typing rhythm analysis
  - Interaction patterns
  - Biometric data (optional)
  - Time-of-day heuristics
- Smoothly transitions between sensory profiles
- Maintains balance and focus through environmental adjustments

### 4. **Immersive Mode**
- Full-screen sensory experience
- Animated visual orbs with:
  - Pulse patterns for excited states
  - Breathing patterns for calm states
  - Wave patterns for creative/anxious states
- Minimal UI for deep immersion
- One-click exit

### 5. **Device Integration**
The system checks for and integrates with:
- **Smart Lights**: Philips Hue, LIFX, Nanoleaf via Bluetooth/USB
- **Haptic Devices**: Phone vibration, haptic vests, controllers
- **VR Headsets**: Meta Quest, PSVR, HTC Vive
- **Smart Speakers**: Sonos, HomePod, Alexa for soundscapes
- **Audio Output**: Web Audio API for in-browser sound

### 6. **Customization Controls**

#### Ambient Light
- Color picker with 5 preset colors
- Brightness slider (0-100%)
- Pattern selection (steady, pulse, wave, breathe)

#### Soundscape
- Volume control (0-100%)
- Type selection: Nature, Ambient, Binaural, White Noise, Music

#### Haptic Feedback
- Enable/disable toggle
- Intensity slider (0-100%)
- Test vibration button
- Pattern selection: Calm, Energize, Ground, Focus

#### 3D Environment
- Theme selection: Forest, Ocean, Cosmos, Desert, Aurora
- Depth mode: 2D, 3D, VR (when supported)

---

## Technology Stack

### Frontend
- **React** + **TypeScript**: Core framework
- **Framer Motion**: Smooth animations and transitions
- **Zustand**: State management (integrated with useNeuroAdaptive)

### Emotion Detection
- **useNeuroAdaptive hook**: Real-time emotional state detection
- **emotionEngine**: Advanced pattern recognition
- Sources: Typing rhythm, interaction patterns, biometric data

### Device APIs
- **Navigator API**: Device capability detection
- **Vibration API**: Haptic feedback
- **Web Audio API**: Soundscape generation
- **Fullscreen API**: Immersive mode
- **WebXR** (future): VR integration
- **Bluetooth/USB** (future): Smart device control

---

## User Flow

### 1. **Initial State**
- Dashboard shows current emotional state (detected or default to "neutral")
- Device support indicators show what's available
- Preset profiles displayed in grid

### 2. **Profile Selection**
- Click any preset profile card
- Profile activates immediately
- Haptic feedback confirms selection (if supported)
- Control panel expands below

### 3. **Real-Time Adjustment**
- Use sliders and controls to fine-tune experience
- Changes apply instantly
- Visual feedback for all adjustments

### 4. **Immersive Mode**
- Click "Enter Immersive Mode" button
- Full-screen experience with animated orb
- Breathing text and minimal UI
- Exit button in top-right corner

---

## Integration Points

### Dashboard Navigation
- **Route**: `/sensory`
- **Navigation**: Dashboard header → "Sensory" button
- **Icon**: Sound waves (audio visualization)

### Auth Store
- No additional auth required
- Uses existing user session
- Profiles can be saved per user (future)

### Adaptive Theme System
- Pulls from `useNeuroAdaptive` hook
- Respects user's current emotional state
- Smooth transitions between states (2s duration)

---

## Future Enhancements

### Phase 2: Smart Device Control
- [ ] Philips Hue bridge integration
- [ ] LIFX API connection
- [ ] Nanoleaf rhythm sync
- [ ] Generic RGB device support via USB/Bluetooth

### Phase 3: Advanced Biometrics
- [ ] Heart rate monitor integration (Apple Watch, Fitbit)
- [ ] Webcam-based facial emotion detection
- [ ] Voice tone analysis
- [ ] Galvanic skin response sensors

### Phase 4: VR/AR
- [ ] Meta Quest native app
- [ ] WebXR 3D environments
- [ ] Spatial audio
- [ ] Hand tracking for control

### Phase 5: AI-Generated Soundscapes
- [ ] Custom binaural beats based on emotion
- [ ] Generative ambient music
- [ ] ASMR experiences
- [ ] Voice-guided meditation

### Phase 6: Social Features
- [ ] Share sensory profiles with friends
- [ ] Community preset library
- [ ] Collaborative immersive spaces
- [ ] Live sensory sessions

---

## Accessibility

- ♿ **Full keyboard navigation**: Tab through all controls
- 🎨 **High contrast mode**: Accessible color schemes
- 📖 **Screen reader support**: ARIA labels on all interactive elements
- ⚙️ **Disable animations**: Respects `prefers-reduced-motion`
- 🔊 **Volume controls**: Independent volume for all audio
- 📱 **Mobile responsive**: Touch-optimized controls

---

## Privacy & Data

- ✅ **Local processing only**: No emotional data sent to servers
- ✅ **Permission-based**: Explicit consent for webcam, mic, biometrics
- ✅ **Opt-out anytime**: Disable neuro-adaptive features
- ✅ **No tracking**: Device data stays on device
- ✅ **Transparent**: See exactly what data is being collected

---

## Performance

- **Lightweight**: ~50KB additional bundle size
- **60 FPS animations**: Smooth transitions via Framer Motion
- **Web Workers**: Emotion detection runs off main thread (future)
- **Lazy loading**: 3D environments load on demand
- **Battery efficient**: Animations pause when tab inactive

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Audio | ✅ | ✅ | ✅ | ✅ |
| Haptics | ✅ | ❌ | ✅ | ✅ |
| Fullscreen | ✅ | ✅ | ✅ | ✅ |
| Bluetooth | ✅ | 🟡 | 🟡 | ✅ |
| WebXR | ✅ | 🟡 | ❌ | ✅ |

✅ Full support | 🟡 Partial support | ❌ Not supported

---

## Getting Started

1. **Navigate to Sensory Expansion**
   - From Dashboard → Click "Sensory" in navigation
   - Or visit `/sensory` directly

2. **Review Current State**
   - See your detected emotional state
   - Check device support indicators

3. **Choose a Profile**
   - Browse preset profiles
   - Click to activate
   - Feel haptic confirmation (if supported)

4. **Customize**
   - Adjust light, sound, haptics, environment
   - Changes apply in real-time

5. **Go Immersive**
   - Click "Enter Immersive Mode"
   - Experience full sensory environment
   - Exit when ready

---

## Code Structure

```
src/
├── pages/
│   └── SensoryExpansion.tsx      # Main component
├── hooks/
│   └── useNeuroAdaptive.ts       # Emotion detection hook
├── utils/
│   └── emotionDetection.ts       # Core emotion engine
└── App.tsx                       # Route configuration
```

### Key Components

**SensoryExpansion.tsx**
- Main UI and state management
- Profile selection and activation
- Immersive mode rendering
- Device capability detection

**useNeuroAdaptive.ts**
- Emotion state tracking
- Adaptive theme generation
- Biometric data simulation
- Permission management

**emotionDetection.ts**
- Typing pattern analysis
- Interaction tracking
- Emotion classification
- Confidence scoring

---

## Credits

Inspired by:
- **Notion AI**: Adaptive interfaces
- **Brain.fm**: Focus-enhancing audio
- **Philips Hue**: Smart lighting ecosystems
- **Apple Spatial Audio**: Immersive sound
- **Meta Quest**: VR environments

---

## Support

For issues, questions, or feature requests:
- 📧 Email: support@lifeos.app
- 💬 Community: [community.lifeos.app](https://community.lifeos.app)
- 🐛 Bug reports: GitHub Issues
- 💡 Feature requests: Product roadmap

---

## License

Part of the LifeOS platform.  
© 2025 LifeOS. All rights reserved.

---

**🎧 Your feelings become a living landscape.**

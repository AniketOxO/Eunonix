# Sensory Expansion - Developer Guide

## Quick Start

### Adding a New Sensory Profile

```typescript
const newProfile: SensoryProfile = {
  id: 'unique-id',
  name: 'Display Name',
  emotion: 'calm' | 'anxious' | 'focused' | 'stressed' | 'excited' | 'fatigued',
  ambientLight: {
    color: '#HEXCODE',
    brightness: 0-100,
    pattern: 'steady' | 'pulse' | 'wave' | 'breathe'
  },
  soundscape: {
    type: 'nature' | 'ambient' | 'binaural' | 'white-noise' | 'music',
    volume: 0-100
  },
  haptics: {
    enabled: true,
    pattern: 'calm' | 'energize' | 'ground' | 'focus',
    intensity: 0-100
  },
  visualEnvironment: {
    theme: 'forest' | 'ocean' | 'cosmos' | 'desert' | 'aurora' | 'abstract',
    depth: '2D' | '3D' | 'VR'
  }
}
```

### Integrating Smart Devices

#### Example: Philips Hue Bridge

```typescript
// In SensoryExpansion.tsx
const connectHueBridge = async () => {
  try {
    const response = await fetch('http://<bridge-ip>/api', {
      method: 'POST',
      body: JSON.stringify({ devicetype: 'eunonix#sensory' })
    })
    const data = await response.json()
    const username = data[0].success?.username
    
    // Store username for future requests
    localStorage.setItem('hue_username', username)
    return username
  } catch (error) {
    console.error('Failed to connect to Hue Bridge', error)
  }
}

const setHueLightColor = async (username: string, lightId: number, color: string) => {
  const rgb = hexToRgb(color)
  const xy = rgbToXY(rgb.r, rgb.g, rgb.b)
  
  await fetch(`http://<bridge-ip>/api/${username}/lights/${lightId}/state`, {
    method: 'PUT',
    body: JSON.stringify({
      on: true,
      xy: [xy.x, xy.y],
      bri: Math.round(activeProfile.ambientLight.brightness * 2.54) // 0-254
    })
  })
}
```

#### Example: LIFX API

```typescript
const setLIFXColor = async (token: string, selector: string, color: string) => {
  await fetch(`https://api.lifx.com/v1/lights/${selector}/state`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      color: color,
      brightness: activeProfile.ambientLight.brightness / 100,
      power: 'on'
    })
  })
}
```

### Custom Soundscape Generation

```typescript
import { useEffect, useRef } from 'react'

const useSoundscape = (type: string, volume: number) => {
  const audioContextRef = useRef<AudioContext>()
  const oscillatorRef = useRef<OscillatorNode>()
  
  useEffect(() => {
    const audioContext = new AudioContext()
    audioContextRef.current = audioContext
    
    if (type === 'binaural') {
      // Create binaural beat
      const leftOsc = audioContext.createOscillator()
      const rightOsc = audioContext.createOscillator()
      const merger = audioContext.createChannelMerger(2)
      const gainNode = audioContext.createGain()
      
      leftOsc.frequency.value = 200 // Base frequency
      rightOsc.frequency.value = 210 // +10Hz for theta wave
      
      leftOsc.connect(merger, 0, 0)
      rightOsc.connect(merger, 0, 1)
      merger.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      gainNode.gain.value = volume / 100
      
      leftOsc.start()
      rightOsc.start()
      
      return () => {
        leftOsc.stop()
        rightOsc.stop()
      }
    } else if (type === 'nature') {
      // Load and play nature sounds
      fetch('/sounds/nature.mp3')
        .then(res => res.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
        .then(decodedData => {
          const source = audioContext.createBufferSource()
          const gainNode = audioContext.createGain()
          
          source.buffer = decodedData
          source.loop = true
          gainNode.gain.value = volume / 100
          
          source.connect(gainNode)
          gainNode.connect(audioContext.destination)
          source.start()
          
          oscillatorRef.current = source as any
        })
    }
  }, [type, volume])
  
  return audioContextRef.current
}
```

### Advanced Haptic Patterns

```typescript
const hapticPatterns = {
  calm: [100, 50, 100, 50, 100],
  energize: [50, 30, 50, 30, 50, 30, 50],
  ground: [200, 100, 200, 100, 200],
  focus: [150, 75, 150, 75, 150, 75]
}

const triggerHaptic = (pattern: keyof typeof hapticPatterns, intensity: number) => {
  if ('vibrate' in navigator) {
    const scaledPattern = hapticPatterns[pattern].map(ms => 
      Math.round(ms * (intensity / 100))
    )
    navigator.vibrate(scaledPattern)
  }
}

// Usage
triggerHaptic('calm', 50) // 50% intensity
```

### WebXR Integration (VR)

```typescript
const enterVR = async () => {
  if ('xr' in navigator) {
    const xr = navigator.xr as any
    const isSupported = await xr.isSessionSupported('immersive-vr')
    
    if (isSupported) {
      const session = await xr.requestSession('immersive-vr')
      
      // Create 3D scene based on visualEnvironment.theme
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl', { xrCompatible: true })
      
      session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, gl)
      })
      
      const render = (time: number, frame: XRFrame) => {
        session.requestAnimationFrame(render)
        
        // Render 3D environment
        const pose = frame.getViewerPose(referenceSpace)
        if (pose) {
          // Draw scene based on activeProfile.visualEnvironment.theme
        }
      }
      
      session.requestAnimationFrame(render)
    }
  }
}
```

### Emotion Detection Integration

```typescript
import { emotionEngine } from '@/utils/emotionDetection'

// Track custom interactions
const trackInteraction = (type: string, value: number) => {
  emotionEngine.recordInteraction(type, value)
}

// Get smoothed emotion
const getCurrentEmotion = () => {
  const metrics = emotionEngine.getSmoothedEmotion()
  return {
    state: metrics.state,
    confidence: metrics.confidence
  }
}

// Auto-select profile based on emotion
useEffect(() => {
  const interval = setInterval(() => {
    const emotion = getCurrentEmotion()
    
    if (emotion.confidence > 0.7) {
      const matchingProfile = PRESET_PROFILES.find(
        p => p.emotion === emotion.state
      )
      
      if (matchingProfile && matchingProfile.id !== activeProfile?.id) {
        activateProfile(matchingProfile)
      }
    }
  }, 10000) // Check every 10s
  
  return () => clearInterval(interval)
}, [activeProfile])
```

### Custom 3D Environments

```typescript
import * as THREE from 'three'

const create3DEnvironment = (theme: string) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ alpha: true })
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  if (theme === 'ocean') {
    // Ocean environment
    const geometry = new THREE.PlaneGeometry(100, 100, 100, 100)
    const material = new THREE.MeshPhongMaterial({
      color: 0x0077be,
      wireframe: false,
      transparent: true,
      opacity: 0.6
    })
    const plane = new THREE.Mesh(geometry, material)
    
    // Animate waves
    const vertices = geometry.attributes.position.array
    const animate = () => {
      for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(Date.now() * 0.001 + vertices[i] * 0.1) * 2
      }
      geometry.attributes.position.needsUpdate = true
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    
    scene.add(plane)
    camera.position.z = 5
    animate()
  } else if (theme === 'cosmos') {
    // Cosmos environment with particles
    const particleCount = 5000
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5
    })
    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)
    
    camera.position.z = 50
    
    const animate = () => {
      particleSystem.rotation.y += 0.001
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()
  }
  
  return { scene, camera, renderer }
}
```

### Testing Device Capabilities

```typescript
const checkDeviceCapabilities = async () => {
  const capabilities = {
    vibration: 'vibrate' in navigator,
    bluetooth: 'bluetooth' in navigator,
    usb: 'usb' in navigator,
    webxr: 'xr' in navigator && await (navigator as any).xr.isSessionSupported('immersive-vr'),
    audio: true,
    fullscreen: 'requestFullscreen' in document.documentElement,
    wakeLock: 'wakeLock' in navigator
  }
  
  return capabilities
}

// Usage
const capabilities = await checkDeviceCapabilities()
console.log('Device supports:', capabilities)
```

### Saving User Preferences

```typescript
import { useAuthStore } from '@/store/useAuthStore'

const saveSensoryPreferences = (profile: SensoryProfile) => {
  const { user } = useAuthStore.getState()
  
  const preferences = {
    userId: user?.id,
    profileId: profile.id,
    customizations: {
      ambientLight: profile.ambientLight,
      soundscape: profile.soundscape,
      haptics: profile.haptics,
      visualEnvironment: profile.visualEnvironment
    },
    savedAt: new Date().toISOString()
  }
  
  localStorage.setItem(`sensory_prefs_${user?.id}`, JSON.stringify(preferences))
}

const loadSensoryPreferences = () => {
  const { user } = useAuthStore.getState()
  const saved = localStorage.getItem(`sensory_prefs_${user?.id}`)
  
  return saved ? JSON.parse(saved) : null
}
```

## API Reference

### SensoryProfile Interface

```typescript
interface SensoryProfile {
  id: string                    // Unique identifier
  name: string                  // Display name
  emotion: EmotionalState       // Associated emotion
  ambientLight: {
    color: string               // Hex color code
    brightness: number          // 0-100
    pattern: LightPattern       // Animation pattern
  }
  soundscape: {
    type: SoundType            // Audio category
    volume: number             // 0-100
  }
  haptics: {
    enabled: boolean           // Feature toggle
    pattern: HapticPattern     // Vibration pattern
    intensity: number          // 0-100
  }
  visualEnvironment: {
    theme: EnvironmentTheme    // 3D scene type
    depth: '2D' | '3D' | 'VR'  // Rendering mode
  }
}
```

### Hook: useNeuroAdaptive

```typescript
const {
  emotionalState,      // Current emotion: 'calm' | 'anxious' | etc.
  adaptiveTheme,       // Dynamic theme object
  isEnabled,           // Neuro-adaptive system status
  toggleNeuroAdaptive, // Enable/disable function
  setPermission,       // Grant permission for data sources
  getPermissions,      // Check current permissions
  resetDetection,      // Reset emotion engine
  getCSSVariables      // Get CSS custom properties
} = useNeuroAdaptive()
```

### Emotion Engine

```typescript
import { emotionEngine } from '@/utils/emotionDetection'

// Record keystroke
emotionEngine.recordKeystroke(timestamp: number, isCorrection: boolean)

// Record pause
emotionEngine.recordPause(duration: number)

// Record interaction
emotionEngine.recordInteraction(type: string, value: number)

// Get current emotion
const metrics = emotionEngine.getSmoothedEmotion()
// Returns: { state, cognitiveLoad, confidence, timestamp, sources }

// Set permissions
emotionEngine.setPermission(type: 'typing' | 'audio' | 'webcam' | 'interaction', enabled: boolean)

// Reset
emotionEngine.reset()
```

## Performance Tips

1. **Lazy load 3D environments**: Only render when entering immersive mode
2. **Debounce slider changes**: Wait 300ms before applying light/sound updates
3. **Use Web Workers**: Offload emotion detection calculations
4. **Optimize animations**: Use `will-change` CSS property sparingly
5. **Batch device commands**: Group smart device updates to reduce API calls
6. **Cache audio files**: Preload soundscapes on profile selection
7. **Suspend inactive contexts**: Pause AudioContext when not in use

## Troubleshooting

### Haptics not working
- Check `navigator.vibrate` availability
- iOS Safari requires user interaction before first vibration
- Some browsers block vibration in cross-origin iframes

### Smart lights not connecting
- Verify bridge IP address on local network
- Check bridge is in pairing mode (press button)
- Ensure app has network access permissions

### Audio not playing
- Check AudioContext is resumed after user gesture
- Verify audio files are in correct format (MP3, OGG, WAV)
- Test volume levels (0-1 range for Web Audio API)

### VR not entering
- Check WebXR device support
- Verify HTTPS connection (required for WebXR)
- Ensure VR headset is connected and powered on

## Resources

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Philips Hue API](https://developers.meethue.com/)
- [LIFX HTTP API](https://api.developer.lifx.com/)
- [Three.js Documentation](https://threejs.org/docs/)

---

Happy building! 🎧✨

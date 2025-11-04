import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Check if current target is interactive
      const target = e.target as HTMLElement
      const isInteractive = target.matches('button, a, input, textarea, select, [role="button"], [onclick]') ||
                           target.closest('button, a, input, textarea, select, [role="button"], [onclick]')
      setIsHovering(!!isInteractive)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    // Track mouse movement
    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    const updateVisibility = () => {
      const shouldShow = !document.body.classList.contains('show-native-cursor')
      setIsVisible(shouldShow)
    }

    updateVisibility()

    document.addEventListener('fullscreenchange', updateVisibility)
    document.addEventListener('lifeos-cursor-visibility-change', updateVisibility)

    return () => {
      document.removeEventListener('fullscreenchange', updateVisibility)
      document.removeEventListener('lifeos-cursor-visibility-change', updateVisibility)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999]"
        style={{
          left: mousePosition.x - 6,
          top: mousePosition.y - 6,
          background: 'linear-gradient(to bottom right, #fbcfe8, #f9a8d4)',
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 0.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      />

      {/* Cursor ring/outline */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-lilac-400/50 rounded-full pointer-events-none z-[9998]"
        style={{
          left: mousePosition.x - 20,
          top: mousePosition.y - 20,
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 0.5,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
        }}
      />
    </>
  )
}

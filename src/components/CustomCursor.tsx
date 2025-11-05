import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="button"], [onclick]'

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isPointerFine, setIsPointerFine] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(pointer: fine)')
    const updatePointerType = () => setIsPointerFine(mediaQuery.matches)

    updatePointerType()
    mediaQuery.addEventListener('change', updatePointerType)

    return () => {
      mediaQuery.removeEventListener('change', updatePointerType)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const ACTIVE_CLASS = 'custom-cursor-active'

    if (isPointerFine && isVisible) {
      document.body.classList.add(ACTIVE_CLASS)
      return () => {
        document.body.classList.remove(ACTIVE_CLASS)
      }
    }

    document.body.classList.remove(ACTIVE_CLASS)

    return () => {
      document.body.classList.remove(ACTIVE_CLASS)
    }
  }, [isPointerFine, isVisible])

  useEffect(() => {
    if (!isPointerFine || typeof window === 'undefined') {
      return
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      const target = e.target as HTMLElement | null
      const isInteractive = target?.matches?.(INTERACTIVE_SELECTOR) ||
        Boolean(target?.closest(INTERACTIVE_SELECTOR))
      setIsHovering(Boolean(isInteractive))
      setIsVisible(true)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isPointerFine])

  const cursorStyle = useMemo(() => ({
    left: mousePosition.x - 6,
    top: mousePosition.y - 6,
    background: 'linear-gradient(to bottom right, #fbcfe8, #f9a8d4)'
  }), [mousePosition.x, mousePosition.y])

  const ringStyle = useMemo(() => ({
    left: mousePosition.x - 20,
    top: mousePosition.y - 20
  }), [mousePosition.x, mousePosition.y])

  if (!isPointerFine) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            key="cursor-dot"
            className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[12000]"
            style={cursorStyle}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: isClicking ? 0.8 : isHovering ? 0.5 : 1,
              opacity: 1
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 28
            }}
          />

          <motion.div
            key="cursor-ring"
            className="fixed top-0 left-0 w-10 h-10 border-2 border-lilac-400/50 rounded-full pointer-events-none z-[11999]"
            style={ringStyle}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
              opacity: isHovering ? 0.8 : 0.5
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 15
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}

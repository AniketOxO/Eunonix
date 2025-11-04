import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export const GlassCard = ({ children, className = '', hover = true }: GlassCardProps) => {
  return (
    <motion.div
      className={`glass-card p-4 sm:p-6 lg:p-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.08)'
      } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  )
}

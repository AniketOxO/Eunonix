import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  className?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  as?: 'button' | 'span'
}

export const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  size = 'md',
  as = 'button'
}: ButtonProps) => {
  const variants = {
    primary: 'bg-ink-700 text-white hover:bg-ink-800',
    secondary: 'bg-lilac-200/40 text-ink-800 hover:bg-lilac-300/60',
    ghost: 'bg-transparent text-ink-700 hover:bg-ink-100/40',
    outline: 'bg-transparent border-2 border-ink-700 text-ink-700 hover:bg-ink-700 hover:text-white',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base',
    lg: 'px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg'
  }

  const Component = motion[as]

  return (
    <Component
      onClick={disabled ? undefined : onClick}
      type={as === 'button' ? type : undefined}
      className={`
        ${sizes[size]} rounded-full font-medium
        transition-all duration-300
        min-h-[44px] touch-manipulation
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {children}
    </Component>
  )
}

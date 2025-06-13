import React, { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MagicCardProps {
  children: React.ReactNode
  className?: string
  gradientColor?: string
  gradientOpacity?: number
  gradientSize?: number
}

export const MagicCard: React.FC<MagicCardProps> = ({
  children,
  className,
  gradientColor,
  gradientOpacity = 0.5,
  gradientSize = 300,
}) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Observer para mudanças no tema
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })
    
    return () => observer.disconnect()
  }, [])

  // Cor padrão baseada no tema - usando RGBA para melhor controle
  const lightModeOpacity = gradientOpacity * 0.6 // 40% mais claro no light mode
  const defaultGradientColor = isDarkMode 
    ? `rgba(218, 165, 32, ${gradientOpacity})` // Dourado suave no dark mode
    : `rgba(147, 197, 253, ${lightModeOpacity})` // Azul bem claro no light mode
  
  const actualGradientColor = gradientColor || defaultGradientColor

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setIsFocused(true)
    setOpacity(1)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-lg backdrop-blur-sm',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${actualGradientColor}, transparent 40%)`,
          opacity,
        }}
      />
      {children}
    </div>
  )
}
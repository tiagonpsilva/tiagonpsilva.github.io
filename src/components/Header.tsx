import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTheme } from '../contexts/ThemeContext'
import { useInteractionTracking } from '../contexts/MixpanelContext'
import { useComponentTracing } from '../hooks/useComponentTracing'
import { useDataDogInteractions } from '../hooks/useDataDog'
import AuthButton from './AuthButton'

// Environment indicator for staging
const EnvironmentIndicator = () => {
  const isStaging = import.meta.env.VITE_STAGING_ENV === 'true'
  const isDev = import.meta.env.DEV
  
  if (!isStaging && !isDev) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black text-center py-1 text-sm font-bold z-50">
      🧪 {isStaging ? 'STAGING' : 'DEVELOPMENT'} ENVIRONMENT - OAuth Testing Mode
    </div>
  )
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { trackClick } = useInteractionTracking()
  const { trackClick: trackDataDogClick, trackNavigation } = useDataDogInteractions()
  const { trackInteraction } = useComponentTracing({
    componentName: 'Header',
    trackMount: true,
    trackUnmount: false,
    trackRender: false,
    trackErrors: true
  })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Efeito para fazer scroll automático quando navegamos para a página inicial com âncora
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      // Pequeno delay para garantir que o DOM foi renderizado
      setTimeout(() => {
        const element = document.querySelector(location.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 300)
    }
  }, [location])


  const navItems = [
    { href: '#home', label: 'Início' },
    { href: '#expertise', label: 'Expertise' },
    { href: '#education', label: 'Formação' },
    { href: '/cases', label: 'Cases', isExternal: true },
    { href: '/labs', label: 'Labs', isExternal: true },
    { href: '/blog', label: 'Blog', isExternal: true },
    { href: '/contact', label: 'Contato', isExternal: true },
  ]

  const handleNavigation = (href: string, isExternal?: boolean, label?: string) => {
    // Track navigation click with both systems
    trackClick('Navigation Link', 'Header', {
      link_href: href,
      link_label: label,
      is_external: isExternal,
      current_page: location.pathname
    })

    // DataDog tracking
    trackDataDogClick(label || 'navigation_link', 'Header', {
      destination: href,
      is_external: isExternal,
      source_page: location.pathname
    })

    // Component-level tracing
    trackInteraction('navigation_click', label || href, {
      href,
      is_external: isExternal,
      current_page: location.pathname
    })

    if (isExternal) {
      trackNavigation(location.pathname, href, 'click')
    }

    if (isExternal) {
      navigate(href)
    } else {
      // Se estamos tentando navegar para uma seção e não estamos na página inicial
      if (location.pathname !== '/') {
        // Navegar para a página inicial com a âncora
        navigate('/' + href)
      } else {
        // Se já estamos na página inicial, fazer scroll para a seção
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <>
      <EnvironmentIndicator />
      <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'glass-effect border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center text-2xl font-bold"
          >
            <span className="text-gray-400 dark:text-gray-500 font-mono">&lt;</span>
            <span className="text-gray-500 dark:text-gray-400 font-mono">Tiago</span>
            <span className="text-gray-400 dark:text-gray-500 font-mono">/&gt;</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleNavigation(item.href, item.isExternal, item.label)}
                className={
                  item.label === 'Blog' 
                    ? "relative group text-primary hover:text-blue-600 transition-colors duration-200 font-semibold text-base tracking-wide"
                    : "text-foreground hover:text-primary transition-colors duration-200 font-medium text-base tracking-wide"
                }
              >
                {item.label === 'Blog' && (
                  <>
                    {/* Background gradient */}
                    <div className="absolute inset-0 -inset-x-2 -inset-y-1 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Subtle glow */}
                    <div className="absolute inset-0 -inset-x-2 -inset-y-1 bg-gradient-to-r from-primary/8 to-blue-600/8 rounded-lg blur-sm"></div>
                  </>
                )}
                <span className="relative z-10">{item.label}</span>
                {item.label === 'Blog' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                )}
              </motion.button>
            ))}
            
            {/* Theme Toggle */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navItems.length * 0.1 }}
              onClick={() => {
                const newTheme = isDarkMode ? 'light' : 'dark'
                
                // Track theme toggle with both systems
                trackClick('Theme Toggle', 'Header', {
                  theme_changed_to: newTheme
                })

                trackDataDogClick('theme_toggle', 'Header', {
                  from_theme: isDarkMode ? 'dark' : 'light',
                  to_theme: newTheme
                })

                trackInteraction('theme_toggle', 'theme_button', {
                  theme_changed_to: newTheme
                })

                toggleDarkMode()
              }}
              className="p-2 text-foreground hover:text-primary transition-colors duration-200 ml-4"
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Auth Button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (navItems.length + 1) * 0.1 }}
              className="ml-4"
            >
              <AuthButton />
            </motion.div>
          </nav>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Auth Button - Mobile */}
            <AuthButton />
            
            <button
              onClick={toggleDarkMode}
              className="p-2 text-foreground hover:text-primary transition-colors duration-200"
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

      </div>
    </motion.header>
    </>
  )
}

export default Header
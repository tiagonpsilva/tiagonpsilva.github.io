import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, TrendingUp, Users, Zap, Smartphone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDeviceCapabilities } from '@/hooks/useMediaQuery'

const AuthModal: React.FC = () => {
  const { showAuthModal, dismissAuthModal, signInWithLinkedIn } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState(false)
  const { isMobile, isPopupSupported } = useDeviceCapabilities()

  // Focus management and accessibility
  useEffect(() => {
    if (showAuthModal) {
      const previousFocus = document.activeElement as HTMLElement
      
      // Focus modal after animation
      const focusTimeout = setTimeout(() => {
        modalRef.current?.focus()
      }, 100)

      // Cleanup function to restore focus
      return () => {
        clearTimeout(focusTimeout)
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus()
        }
      }
    }
  }, [showAuthModal])

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAuthModal) {
        dismissAuthModal()
      }
    }

    if (showAuthModal) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showAuthModal, dismissAuthModal])

  // Handle backdrop clicks - improved for touch devices
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      dismissAuthModal()
    }
  }

  // Touch event handling for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setTouchStart(true)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart && e.target === e.currentTarget) {
      dismissAuthModal()
    }
    setTouchStart(false)
  }

  const benefits = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Conteúdo Personalizado",
      description: "Recomendações baseadas no seu perfil profissional"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Insights Exclusivos",
      description: "Artigos e recursos direcionados para sua área"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Networking Inteligente",
      description: "Descubra conexões e oportunidades relevantes"
    }
  ]

  return (
    <AnimatePresence>
      {showAuthModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center ${isMobile ? 'p-2' : 'p-4'}`}
            onClick={handleBackdropClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            aria-describedby="auth-modal-description"
          >
            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`bg-background/95 backdrop-blur-lg border border-border shadow-2xl relative ${
                isMobile 
                  ? 'rounded-t-3xl h-full w-full flex flex-col justify-center p-6' 
                  : 'rounded-2xl p-6 md:p-8 max-w-md w-full'
              }`}
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
              role="document"
            >
              {/* Close Button */}
              <button
                onClick={dismissAuthModal}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Fechar modal de autenticação"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                
                <h2 id="auth-modal-title" className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Personalize sua Experiência
                </h2>
                
                <p id="auth-modal-description" className="text-muted-foreground text-sm md:text-base">
                  {isMobile 
                    ? 'Conecte-se com LinkedIn para uma experiência personalizada. Você será redirecionado brevemente.'
                    : 'Conecte-se com LinkedIn para ter uma experiência mais relevante e personalizada'
                  }
                </p>
                
                {isMobile && !isPopupSupported && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm font-medium">Mobile Otimizado</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Redirecionamento seguro para melhor experiência móvel
                    </p>
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* LinkedIn Button */}
              <motion.button
                whileHover={{ scale: isMobile ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signInWithLinkedIn}
                className={`w-full bg-[#0077B5] hover:bg-[#005582] text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0077B5] focus:ring-offset-2 focus:ring-offset-background ${
                  isMobile ? 'py-4 px-6 text-lg' : 'py-3 px-4'
                }`}
                aria-label={isMobile ? "Conectar com LinkedIn (redirecionamento)" : "Conectar com LinkedIn para personalizar experiência"}
                type="button"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                {isMobile ? 'Conectar com LinkedIn →' : 'Conectar com LinkedIn'}
              </motion.button>

              {/* Disclaimer */}
              <div className="text-center">
                <button
                  onClick={dismissAuthModal}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
                  type="button"
                  aria-label="Dispensar modal e continuar sem conectar"
                >
                  Talvez depois
                </button>
              </div>

              {/* Privacy Note */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Seus dados são seguros. Usamos apenas informações básicas do perfil para personalização.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AuthModal
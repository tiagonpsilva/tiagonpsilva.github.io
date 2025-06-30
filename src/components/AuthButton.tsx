import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, User, LogOut, ExternalLink, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useInteractionTracking } from '@/contexts/MixpanelContext'
import { useComponentTracing } from '@/hooks/useComponentTracing'
import { useDataDogInteractions, useDataDogBusiness } from '@/hooks/useDataDog'

const AuthButton: React.FC = () => {
  const { user, isAuthenticated, signInWithLinkedIn, signOut, loading } = useAuth()
  const { trackClick } = useInteractionTracking()
  const { trackClick: trackDataDogClick } = useDataDogInteractions()
  const { trackConversion } = useDataDogBusiness()
  const { trackInteraction } = useComponentTracing({
    componentName: 'AuthButton',
    trackMount: true,
    trackUnmount: false,
    trackRender: false,
    trackErrors: true
  })
  const [showMenu, setShowMenu] = useState(false)

  if (loading) return null

  const handleSignIn = () => {
    // Track with multiple systems
    trackClick('Auth Button Clicked', 'Header', {
      action: 'sign_in',
      trigger: 'manual'
    })

    trackDataDogClick('auth_sign_in_clicked', 'AuthButton', {
      auth_provider: 'linkedin',
      trigger: 'manual'
    })

    trackInteraction('sign_in_click', 'auth_button', {
      provider: 'linkedin',
      trigger: 'manual'
    })

    // Track as potential conversion
    trackConversion('linkedin', {
      action: 'sign_in_attempt',
      trigger: 'manual'
    })

    signInWithLinkedIn()
  }

  const handleMenuToggle = () => {
    setShowMenu(!showMenu)
    trackClick('Auth Menu Toggled', 'Header', {
      user_id: user?.id,
      menu_open: !showMenu
    })
  }

  const handleLinkedInProfile = () => {
    if (user?.publicProfileUrl) {
      window.open(user.publicProfileUrl, '_blank')
      trackClick('LinkedIn Profile Clicked', 'Auth Menu', {
        user_id: user.id,
        profile_url: user.publicProfileUrl
      })
    }
    setShowMenu(false)
  }

  const handleSignOut = () => {
    trackClick('Sign Out Clicked', 'Auth Menu', {
      user_id: user?.id
    })
    signOut()
    setShowMenu(false)
  }

  const getInitials = (name?: string): string => {
    // Handle undefined, null, or empty names gracefully
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return 'U' // Default to 'U' for User
    }
    
    try {
      return name
        .trim()
        .split(' ')
        .filter(word => word.length > 0) // Remove empty strings
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    } catch (error) {
      console.warn('Error generating initials for name:', name, error)
      return 'U' // Fallback
    }
  }

  return (
    <div className="relative">
      {isAuthenticated && user ? (
        // Authenticated State - Interactive Button with Menu
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMenuToggle}
          data-testid="auth-button"
          className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1.5 text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full border border-green-300 dark:border-green-700 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold">
                {getInitials(user.name)}
              </div>
            )}
          </div>

          {/* Desktop: Full info */}
          <div className="hidden md:flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              {user.name ? user.name.split(' ')[0] : 'Usuário'}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <ChevronDown className={`w-3 h-3 text-green-600 dark:text-green-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </div>

          {/* Mobile: Compact */}
          <div className="md:hidden flex items-center gap-1">
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">On</span>
            <ChevronDown className={`w-3 h-3 text-green-600 dark:text-green-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </div>
        </motion.button>
      ) : (
        // Not Authenticated State - Sign In Button
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignIn}
          data-testid="auth-button"
          className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group auth-button-login"
        >
          {/* Desktop: Full button */}
          <div className="hidden md:flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
              Conectar
            </span>
            <div className="w-2 h-2 bg-gray-400 group-hover:bg-blue-500 rounded-full transition-colors"></div>
          </div>

          {/* Mobile: Compact */}
          <div className="md:hidden flex items-center gap-1">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            <span className="text-xs text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">Login</span>
          </div>
        </motion.button>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && isAuthenticated && user && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-40 md:hidden" 
              onClick={() => setShowMenu(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-lg border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-border bg-green-50/50 dark:bg-green-900/10">
                <div className="flex items-center gap-3">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
                      {getInitials(user.name)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {user.name || 'Usuário'}
                    </div>
                    {user.headline && (
                      <div className="text-sm text-muted-foreground truncate">
                        {user.headline}
                      </div>
                    )}
                    {user.location && (
                      <div className="text-xs text-muted-foreground truncate">
                        📍 {user.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {user.publicProfileUrl && (
                  <button
                    onClick={handleLinkedInProfile}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 text-sm"
                  >
                    <div className="w-8 h-8 bg-[#0077B5]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <span className="flex-1">Ver Perfil LinkedIn</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}

                <div className="border-t border-border my-2"></div>

                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3 text-sm text-red-600 dark:text-red-400"
                >
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Sair da Conta</span>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <div className="text-xs text-muted-foreground text-center">
                  Conectado via LinkedIn
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AuthButton
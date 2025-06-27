import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ExternalLink, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useInteractionTracking } from '@/contexts/MixpanelContext'

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth()
  const { trackClick } = useInteractionTracking()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!isAuthenticated || !user) {
    return null
  }

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown)
    trackClick('User Profile Clicked', 'Header', {
      user_id: user.id,
      dropdown_open: !showDropdown
    })
  }

  const handleLinkedInProfileClick = () => {
    if (user.publicProfileUrl) {
      window.open(user.publicProfileUrl, '_blank')
      trackClick('LinkedIn Profile Clicked', 'User Dropdown', {
        user_id: user.id,
        profile_url: user.publicProfileUrl
      })
    }
    setShowDropdown(false)
  }

  const handleSignOut = () => {
    trackClick('Sign Out Clicked', 'User Dropdown', {
      user_id: user.id
    })
    signOut()
    setShowDropdown(false)
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleProfileClick}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-muted/50 transition-colors group"
      >
        {/* Avatar */}
        <div className="relative">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(user.name)}
            </div>
          )}
          
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
        </div>

        {/* User Info (hidden on mobile) */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground truncate max-w-32">
            {user.name.split(' ')[0]}
          </div>
          {user.headline && (
            <div className="text-xs text-muted-foreground truncate max-w-32">
              {user.headline}
            </div>
          )}
        </div>

        {/* Dropdown Indicator */}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-40 md:hidden" 
              onClick={() => setShowDropdown(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-lg border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {getInitials(user.name)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {user.name}
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
                    onClick={handleLinkedInProfileClick}
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
                  <span>Sair</span>
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

export default UserProfile
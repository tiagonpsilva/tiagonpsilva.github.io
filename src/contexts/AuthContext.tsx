import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMixpanel } from './MixpanelContext'

export interface LinkedInUser {
  id: string
  name: string
  email?: string
  picture?: string
  headline?: string
  location?: string
  industry?: string
  publicProfileUrl?: string
}

interface AuthContextType {
  user: LinkedInUser | null
  isAuthenticated: boolean
  loading: boolean
  signInWithLinkedIn: () => void
  signOut: () => void
  showAuthModal: boolean
  dismissAuthModal: () => void
  shouldShowAuthModal: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// User engagement tracking for modal timing
interface EngagementData {
  pageViews: number
  timeOnSite: number
  lastVisit: number
  modalDismissed: boolean
  lastDismissTime: number
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LinkedInUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { track, identify, setUserProperties } = useMixpanel()

  // Initialize engagement tracking
  useEffect(() => {
    const initializeAuth = () => {
      // Check for existing user session
      const savedUser = localStorage.getItem('linkedin_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          identifyLinkedInUser(userData)
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          localStorage.removeItem('linkedin_user')
        }
      }

      // Initialize engagement tracking
      updateEngagementData()
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // Track page views and time for modal trigger
  useEffect(() => {
    if (!user && !loading) {
      const timer = setTimeout(() => {
        if (shouldShowAuthModal()) {
          setShowAuthModal(true)
          track('Auth Modal Shown', {
            trigger: 'time_based',
            time_on_site: getEngagementData().timeOnSite
          })
        }
      }, 30000) // Show after 30 seconds

      return () => clearTimeout(timer)
    }
  }, [user, loading])

  const getEngagementData = (): EngagementData => {
    const defaultData: EngagementData = {
      pageViews: 0,
      timeOnSite: 0,
      lastVisit: Date.now(),
      modalDismissed: false,
      lastDismissTime: 0
    }

    try {
      const saved = localStorage.getItem('user_engagement')
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch {
      return defaultData
    }
  }

  const updateEngagementData = () => {
    const current = getEngagementData()
    const now = Date.now()
    
    // Calculate time on site (if same session)
    const timeOnSite = now - current.lastVisit < 30 * 60 * 1000 ? 
      current.timeOnSite + (now - current.lastVisit) : 
      current.timeOnSite

    const updated: EngagementData = {
      ...current,
      pageViews: current.pageViews + 1,
      timeOnSite,
      lastVisit: now
    }

    localStorage.setItem('user_engagement', JSON.stringify(updated))

    // Check if should show modal based on page views
    if (!user && updated.pageViews >= 3 && shouldShowAuthModal()) {
      setShowAuthModal(true)
      track('Auth Modal Shown', {
        trigger: 'page_views',
        page_views: updated.pageViews
      })
    }
  }

  const shouldShowAuthModal = (): boolean => {
    if (user) return false
    
    const engagement = getEngagementData()
    
    // Don't show if dismissed recently (30 days)
    if (engagement.modalDismissed && 
        Date.now() - engagement.lastDismissTime < 30 * 24 * 60 * 60 * 1000) {
      return false
    }

    return true
  }

  const dismissAuthModal = () => {
    setShowAuthModal(false)
    
    const engagement = getEngagementData()
    const updated: EngagementData = {
      ...engagement,
      modalDismissed: true,
      lastDismissTime: Date.now()
    }
    
    localStorage.setItem('user_engagement', JSON.stringify(updated))
    
    track('Auth Modal Dismissed', {
      page_views: engagement.pageViews,
      time_on_site: engagement.timeOnSite
    })
  }

  const signInWithLinkedIn = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`
    const scope = 'profile email'
    const state = Math.random().toString(36).substring(7)
    
    // Store state for security
    sessionStorage.setItem('linkedin_oauth_state', state)
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`

    track('LinkedIn OAuth Initiated', {
      modal_trigger: showAuthModal ? 'modal' : 'manual'
    })

    // Open LinkedIn auth in popup
    const popup = window.open(
      authUrl,
      'linkedin-auth',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    )

    // Listen for auth completion
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        // Check if user was authenticated (will be handled by callback)
        const checkAuth = setTimeout(() => {
          const savedUser = localStorage.getItem('linkedin_user')
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              setUser(userData)
              identifyLinkedInUser(userData)
              setShowAuthModal(false)
            } catch (error) {
              console.error('Error parsing auth result:', error)
            }
          }
        }, 1000)

        return () => clearTimeout(checkAuth)
      }
    }, 1000)
  }

  const identifyLinkedInUser = (userData: LinkedInUser) => {
    // Enhanced Mixpanel identification with LinkedIn data
    identify(userData.id)
    
    setUserProperties({
      $name: userData.name,
      $email: userData.email,
      linkedin_id: userData.id,
      linkedin_headline: userData.headline,
      linkedin_location: userData.location,
      linkedin_industry: userData.industry,
      linkedin_profile_url: userData.publicProfileUrl,
      authenticated_user: true,
      auth_provider: 'linkedin',
      first_auth_date: new Date().toISOString(),
      user_type: 'authenticated'
    })

    track('User Authenticated', {
      provider: 'linkedin',
      user_id: userData.id,
      has_email: !!userData.email,
      has_headline: !!userData.headline,
      has_location: !!userData.location
    })
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('linkedin_user')
    
    track('User Signed Out', {
      provider: 'linkedin'
    })

    // Reset Mixpanel identification
    // Note: In a real app, you might want to keep some anonymous tracking
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signInWithLinkedIn,
    signOut,
    showAuthModal,
    dismissAuthModal,
    shouldShowAuthModal
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for easier page view tracking integration
export const usePageViewTracking = () => {
  const { user } = useAuth()
  
  useEffect(() => {
    // This will trigger engagement tracking when pages change
    const event = new CustomEvent('pageview')
    window.dispatchEvent(event)
  }, [])

  return { isAuthenticated: !!user }
}
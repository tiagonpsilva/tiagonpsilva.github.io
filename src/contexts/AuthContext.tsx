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

// Validate and sanitize user data to prevent crashes
const validateUserData = (userData: any): LinkedInUser | null => {
  try {
    // Check if userData is an object
    if (!userData || typeof userData !== 'object') {
      return null
    }

    // Validate required fields
    if (!userData.id || typeof userData.id !== 'string') {
      return null
    }

    // Name is critical - provide fallback if missing
    const name = userData.name && typeof userData.name === 'string' 
      ? userData.name.trim() 
      : userData.email && typeof userData.email === 'string'
        ? userData.email.split('@')[0] // Use email prefix as fallback
        : 'Usuário LinkedIn' // Ultimate fallback

    if (!name) {
      return null
    }

    // Create sanitized user object
    const sanitizedUser: LinkedInUser = {
      id: userData.id.trim(),
      name: name,
      email: userData.email && typeof userData.email === 'string' ? userData.email.trim() : undefined,
      picture: userData.picture && typeof userData.picture === 'string' ? userData.picture.trim() : undefined,
      headline: userData.headline && typeof userData.headline === 'string' ? userData.headline.trim() : undefined,
      location: userData.location && typeof userData.location === 'string' ? userData.location.trim() : undefined,
      industry: userData.industry && typeof userData.industry === 'string' ? userData.industry.trim() : undefined,
      publicProfileUrl: userData.publicProfileUrl && typeof userData.publicProfileUrl === 'string' ? userData.publicProfileUrl.trim() : undefined
    }

    return sanitizedUser
  } catch (error) {
    console.warn('Error validating user data:', error)
    return null
  }
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
          const validatedUser = validateUserData(userData)
          
          if (validatedUser) {
            setUser(validatedUser)
            identifyLinkedInUser(validatedUser)
          } else {
            console.warn('Invalid user data found, clearing localStorage')
            localStorage.removeItem('linkedin_user')
          }
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          localStorage.removeItem('linkedin_user')
        }
      }

      // Initialize engagement tracking
      updateEngagementData()
      setLoading(false)
    }

    // Listen for auth success from popup
    const handleAuthMessage = (event: MessageEvent) => {
      // Security: check origin
      if (event.origin !== window.location.origin) {
        console.warn('⚠️ Ignoring message from untrusted origin:', event.origin)
        return
      }

      if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        console.log('📨 Received auth success from popup:', event.data.userData)
        
        const userData = event.data.userData
        const validatedUser = validateUserData(userData)
        
        if (validatedUser) {
          // Save validated data to localStorage
          try {
            localStorage.setItem('linkedin_user', JSON.stringify(validatedUser))
            setUser(validatedUser)
            identifyLinkedInUser(validatedUser)
            setShowAuthModal(false)
            console.log('✅ User authenticated via postMessage')
          } catch (error) {
            console.error('❌ Failed to save user data:', error)
          }
        } else {
          console.error('❌ Invalid user data received from OAuth')
          setShowAuthModal(false)
        }
      }
    }

    window.addEventListener('message', handleAuthMessage)
    initializeAuth()

    return () => {
      window.removeEventListener('message', handleAuthMessage)
    }
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
    const currentOrigin = window.location.origin
    const redirectUri = `${currentOrigin}/auth/linkedin/callback`
    const scope = 'openid profile email'
    const state = Math.random().toString(36).substring(7)
    
    console.log('🔐 Starting LinkedIn OAuth...')
    console.log('Current Origin:', currentOrigin)
    console.log('Client ID:', clientId)
    console.log('Redirect URI:', redirectUri)
    
    if (!clientId) {
      console.error('❌ VITE_LINKEDIN_CLIENT_ID not found!')
      return
    }
    
    // Store state for security
    sessionStorage.setItem('linkedin_oauth_state', state)
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`

    console.log('🌐 Auth URL:', authUrl)

    track('LinkedIn OAuth Initiated', {
      modal_trigger: showAuthModal ? 'modal' : 'manual'
    })

    // Open LinkedIn auth in popup
    const popup = window.open(
      authUrl,
      'linkedin-auth',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      console.error('❌ Popup blocked!')
      return
    }

    console.log('✅ Popup opened')

    // Listen for popup close (just for logging, auth handled by postMessage)
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        console.log('🔄 Popup closed')
        
        // Small delay to allow postMessage to be processed
        setTimeout(() => {
          if (!user) {
            console.warn('⚠️ Popup closed but no user authenticated - user may have cancelled')
          }
        }, 1000)
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

    // Show success notification
    console.log(`✅ Conectado como ${userData.name}`)
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
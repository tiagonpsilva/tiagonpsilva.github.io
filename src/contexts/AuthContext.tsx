import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { useMixpanel } from './MixpanelContext'
import { storage } from '../utils/storage'
import { useDeviceCapabilities } from '../hooks/useMediaQuery'
import { useAuthConcurrencyControl } from '../hooks/useAuthStatePersistence'
import { useAuthError } from '../hooks/useAuthError'
import { AuthError, AuthErrorHandler } from '../utils/AuthErrorHandler'
import { updateDataDogUser } from '../utils/datadogConfig'

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
  authError: AuthError | null
  clearAuthError: () => void
  retryAuth: () => Promise<void>
  isRetrying: boolean
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

// Sanitize string to prevent XSS and normalize data
const sanitizeString = (value: any): string | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined
  }
  
  return value
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 500) // Limit length to prevent DoS
}

// Validate URL format
const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Validate and sanitize user data to prevent crashes and XSS
const validateUserData = (userData: any): LinkedInUser | null => {
  try {
    // Check if userData is an object
    if (!userData || typeof userData !== 'object') {
      console.warn('Invalid user data: not an object')
      return null
    }

    // Validate required fields
    const rawId = sanitizeString(userData.id)
    if (!rawId || rawId.length < 1) {
      console.warn('Invalid user data: missing or invalid id')
      return null
    }

    // Name is critical - provide fallback if missing
    let name = sanitizeString(userData.name)
    if (!name) {
      // Try email prefix as fallback
      const email = sanitizeString(userData.email)
      if (email && validateEmail(email)) {
        name = email.split('@')[0]
      } else {
        name = 'Usuário LinkedIn' // Ultimate fallback
      }
    }

    // Validate and sanitize email
    const rawEmail = sanitizeString(userData.email)
    const email = rawEmail && validateEmail(rawEmail) ? rawEmail : undefined

    // Validate and sanitize picture URL
    const rawPicture = sanitizeString(userData.picture)
    const picture = rawPicture && validateUrl(rawPicture) ? rawPicture : undefined

    // Validate and sanitize profile URL
    const rawProfileUrl = sanitizeString(userData.publicProfileUrl)
    const publicProfileUrl = rawProfileUrl && validateUrl(rawProfileUrl) ? rawProfileUrl : undefined

    // Create sanitized user object
    const sanitizedUser: LinkedInUser = {
      id: rawId,
      name: name,
      email: email,
      picture: picture,
      headline: sanitizeString(userData.headline),
      location: sanitizeString(userData.location),
      industry: sanitizeString(userData.industry),
      publicProfileUrl: publicProfileUrl
    }

    // Log sanitization if data was modified
    if (process.env.NODE_ENV === 'development') {
      const wasModified = JSON.stringify(userData) !== JSON.stringify(sanitizedUser)
      if (wasModified) {
        console.log('User data was sanitized:', { original: userData, sanitized: sanitizedUser })
      }
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
  const { isMobile, isPopupSupported, preferRedirect } = useDeviceCapabilities()
  const { attemptAuth, clearAuthProgress } = useAuthConcurrencyControl()
  const authPopupRef = useRef<Window | null>(null)
  const { 
    error: authError, 
    setError: setAuthError, 
    clearError: clearAuthError, 
    retry: retryAuth,
    isRetrying 
  } = useAuthError({
    retryType: 'custom',
    maxRetries: 3,
    onRetrySuccess: () => {
      console.log('🎉 Authentication retry succeeded')
    },
    onRetryFailure: (error) => {
      console.error('❌ Authentication retry failed:', error)
    }
  })

  // Initialize engagement tracking
  useEffect(() => {
    const initializeAuth = () => {
      // Check for existing user session
      const savedUser = storage.getItem('linkedin_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          const validatedUser = validateUserData(userData)
          
          if (validatedUser) {
            setUser(validatedUser)
            identifyLinkedInUser(validatedUser)
          } else {
            console.warn('Invalid user data found, clearing storage')
            storage.removeItem('linkedin_user')
          }
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          storage.removeItem('linkedin_user')
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

      if (event.data?.type === 'LINKEDIN_AUTH_CODE') {
        console.log('📨 Received auth code from popup')
        
        // Validate state
        const savedState = sessionStorage.getItem('linkedin_oauth_state')
        if (event.data.state !== savedState) {
          console.error('State mismatch')
          setAuthError(AuthErrorHandler.handleError('State parameter mismatch', { type: 'state_mismatch' }))
          return
        }
        
        // Process the code (simplified for now)
        const mockUser = {
          id: 'user_' + Date.now(),
          name: 'Usuário LinkedIn',
          email: 'user@example.com',
          headline: 'Profissional LinkedIn',
          location: 'Brasil'
        }
        
        storage.setItem('linkedin_user', JSON.stringify(mockUser))
        setUser(mockUser)
        identifyLinkedInUser(mockUser)
        setShowAuthModal(false)
        clearAuthError()
        console.log('✅ User authenticated')
        
      } else if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        console.log('📨 Received auth success from popup:', event.data.userData)
        
        const userData = event.data.userData
        const validatedUser = validateUserData(userData)
        
        if (validatedUser) {
          // Save validated data to storage
          try {
            storage.setItem('linkedin_user', JSON.stringify(validatedUser))
            setUser(validatedUser)
            identifyLinkedInUser(validatedUser)
            setShowAuthModal(false)
            clearAuthError() // Clear any previous errors
            console.log('✅ User authenticated via postMessage')
          } catch (error) {
            console.error('❌ Failed to save user data:', error)
            setAuthError(AuthErrorHandler.handleError(error, { type: 'storage_save' }))
          }
        } else {
          console.error('❌ Invalid user data received from OAuth')
          setAuthError(AuthErrorHandler.handleError('Invalid user data', { type: 'invalid_user_data' }))
          setShowAuthModal(false)
        }
      } else if (event.data?.type === 'LINKEDIN_AUTH_ERROR') {
        console.error('📨 Received auth error from popup:', event.data)
        
        const errorCode = event.data.error || 'AUTH_ERROR'
        const errorDescription = event.data.errorDescription || 'Erro de autenticação'
        
        setAuthError(AuthErrorHandler.handleError(errorDescription, { 
          type: 'oauth_callback_error',
          errorCode,
          source: 'popup_message'
        }))
        setShowAuthModal(false)
        console.log('❌ Authentication failed via postMessage')
      }
    }

    window.addEventListener('message', handleAuthMessage)
    initializeAuth()

    return () => {
      window.removeEventListener('message', handleAuthMessage)
    }
  }, [])

  // Track page views and time for modal trigger - DISABLED IN PRODUCTION
  useEffect(() => {
    // Only show automatic modals in development
    if (!user && !loading && import.meta.env.DEV) {
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
      const saved = storage.getItem('user_engagement')
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

    storage.setItem('user_engagement', JSON.stringify(updated))

    // Check if should show modal based on page views - DISABLED IN PRODUCTION
    if (!user && updated.pageViews >= 3 && shouldShowAuthModal() && import.meta.env.DEV) {
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
    
    storage.setItem('user_engagement', JSON.stringify(updated))
    
    track('Auth Modal Dismissed', {
      page_views: engagement.pageViews,
      time_on_site: engagement.timeOnSite
    })
  }

  const signInWithLinkedIn = () => {
    attemptAuth(async () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID
    const currentOrigin = window.location.origin
    // URL que o React Router pode capturar (sem /api/)
    const redirectUri = `https://tiagopinto.io/oauth/linkedin/callback`
    const scope = 'openid profile email'
    const state = Math.random().toString(36).substring(7)
    
    console.log('🔐 Starting LinkedIn OAuth...')
    console.log('Device Info:', { isMobile, isPopupSupported, preferRedirect })
    console.log('Current Origin:', currentOrigin)
    console.log('Client ID:', clientId)
    console.log('Redirect URI:', redirectUri)
    
    
    if (!clientId) {
      const error = new Error('VITE_LINKEDIN_CLIENT_ID not found')
      setAuthError(error, { step: 'config_validation' })
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
      modal_trigger: showAuthModal ? 'modal' : 'manual',
      device_type: isMobile ? 'mobile' : 'desktop',
      popup_supported: isPopupSupported,
      auth_method: preferRedirect ? 'redirect' : 'popup'
    })

    // Use mobile-optimized strategy
    if (preferRedirect) {
      console.log('📱 Using redirect strategy for mobile/popup-blocked environment')
      
      // Store current page to return to after auth
      sessionStorage.setItem('linkedin_auth_return_url', window.location.pathname + window.location.search)
      
      // Direct redirect for mobile or when popups are blocked
      window.location.href = authUrl
      return
    }

    // Desktop popup strategy
    console.log('🖥️ Using popup strategy for desktop')
    
    // Try popup with optimized dimensions for auth flow
    const popupFeatures = [
      'width=500',
      'height=600',
      'left=' + (window.screen.width / 2 - 250),
      'top=' + (window.screen.height / 2 - 300),
      'scrollbars=yes',
      'resizable=yes',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'directories=no',
      'status=no'
    ].join(',')

    const popup = window.open(authUrl, 'linkedin-auth', popupFeatures)

    if (!popup) {
      console.warn('❌ Popup blocked! Falling back to redirect...')
      
      // Create popup blocked error but don't stop the process
      const popupError = new Error('Popup blocked by browser')
      setAuthError(popupError, { 
        step: 'popup_blocked', 
        fallback: 'redirect',
        userAgent: navigator.userAgent
      })
      
      track('LinkedIn OAuth Popup Blocked', {
        fallback_to_redirect: true
      })
      
      // Fallback to redirect if popup is blocked
      sessionStorage.setItem('linkedin_auth_return_url', window.location.pathname + window.location.search)
      window.location.href = authUrl
      clearAuthProgress() // Clear auth progress since we're redirecting
      return
    }

    // Store popup reference for cleanup during navigation
    authPopupRef.current = popup
    console.log('✅ Popup opened successfully')

    // Monitor popup status
    let popupClosed = false
    const checkClosed = setInterval(() => {
      try {
        if (popup?.closed) {
          clearInterval(checkClosed)
          popupClosed = true
          console.log('🔄 Popup closed')
          
          // Small delay to allow postMessage to be processed
          setTimeout(() => {
            if (!user && popupClosed) {
              console.warn('⚠️ Popup closed but no user authenticated - user may have cancelled')
              track('LinkedIn OAuth Cancelled', {
                method: 'popup_closed'
              })
            }
          }, 1000)
        }
      } catch (error) {
        // Popup might be closed or cross-origin, clear interval
        clearInterval(checkClosed)
      }
    }, 1000)

    // Auto-close popup after 10 minutes to prevent memory leaks
    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close()
        clearInterval(checkClosed)
        authPopupRef.current = null
        clearAuthProgress() // Clear auth progress on timeout
        console.warn('⏰ Auto-closed popup after timeout')
        
        // Dispatch failure event
        window.dispatchEvent(new CustomEvent('linkedin-auth-failure'))
      }
    }, 10 * 60 * 1000)
    })
  }

  const identifyLinkedInUser = (userData: LinkedInUser) => {
    // Clear auth progress on successful authentication
    clearAuthProgress()
    authPopupRef.current = null
    
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

    // Update DataDog user context
    updateDataDogUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      type: 'linkedin_authenticated'
    })

    // Dispatch success event for UI feedback
    window.dispatchEvent(new CustomEvent('linkedin-auth-success'))

    // Show success notification
    console.log(`✅ Conectado como ${userData.name}`)
  }

  const signOut = () => {
    setUser(null)
    storage.removeItem('linkedin_user')
    
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
    shouldShowAuthModal,
    authError,
    clearAuthError,
    retryAuth,
    isRetrying
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
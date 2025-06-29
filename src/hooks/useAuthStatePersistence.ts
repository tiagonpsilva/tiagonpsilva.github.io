import { useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { storage } from '../utils/storage'

/**
 * Hook for managing authentication state persistence during navigation
 * Handles cleanup of incomplete auth states and prevents conflicts
 */
export const useAuthStatePersistence = () => {
  const { pathname } = useLocation()

  // Cleanup function for incomplete authentication
  const cleanupIncompleteAuth = useCallback(() => {
    console.log('🧹 Cleaning up incomplete authentication state')
    
    // Remove OAuth-related session data
    storage.removeItem('linkedin_oauth_state')
    storage.removeItem('auth_in_progress')
    storage.removeItem('navigation_during_auth')
    
    // Clear any lingering return URLs if auth was interrupted
    const returnUrl = storage.getItem('linkedin_auth_return_url')
    if (returnUrl) {
      console.log('🔄 Clearing interrupted return URL:', returnUrl)
      storage.removeItem('linkedin_auth_return_url')
    }
  }, [])

  // Check if authentication is currently in progress
  const isAuthInProgress = useCallback(() => {
    const authProgress = storage.getItem('auth_in_progress')
    if (!authProgress) return false
    
    // Check if auth has been in progress too long (5 minutes max)
    const authStartTime = parseInt(authProgress, 10)
    const maxAuthTime = 5 * 60 * 1000 // 5 minutes
    const isExpired = Date.now() - authStartTime > maxAuthTime
    
    if (isExpired) {
      console.warn('⏰ Authentication timeout detected, cleaning up')
      cleanupIncompleteAuth()
      return false
    }
    
    return true
  }, [cleanupIncompleteAuth])

  // Mark authentication as in progress
  const markAuthInProgress = useCallback(() => {
    console.log('🚀 Marking authentication as in progress')
    storage.setItem('auth_in_progress', Date.now().toString())
  }, [])

  // Clear authentication progress marker
  const clearAuthProgress = useCallback(() => {
    console.log('✅ Clearing authentication progress marker')
    storage.removeItem('auth_in_progress')
  }, [])

  // Handle navigation during authentication
  useEffect(() => {
    const authInProgress = storage.getItem('auth_in_progress')
    
    // If auth is in progress and user navigated away from callback route
    if (authInProgress && pathname !== '/auth/linkedin/callback') {
      console.log('🔄 Navigation detected during auth, checking state...')
      
      // Only clean up if we're not on a valid auth flow page
      if (!pathname.includes('/auth/')) {
        console.log('📍 User navigated to non-auth page during auth, cleaning up')
        cleanupIncompleteAuth()
      }
    }
  }, [pathname, cleanupIncompleteAuth])

  // Handle page visibility changes (tab switching, app backgrounding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const navigationDuringAuth = storage.getItem('navigation_during_auth')
        
        if (navigationDuringAuth) {
          console.log('👁️ Page became visible, checking for interrupted auth')
          cleanupIncompleteAuth()
        }
        
        // Check for expired auth states
        if (isAuthInProgress()) {
          console.log('🔍 Page visible with auth in progress')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [cleanupIncompleteAuth, isAuthInProgress])

  // Handle browser navigation events
  useEffect(() => {
    const handleBeforeUnload = () => {
      const authInProgress = storage.getItem('auth_in_progress')
      
      if (authInProgress) {
        console.log('⚠️ Page unloading during auth, marking navigation')
        storage.setItem('navigation_during_auth', 'true')
      }
    }

    const handlePopState = () => {
      // Handle browser back/forward during auth
      const authInProgress = storage.getItem('auth_in_progress')
      
      if (authInProgress && !pathname.includes('/auth/')) {
        console.log('⬅️ Browser navigation during auth detected')
        cleanupIncompleteAuth()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname, cleanupIncompleteAuth])

  // Cleanup on unmount
  useEffect(() => {
    // Only cleanup if component is actually unmounting, not just re-rendering
    const timeoutId = setTimeout(() => {
      const authInProgress = storage.getItem('auth_in_progress')
      if (authInProgress) {
        console.log('🔄 Component unmounted with auth in progress, cleaning up')
        cleanupIncompleteAuth()
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [cleanupIncompleteAuth])

  return {
    isAuthInProgress,
    markAuthInProgress,
    clearAuthProgress,
    cleanupIncompleteAuth
  }
}

/**
 * Hook for preventing concurrent authentication attempts
 */
export const useAuthConcurrencyControl = () => {
  const { isAuthInProgress, markAuthInProgress, clearAuthProgress } = useAuthStatePersistence()

  const attemptAuth = useCallback(async (authFunction: () => Promise<void> | void) => {
    // Prevent concurrent auth attempts
    if (isAuthInProgress()) {
      console.warn('🚫 Authentication already in progress, ignoring request')
      return false
    }

    try {
      markAuthInProgress()
      await authFunction()
      return true
    } catch (error) {
      console.error('❌ Authentication attempt failed:', error)
      clearAuthProgress()
      throw error
    }
  }, [isAuthInProgress, markAuthInProgress, clearAuthProgress])

  return {
    attemptAuth,
    isAuthInProgress,
    clearAuthProgress
  }
}
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useDataDog, useDataDogBusiness } from './useDataDog'
import { trackPageView, createSpan } from '../utils/telemetry'

/**
 * Hook for comprehensive route tracking with OpenTelemetry and DataDog
 */
export const useRouteTracing = () => {
  const location = useLocation()
  const { trackPageView: trackDataDogPageView, trackAction } = useDataDog()
  const { trackEngagement } = useDataDogBusiness()
  const previousPath = useRef<string>('')
  const pageStartTime = useRef<number>(Date.now())

  useEffect(() => {
    const currentPath = location.pathname
    const previousPathValue = previousPath.current
    const navigationStartTime = Date.now()
    
    // Get page name for tracking
    const getPageName = (path: string): string => {
      switch (path) {
        case '/': return 'Home'
        case '/blog': return 'Blog'
        case '/cases': return 'Cases'
        case '/labs': return 'Labs'
        case '/projects': return 'Projects'
        case '/contact': return 'Contact'
        case '/auth/debug': return 'Auth Debug'
        case '/auth/linkedin/callback': return 'LinkedIn Callback'
        default:
          if (path.startsWith('/blog/')) return 'Blog Article'
          return 'Unknown Page'
      }
    }

    const pageName = getPageName(currentPath)
    const previousPageName = getPageName(previousPathValue)

    // Create OpenTelemetry span for navigation
    const navigationSpan = createSpan('user.navigation', {
      'page.name': pageName,
      'page.path': currentPath,
      'page.previous': previousPathValue || 'direct',
      'navigation.type': previousPathValue ? 'spa' : 'direct',
      'user.agent': navigator.userAgent
    })

    // Track with both systems
    Promise.all([
      // OpenTelemetry page view
      trackPageView(pageName, currentPath),
      
      // DataDog page view
      trackDataDogPageView(pageName, {
        page_path: currentPath,
        previous_page: previousPathValue,
        navigation_type: previousPathValue ? 'spa' : 'direct',
        timestamp: new Date().toISOString()
      })
    ]).then(() => {
      navigationSpan.setStatus({ code: 1 }) // OK
    }).catch((error) => {
      navigationSpan.setStatus({ code: 2, message: error.message }) // ERROR
      navigationSpan.recordException(error)
    }).finally(() => {
      navigationSpan.end()
    })

    // Track navigation timing
    if (previousPathValue) {
      const navigationDuration = navigationStartTime - pageStartTime.current
      
      trackAction('page.navigation_timing', {
        from_page: previousPageName,
        to_page: pageName,
        duration_ms: navigationDuration,
        timestamp: new Date().toISOString()
      })

      // Track engagement with previous page
      trackEngagement('page_time', navigationDuration, {
        page_name: previousPageName,
        session_duration: navigationDuration
      })
    }

    // Update refs for next navigation
    previousPath.current = currentPath
    pageStartTime.current = navigationStartTime

    // Track page visibility changes
    const handleVisibilityChange = () => {
      const visibilitySpan = createSpan('page.visibility_change', {
        'page.name': pageName,
        'page.visibility': document.visibilityState,
        'timestamp': new Date().toISOString()
      })

      trackAction('page.visibility_change', {
        page_name: pageName,
        visibility_state: document.visibilityState,
        timestamp: new Date().toISOString()
      })

      visibilitySpan.end()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [location.pathname, trackDataDogPageView, trackAction, trackEngagement])

  // Return page information for components
  return {
    currentPath: location.pathname,
    pageName: (() => {
      switch (location.pathname) {
        case '/': return 'Home'
        case '/blog': return 'Blog'
        case '/cases': return 'Cases'
        case '/labs': return 'Labs'
        case '/projects': return 'Projects'
        case '/contact': return 'Contact'
        default:
          if (location.pathname.startsWith('/blog/')) return 'Blog Article'
          return 'Unknown Page'
      }
    })()
  }
}
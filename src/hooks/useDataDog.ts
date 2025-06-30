import { useCallback } from 'react'
import { 
  trackDataDogEvent, 
  trackDataDogPageView, 
  logToDataDog, 
  trackBusinessMetric,
  updateDataDogUser
} from '../utils/datadogConfig'

/**
 * Hook for DataDog observability integration
 */
export const useDataDog = () => {
  // Track custom actions
  const trackAction = useCallback((
    name: string, 
    context?: Record<string, any>
  ) => {
    trackDataDogEvent(name, context, 'action')
  }, [])

  // Track errors
  const trackError = useCallback((
    error: string | Error, 
    context?: Record<string, any>
  ) => {
    const errorName = error instanceof Error ? error.message : error
    trackDataDogEvent(errorName, context, 'error')
  }, [])

  // Track timing/performance
  const trackTiming = useCallback((
    name: string, 
    duration: number, 
    context?: Record<string, any>
  ) => {
    trackDataDogEvent(name, { duration, ...context }, 'timing')
  }, [])

  // Track page views
  const trackPageView = useCallback((
    pageName: string, 
    context?: Record<string, any>
  ) => {
    trackDataDogPageView(pageName, context)
  }, [])

  // Log messages
  const log = useCallback((
    message: string,
    level: 'debug' | 'info' | 'warn' | 'error' = 'info',
    context?: Record<string, any>
  ) => {
    logToDataDog(message, level, context)
  }, [])

  // Track business metrics
  const trackMetric = useCallback((
    metric: string, 
    value: number, 
    tags?: Record<string, string>
  ) => {
    trackBusinessMetric(metric, value, tags)
  }, [])

  // Update user context
  const updateUser = useCallback((user: {
    id: string
    name?: string
    email?: string
    type?: string
  }) => {
    updateDataDogUser(user)
  }, [])

  return {
    trackAction,
    trackError,
    trackTiming,
    trackPageView,
    log,
    trackMetric,
    updateUser
  }
}

/**
 * Hook for tracking user interactions with DataDog
 */
export const useDataDogInteractions = () => {
  const { trackAction } = useDataDog()

  const trackClick = useCallback((
    elementName: string, 
    location?: string, 
    additionalContext?: Record<string, any>
  ) => {
    trackAction('user.click', {
      element: elementName,
      location: location || 'unknown',
      timestamp: new Date().toISOString(),
      ...additionalContext
    })
  }, [trackAction])

  const trackNavigation = useCallback((
    from: string, 
    to: string, 
    method: 'click' | 'browser' | 'direct' = 'click'
  ) => {
    trackAction('user.navigation', {
      from_page: from,
      to_page: to,
      navigation_method: method,
      timestamp: new Date().toISOString()
    })
  }, [trackAction])

  const trackFormSubmission = useCallback((
    formName: string, 
    success: boolean, 
    context?: Record<string, any>
  ) => {
    trackAction('user.form_submission', {
      form_name: formName,
      success,
      timestamp: new Date().toISOString(),
      ...context
    })
  }, [trackAction])

  const trackExternalLink = useCallback((
    url: string, 
    linkText?: string, 
    context?: Record<string, any>
  ) => {
    trackAction('user.external_link', {
      destination_url: url,
      link_text: linkText,
      timestamp: new Date().toISOString(),
      ...context
    })
  }, [trackAction])

  return {
    trackClick,
    trackNavigation,
    trackFormSubmission,
    trackExternalLink
  }
}

/**
 * Hook for tracking business events
 */
export const useDataDogBusiness = () => {
  const { trackMetric, trackAction } = useDataDog()

  const trackEngagement = useCallback((
    action: string, 
    value: number = 1, 
    context?: Record<string, any>
  ) => {
    trackMetric('engagement', value, { action })
    trackAction('business.engagement', {
      action,
      value,
      ...context
    })
  }, [trackMetric, trackAction])

  const trackConversion = useCallback((
    type: 'contact' | 'linkedin' | 'project_view' | 'blog_read',
    context?: Record<string, any>
  ) => {
    trackMetric('conversion', 1, { type })
    trackAction('business.conversion', {
      conversion_type: type,
      timestamp: new Date().toISOString(),
      ...context
    })
  }, [trackMetric, trackAction])

  const trackRetention = useCallback((
    sessionDuration: number,
    pageViews: number,
    isReturning: boolean = false
  ) => {
    trackMetric('session_duration', sessionDuration, { 
      user_type: isReturning ? 'returning' : 'new' 
    })
    trackMetric('page_views', pageViews, { 
      user_type: isReturning ? 'returning' : 'new' 
    })
    
    trackAction('business.session_end', {
      duration_seconds: sessionDuration,
      page_views: pageViews,
      user_type: isReturning ? 'returning' : 'new',
      timestamp: new Date().toISOString()
    })
  }, [trackMetric, trackAction])

  return {
    trackEngagement,
    trackConversion,
    trackRetention
  }
}
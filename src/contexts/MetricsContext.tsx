import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react'
import { useBusinessIntelligence } from '../hooks/useBusinessIntelligence'
import { metricsCollector, MetricsUtils } from '../utils/customMetrics'
import { useDataDog } from '../hooks/useDataDog'

interface MetricsContextType {
  // Business Intelligence
  trackConversion: (funnel: string, step: string, value?: number, context?: Record<string, any>) => void
  trackEngagement: (timeOnPage: number, scrollDepth: number, interactions: number) => void
  trackKPI: (name: string, value: number, unit?: string, context?: Record<string, any>) => void
  trackRevenue: (amount: number, currency?: string, source?: string, context?: Record<string, any>) => void
  trackMilestone: (milestone: string, category?: string, context?: Record<string, any>) => void
  
  // Performance Tracking
  startTiming: (name: string, context?: Record<string, any>) => void
  endTiming: (name: string) => number | null
  trackPageLoad: () => void
  trackApiCall: (endpoint: string, method: string, responseTime: number, statusCode: number) => void
  
  // Error Tracking
  trackError: (error: Error, context?: Record<string, any>) => void
  trackException: (errorType: string, message: string, context?: Record<string, any>) => void
  
  // Session Management
  getSessionStats: () => any
  exportMetrics: () => any
  
  // Predefined tracking functions
  portfolio: {
    trackHomepageView: () => void
    trackExpertiseView: () => void
    trackCasesView: () => void
    trackProjectClick: (projectName: string) => void
    trackGithubVisit: (projectName: string) => void
  }
  
  contact: {
    trackContactView: () => void
    trackEmailClick: () => void
    trackWhatsAppClick: () => void
    trackLinkedInClick: () => void
    trackFormSubmit: (formType: string) => void
  }
  
  auth: {
    trackSignInView: () => void
    trackSignInAttempt: (provider: string) => void
    trackSignInComplete: (provider: string, userId: string) => void
    trackSignOut: () => void
  }
  
  blog: {
    trackBlogListView: () => void
    trackArticleClick: (articleSlug: string) => void
    trackArticleRead: (articleSlug: string, readTime: number) => void
    trackArticleShare: (articleSlug: string, platform: string) => void
    trackLinkedInPostVisit: (articleSlug: string) => void
  }
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined)

export const useMetrics = (): MetricsContextType => {
  const context = useContext(MetricsContext)
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider')
  }
  return context
}

interface MetricsProviderProps {
  children: React.ReactNode
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children }) => {
  const businessIntelligence = useBusinessIntelligence()
  const { trackError: dataDogTrackError } = useDataDog()
  const errorBoundaryRef = useRef<boolean>(false)

  // Initialize session tracking
  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('session_id', sessionId)
    }

    // Track session start
    businessIntelligence.trackMilestone('session_start', 'session', {
      session_id: sessionId,
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language
    })

    // Track initial page load
    MetricsUtils.trackPageLoad()

    return () => {
      // Track session end on unmount
      businessIntelligence.trackMilestone('session_end', 'session', {
        session_id: sessionId,
        session_stats: businessIntelligence.getSessionStats()
      })
    }
  }, [businessIntelligence])

  // Enhanced tracking functions
  const trackConversion = useCallback((
    funnel: string, 
    step: string, 
    value?: number, 
    context?: Record<string, any>
  ) => {
    businessIntelligence.trackConversion({ funnel, step, value, context })
    MetricsUtils.trackConversion(funnel, step, value)
  }, [businessIntelligence])

  const trackEngagement = useCallback((
    timeOnPage: number, 
    scrollDepth: number, 
    interactions: number
  ) => {
    businessIntelligence.trackEngagement({ timeOnPage, scrollDepth, clickCount: interactions })
    MetricsUtils.trackEngagement(timeOnPage, scrollDepth, interactions)
  }, [businessIntelligence])

  const trackKPI = useCallback((
    name: string, 
    value: number, 
    unit: string = 'count', 
    context?: Record<string, any>
  ) => {
    businessIntelligence.trackKPI(name, value, unit, context)
    metricsCollector.record({ name: `kpi.${name}`, value, unit, tags: context })
  }, [businessIntelligence])

  const trackRevenue = useCallback((
    amount: number, 
    currency: string = 'USD', 
    source: string = '', 
    context?: Record<string, any>
  ) => {
    businessIntelligence.trackRevenue(amount, currency, source, context)
    metricsCollector.recordBusinessMetric({
      category: 'revenue',
      metric: 'transaction',
      value: amount,
      dimensions: { currency, source, ...context }
    })
  }, [businessIntelligence])

  const trackMilestone = useCallback((
    milestone: string, 
    category: string = 'user_journey', 
    context?: Record<string, any>
  ) => {
    businessIntelligence.trackMilestone(milestone, category, context)
  }, [businessIntelligence])

  // Performance tracking
  const startTiming = useCallback((name: string, context?: Record<string, any>) => {
    metricsCollector.startTiming(name, context)
  }, [])

  const endTiming = useCallback((name: string): number | null => {
    return metricsCollector.endTiming(name)
  }, [])

  const trackPageLoad = useCallback(() => {
    MetricsUtils.trackPageLoad()
  }, [])

  const trackApiCall = useCallback((
    endpoint: string, 
    method: string, 
    responseTime: number, 
    statusCode: number
  ) => {
    MetricsUtils.trackApiCall(endpoint, method, responseTime, statusCode)
  }, [])

  // Error tracking
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    if (!errorBoundaryRef.current) {
      errorBoundaryRef.current = true
      
      dataDogTrackError(error, context)
      MetricsUtils.trackError('javascript_error', error.message, {
        stack: error.stack?.substring(0, 500),
        ...context
      })
      
      setTimeout(() => {
        errorBoundaryRef.current = false
      }, 1000)
    }
  }, [dataDogTrackError])

  const trackException = useCallback((
    errorType: string, 
    message: string, 
    context?: Record<string, any>
  ) => {
    MetricsUtils.trackError(errorType, message, context)
  }, [])

  // Portfolio tracking functions
  const portfolio = {
    trackHomepageView: useCallback(() => {
      trackConversion('portfolio', 'homepage_view')
    }, [trackConversion]),

    trackExpertiseView: useCallback(() => {
      trackConversion('portfolio', 'expertise_view')
    }, [trackConversion]),

    trackCasesView: useCallback(() => {
      trackConversion('portfolio', 'cases_view')
    }, [trackConversion]),

    trackProjectClick: useCallback((projectName: string) => {
      trackConversion('portfolio', 'project_click', 1, { project_name: projectName })
    }, [trackConversion]),

    trackGithubVisit: useCallback((projectName: string) => {
      trackConversion('portfolio', 'github_visit', 1, { project_name: projectName })
    }, [trackConversion])
  }

  // Contact tracking functions
  const contact = {
    trackContactView: useCallback(() => {
      trackConversion('contact', 'contact_view')
    }, [trackConversion]),

    trackEmailClick: useCallback(() => {
      trackConversion('contact', 'email_click')
    }, [trackConversion]),

    trackWhatsAppClick: useCallback(() => {
      trackConversion('contact', 'whatsapp_click')
    }, [trackConversion]),

    trackLinkedInClick: useCallback(() => {
      trackConversion('contact', 'linkedin_click')
    }, [trackConversion]),

    trackFormSubmit: useCallback((formType: string) => {
      trackConversion('contact', 'form_submit', 1, { form_type: formType })
    }, [trackConversion])
  }

  // Auth tracking functions
  const auth = {
    trackSignInView: useCallback(() => {
      trackConversion('auth', 'signin_view')
    }, [trackConversion]),

    trackSignInAttempt: useCallback((provider: string) => {
      trackConversion('auth', 'signin_attempt', 1, { provider })
    }, [trackConversion]),

    trackSignInComplete: useCallback((provider: string, userId: string) => {
      trackConversion('auth', 'signin_complete', 1, { provider, user_id: userId })
      trackMilestone('user_authenticated', 'auth', { provider, user_id: userId })
    }, [trackConversion, trackMilestone]),

    trackSignOut: useCallback(() => {
      trackConversion('auth', 'signout')
    }, [trackConversion])
  }

  // Blog tracking functions
  const blog = {
    trackBlogListView: useCallback(() => {
      trackConversion('blog', 'blog_list_view')
    }, [trackConversion]),

    trackArticleClick: useCallback((articleSlug: string) => {
      trackConversion('blog', 'article_click', 1, { article_slug: articleSlug })
    }, [trackConversion]),

    trackArticleRead: useCallback((articleSlug: string, readTime: number) => {
      trackConversion('blog', 'article_read', readTime, { article_slug: articleSlug, read_time: readTime })
      trackMilestone('article_completed', 'content', { article_slug: articleSlug, read_time: readTime })
    }, [trackConversion, trackMilestone]),

    trackArticleShare: useCallback((articleSlug: string, platform: string) => {
      trackConversion('blog', 'article_share', 1, { article_slug: articleSlug, platform })
    }, [trackConversion]),

    trackLinkedInPostVisit: useCallback((articleSlug: string) => {
      trackConversion('blog', 'linkedin_post_visit', 1, { article_slug: articleSlug })
    }, [trackConversion])
  }

  // Utility functions
  const getSessionStats = useCallback(() => {
    return businessIntelligence.getSessionStats()
  }, [businessIntelligence])

  const exportMetrics = useCallback(() => {
    return {
      customMetrics: metricsCollector.exportMetrics(),
      sessionStats: businessIntelligence.getSessionStats(),
      basicMetrics: businessIntelligence.getBasicMetrics()
    }
  }, [businessIntelligence])

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error_type: 'global_error'
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(String(event.reason)), {
        error_type: 'unhandled_promise_rejection'
      })
    }

    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackError])

  const contextValue: MetricsContextType = {
    trackConversion,
    trackEngagement,
    trackKPI,
    trackRevenue,
    trackMilestone,
    startTiming,
    endTiming,
    trackPageLoad,
    trackApiCall,
    trackError,
    trackException,
    getSessionStats,
    exportMetrics,
    portfolio,
    contact,
    auth,
    blog
  }

  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  )
}

export default MetricsContext
import { useCallback, useEffect, useRef } from 'react'
import { useDataDog } from './useDataDog'
import { createSpan } from '../utils/telemetry'

interface BusinessMetrics {
  userId?: string
  sessionId: string
  userType: 'anonymous' | 'authenticated'
  deviceType: 'mobile' | 'tablet' | 'desktop'
  environment: 'development' | 'production'
}

interface ConversionEvent {
  funnel: string
  step: string
  value?: number
  currency?: string
  context?: Record<string, any>
}

interface EngagementMetrics {
  timeOnPage: number
  scrollDepth: number
  clickCount: number
  sessionDuration: number
  pagesViewed: number
}

/**
 * Hook for comprehensive business intelligence and custom metrics tracking
 */
export const useBusinessIntelligence = () => {
  const { trackAction, trackTiming } = useDataDog()
  const sessionStart = useRef<number>(Date.now())
  const pageStart = useRef<number>(Date.now())
  const interactions = useRef<number>(0)
  const maxScrollDepth = useRef<number>(0)
  const pagesInSession = useRef<Set<string>>(new Set())

  // Get basic user metrics
  const getBasicMetrics = useCallback((): BusinessMetrics => {
    const getUserAgent = () => {
      const ua = navigator.userAgent
      if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        if (/iPad/i.test(ua)) return 'tablet'
        return 'mobile'
      }
      return 'desktop'
    }

    return {
      sessionId: sessionStorage.getItem('session_id') || `session_${Date.now()}`,
      userType: localStorage.getItem('linkedin_user') ? 'authenticated' : 'anonymous',
      deviceType: getUserAgent(),
      environment: import.meta.env.DEV ? 'development' : 'production'
    }
  }, [])

  // Track business conversion events
  const trackConversion = useCallback((event: ConversionEvent) => {
    const metrics = getBasicMetrics()
    
    const conversionSpan = createSpan('business.conversion', {
      'conversion.funnel': event.funnel,
      'conversion.step': event.step,
      'conversion.value': event.value || 0,
      'conversion.currency': event.currency || 'USD',
      'user.type': metrics.userType,
      'user.device': metrics.deviceType,
      'business.environment': metrics.environment
    })

    trackAction('business_conversion', {
      funnel: event.funnel,
      step: event.step,
      value: event.value,
      currency: event.currency,
      user_type: metrics.userType,
      device_type: metrics.deviceType,
      session_id: metrics.sessionId,
      timestamp: new Date().toISOString(),
      ...event.context
    })

    conversionSpan.end()
  }, [getBasicMetrics, trackAction])

  // Track user engagement metrics
  const trackEngagement = useCallback((engagement: Partial<EngagementMetrics>) => {
    const metrics = getBasicMetrics()
    
    const engagementSpan = createSpan('business.engagement', {
      'engagement.time_on_page': engagement.timeOnPage || 0,
      'engagement.scroll_depth': engagement.scrollDepth || 0,
      'engagement.click_count': engagement.clickCount || 0,
      'engagement.session_duration': engagement.sessionDuration || 0,
      'engagement.pages_viewed': engagement.pagesViewed || 0,
      'user.type': metrics.userType,
      'user.device': metrics.deviceType
    })

    trackAction('user_engagement', {
      time_on_page_seconds: engagement.timeOnPage,
      scroll_depth_percent: engagement.scrollDepth,
      click_count: engagement.clickCount,
      session_duration_seconds: engagement.sessionDuration,
      pages_viewed: engagement.pagesViewed,
      user_type: metrics.userType,
      device_type: metrics.deviceType,
      session_id: metrics.sessionId,
      timestamp: new Date().toISOString()
    })

    if (engagement.timeOnPage) {
      trackTiming('page.time_on_page', engagement.timeOnPage * 1000, {
        page_name: window.location.pathname,
        user_type: metrics.userType
      })
    }

    engagementSpan.end()
  }, [getBasicMetrics, trackAction, trackTiming])

  // Track business KPIs
  const trackKPI = useCallback((
    kpiName: string, 
    value: number, 
    unit: string = 'count',
    context?: Record<string, any>
  ) => {
    const metrics = getBasicMetrics()
    
    const kpiSpan = createSpan('business.kpi', {
      'kpi.name': kpiName,
      'kpi.value': value,
      'kpi.unit': unit,
      'user.type': metrics.userType,
      'business.environment': metrics.environment
    })

    trackAction('business_kpi', {
      kpi_name: kpiName,
      kpi_value: value,
      kpi_unit: unit,
      user_type: metrics.userType,
      device_type: metrics.deviceType,
      session_id: metrics.sessionId,
      timestamp: new Date().toISOString(),
      ...context
    })

    kpiSpan.end()
  }, [getBasicMetrics, trackAction])

  // Track revenue and business value
  const trackRevenue = useCallback((
    amount: number,
    currency: string = 'USD',
    source: string,
    context?: Record<string, any>
  ) => {
    const metrics = getBasicMetrics()
    
    const revenueSpan = createSpan('business.revenue', {
      'revenue.amount': amount,
      'revenue.currency': currency,
      'revenue.source': source,
      'user.type': metrics.userType,
      'business.environment': metrics.environment
    })

    trackAction('business_revenue', {
      revenue_amount: amount,
      revenue_currency: currency,
      revenue_source: source,
      user_type: metrics.userType,
      device_type: metrics.deviceType,
      session_id: metrics.sessionId,
      timestamp: new Date().toISOString(),
      ...context
    })

    // Also track as conversion
    trackConversion({
      funnel: 'revenue',
      step: source,
      value: amount,
      currency,
      context
    })

    revenueSpan.end()
  }, [getBasicMetrics, trackAction, trackConversion])

  // Track user journey milestones
  const trackMilestone = useCallback((
    milestone: string,
    category: string = 'user_journey',
    context?: Record<string, any>
  ) => {
    const metrics = getBasicMetrics()
    
    const milestoneSpan = createSpan('business.milestone', {
      'milestone.name': milestone,
      'milestone.category': category,
      'user.type': metrics.userType,
      'business.environment': metrics.environment
    })

    trackAction('user_milestone', {
      milestone_name: milestone,
      milestone_category: category,
      user_type: metrics.userType,
      device_type: metrics.deviceType,
      session_id: metrics.sessionId,
      timestamp: new Date().toISOString(),
      ...context
    })

    milestoneSpan.end()
  }, [getBasicMetrics, trackAction])

  // Auto-track scroll depth
  useEffect(() => {
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent
        
        // Track significant scroll milestones
        if (scrollPercent >= 25 && scrollPercent < 50) {
          trackMilestone('25_percent_scroll', 'engagement')
        } else if (scrollPercent >= 50 && scrollPercent < 75) {
          trackMilestone('50_percent_scroll', 'engagement')
        } else if (scrollPercent >= 75 && scrollPercent < 100) {
          trackMilestone('75_percent_scroll', 'engagement')
        } else if (scrollPercent >= 100) {
          trackMilestone('100_percent_scroll', 'engagement')
        }
      }
    }

    const handleScroll = () => {
      requestAnimationFrame(trackScrollDepth)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackMilestone])

  // Auto-track click interactions
  useEffect(() => {
    const handleClick = () => {
      interactions.current += 1
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Track page entry
  useEffect(() => {
    const currentPage = window.location.pathname
    pagesInSession.current.add(currentPage)
    pageStart.current = Date.now()

    // Track page view as milestone
    trackMilestone(`page_view_${currentPage.replace('/', '') || 'home'}`, 'navigation')

    // Track session engagement on page unload
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageStart.current) / 1000)
      const sessionDuration = Math.round((Date.now() - sessionStart.current) / 1000)
      
      trackEngagement({
        timeOnPage,
        scrollDepth: maxScrollDepth.current,
        clickCount: interactions.current,
        sessionDuration,
        pagesViewed: pagesInSession.current.size
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [trackEngagement, trackMilestone])

  // Get current session stats
  const getSessionStats = useCallback(() => {
    return {
      sessionDuration: Math.round((Date.now() - sessionStart.current) / 1000),
      timeOnCurrentPage: Math.round((Date.now() - pageStart.current) / 1000),
      totalInteractions: interactions.current,
      maxScrollDepth: maxScrollDepth.current,
      pagesViewed: pagesInSession.current.size,
      currentPage: window.location.pathname
    }
  }, [])

  return {
    trackConversion,
    trackEngagement,
    trackKPI,
    trackRevenue,
    trackMilestone,
    getSessionStats,
    getBasicMetrics
  }
}

/**
 * Predefined conversion funnels for common business scenarios
 */
export const ConversionFunnels = {
  // Portfolio engagement funnel
  PORTFOLIO: {
    VIEW_HOMEPAGE: { funnel: 'portfolio', step: 'homepage_view' },
    VIEW_EXPERTISE: { funnel: 'portfolio', step: 'expertise_view' },
    VIEW_CASES: { funnel: 'portfolio', step: 'cases_view' },
    CLICK_PROJECT: { funnel: 'portfolio', step: 'project_click' },
    VISIT_GITHUB: { funnel: 'portfolio', step: 'github_visit' }
  },
  
  // Contact funnel
  CONTACT: {
    VIEW_CONTACT: { funnel: 'contact', step: 'contact_view' },
    CLICK_EMAIL: { funnel: 'contact', step: 'email_click' },
    CLICK_WHATSAPP: { funnel: 'contact', step: 'whatsapp_click' },
    CLICK_LINKEDIN: { funnel: 'contact', step: 'linkedin_click' },
    SUBMIT_FORM: { funnel: 'contact', step: 'form_submit' }
  },
  
  // Authentication funnel
  AUTH: {
    VIEW_SIGNIN: { funnel: 'auth', step: 'signin_view' },
    ATTEMPT_SIGNIN: { funnel: 'auth', step: 'signin_attempt' },
    COMPLETE_SIGNIN: { funnel: 'auth', step: 'signin_complete' },
    SIGNOUT: { funnel: 'auth', step: 'signout' }
  },
  
  // Blog engagement funnel
  BLOG: {
    VIEW_BLOG_LIST: { funnel: 'blog', step: 'blog_list_view' },
    CLICK_ARTICLE: { funnel: 'blog', step: 'article_click' },
    READ_ARTICLE: { funnel: 'blog', step: 'article_read' },
    SHARE_ARTICLE: { funnel: 'blog', step: 'article_share' },
    VISIT_LINKEDIN_POST: { funnel: 'blog', step: 'linkedin_post_visit' }
  }
} as const
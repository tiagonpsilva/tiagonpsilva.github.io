import { createSpan } from './telemetry'

/**
 * Custom metrics collection and processing utilities
 */

interface CustomMetric {
  name: string
  value: number
  unit: string
  tags?: Record<string, string | number | boolean>
  timestamp?: number
}

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  context?: Record<string, any>
}

interface BusinessMetric {
  category: 'conversion' | 'engagement' | 'performance' | 'error' | 'revenue'
  metric: string
  value: number
  dimensions?: Record<string, any>
}

class CustomMetricsCollector {
  private metrics: CustomMetric[] = []
  private performanceMarks: Map<string, PerformanceMetric> = new Map()
  private businessMetrics: BusinessMetric[] = []

  /**
   * Record a custom metric
   */
  record(metric: CustomMetric): void {
    const metricWithTimestamp = {
      ...metric,
      timestamp: metric.timestamp || Date.now()
    }

    this.metrics.push(metricWithTimestamp)

    // Create OpenTelemetry span for metric
    const span = createSpan('custom.metric', {
      'metric.name': metric.name,
      'metric.value': metric.value,
      'metric.unit': metric.unit,
      'metric.timestamp': metricWithTimestamp.timestamp,
      ...metric.tags
    })

    span.end()

    // Log in development
    if (import.meta.env.DEV) {
      console.log('📊 Custom Metric:', metricWithTimestamp)
    }
  }

  /**
   * Start a performance measurement
   */
  startTiming(name: string, context?: Record<string, any>): void {
    const startTime = performance.now()
    this.performanceMarks.set(name, {
      name,
      startTime,
      context
    })

    // Use Performance API if available
    if (performance.mark) {
      performance.mark(`${name}-start`)
    }
  }

  /**
   * End a performance measurement
   */
  endTiming(name: string): number | null {
    const mark = this.performanceMarks.get(name)
    if (!mark) {
      console.warn(`Performance mark '${name}' not found`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - mark.startTime

    // Update the mark
    mark.endTime = endTime
    mark.duration = duration

    // Use Performance API if available
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }

    // Record as custom metric
    this.record({
      name: `performance.${name}`,
      value: duration,
      unit: 'milliseconds',
      tags: {
        'timing.type': 'duration',
        ...mark.context
      }
    })

    // Create business metric for performance
    this.recordBusinessMetric({
      category: 'performance',
      metric: name,
      value: duration,
      dimensions: mark.context
    })

    return duration
  }

  /**
   * Record a business metric
   */
  recordBusinessMetric(metric: BusinessMetric): void {
    this.businessMetrics.push(metric)

    // Create OpenTelemetry span
    const span = createSpan('business.metric', {
      'business.category': metric.category,
      'business.metric': metric.metric,
      'business.value': metric.value,
      'business.timestamp': Date.now(),
      ...metric.dimensions
    })

    span.end()

    // Log in development
    if (import.meta.env.DEV) {
      console.log('💼 Business Metric:', metric)
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): Record<string, any> {
    const completedTimings = Array.from(this.performanceMarks.values())
      .filter(mark => mark.duration !== undefined)

    if (completedTimings.length === 0) {
      return {}
    }

    const durations = completedTimings.map(mark => mark.duration!)
    
    return {
      count: durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      total: durations.reduce((a, b) => a + b, 0)
    }
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, any> {
    const metricsByName = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = []
      }
      acc[metric.name].push(metric.value)
      return acc
    }, {} as Record<string, number[]>)

    const summary: Record<string, any> = {}
    
    for (const [name, values] of Object.entries(metricsByName)) {
      summary[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        sum: values.reduce((a, b) => a + b, 0)
      }
    }

    return summary
  }

  /**
   * Get business metrics by category
   */
  getBusinessMetricsByCategory(): Record<string, BusinessMetric[]> {
    return this.businessMetrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = []
      }
      acc[metric.category].push(metric)
      return acc
    }, {} as Record<string, BusinessMetric[]>)
  }

  /**
   * Export all metrics for analysis
   */
  exportMetrics(): {
    customMetrics: CustomMetric[]
    performanceMetrics: PerformanceMetric[]
    businessMetrics: BusinessMetric[]
    summary: {
      performance: Record<string, any>
      custom: Record<string, any>
      business: Record<string, BusinessMetric[]>
    }
  } {
    return {
      customMetrics: [...this.metrics],
      performanceMetrics: Array.from(this.performanceMarks.values()),
      businessMetrics: [...this.businessMetrics],
      summary: {
        performance: this.getPerformanceStats(),
        custom: this.getMetricsSummary(),
        business: this.getBusinessMetricsByCategory()
      }
    }
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.metrics = []
    this.performanceMarks.clear()
    this.businessMetrics = []
  }
}

// Global metrics collector instance
export const metricsCollector = new CustomMetricsCollector()

/**
 * Predefined metrics for common scenarios
 */
export const Metrics = {
  // Page performance metrics
  PAGE_LOAD_TIME: 'page.load_time',
  COMPONENT_RENDER_TIME: 'component.render_time',
  API_RESPONSE_TIME: 'api.response_time',
  
  // User interaction metrics
  CLICK_RESPONSE_TIME: 'interaction.click_response',
  FORM_COMPLETION_TIME: 'form.completion_time',
  NAVIGATION_TIME: 'navigation.time',
  
  // Business metrics
  CONVERSION_RATE: 'business.conversion_rate',
  SESSION_DURATION: 'business.session_duration',
  BOUNCE_RATE: 'business.bounce_rate',
  ENGAGEMENT_SCORE: 'business.engagement_score',
  
  // Error metrics
  ERROR_RATE: 'error.rate',
  EXCEPTION_COUNT: 'error.exception_count',
  RECOVERY_TIME: 'error.recovery_time'
} as const

/**
 * Utility functions for common metric patterns
 */
export const MetricsUtils = {
  /**
   * Track page load performance
   */
  trackPageLoad(): void {
    if (performance.timing) {
      const timing = performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
      const firstPaint = timing.responseStart - timing.navigationStart

      metricsCollector.record({
        name: Metrics.PAGE_LOAD_TIME,
        value: loadTime,
        unit: 'milliseconds',
        tags: {
          'page.url': window.location.pathname,
          'page.referrer': document.referrer || 'direct'
        }
      })

      metricsCollector.recordBusinessMetric({
        category: 'performance',
        metric: 'page_load',
        value: loadTime,
        dimensions: {
          dom_content_loaded: domContentLoaded,
          first_paint: firstPaint,
          page_url: window.location.pathname
        }
      })
    }
  },

  /**
   * Track component performance
   */
  trackComponentPerformance(componentName: string, renderTime: number): void {
    metricsCollector.record({
      name: Metrics.COMPONENT_RENDER_TIME,
      value: renderTime,
      unit: 'milliseconds',
      tags: {
        'component.name': componentName
      }
    })

    metricsCollector.recordBusinessMetric({
      category: 'performance',
      metric: 'component_render',
      value: renderTime,
      dimensions: {
        component_name: componentName
      }
    })
  },

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, method: string, responseTime: number, statusCode: number): void {
    metricsCollector.record({
      name: Metrics.API_RESPONSE_TIME,
      value: responseTime,
      unit: 'milliseconds',
      tags: {
        'api.endpoint': endpoint,
        'api.method': method,
        'api.status_code': statusCode
      }
    })

    metricsCollector.recordBusinessMetric({
      category: 'performance',
      metric: 'api_response',
      value: responseTime,
      dimensions: {
        endpoint,
        method,
        status_code: statusCode,
        success: statusCode >= 200 && statusCode < 300
      }
    })
  },

  /**
   * Track user engagement
   */
  trackEngagement(timeOnPage: number, scrollDepth: number, interactions: number): void {
    const engagementScore = Math.min(100, (timeOnPage / 60) * 30 + scrollDepth * 0.5 + interactions * 2)

    metricsCollector.record({
      name: Metrics.ENGAGEMENT_SCORE,
      value: engagementScore,
      unit: 'score',
      tags: {
        'engagement.time_on_page': timeOnPage,
        'engagement.scroll_depth': scrollDepth,
        'engagement.interactions': interactions
      }
    })

    metricsCollector.recordBusinessMetric({
      category: 'engagement',
      metric: 'user_engagement',
      value: engagementScore,
      dimensions: {
        time_on_page: timeOnPage,
        scroll_depth: scrollDepth,
        interactions: interactions
      }
    })
  },

  /**
   * Track conversion events
   */
  trackConversion(funnel: string, step: string, value?: number): void {
    metricsCollector.recordBusinessMetric({
      category: 'conversion',
      metric: 'funnel_step',
      value: value || 1,
      dimensions: {
        funnel,
        step
      }
    })
  },

  /**
   * Track errors
   */
  trackError(errorType: string, errorMessage: string, context?: Record<string, any>): void {
    metricsCollector.record({
      name: Metrics.EXCEPTION_COUNT,
      value: 1,
      unit: 'count',
      tags: {
        'error.type': errorType,
        'error.message': errorMessage.substring(0, 100),
        ...context
      }
    })

    metricsCollector.recordBusinessMetric({
      category: 'error',
      metric: 'exception',
      value: 1,
      dimensions: {
        error_type: errorType,
        error_message: errorMessage.substring(0, 100),
        ...context
      }
    })
  }
}

/**
 * Performance observer for automatic metrics collection
 */
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  try {
    // Observe navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          MetricsUtils.trackPageLoad()
        }
      }
    })
    navObserver.observe({ entryTypes: ['navigation'] })

    // Observe paint timing
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          metricsCollector.record({
            name: `performance.${entry.name}`,
            value: entry.startTime,
            unit: 'milliseconds',
            tags: {
              'paint.type': entry.name
            }
          })
        }
      }
    })
    paintObserver.observe({ entryTypes: ['paint'] })

  } catch (error) {
    console.warn('PerformanceObserver not fully supported:', error)
  }
}

export default metricsCollector
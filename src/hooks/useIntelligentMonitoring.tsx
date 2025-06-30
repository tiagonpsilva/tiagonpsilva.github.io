import { useCallback, useEffect, useState } from 'react'
import { intelligentMonitoring, AlertRule, AlertEvent } from '../utils/intelligentMonitoring'
import { useMetrics } from '../contexts/MetricsContext'

interface MonitoringHookReturn {
  isEnabled: boolean
  toggleMonitoring: () => void
  getStatus: () => any
  getRecentAlerts: (limit?: number) => AlertEvent[]
  addCustomRule: (rule: AlertRule) => void
  removeRule: (ruleId: string) => boolean
  exportData: () => any
  clearAlerts: () => void
  setAlertThreshold: (ruleId: string, threshold: number) => void
}

/**
 * Hook for intelligent monitoring integration
 */
export const useIntelligentMonitoring = (): MonitoringHookReturn => {
  const [isEnabled, setIsEnabled] = useState(true)
  const { trackKPI } = useMetrics()

  useEffect(() => {
    // Only initialize monitoring in development
    if (import.meta.env.DEV) {
      intelligentMonitoring.setEnabled(true)
      setIsEnabled(true)

      // Track monitoring initialization
      trackKPI('monitoring_initialized', 1, 'boolean', {
        timestamp: new Date().toISOString(),
        system: 'intelligent_monitoring'
      })

      return () => {
        // Clean shutdown
        intelligentMonitoring.setEnabled(false)
      }
    } else {
      // Disable in production
      intelligentMonitoring.setEnabled(false)
      setIsEnabled(false)
    }
  }, [trackKPI])

  const toggleMonitoring = useCallback(() => {
    const newState = !isEnabled
    intelligentMonitoring.setEnabled(newState)
    setIsEnabled(newState)
    
    trackKPI('monitoring_toggled', newState ? 1 : 0, 'boolean', {
      action: newState ? 'enabled' : 'disabled',
      timestamp: new Date().toISOString()
    })
  }, [isEnabled, trackKPI])

  const getStatus = useCallback(() => {
    return intelligentMonitoring.getMonitoringStatus()
  }, [])

  const getRecentAlerts = useCallback((limit: number = 10) => {
    return intelligentMonitoring.getRecentAlerts(limit)
  }, [])

  const addCustomRule = useCallback((rule: AlertRule) => {
    intelligentMonitoring.addAlertRule(rule)
    
    trackKPI('monitoring_rule_added', 1, 'count', {
      rule_id: rule.id,
      rule_name: rule.name,
      severity: rule.severity,
      metric: rule.metric
    })
  }, [trackKPI])

  const removeRule = useCallback((ruleId: string): boolean => {
    const removed = intelligentMonitoring.removeAlertRule(ruleId)
    
    if (removed) {
      trackKPI('monitoring_rule_removed', 1, 'count', {
        rule_id: ruleId
      })
    }
    
    return removed
  }, [trackKPI])

  const exportData = useCallback(() => {
    const data = intelligentMonitoring.exportMonitoringData()
    
    trackKPI('monitoring_data_exported', 1, 'count', {
      rules_count: data.rules.length,
      alerts_count: data.alerts.length,
      baselines_count: data.baselines.length
    })
    
    return data
  }, [trackKPI])

  const clearAlerts = useCallback(() => {
    // This would clear alert history if we had such a method
    trackKPI('monitoring_alerts_cleared', 1, 'count', {
      timestamp: new Date().toISOString()
    })
  }, [trackKPI])

  const setAlertThreshold = useCallback((ruleId: string, threshold: number) => {
    // This would update rule threshold if we had such a method
    trackKPI('monitoring_threshold_updated', threshold, 'value', {
      rule_id: ruleId,
      new_threshold: threshold
    })
  }, [trackKPI])

  return {
    isEnabled,
    toggleMonitoring,
    getStatus,
    getRecentAlerts,
    addCustomRule,
    removeRule,
    exportData,
    clearAlerts,
    setAlertThreshold
  }
}

/**
 * Hook for monitoring specific metrics with custom rules
 */
export const useMetricMonitoring = (metricName: string, defaultThreshold?: number) => {
  const { addCustomRule, removeRule } = useIntelligentMonitoring()
  const [ruleId, setRuleId] = useState<string | null>(null)

  const createRule = useCallback((threshold: number, condition: 'greater_than' | 'less_than' = 'greater_than') => {
    if (ruleId) {
      removeRule(ruleId)
    }

    const newRuleId = `custom_${metricName}_${Date.now()}`
    const rule: AlertRule = {
      id: newRuleId,
      name: `Custom Alert: ${metricName}`,
      metric: metricName,
      threshold,
      condition,
      timeWindow: 5,
      severity: 'warning',
      enabled: true,
      cooldown: 10
    }

    addCustomRule(rule)
    setRuleId(newRuleId)
  }, [metricName, ruleId, addCustomRule, removeRule])

  const removeCurrentRule = useCallback(() => {
    if (ruleId) {
      removeRule(ruleId)
      setRuleId(null)
    }
  }, [ruleId, removeRule])

  useEffect(() => {
    if (defaultThreshold) {
      createRule(defaultThreshold)
    }

    return () => {
      removeCurrentRule()
    }
  }, []) // Only run on mount/unmount

  return {
    createRule,
    removeCurrentRule,
    hasActiveRule: !!ruleId
  }
}

/**
 * Hook for performance monitoring alerts
 */
export const usePerformanceMonitoring = () => {
  const { addCustomRule } = useIntelligentMonitoring()
  const { trackKPI } = useMetrics()

  useEffect(() => {
    // Add performance-specific rules
    const performanceRules: AlertRule[] = [
      {
        id: 'performance_page_load_critical',
        name: 'Critical Page Load Time',
        metric: 'page.load_time',
        threshold: 5000, // 5 seconds
        condition: 'greater_than',
        timeWindow: 1,
        severity: 'critical',
        enabled: true,
        cooldown: 5
      },
      {
        id: 'performance_memory_warning',
        name: 'High Memory Usage',
        metric: 'browser.memory_usage',
        threshold: 85, // 85%
        condition: 'greater_than',
        timeWindow: 2,
        severity: 'warning',
        enabled: true,
        cooldown: 15
      },
      {
        id: 'performance_api_slow',
        name: 'Slow API Response',
        metric: 'api.response_time',
        threshold: 3000, // 3 seconds
        condition: 'greater_than',
        timeWindow: 3,
        severity: 'warning',
        enabled: true,
        cooldown: 10
      }
    ]

    performanceRules.forEach(rule => addCustomRule(rule))

    trackKPI('performance_monitoring_initialized', performanceRules.length, 'count', {
      rules: performanceRules.map(r => r.id)
    })
  }, [addCustomRule, trackKPI])

  return {
    trackPageLoadTime: (time: number) => {
      intelligentMonitoring.checkMetric('page.load_time', time, {
        page: window.location.pathname,
        timestamp: Date.now()
      })
    },
    
    trackMemoryUsage: (usage: number) => {
      intelligentMonitoring.checkMetric('browser.memory_usage', usage, {
        timestamp: Date.now()
      })
    },
    
    trackApiResponse: (endpoint: string, time: number) => {
      intelligentMonitoring.checkMetric('api.response_time', time, {
        endpoint,
        timestamp: Date.now()
      })
    }
  }
}

/**
 * Hook for business metrics monitoring
 */
export const useBusinessMonitoring = () => {
  const { addCustomRule } = useIntelligentMonitoring()
  const { trackKPI } = useMetrics()

  useEffect(() => {
    // Add business-specific rules
    const businessRules: AlertRule[] = [
      {
        id: 'business_low_conversion',
        name: 'Low Conversion Rate',
        metric: 'business.conversion_rate',
        threshold: 2, // 2%
        condition: 'less_than',
        timeWindow: 30,
        severity: 'warning',
        enabled: true,
        cooldown: 60
      },
      {
        id: 'business_high_bounce',
        name: 'High Bounce Rate',
        metric: 'business.bounce_rate',
        threshold: 90, // 90%
        condition: 'greater_than',
        timeWindow: 60,
        severity: 'info',
        enabled: true,
        cooldown: 120
      },
      {
        id: 'business_low_engagement',
        name: 'Low Engagement Score',
        metric: 'business.engagement_score',
        threshold: 15,
        condition: 'less_than',
        timeWindow: 45,
        severity: 'info',
        enabled: true,
        cooldown: 90
      }
    ]

    businessRules.forEach(rule => addCustomRule(rule))

    trackKPI('business_monitoring_initialized', businessRules.length, 'count', {
      rules: businessRules.map(r => r.id)
    })
  }, [addCustomRule, trackKPI])

  return {
    trackConversionRate: (rate: number) => {
      intelligentMonitoring.checkMetric('business.conversion_rate', rate, {
        timestamp: Date.now()
      })
    },
    
    trackBounceRate: (rate: number) => {
      intelligentMonitoring.checkMetric('business.bounce_rate', rate, {
        timestamp: Date.now()
      })
    },
    
    trackEngagementScore: (score: number) => {
      intelligentMonitoring.checkMetric('business.engagement_score', score, {
        timestamp: Date.now()
      })
    }
  }
}

export default useIntelligentMonitoring
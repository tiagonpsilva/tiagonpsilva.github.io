import { metricsCollector } from './customMetrics'
import { createSpan } from './telemetry'
import { shouldEnableMonitoring, shouldSendAlert, safeAlert } from './monitoringControls'

/**
 * Intelligent monitoring and alerting system
 * Provides proactive monitoring, anomaly detection, and smart alerting
 */

interface AlertRule {
  id: string
  name: string
  metric: string
  threshold: number
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  timeWindow: number // minutes
  severity: 'critical' | 'warning' | 'info'
  enabled: boolean
  cooldown: number // minutes to wait before same alert can fire again
}

interface AlertEvent {
  id: string
  ruleId: string
  ruleName: string
  metric: string
  value: number
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  timestamp: number
  message: string
  context?: Record<string, any>
}

interface PerformanceBaseline {
  metric: string
  average: number
  min: number
  max: number
  standardDeviation: number
  sampleCount: number
  lastUpdated: number
}

interface AnomalyDetection {
  metric: string
  currentValue: number
  expectedValue: number
  deviation: number
  isAnomaly: boolean
  confidence: number
  type: 'spike' | 'drop' | 'trend' | 'normal'
}

class IntelligentMonitoringSystem {
  private alertRules: Map<string, AlertRule> = new Map()
  private alertHistory: AlertEvent[] = []
  private lastAlertTimes: Map<string, number> = new Map()
  private performanceBaselines: Map<string, PerformanceBaseline> = new Map()
  private metricHistory: Map<string, number[]> = new Map()
  private isEnabled: boolean = true

  constructor() {
    // Use centralized monitoring controls
    if (shouldEnableMonitoring()) {
      this.initializeDefaultRules()
      this.startPeriodicMonitoring()
      this.isEnabled = true
    } else {
      this.isEnabled = false
      console.log('🔇 Intelligent monitoring disabled for this environment')
    }
  }

  /**
   * Initialize default monitoring rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        metric: 'error.rate',
        threshold: 5,
        condition: 'greater_than',
        timeWindow: 5,
        severity: 'critical',
        enabled: true,
        cooldown: 15
      },
      {
        id: 'slow_page_load',
        name: 'Slow Page Load Time',
        metric: 'page.load_time',
        threshold: 3000,
        condition: 'greater_than',
        timeWindow: 10,
        severity: 'warning',
        enabled: true,
        cooldown: 10
      },
      {
        id: 'low_engagement',
        name: 'Low User Engagement',
        metric: 'business.engagement_score',
        threshold: 20,
        condition: 'less_than',
        timeWindow: 30,
        severity: 'info',
        enabled: true,
        cooldown: 60
      },
      {
        id: 'high_bounce_rate',
        name: 'High Bounce Rate',
        metric: 'business.bounce_rate',
        threshold: 80,
        condition: 'greater_than',
        timeWindow: 60,
        severity: 'warning',
        enabled: true,
        cooldown: 30
      },
      {
        id: 'api_response_time',
        name: 'Slow API Response',
        metric: 'api.response_time',
        threshold: 2000,
        condition: 'greater_than',
        timeWindow: 5,
        severity: 'warning',
        enabled: true,
        cooldown: 10
      }
    ]

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule)
    })
  }

  /**
   * Add or update an alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule)
    
    // Track rule creation
    const span = createSpan('monitoring.rule_added', {
      'rule.id': rule.id,
      'rule.name': rule.name,
      'rule.severity': rule.severity,
      'rule.enabled': rule.enabled
    })
    span.end()
  }

  /**
   * Remove an alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const removed = this.alertRules.delete(ruleId)
    
    if (removed) {
      const span = createSpan('monitoring.rule_removed', {
        'rule.id': ruleId
      })
      span.end()
    }
    
    return removed
  }

  /**
   * Check metric against all applicable rules
   */
  checkMetric(metric: string, value: number, context?: Record<string, any>): void {
    if (!this.isEnabled) return

    // Prevent infinite loops from recursive metric calls
    if (context && context._recursive) return

    // Store metric value for trend analysis
    this.storeMetricValue(metric, value)

    // Check against alert rules with recursion protection
    for (const rule of this.alertRules.values()) {
      if (rule.enabled && rule.metric === metric) {
        this.evaluateRule(rule, value, { ...context, _recursive: true })
      }
    }

    // Perform anomaly detection with recursion protection
    const anomaly = this.detectAnomaly(metric, value)
    if (anomaly.isAnomaly && anomaly.confidence > 0.7) { // Higher threshold to reduce noise
      this.handleAnomaly(anomaly, { ...context, _recursive: true })
    }

    // Update performance baselines
    this.updateBaseline(metric, value)
  }

  /**
   * Store metric value for historical analysis
   */
  private storeMetricValue(metric: string, value: number): void {
    if (!this.metricHistory.has(metric)) {
      this.metricHistory.set(metric, [])
    }
    
    const history = this.metricHistory.get(metric)!
    history.push(value)
    
    // Keep only last 100 values for performance
    if (history.length > 100) {
      history.shift()
    }
  }

  /**
   * Evaluate a specific rule against a metric value
   */
  private evaluateRule(rule: AlertRule, value: number, context?: Record<string, any>): void {
    const now = Date.now()
    const lastAlert = this.lastAlertTimes.get(rule.id) || 0
    const cooldownMs = rule.cooldown * 60 * 1000

    // Check if cooldown period has passed
    if (now - lastAlert < cooldownMs) {
      return
    }

    let shouldAlert = false
    
    switch (rule.condition) {
      case 'greater_than':
        shouldAlert = value > rule.threshold
        break
      case 'less_than':
        shouldAlert = value < rule.threshold
        break
      case 'equals':
        shouldAlert = value === rule.threshold
        break
      case 'not_equals':
        shouldAlert = value !== rule.threshold
        break
    }

    if (shouldAlert) {
      this.triggerAlert(rule, value, context)
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule, value: number, context?: Record<string, any>): void {
    const alertEvent: AlertEvent = {
      id: `alert_${Date.now()}_${rule.id}`,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      severity: rule.severity,
      timestamp: Date.now(),
      message: this.generateAlertMessage(rule, value),
      context
    }

    this.alertHistory.push(alertEvent)
    this.lastAlertTimes.set(rule.id, Date.now())

    // Send alert to monitoring systems
    this.sendAlert(alertEvent)

    // Track alert in telemetry
    const span = createSpan('monitoring.alert_triggered', {
      'alert.id': alertEvent.id,
      'alert.rule': rule.name,
      'alert.severity': rule.severity,
      'alert.metric': rule.metric,
      'alert.value': value,
      'alert.threshold': rule.threshold
    })
    span.end()

    // Log alert in development
    if (import.meta.env.DEV) {
      console.warn(`🚨 Alert: ${alertEvent.message}`, alertEvent)
    }
  }

  /**
   * Generate human-readable alert message
   */
  private generateAlertMessage(rule: AlertRule, value: number): string {
    const condition = rule.condition.replace('_', ' ')
    return `${rule.name}: ${rule.metric} is ${value} (${condition} ${rule.threshold})`
  }

  /**
   * Send alert to external systems
   */
  private sendAlert(alert: AlertEvent): void {
    // Check if alert should be sent
    if (!shouldSendAlert(alert.ruleId)) {
      return
    }

    try {
      // Send to DataDog as custom event (only if enabled)
      if ((window as any).DD_RUM && shouldEnableMonitoring()) {
        (window as any).DD_RUM.addAction('monitoring_alert', {
          alert_id: alert.id,
          rule_name: alert.ruleName,
          severity: alert.severity,
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          message: alert.message
        })
      }

      // Use safe alert instead of direct console/alert
      safeAlert(alert.message, alert.ruleId)

    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  /**
   * Detect anomalies using statistical analysis
   */
  private detectAnomaly(metric: string, currentValue: number): AnomalyDetection {
    const history = this.metricHistory.get(metric) || []
    
    if (history.length < 10) {
      return {
        metric,
        currentValue,
        expectedValue: currentValue,
        deviation: 0,
        isAnomaly: false,
        confidence: 0,
        type: 'normal'
      }
    }

    const mean = history.reduce((a, b) => a + b, 0) / history.length
    const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length
    const standardDeviation = Math.sqrt(variance)
    
    const deviation = Math.abs(currentValue - mean)
    const zScore = standardDeviation > 0 ? deviation / standardDeviation : 0
    
    const isAnomaly = zScore > 2 // Values more than 2 standard deviations away
    const confidence = Math.min(zScore / 3, 1) // Confidence 0-1 based on z-score
    
    let type: 'spike' | 'drop' | 'trend' | 'normal' = 'normal'
    if (isAnomaly) {
      if (currentValue > mean + (2 * standardDeviation)) {
        type = 'spike'
      } else if (currentValue < mean - (2 * standardDeviation)) {
        type = 'drop'
      } else {
        type = 'trend'
      }
    }

    return {
      metric,
      currentValue,
      expectedValue: mean,
      deviation,
      isAnomaly,
      confidence,
      type
    }
  }

  /**
   * Handle detected anomaly
   */
  private handleAnomaly(anomaly: AnomalyDetection, context?: Record<string, any>): void {
    const alertEvent: AlertEvent = {
      id: `anomaly_${Date.now()}_${anomaly.metric}`,
      ruleId: 'anomaly_detection',
      ruleName: `Anomaly Detected: ${anomaly.metric}`,
      metric: anomaly.metric,
      value: anomaly.currentValue,
      threshold: anomaly.expectedValue,
      severity: anomaly.confidence > 0.8 ? 'warning' : 'info',
      timestamp: Date.now(),
      message: `Anomaly detected in ${anomaly.metric}: ${anomaly.type} (confidence: ${(anomaly.confidence * 100).toFixed(1)}%)`,
      context: { ...context, anomaly }
    }

    this.alertHistory.push(alertEvent)
    this.sendAlert(alertEvent)

    // Track anomaly in telemetry
    const span = createSpan('monitoring.anomaly_detected', {
      'anomaly.metric': anomaly.metric,
      'anomaly.type': anomaly.type,
      'anomaly.confidence': anomaly.confidence,
      'anomaly.current_value': anomaly.currentValue,
      'anomaly.expected_value': anomaly.expectedValue
    })
    span.end()
  }

  /**
   * Update performance baseline for a metric
   */
  private updateBaseline(metric: string, value: number): void {
    const existing = this.performanceBaselines.get(metric)
    const now = Date.now()
    
    if (!existing) {
      this.performanceBaselines.set(metric, {
        metric,
        average: value,
        min: value,
        max: value,
        standardDeviation: 0,
        sampleCount: 1,
        lastUpdated: now
      })
      return
    }

    // Update baseline with exponential moving average
    const alpha = 0.1 // Smoothing factor
    const newAverage = (alpha * value) + ((1 - alpha) * existing.average)
    const newMin = Math.min(existing.min, value)
    const newMax = Math.max(existing.max, value)
    
    // Simple standard deviation calculation
    const variance = Math.pow(value - newAverage, 2)
    const newStdDev = Math.sqrt((existing.standardDeviation * existing.standardDeviation * existing.sampleCount + variance) / (existing.sampleCount + 1))

    this.performanceBaselines.set(metric, {
      metric,
      average: newAverage,
      min: newMin,
      max: newMax,
      standardDeviation: newStdDev,
      sampleCount: existing.sampleCount + 1,
      lastUpdated: now
    })
  }

  /**
   * Start periodic monitoring checks
   */
  private startPeriodicMonitoring(): void {
    // Only run health checks in development and less frequently
    if (import.meta.env.DEV) {
      // Check system health every 2 minutes in development
      setInterval(() => {
        if (this.isEnabled) {
          this.performHealthCheck()
        }
      }, 120000)
    }

    // Clean up old alert history every hour
    setInterval(() => {
      this.cleanupAlertHistory()
    }, 3600000)
  }

  /**
   * Perform overall system health check
   */
  private performHealthCheck(): void {
    const span = createSpan('monitoring.health_check', {
      'health.timestamp': Date.now(),
      'health.enabled': this.isEnabled
    })

    try {
      // Check browser performance
      const memory = (performance as any).memory
      if (memory) {
        this.checkMetric('browser.memory_usage', memory.usedJSHeapSize / memory.totalJSHeapSize * 100)
      }

      // Check connection quality
      const connection = (navigator as any).connection
      if (connection) {
        this.checkMetric('network.connection_speed', connection.downlink || 0)
        this.checkMetric('network.rtt', connection.rtt || 0)
      }

      // Check error rates
      const metrics = metricsCollector.exportMetrics()
      if (metrics.businessMetrics.length > 0) {
        const errorMetrics = metrics.businessMetrics.filter(m => m.category === 'error')
        const errorRate = errorMetrics.length / metrics.businessMetrics.length * 100
        this.checkMetric('error.rate', errorRate)
      }

      span.setAttributes({
        'health.status': 'healthy',
        'health.checks_performed': 'memory,network,errors'
      })

    } catch (error) {
      span.recordException(error as Error)
      console.error('Health check failed:', error)
    } finally {
      span.end()
    }
  }

  /**
   * Clean up old alert history
   */
  private cleanupAlertHistory(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    this.alertHistory = this.alertHistory.filter(alert => alert.timestamp > oneWeekAgo)
  }

  /**
   * Get current monitoring status
   */
  getMonitoringStatus(): {
    enabled: boolean
    totalRules: number
    activeRules: number
    recentAlerts: number
    performanceBaselines: number
  } {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const recentAlerts = this.alertHistory.filter(alert => alert.timestamp > oneHourAgo).length
    
    return {
      enabled: this.isEnabled,
      totalRules: this.alertRules.size,
      activeRules: Array.from(this.alertRules.values()).filter(rule => rule.enabled).length,
      recentAlerts,
      performanceBaselines: this.performanceBaselines.size
    }
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): AlertEvent[] {
    return this.alertHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Get performance baselines
   */
  getPerformanceBaselines(): PerformanceBaseline[] {
    return Array.from(this.performanceBaselines.values())
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    
    const span = createSpan('monitoring.enabled_changed', {
      'monitoring.enabled': enabled
    })
    span.end()
  }

  /**
   * Export monitoring data for analysis
   */
  exportMonitoringData(): {
    rules: AlertRule[]
    alerts: AlertEvent[]
    baselines: PerformanceBaseline[]
    status: any
  } {
    return {
      rules: Array.from(this.alertRules.values()),
      alerts: this.alertHistory,
      baselines: this.getPerformanceBaselines(),
      status: this.getMonitoringStatus()
    }
  }
}

// Global monitoring system instance
export const intelligentMonitoring = new IntelligentMonitoringSystem()

// Integration with metrics collector
const originalRecord = metricsCollector.record.bind(metricsCollector)
metricsCollector.record = function(metric) {
  // Call original record method
  originalRecord(metric)
  
  // Send to monitoring system
  intelligentMonitoring.checkMetric(metric.name, metric.value, metric.tags)
}

export default intelligentMonitoring

// Types export
export type { AlertRule, AlertEvent, PerformanceBaseline, AnomalyDetection }
/**
 * Emergency monitoring controls to prevent popup loops and performance issues
 */

// Global flag to disable all monitoring features in production
export const MONITORING_DISABLED_IN_PRODUCTION = true

// Global flag to disable alert popups completely
export const DISABLE_ALERT_POPUPS = true

// Rate limiting for alerts
const alertRateLimit = new Map<string, number>()
const ALERT_COOLDOWN_MS = 60000 // 1 minute cooldown per alert type

/**
 * Check if an alert should be sent based on rate limiting
 */
export function shouldSendAlert(alertType: string): boolean {
  if (DISABLE_ALERT_POPUPS) {
    return false
  }

  if (MONITORING_DISABLED_IN_PRODUCTION && !import.meta.env.DEV) {
    return false
  }

  const now = Date.now()
  const lastAlert = alertRateLimit.get(alertType) || 0
  
  if (now - lastAlert < ALERT_COOLDOWN_MS) {
    return false
  }

  alertRateLimit.set(alertType, now)
  return true
}

/**
 * Safe alert function that respects global controls
 */
export function safeAlert(message: string, alertType: string = 'general'): void {
  if (!shouldSendAlert(alertType)) {
    // Log instead of showing popup
    if (import.meta.env.DEV) {
      console.warn(`🚨 [ALERT SUPPRESSED] ${alertType}: ${message}`)
    }
    return
  }

  // Only log in development, never use alert() in production
  if (import.meta.env.DEV) {
    console.warn(`🚨 [ALERT] ${alertType}: ${message}`)
  }
}

/**
 * Check if monitoring should be enabled for current environment
 */
export function shouldEnableMonitoring(): boolean {
  if (MONITORING_DISABLED_IN_PRODUCTION && !import.meta.env.DEV) {
    return false
  }
  
  return import.meta.env.DEV
}

/**
 * Clear all rate limiting (for testing)
 */
export function clearAlertRateLimit(): void {
  alertRateLimit.clear()
}

export default {
  MONITORING_DISABLED_IN_PRODUCTION,
  DISABLE_ALERT_POPUPS,
  shouldSendAlert,
  safeAlert,
  shouldEnableMonitoring,
  clearAlertRateLimit
}
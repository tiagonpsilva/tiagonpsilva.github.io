/**
 * User Identification Utilities
 * Captures various user identification data for Mixpanel tracking
 */

interface UserIdentificationData {
  user_id: string
  session_id: string
  device_fingerprint: string
  browser_fingerprint: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referrer: string
  user_agent: string
  timezone: string
  language: string
  screen_resolution: string
  is_returning_user: boolean
  first_visit_date?: string
  last_visit_date?: string
  visit_count: number
  user_type: 'new' | 'returning' | 'unknown'
}

// Generate a unique device fingerprint
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx?.fillText('Fingerprint', 10, 10)
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 'unknown',
    (navigator as any).deviceMemory || 'unknown'
  ].join('|')
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

// Generate or retrieve browser fingerprint
const getBrowserFingerprint = (): string => {
  const stored = localStorage.getItem('browser_fingerprint')
  if (stored) return stored
  
  const fingerprint = generateDeviceFingerprint()
  localStorage.setItem('browser_fingerprint', fingerprint)
  return fingerprint
}

// Generate or retrieve persistent user ID
const getUserId = (): string => {
  const stored = localStorage.getItem('user_id')
  if (stored) return stored
  
  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  localStorage.setItem('user_id', userId)
  return userId
}

// Generate session ID (expires when browser closes)
const getSessionId = (): string => {
  const stored = sessionStorage.getItem('session_id')
  if (stored) return stored
  
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  sessionStorage.setItem('session_id', sessionId)
  return sessionId
}

// Extract UTM parameters from URL
const getUtmParameters = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
    utm_term: urlParams.get('utm_term') || undefined
  }
}

// Track user visits
const updateVisitTracking = () => {
  const now = new Date().toISOString()
  const visitCount = parseInt(localStorage.getItem('visit_count') || '0') + 1
  const firstVisit = localStorage.getItem('first_visit_date')
  
  if (!firstVisit) {
    localStorage.setItem('first_visit_date', now)
  }
  
  localStorage.setItem('last_visit_date', now)
  localStorage.setItem('visit_count', visitCount.toString())
  
  return {
    visit_count: visitCount,
    first_visit_date: firstVisit || now,
    last_visit_date: now,
    is_returning_user: visitCount > 1
  }
}

// Check for existing user data in various sources
const checkExistingUserData = () => {
  const sources = {
    // Google Analytics
    ga_client_id: localStorage.getItem('_ga') || localStorage.getItem('_gid'),
    
    // Facebook Pixel
    fb_user_id: localStorage.getItem('_fbp'),
    
    // LinkedIn Insight Tag
    linkedin_user_id: localStorage.getItem('_li_dcdm_c'),
    
    // Other common tracking cookies
    mixpanel_distinct_id: localStorage.getItem('mp_' + (window.location.hostname).replace(/\./g, '_') + '_mixpanel'),
    
    // Custom user identifiers
    email_hash: localStorage.getItem('user_email_hash'),
    custom_user_id: localStorage.getItem('custom_user_id')
  }
  
  return Object.fromEntries(
    Object.entries(sources).filter(([_, value]) => value !== null)
  )
}

// Get comprehensive user identification data
export const getUserIdentificationData = (): UserIdentificationData => {
  try {
    const visitData = updateVisitTracking()
    const utmParams = getUtmParameters()
    const existingData = checkExistingUserData()
    
    // Safe timezone extraction
    let timezone = 'UTC'
    try {
      const resolvedOptions = Intl.DateTimeFormat().resolvedOptions()
      timezone = typeof resolvedOptions.timeZone === 'string' ? resolvedOptions.timeZone : 'UTC'
    } catch (error) {
      console.warn('Failed to get timezone, using UTC:', error)
    }
    
    // Safe language extraction
    let language = 'en-US'
    try {
      language = typeof navigator.language === 'string' ? navigator.language : 'en-US'
    } catch (error) {
      console.warn('Failed to get language, using en-US:', error)
    }
    
    const identificationData: UserIdentificationData = {
      user_id: getUserId(),
      session_id: getSessionId(),
      device_fingerprint: generateDeviceFingerprint(),
      browser_fingerprint: getBrowserFingerprint(),
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      timezone,
      language,
      screen_resolution: `${screen.width}x${screen.height}`,
      user_type: visitData.is_returning_user ? 'returning' : 'new',
      ...visitData,
      ...utmParams,
      
      // Add existing tracking data if available (with safety check)
      ...Object.fromEntries(
        Object.entries(existingData).map(([key, value]) => [
          key, 
          typeof value === 'object' && value !== null ? JSON.stringify(value) : value
        ])
      )
    }
    
    return identificationData
  } catch (error) {
    console.error('Error in getUserIdentificationData:', error)
    // Return minimal safe data
    return {
      user_id: 'fallback_' + Date.now(),
      session_id: 'fallback_session_' + Date.now(),
      device_fingerprint: 'fallback',
      browser_fingerprint: 'fallback',
      referrer: 'direct',
      user_agent: 'unknown',
      timezone: 'UTC',
      language: 'en-US',
      screen_resolution: '1920x1080',
      is_returning_user: false,
      visit_count: 1,
      user_type: 'unknown'
    }
  }
}

// Store UTM parameters for session attribution
export const storeUtmParameters = () => {
  const utmParams = getUtmParameters()
  
  // Store for the session
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      sessionStorage.setItem(key, value)
    }
  })
  
  // Store first-touch attribution (persist across sessions)
  const firstTouch = localStorage.getItem('first_touch_attribution')
  if (!firstTouch && Object.values(utmParams).some(v => v)) {
    localStorage.setItem('first_touch_attribution', JSON.stringify({
      ...utmParams,
      timestamp: new Date().toISOString()
    }))
  }
}

// Get user preferences from browser
export const getUserPreferences = () => {
  return {
    cookies_enabled: navigator.cookieEnabled,
    do_not_track: navigator.doNotTrack === '1',
    connection_type: (navigator as any).connection?.effectiveType || 'unknown',
    platform: navigator.platform,
    online_status: navigator.onLine,
    touch_support: 'ontouchstart' in window,
    webgl_support: !!document.createElement('canvas').getContext('webgl'),
    local_storage_support: typeof Storage !== 'undefined'
  }
}

// Enhanced user identification for Mixpanel
export const identifyUserForMixpanel = (mixpanelInstance: any) => {
  try {
    const userData = getUserIdentificationData()
    const preferences = getUserPreferences()
    
    // Use the persistent user_id as the distinct_id
    mixpanelInstance.identify(userData.user_id)
    
    // Sanitize all properties to ensure no objects are passed
    const sanitizedUserData = Object.fromEntries(
      Object.entries(userData).map(([key, value]) => [
        key,
        typeof value === 'object' && value !== null 
          ? (Array.isArray(value) ? value.join(',') : JSON.stringify(value))
          : String(value)
      ])
    )
    
    const sanitizedPreferences = Object.fromEntries(
      Object.entries(preferences).map(([key, value]) => [
        key,
        typeof value === 'object' && value !== null 
          ? (Array.isArray(value) ? value.join(',') : JSON.stringify(value))
          : String(value)
      ])
    )
    
    // Set user properties (all guaranteed to be primitive values)
    mixpanelInstance.people.set({
      // Core identification
      $user_id: String(sanitizedUserData.user_id),
      $session_id: String(sanitizedUserData.session_id),
      
      // Device & Browser
      device_fingerprint: String(sanitizedUserData.device_fingerprint),
      browser_fingerprint: String(sanitizedUserData.browser_fingerprint),
      $browser: String(getBrowserInfo()),
      $os: String(getOSInfo()),
      
      // Location & Language (explicit string conversion)
      $timezone: String(sanitizedUserData.timezone),
      $language: String(sanitizedUserData.language),
      screen_resolution: String(sanitizedUserData.screen_resolution),
      
      // Attribution
      $initial_referrer: String(sanitizedUserData.referrer),
      utm_source: sanitizedUserData.utm_source ? String(sanitizedUserData.utm_source) : undefined,
      utm_medium: sanitizedUserData.utm_medium ? String(sanitizedUserData.utm_medium) : undefined,
      utm_campaign: sanitizedUserData.utm_campaign ? String(sanitizedUserData.utm_campaign) : undefined,
      
      // User behavior
      user_type: String(sanitizedUserData.user_type),
      visit_count: Number(sanitizedUserData.visit_count),
      first_visit_date: String(sanitizedUserData.first_visit_date),
      last_visit_date: String(sanitizedUserData.last_visit_date),
      
      // Technical capabilities (sanitized)
      ...sanitizedPreferences,
      
      // Timestamps
      $created: String(sanitizedUserData.first_visit_date),
      last_seen: String(sanitizedUserData.last_visit_date)
    })
    
    console.log('✅ User identified for Mixpanel:', sanitizedUserData.user_id)
    return userData
    
  } catch (error) {
    console.warn('❌ Failed to identify user for Mixpanel:', error)
    return null
  }
}

// Helper functions
const getBrowserInfo = (): string => {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown'
}

const getOSInfo = (): string => {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS')) return 'iOS'
  return 'Unknown'
}

// Clean up old data (call periodically)
export const cleanupOldUserData = () => {
  const maxAge = 90 * 24 * 60 * 60 * 1000 // 90 days
  const now = Date.now()
  
  // Check if last visit is too old
  const lastVisit = localStorage.getItem('last_visit_date')
  if (lastVisit) {
    const lastVisitTime = new Date(lastVisit).getTime()
    if (now - lastVisitTime > maxAge) {
      // Reset user data for inactive users
      localStorage.removeItem('user_id')
      localStorage.removeItem('visit_count')
      localStorage.removeItem('first_visit_date')
      localStorage.removeItem('last_visit_date')
      console.log('🧹 Cleaned up old user data')
    }
  }
}
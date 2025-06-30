import { datadogRum } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs'

interface DataDogConfig {
  enabled: boolean
  environment: 'development' | 'production' | 'test'
  rum: {
    applicationId?: string
    clientToken?: string
    site?: string
    service?: string
    version?: string
  }
  logs: {
    clientToken?: string
    site?: string
    service?: string
  }
  sampling: {
    sessionSampleRate: number
    premiumSampleRate: number
    replaySampleRate: number
  }
  debug: boolean
}

/**
 * Configuração do DataDog por ambiente
 */
export const getDataDogConfig = (): DataDogConfig => {
  const isDev = import.meta.env.DEV
  const mode = import.meta.env.MODE
  
  // Environment variables
  const rumApplicationId = import.meta.env.VITE_DATADOG_RUM_APPLICATION_ID
  const rumClientToken = import.meta.env.VITE_DATADOG_RUM_CLIENT_TOKEN
  const logsClientToken = import.meta.env.VITE_DATADOG_LOGS_CLIENT_TOKEN
  const datadogSite = (import.meta.env.VITE_DATADOG_SITE || 'datadoghq.com') as 'datadoghq.com' | 'datadoghq.eu' | 'us3.datadoghq.com' | 'us5.datadoghq.com' | 'ap1.datadoghq.com' | 'ddog-gov.com'
  const telemetryEnabled = import.meta.env.VITE_TELEMETRY_ENABLED === 'true'
  
  const config: DataDogConfig = {
    enabled: telemetryEnabled && !!(rumApplicationId && rumClientToken),
    environment: isDev ? 'development' : 'production',
    rum: {
      applicationId: rumApplicationId,
      clientToken: rumClientToken,
      site: datadogSite,
      service: 'tiago-portfolio',
      version: '1.0.0'
    },
    logs: {
      clientToken: logsClientToken || rumClientToken,
      site: datadogSite,
      service: 'tiago-portfolio'
    },
    sampling: {
      sessionSampleRate: isDev ? 100 : 10, // 100% dev, 10% prod
      premiumSampleRate: isDev ? 100 : 5,  // 100% dev, 5% prod
      replaySampleRate: isDev ? 20 : 1      // 20% dev, 1% prod
    },
    debug: isDev
  }
  
  // Log configuration
  console.log('📊 DataDog Configuration:', {
    environment: config.environment,
    enabled: config.enabled,
    hasRumToken: !!config.rum.clientToken,
    hasLogsToken: !!config.logs.clientToken,
    site: config.rum.site,
    sampling: config.sampling,
    debug: config.debug,
    mode,
    isDev
  })
  
  return config
}

/**
 * Initialize DataDog RUM with comprehensive monitoring
 */
export const initializeDataDog = (): void => {
  const config = getDataDogConfig()
  
  if (!config.enabled) {
    console.warn('⚠️ DataDog disabled - missing configuration')
    return
  }
  
  try {
    // Initialize RUM (Real User Monitoring)
    datadogRum.init({
      applicationId: config.rum.applicationId!,
      clientToken: config.rum.clientToken!,
      site: config.rum.site as any,
      service: config.rum.service,
      env: config.environment,
      version: config.rum.version,
      
      // Sampling configuration
      sessionSampleRate: config.sampling.sessionSampleRate,
      sessionReplaySampleRate: config.sampling.replaySampleRate,
      
      // Tracking configuration
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
      
      // Performance tracking
      trackViewsManually: false, // Automatic SPA view tracking
      
      // Privacy and security
      allowedTracingUrls: [
        { match: window.location.origin, propagatorTypes: ['datadog'] },
        { match: /^https:\/\/api\./, propagatorTypes: ['datadog'] },
        { match: /^https:\/\/.*\.vercel\.app/, propagatorTypes: ['datadog'] }
      ],
      
      // Development configuration
      silentMultipleInit: true,
      proxy: config.debug ? undefined : 'https://www.datadoghq-browser-agent.com'
    })
    
    // Initialize Logs
    if (config.logs.clientToken) {
      datadogLogs.init({
        clientToken: config.logs.clientToken,
        site: config.logs.site as any,
        service: config.logs.service,
        env: config.environment,
        version: config.rum.version,
        forwardErrorsToLogs: true,
        sessionSampleRate: config.sampling.sessionSampleRate
      })
      
      console.log('📝 DataDog Logs initialized')
    }
    
    // Set user context
    datadogRum.setUser({
      id: 'anonymous', // Will be updated when user authenticates
      type: 'visitor'
    })
    
    // Set global context
    datadogRum.setGlobalContextProperty('portfolio.framework', 'react')
    datadogRum.setGlobalContextProperty('portfolio.platform', 'vercel')
    datadogRum.setGlobalContextProperty('portfolio.version', '1.0.0')
    
    console.log('🎯 DataDog RUM initialized successfully')
    
    // Track initialization
    datadogRum.addAction('portfolio.initialized', {
      environment: config.environment,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Failed to initialize DataDog:', error)
  }
}

/**
 * Update user context when authenticated
 */
export const updateDataDogUser = (user: {
  id: string
  name?: string
  email?: string
  type?: string
}) => {
  try {
    datadogRum.setUser({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type || 'authenticated'
    })
    
    datadogRum.addAction('user.authenticated', {
      user_id: user.id,
      user_type: user.type || 'authenticated'
    })
    
  } catch (error) {
    console.error('❌ Failed to update DataDog user:', error)
  }
}

/**
 * Track custom events
 */
export const trackDataDogEvent = (
  name: string, 
  context?: Record<string, any>,
  type: 'action' | 'error' | 'timing' = 'action'
) => {
  try {
    switch (type) {
      case 'action':
        datadogRum.addAction(name, context)
        break
      case 'error':
        datadogRum.addError(new Error(name), context)
        break
      case 'timing':
        datadogRum.addTiming(name, context?.duration || 0)
        break
    }
  } catch (error) {
    console.error('❌ Failed to track DataDog event:', error)
  }
}

/**
 * Track page views manually (for SPA)
 */
export const trackDataDogPageView = (name: string, context?: Record<string, any>) => {
  try {
    datadogRum.startView(name)
    
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        datadogRum.setGlobalContextProperty(key, value)
      })
    }
    
  } catch (error) {
    console.error('❌ Failed to track page view:', error)
  }
}

/**
 * Log messages to DataDog
 */
export const logToDataDog = (
  message: string,
  level: 'debug' | 'info' | 'warn' | 'error' = 'info',
  context?: Record<string, any>
) => {
  try {
    if (datadogLogs) {
      datadogLogs.logger[level](message, context)
    }
  } catch (error) {
    console.error('❌ Failed to log to DataDog:', error)
  }
}

/**
 * Track business metrics
 */
export const trackBusinessMetric = (metric: string, value: number, tags?: Record<string, string>) => {
  try {
    datadogRum.addAction(`business.${metric}`, {
      value,
      timestamp: new Date().toISOString(),
      ...tags
    })
  } catch (error) {
    console.error('❌ Failed to track business metric:', error)
  }
}
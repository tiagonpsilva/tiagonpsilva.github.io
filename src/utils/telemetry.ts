import { trace } from '@opentelemetry/api'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'

interface TelemetryConfig {
  enabled: boolean
  environment: 'development' | 'production' | 'test'
  debug: boolean
}

/**
 * Configuração do OpenTelemetry por ambiente
 */
export const getTelemetryConfig = (): TelemetryConfig => {
  const isDev = import.meta.env.DEV
  const telemetryEnabled = import.meta.env.VITE_TELEMETRY_ENABLED === 'true'
  const datadogApiKey = import.meta.env.VITE_DATADOG_API_KEY
  
  const config: TelemetryConfig = {
    enabled: telemetryEnabled && !!datadogApiKey,
    environment: isDev ? 'development' : 'production',
    debug: isDev
  }
  
  // Log configuration
  console.log('🔭 Telemetry Configuration:', {
    environment: config.environment,
    enabled: config.enabled,
    hasDatadogKey: !!datadogApiKey,
    debug: config.debug,
    isDev
  })
  
  return config
}

/**
 * Initialize OpenTelemetry with basic web instrumentation
 */
export const initializeTelemetry = (): void => {
  const config = getTelemetryConfig()
  
  if (!config.enabled) {
    console.warn('⚠️ Telemetry disabled - missing configuration')
    return
  }
  
  try {
    // Create basic tracer provider
    const provider = new WebTracerProvider({
      // Basic configuration for web
    })
    
    // Register the provider globally
    provider.register()
    
    // Auto-instrument web APIs
    registerInstrumentations({
      instrumentations: [
        getWebAutoInstrumentations({
          '@opentelemetry/instrumentation-fetch': {
            enabled: true,
            clearTimingResources: true,
            propagateTraceHeaderCorsUrls: [
              /^https:\/\/api\./,
              /^https:\/\/.*\.vercel\.app/,
              window.location.origin
            ]
          },
          '@opentelemetry/instrumentation-xml-http-request': {
            enabled: true,
            clearTimingResources: true
          },
          '@opentelemetry/instrumentation-user-interaction': {
            enabled: true,
            eventNames: ['click', 'submit', 'keydown']
          },
          '@opentelemetry/instrumentation-document-load': {
            enabled: true
          }
        })
      ]
    })
    
    console.log('🎯 OpenTelemetry initialized successfully')
    
    // Create initial trace to test connection
    const tracer = trace.getTracer('portfolio-init', '1.0.0')
    const span = tracer.startSpan('app.initialization')
    span.setAttributes({
      'app.component': 'telemetry',
      'app.environment': config.environment,
      'app.version': '1.0.0'
    })
    span.end()
    
  } catch (error) {
    console.error('❌ Failed to initialize telemetry:', error)
  }
}

/**
 * Utility to create custom spans
 */
export const createSpan = (name: string, attributes?: Record<string, string | number | boolean>) => {
  const tracer = trace.getTracer('portfolio-custom', '1.0.0')
  const span = tracer.startSpan(name)
  
  if (attributes) {
    span.setAttributes(attributes)
  }
  
  return span
}

/**
 * Utility to wrap functions with tracing
 */
export const withTracing = <T extends any[], R>(
  spanName: string,
  fn: (...args: T) => R,
  attributes?: Record<string, string | number | boolean>
) => {
  return (...args: T): R => {
    const span = createSpan(spanName, attributes)
    
    try {
      const result = fn(...args)
      
      // Handle promises
      if (result instanceof Promise) {
        return result
          .then(value => {
            span.setStatus({ code: 1 }) // OK
            span.end()
            return value
          })
          .catch(error => {
            span.setStatus({ code: 2, message: error.message }) // ERROR
            span.recordException(error)
            span.end()
            throw error
          }) as R
      }
      
      span.setStatus({ code: 1 }) // OK
      span.end()
      return result
      
    } catch (error) {
      span.setStatus({ code: 2, message: (error as Error).message }) // ERROR
      span.recordException(error as Error)
      span.end()
      throw error
    }
  }
}

/**
 * Utility to track user interactions
 */
export const trackUserInteraction = (action: string, element?: string, additional?: Record<string, any>) => {
  const span = createSpan('user.interaction', {
    'user.action': action,
    'user.element': element || 'unknown',
    ...additional
  })
  span.end()
}

/**
 * Utility to track page views
 */
export const trackPageView = (pageName: string, path: string) => {
  const span = createSpan('page.view', {
    'page.name': pageName,
    'page.path': path,
    'page.url': window.location.href
  })
  span.end()
}

/**
 * Utility to track API calls
 */
export const trackApiCall = (method: string, url: string, status?: number, duration?: number) => {
  const span = createSpan('api.call', {
    'http.method': method,
    'http.url': url,
    'http.status_code': status || 0,
    'http.duration_ms': duration || 0
  })
  span.end()
}
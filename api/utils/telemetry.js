const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { trace } = require('@opentelemetry/api')

let sdk = null
let isInitialized = false

/**
 * Initialize OpenTelemetry for Vercel serverless functions
 */
function initializeTelemetry() {
  if (isInitialized) {
    return
  }

  try {
    const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
    const datadogApiKey = process.env.DATADOG_API_KEY || process.env.VITE_DATADOG_API_KEY
    const telemetryEnabled = process.env.TELEMETRY_ENABLED === 'true' || process.env.VITE_TELEMETRY_ENABLED === 'true'
    
    if (!telemetryEnabled || !datadogApiKey) {
      console.log('🔭 Telemetry disabled for serverless functions')
      return
    }

    // Create exporter for DataDog
    const exporter = new OTLPTraceExporter({
      url: `https://trace-api.${process.env.DATADOG_SITE || 'datadoghq.com'}/v1/traces`,
      headers: {
        'DD-API-KEY': datadogApiKey,
        'Content-Type': 'application/x-protobuf'
      }
    })

    // Initialize SDK
    sdk = new NodeSDK({
      serviceName: 'tiago-portfolio-api',
      serviceVersion: '1.0.0',
      traceExporter: exporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-http': {
            enabled: true,
            requestHook: (span, request) => {
              span.setAttributes({
                'http.user_agent': request.headers['user-agent'] || 'unknown',
                'http.referer': request.headers['referer'] || 'unknown',
                'serverless.platform': 'vercel',
                'serverless.function': process.env.VERCEL_FUNCTION_NAME || 'unknown'
              })
            }
          },
          '@opentelemetry/instrumentation-fetch': {
            enabled: true
          }
        })
      ]
    })

    sdk.start()
    isInitialized = true

    console.log('🎯 OpenTelemetry initialized for serverless function')

  } catch (error) {
    console.error('❌ Failed to initialize telemetry:', error.message)
  }
}

/**
 * Create a traced function wrapper for API endpoints
 */
function withTracing(functionName, handler) {
  return async (req, res) => {
    // Initialize telemetry if not already done
    if (!isInitialized) {
      initializeTelemetry()
    }

    const tracer = trace.getTracer('portfolio-api', '1.0.0')
    const span = tracer.startSpan(`api.${functionName}`)

    // Add request attributes
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.user_agent': req.headers['user-agent'] || 'unknown',
      'http.referer': req.headers['referer'] || 'unknown',
      'api.function': functionName,
      'api.platform': 'vercel',
      'api.environment': process.env.VERCEL_ENV || 'development'
    })

    const startTime = Date.now()

    try {
      // Execute the actual handler
      const result = await handler(req, res)
      
      const duration = Date.now() - startTime
      
      // Add success attributes
      span.setAttributes({
        'http.status_code': res.statusCode || 200,
        'api.duration_ms': duration,
        'api.success': true
      })
      
      span.setStatus({ code: 1 }) // OK
      
      return result

    } catch (error) {
      const duration = Date.now() - startTime
      
      // Add error attributes
      span.setAttributes({
        'http.status_code': res.statusCode || 500,
        'api.duration_ms': duration,
        'api.success': false,
        'error.name': error.name,
        'error.message': error.message
      })
      
      span.recordException(error)
      span.setStatus({ code: 2, message: error.message }) // ERROR
      
      throw error

    } finally {
      span.end()
    }
  }
}

/**
 * Manually create spans for specific operations
 */
function createSpan(operationName, attributes = {}) {
  const tracer = trace.getTracer('portfolio-api', '1.0.0')
  const span = tracer.startSpan(operationName)
  
  span.setAttributes({
    'api.operation': operationName,
    'api.platform': 'vercel',
    'timestamp': new Date().toISOString(),
    ...attributes
  })
  
  return span
}

/**
 * Track external API calls
 */
function trackExternalApiCall(url, method, statusCode, duration, context = {}) {
  const span = createSpan('external_api_call', {
    'external.url': url,
    'external.method': method,
    'external.status_code': statusCode,
    'external.duration_ms': duration,
    ...context
  })
  
  span.end()
}

/**
 * Track authentication events
 */
function trackAuthEvent(eventType, userId, provider, success, context = {}) {
  const span = createSpan('auth_event', {
    'auth.event_type': eventType,
    'auth.user_id': userId || 'anonymous',
    'auth.provider': provider,
    'auth.success': success,
    ...context
  })
  
  span.end()
}

/**
 * Graceful shutdown for serverless
 */
function shutdown() {
  if (sdk && isInitialized) {
    try {
      sdk.shutdown()
      console.log('🔄 Telemetry shutdown completed')
    } catch (error) {
      console.error('❌ Error during telemetry shutdown:', error.message)
    }
  }
}

module.exports = {
  initializeTelemetry,
  withTracing,
  createSpan,
  trackExternalApiCall,
  trackAuthEvent,
  shutdown
}
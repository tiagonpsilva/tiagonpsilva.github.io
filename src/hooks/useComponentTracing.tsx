import { useEffect, useRef, useCallback } from 'react'
import { useDataDog } from './useDataDog'
import { createSpan, withTracing } from '../utils/telemetry'

interface ComponentTracingOptions {
  componentName: string
  trackMount?: boolean
  trackUnmount?: boolean
  trackRender?: boolean
  trackProps?: boolean
  trackErrors?: boolean
}

/**
 * Hook for comprehensive component-level tracing
 */
export const useComponentTracing = (options: ComponentTracingOptions) => {
  const { trackAction, trackError, trackTiming } = useDataDog()
  const mountTime = useRef<number>(Date.now())
  const renderCount = useRef<number>(0)
  const lastRenderTime = useRef<number>(Date.now())

  const {
    componentName,
    trackMount = true,
    trackUnmount = true,
    trackRender = false,
    trackErrors = true
  } = options

  // Track component mount
  useEffect(() => {
    if (trackMount) {
      const mountSpan = createSpan('component.mount', {
        'component.name': componentName,
        'component.mount_time': mountTime.current,
        'component.type': 'react'
      })

      trackAction('component.mounted', {
        component_name: componentName,
        mount_timestamp: new Date().toISOString()
      })

      mountSpan.end()
    }

    // Track component unmount
    return () => {
      if (trackUnmount) {
        const lifetimeDuration = Date.now() - mountTime.current
        
        const unmountSpan = createSpan('component.unmount', {
          'component.name': componentName,
          'component.lifetime_ms': lifetimeDuration,
          'component.render_count': renderCount.current
        })

        trackAction('component.unmounted', {
          component_name: componentName,
          lifetime_duration_ms: lifetimeDuration,
          total_renders: renderCount.current,
          unmount_timestamp: new Date().toISOString()
        })

        trackTiming('component.lifetime', lifetimeDuration, {
          component_name: componentName,
          render_count: renderCount.current
        })

        unmountSpan.end()
      }
    }
  }, [componentName, trackMount, trackUnmount, trackAction, trackTiming])

  // Track renders
  useEffect(() => {
    if (trackRender) {
      renderCount.current += 1
      const renderTime = Date.now()
      const timeSinceLastRender = renderTime - lastRenderTime.current

      const renderSpan = createSpan('component.render', {
        'component.name': componentName,
        'component.render_count': renderCount.current,
        'component.render_delta_ms': timeSinceLastRender
      })

      trackAction('component.rendered', {
        component_name: componentName,
        render_count: renderCount.current,
        time_since_last_render_ms: timeSinceLastRender,
        render_timestamp: new Date().toISOString()
      })

      lastRenderTime.current = renderTime
      renderSpan.end()
    }
  })

  // Error boundary integration
  const trackComponentError = useCallback((error: Error, errorInfo?: any) => {
    if (trackErrors) {
      const errorSpan = createSpan('component.error', {
        'component.name': componentName,
        'error.message': error.message,
        'error.stack': error.stack?.substring(0, 500) || 'no stack',
        'component.render_count': renderCount.current
      })

      trackError(error, {
        component_name: componentName,
        error_info: errorInfo,
        render_count: renderCount.current,
        error_timestamp: new Date().toISOString()
      })

      errorSpan.recordException(error)
      errorSpan.end()
    }
  }, [componentName, trackErrors, trackError])

  // Wrapper for async operations
  const traceAsyncOperation = useCallback(<T extends any[], R>(
    operationName: string,
    operation: (...args: T) => Promise<R>,
    context?: Record<string, any>
  ) => {
    return withTracing(
      `${componentName}.${operationName}`,
      operation,
      {
        'component.name': componentName,
        'operation.type': 'async',
        ...context
      }
    )
  }, [componentName])

  // Track user interactions within component
  const trackInteraction = useCallback((
    interactionType: string,
    element?: string,
    context?: Record<string, any>
  ) => {
    const interactionSpan = createSpan('component.interaction', {
      'component.name': componentName,
      'interaction.type': interactionType,
      'interaction.element': element || 'unknown',
      'user.agent': navigator.userAgent
    })

    trackAction('component.interaction', {
      component_name: componentName,
      interaction_type: interactionType,
      element: element,
      timestamp: new Date().toISOString(),
      ...context
    })

    interactionSpan.end()
  }, [componentName, trackAction])

  // Track API calls from component
  const trackApiCall = useCallback((
    method: string,
    url: string,
    status?: number,
    duration?: number,
    context?: Record<string, any>
  ) => {
    const apiSpan = createSpan('component.api_call', {
      'component.name': componentName,
      'http.method': method,
      'http.url': url,
      'http.status_code': status || 0,
      'http.duration_ms': duration || 0
    })

    trackAction('component.api_call', {
      component_name: componentName,
      method,
      url,
      status_code: status,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      ...context
    })

    apiSpan.end()
  }, [componentName, trackAction])

  return {
    trackComponentError,
    traceAsyncOperation,
    trackInteraction,
    trackApiCall,
    componentStats: {
      renderCount: renderCount.current,
      mountTime: mountTime.current,
      lifetimeMs: Date.now() - mountTime.current
    }
  }
}

/**
 * Higher-Order Component for automatic component tracing
 */
export const withComponentTracing = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  tracingOptions: ComponentTracingOptions
) => {
  const TracedComponent = (props: P) => {
    const { trackComponentError } = useComponentTracing(tracingOptions)

    // Error boundary functionality
    useEffect(() => {
      const handleError = (error: ErrorEvent) => {
        trackComponentError(new Error(error.message), {
          filename: error.filename,
          lineno: error.lineno,
          colno: error.colno
        })
      }

      window.addEventListener('error', handleError)
      return () => window.removeEventListener('error', handleError)
    }, [trackComponentError])

    return <WrappedComponent {...props} />
  }

  TracedComponent.displayName = `withComponentTracing(${tracingOptions.componentName})`
  return TracedComponent
}
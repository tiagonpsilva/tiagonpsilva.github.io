export enum AuthErrorType {
  POPUP_BLOCKED = 'popup_blocked',
  NETWORK_ERROR = 'network_error',
  THIRD_PARTY_COOKIES = 'third_party_cookies',
  RATE_LIMITED = 'rate_limited',
  INVALID_TOKEN = 'invalid_token',
  INVALID_STATE = 'invalid_state',
  USER_CANCELLED = 'user_cancelled',
  CORS_ERROR = 'cors_error',
  TIMEOUT = 'timeout',
  SERVER_ERROR = 'server_error',
  OAUTH_ERROR = 'oauth_error',
  BROWSER_COMPATIBILITY = 'browser_compatibility',
  UNKNOWN = 'unknown'
}

export interface AuthError {
  type: AuthErrorType
  message: string
  userMessage: string
  suggestedAction: string
  retryable: boolean
  technicalDetails?: string
  timestamp: number
  context?: Record<string, any>
}

export class AuthErrorHandler {
  static handleError(error: any, context?: Record<string, any>): AuthError {
    const timestamp = Date.now()
    
    // Network-related errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: 'Network request failed',
        userMessage: 'Não foi possível conectar com o LinkedIn. Verifique sua conexão.',
        suggestedAction: 'Verifique sua conexão de internet e tente novamente.',
        retryable: true,
        technicalDetails: error.message,
        timestamp,
        context
      }
    }

    // CORS errors
    if (error.message?.includes('CORS') || error.name === 'NetworkError') {
      return {
        type: AuthErrorType.CORS_ERROR,
        message: 'CORS policy violation',
        userMessage: 'Erro de segurança do navegador.',
        suggestedAction: 'Tente atualizar a página ou usar outro navegador.',
        retryable: true,
        technicalDetails: error.message,
        timestamp,
        context
      }
    }

    // Popup blocked
    if (error.message?.includes('popup') || error.message?.includes('blocked')) {
      return {
        type: AuthErrorType.POPUP_BLOCKED,
        message: 'Popup blocked by browser',
        userMessage: 'Seu navegador bloqueou a janela de login do LinkedIn.',
        suggestedAction: 'Permita popups para este site nas configurações do navegador e tente novamente.',
        retryable: true,
        technicalDetails: error.message,
        timestamp,
        context
      }
    }

    // HTTP status code errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            type: AuthErrorType.OAUTH_ERROR,
            message: 'Bad request',
            userMessage: 'Erro na solicitação de autenticação.',
            suggestedAction: 'Tente novamente ou entre em contato com o suporte.',
            retryable: false,
            technicalDetails: `HTTP ${error.status}: ${error.statusText}`,
            timestamp,
            context
          }

        case 401:
          return {
            type: AuthErrorType.INVALID_TOKEN,
            message: 'Unauthorized',
            userMessage: 'Credenciais de autenticação inválidas.',
            suggestedAction: 'Tente fazer login novamente.',
            retryable: true,
            technicalDetails: `HTTP ${error.status}: ${error.statusText}`,
            timestamp,
            context
          }

        case 403:
          return {
            type: AuthErrorType.OAUTH_ERROR,
            message: 'Forbidden',
            userMessage: 'Acesso negado pelo LinkedIn.',
            suggestedAction: 'Verifique se você tem uma conta LinkedIn válida e tente novamente.',
            retryable: false,
            technicalDetails: `HTTP ${error.status}: ${error.statusText}`,
            timestamp,
            context
          }

        case 429:
          return {
            type: AuthErrorType.RATE_LIMITED,
            message: 'Rate limit exceeded',
            userMessage: 'Muitas tentativas de login. Aguarde um momento.',
            suggestedAction: 'Aguarde alguns minutos antes de tentar novamente.',
            retryable: true,
            technicalDetails: `HTTP ${error.status}: Rate limited`,
            timestamp,
            context
          }

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: AuthErrorType.SERVER_ERROR,
            message: 'Server error',
            userMessage: 'Erro temporário nos servidores do LinkedIn.',
            suggestedAction: 'Tente novamente em alguns minutos.',
            retryable: true,
            technicalDetails: `HTTP ${error.status}: ${error.statusText}`,
            timestamp,
            context
          }

        default:
          return {
            type: AuthErrorType.UNKNOWN,
            message: `HTTP ${error.status} error`,
            userMessage: 'Erro inesperado durante a autenticação.',
            suggestedAction: 'Tente novamente ou recarregue a página.',
            retryable: true,
            technicalDetails: `HTTP ${error.status}: ${error.statusText}`,
            timestamp,
            context
          }
      }
    }

    // OAuth-specific errors
    if (error.error) {
      switch (error.error) {
        case 'access_denied':
          return {
            type: AuthErrorType.USER_CANCELLED,
            message: 'User denied access',
            userMessage: 'Você cancelou a autorização do LinkedIn.',
            suggestedAction: 'Para usar recursos personalizados, autorize o acesso ao LinkedIn.',
            retryable: true,
            technicalDetails: `OAuth error: ${error.error}`,
            timestamp,
            context
          }

        case 'invalid_request':
          return {
            type: AuthErrorType.OAUTH_ERROR,
            message: 'Invalid OAuth request',
            userMessage: 'Erro na configuração de autenticação.',
            suggestedAction: 'Tente novamente ou entre em contato com o suporte.',
            retryable: false,
            technicalDetails: `OAuth error: ${error.error}`,
            timestamp,
            context
          }

        case 'invalid_state':
          return {
            type: AuthErrorType.INVALID_STATE,
            message: 'Invalid OAuth state parameter',
            userMessage: 'Erro de segurança na autenticação.',
            suggestedAction: 'Tente fazer login novamente.',
            retryable: true,
            technicalDetails: `OAuth error: ${error.error}`,
            timestamp,
            context
          }

        default:
          return {
            type: AuthErrorType.OAUTH_ERROR,
            message: `OAuth error: ${error.error}`,
            userMessage: 'Erro durante autorização do LinkedIn.',
            suggestedAction: 'Tente novamente ou entre em contato com o suporte.',
            retryable: true,
            technicalDetails: `OAuth error: ${error.error}`,
            timestamp,
            context
          }
      }
    }

    // Timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        type: AuthErrorType.TIMEOUT,
        message: 'Request timeout',
        userMessage: 'A autenticação demorou muito para responder.',
        suggestedAction: 'Verifique sua conexão e tente novamente.',
        retryable: true,
        technicalDetails: error.message,
        timestamp,
        context
      }
    }

    // Third-party cookie errors
    if (error.message?.includes('cookie') || error.message?.includes('SameSite')) {
      return {
        type: AuthErrorType.THIRD_PARTY_COOKIES,
        message: 'Third-party cookies blocked',
        userMessage: 'Seu navegador está bloqueando cookies necessários.',
        suggestedAction: 'Permita cookies de terceiros para este site ou use modo anônimo.',
        retryable: true,
        technicalDetails: error.message,
        timestamp,
        context
      }
    }

    // Browser compatibility errors
    if (error.message?.includes('not supported') || error.name === 'NotSupportedError') {
      return {
        type: AuthErrorType.BROWSER_COMPATIBILITY,
        message: 'Browser compatibility issue',
        userMessage: 'Seu navegador não suporta esta funcionalidade.',
        suggestedAction: 'Atualize seu navegador ou use uma versão mais recente.',
        retryable: false,
        technicalDetails: error.message,
        timestamp,
        context
      }
    }

    // Generic fallback
    return {
      type: AuthErrorType.UNKNOWN,
      message: error.message || 'Unknown error',
      userMessage: 'Ocorreu um erro inesperado durante a autenticação.',
      suggestedAction: 'Tente novamente ou recarregue a página.',
      retryable: true,
      technicalDetails: error.stack || error.toString(),
      timestamp,
      context
    }
  }

  static logError(error: AuthError): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Authentication Error')
      console.error('Type:', error.type)
      console.error('Message:', error.message)
      console.error('User Message:', error.userMessage)
      console.error('Suggested Action:', error.suggestedAction)
      console.error('Retryable:', error.retryable)
      console.error('Technical Details:', error.technicalDetails)
      console.error('Context:', error.context)
      console.error('Timestamp:', new Date(error.timestamp).toISOString())
      console.groupEnd()
    }

    // Track error in analytics
    try {
      // Custom event for monitoring
      const errorEvent = new CustomEvent('auth-error', {
        detail: {
          type: error.type,
          message: error.message,
          userMessage: error.userMessage,
          retryable: error.retryable,
          timestamp: error.timestamp,
          context: error.context
        }
      })
      window.dispatchEvent(errorEvent)

      // Mixpanel tracking (if available)
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.track('Authentication Error', {
          error_type: error.type,
          error_message: error.message,
          user_message: error.userMessage,
          retryable: error.retryable,
          technical_details: error.technicalDetails,
          user_agent: navigator.userAgent,
          page_url: window.location.href,
          timestamp: error.timestamp,
          context: error.context
        })
      }
    } catch (loggingError) {
      console.warn('Failed to log auth error:', loggingError)
    }
  }

  static createUserFriendlyError(type: AuthErrorType, customMessage?: string): AuthError {
    const error = this.handleError({ error: type }, { custom: true })
    
    if (customMessage) {
      error.userMessage = customMessage
    }
    
    return error
  }
}
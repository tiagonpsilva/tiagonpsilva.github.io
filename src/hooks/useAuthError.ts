import { useState, useCallback, useEffect } from 'react'
import { AuthError, AuthErrorHandler, AuthErrorType } from '../utils/AuthErrorHandler'
import { AuthRetryManager, createAuthRetryManager } from '../utils/AuthRetryManager'

interface UseAuthErrorOptions {
  retryType?: 'token' | 'profile' | 'popup' | 'custom'
  autoRetry?: boolean
  maxRetries?: number
  onRetrySuccess?: () => void
  onRetryFailure?: (error: AuthError) => void
  onMaxRetriesReached?: (error: AuthError) => void
}

interface UseAuthErrorReturn {
  error: AuthError | null
  isRetrying: boolean
  retryCount: number
  retryCountdown: number
  setError: (error: any, context?: Record<string, any>) => void
  clearError: () => void
  retry: () => Promise<void>
  canRetry: boolean
  hasRetriesLeft: boolean
  retryManager: AuthRetryManager
}

export const useAuthError = (options: UseAuthErrorOptions = {}): UseAuthErrorReturn => {
  const {
    retryType = 'custom',
    autoRetry = false,
    maxRetries = 3,
    onRetrySuccess,
    onRetryFailure,
    onMaxRetriesReached
  } = options

  const [error, setErrorState] = useState<AuthError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [retryManager] = useState(() => createAuthRetryManager(retryType, {
    maxRetries,
    onRetryAttempt: (attemptNumber) => {
      setRetryCount(attemptNumber)
      setIsRetrying(true)
    },
    onMaxRetriesReached: (authError) => {
      setIsRetrying(false)
      onMaxRetriesReached?.(authError)
    }
  }))

  // Listen for retry events to update countdown
  useEffect(() => {
    const handleRetryAttempt = (event: CustomEvent) => {
      const { delay } = event.detail
      let countdown = Math.ceil(delay / 1000)
      
      setRetryCountdown(countdown)
      
      const timer = setInterval(() => {
        countdown -= 1
        setRetryCountdown(countdown)
        
        if (countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }

    window.addEventListener('auth-retry-attempt', handleRetryAttempt as any)
    return () => {
      window.removeEventListener('auth-retry-attempt', handleRetryAttempt as any)
    }
  }, [])

  const setError = useCallback((errorInput: any, context?: Record<string, any>) => {
    const authError = AuthErrorHandler.handleError(errorInput, context)
    setErrorState(authError)
    setIsRetrying(false)
    setRetryCount(0)
    setRetryCountdown(0)
    
    // Log the error
    AuthErrorHandler.logError(authError)

    // Auto-retry if enabled and error is retryable
    if (autoRetry && authError.retryable && retryManager.isRetryable(authError)) {
      setTimeout(() => {
        retry()
      }, 1000)
    }
  }, [autoRetry, retryManager])

  const clearError = useCallback(() => {
    setErrorState(null)
    setIsRetrying(false)
    setRetryCount(0)
    setRetryCountdown(0)
    retryManager.resetRetries()
  }, [retryManager])

  const retry = useCallback(async () => {
    if (!error || !retryManager.isRetryable(error)) {
      return
    }

    setIsRetrying(true)
    
    try {
      // The actual retry logic should be implemented by the calling component
      // This hook just manages the state
      
      // Simulate retry operation - in real usage, this would be passed as a function
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // If we get here, assume success
      clearError()
      onRetrySuccess?.()
      
    } catch (retryError) {
      const newAuthError = AuthErrorHandler.handleError(retryError, {
        ...error.context,
        isRetry: true,
        previousError: error.type
      })
      
      setErrorState(newAuthError)
      AuthErrorHandler.logError(newAuthError)
      onRetryFailure?.(newAuthError)
    } finally {
      setIsRetrying(false)
    }
  }, [error, retryManager, clearError, onRetrySuccess, onRetryFailure])

  const canRetry = error?.retryable && retryManager.hasRetriesLeft() || false
  const hasRetriesLeft = retryManager.hasRetriesLeft()

  return {
    error,
    isRetrying,
    retryCount,
    retryCountdown,
    setError,
    clearError,
    retry,
    canRetry,
    hasRetriesLeft,
    retryManager
  }
}

// Specialized hooks for different auth operations
export const useTokenExchangeError = (options?: Omit<UseAuthErrorOptions, 'retryType'>) => {
  return useAuthError({ ...options, retryType: 'token' })
}

export const useProfileFetchError = (options?: Omit<UseAuthErrorOptions, 'retryType'>) => {
  return useAuthError({ ...options, retryType: 'profile' })
}

export const usePopupError = (options?: Omit<UseAuthErrorOptions, 'retryType'>) => {
  return useAuthError({ ...options, retryType: 'popup' })
}

// Hook for creating user-friendly error messages
export const useUserFriendlyError = () => {
  const createUserMessage = useCallback((error: AuthError): string => {
    const timeOfDay = new Date().getHours()
    const greeting = timeOfDay < 12 ? 'Bom dia' : timeOfDay < 18 ? 'Boa tarde' : 'Boa noite'
    
    switch (error.type) {
      case AuthErrorType.POPUP_BLOCKED:
        return `${greeting}! Parece que seu navegador bloqueou nossa janela de login. Isso é normal por segurança.`
      
      case AuthErrorType.NETWORK_ERROR:
        return `Ops! Parece que há um problema com sua conexão. Vamos tentar novamente?`
      
      case AuthErrorType.RATE_LIMITED:
        return `Calma aí! Você está tentando fazer login muito rapidamente. Vamos aguardar um pouquinho.`
      
      case AuthErrorType.USER_CANCELLED:
        return `Tudo bem! Você pode tentar fazer login novamente quando quiser.`
      
      case AuthErrorType.THIRD_PARTY_COOKIES:
        return `Seu navegador está sendo extra cuidadoso com cookies. Vamos te ajudar a resolver isso.`
      
      case AuthErrorType.BROWSER_COMPATIBILITY:
        return `Parece que você está usando um navegador mais antigo. Vamos te mostrar como atualizar.`
      
      default:
        return `Oops! Algo não saiu como esperado. Mas não se preocupe, vamos resolver isso juntos.`
    }
  }, [])

  const createActionableAdvice = useCallback((error: AuthError): string[] => {
    switch (error.type) {
      case AuthErrorType.POPUP_BLOCKED:
        return [
          '🔓 Procure o ícone de popup bloqueado na barra de endereços',
          '✅ Clique nele e permita popups para este site',
          '🔄 Tente fazer login novamente'
        ]
      
      case AuthErrorType.NETWORK_ERROR:
        return [
          '📡 Verifique se você está conectado à internet',
          '🔄 Recarregue a página',
          '⏱️ Aguarde alguns segundos e tente novamente'
        ]
      
      case AuthErrorType.THIRD_PARTY_COOKIES:
        return [
          '🍪 Permita cookies de terceiros nas configurações',
          '🔒 Ou tente usar modo anônimo/incógnito',
          '🔄 Recarregue a página após alterar as configurações'
        ]
      
      case AuthErrorType.BROWSER_COMPATIBILITY:
        return [
          '🆙 Atualize seu navegador para a versão mais recente',
          '🌐 Ou use Chrome, Firefox, Safari ou Edge',
          '🔌 Desative extensões que possam interferir'
        ]
      
      default:
        return [
          '🔄 Recarregue a página',
          '⏱️ Aguarde alguns minutos e tente novamente',
          '💬 Entre em contato se o problema persistir'
        ]
    }
  }, [])

  return {
    createUserMessage,
    createActionableAdvice
  }
}
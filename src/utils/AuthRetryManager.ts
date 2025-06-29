import { AuthErrorType, AuthError, AuthErrorHandler } from './AuthErrorHandler'

export interface RetryConfig {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  retryableErrors?: AuthErrorType[]
  onRetryAttempt?: (attemptNumber: number, error: AuthError) => void
  onMaxRetriesReached?: (error: AuthError) => void
}

export class AuthRetryManager {
  private retryAttempts = 0
  private readonly config: Required<RetryConfig>

  constructor(config: RetryConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      baseDelay: config.baseDelay ?? 1000,
      maxDelay: config.maxDelay ?? 10000,
      retryableErrors: config.retryableErrors ?? [
        AuthErrorType.NETWORK_ERROR,
        AuthErrorType.TIMEOUT,
        AuthErrorType.RATE_LIMITED,
        AuthErrorType.SERVER_ERROR,
        AuthErrorType.CORS_ERROR
      ],
      onRetryAttempt: config.onRetryAttempt ?? (() => {}),
      onMaxRetriesReached: config.onMaxRetriesReached ?? (() => {})
    }
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      const result = await operation()
      this.reset() // Reset retry count on success
      return result
    } catch (error) {
      const authError = AuthErrorHandler.handleError(error, {
        ...context,
        retryAttempt: this.retryAttempts,
        maxRetries: this.config.maxRetries
      })

      AuthErrorHandler.logError(authError)

      if (!this.shouldRetry(authError)) {
        if (this.retryAttempts >= this.config.maxRetries) {
          this.config.onMaxRetriesReached(authError)
        }
        throw authError
      }

      return this.retryOperation(operation, authError, context)
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    error: AuthError,
    context?: Record<string, any>
  ): Promise<T> {
    this.retryAttempts++
    
    const delay = this.calculateDelay()
    
    console.log(
      `🔄 Retrying authentication (attempt ${this.retryAttempts}/${this.config.maxRetries}) in ${delay}ms`
    )

    this.config.onRetryAttempt(this.retryAttempts, error)

    // Dispatch retry event for UI feedback
    const retryEvent = new CustomEvent('auth-retry-attempt', {
      detail: {
        attemptNumber: this.retryAttempts,
        maxRetries: this.config.maxRetries,
        delay,
        error: error.type,
        nextRetryIn: delay
      }
    })
    window.dispatchEvent(retryEvent)

    await this.delay(delay)

    return this.executeWithRetry(operation, {
      ...context,
      isRetry: true,
      originalError: error.type
    })
  }

  private shouldRetry(error: AuthError): boolean {
    // Don't retry if max attempts reached
    if (this.retryAttempts >= this.config.maxRetries) {
      return false
    }

    // Check if error type is retryable
    if (!this.config.retryableErrors.includes(error.type)) {
      return false
    }

    // Additional logic for specific error types
    switch (error.type) {
      case AuthErrorType.RATE_LIMITED:
        // For rate limiting, only retry if we haven't exceeded attempts
        return this.retryAttempts < Math.min(this.config.maxRetries, 2)
      
      case AuthErrorType.NETWORK_ERROR:
      case AuthErrorType.TIMEOUT:
        // Network errors are generally retryable
        return true
      
      case AuthErrorType.SERVER_ERROR:
        // Server errors might be temporary
        return this.retryAttempts < Math.min(this.config.maxRetries, 2)
      
      default:
        return error.retryable
    }
  }

  private calculateDelay(): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.config.baseDelay * Math.pow(2, this.retryAttempts - 1)
    
    // Add jitter (±25% randomization)
    const jitterRange = exponentialDelay * 0.25
    const jitter = (Math.random() - 0.5) * jitterRange * 2
    
    const delayWithJitter = exponentialDelay + jitter
    
    // Cap at maximum delay
    return Math.min(delayWithJitter, this.config.maxDelay)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private reset(): void {
    this.retryAttempts = 0
  }

  // Public methods for external control
  public getRetryAttempts(): number {
    return this.retryAttempts
  }

  public getMaxRetries(): number {
    return this.config.maxRetries
  }

  public hasRetriesLeft(): boolean {
    return this.retryAttempts < this.config.maxRetries
  }

  public resetRetries(): void {
    this.reset()
  }

  public isRetryable(error: AuthError): boolean {
    return this.shouldRetry(error)
  }
}

// Specialized retry managers for different auth operations
export class TokenExchangeRetryManager extends AuthRetryManager {
  constructor() {
    super({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      retryableErrors: [
        AuthErrorType.NETWORK_ERROR,
        AuthErrorType.TIMEOUT,
        AuthErrorType.SERVER_ERROR,
        AuthErrorType.RATE_LIMITED
      ]
    })
  }
}

export class ProfileFetchRetryManager extends AuthRetryManager {
  constructor() {
    super({
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 3000,
      retryableErrors: [
        AuthErrorType.NETWORK_ERROR,
        AuthErrorType.TIMEOUT,
        AuthErrorType.SERVER_ERROR
      ]
    })
  }
}

export class PopupRetryManager extends AuthRetryManager {
  constructor() {
    super({
      maxRetries: 1, // Only one retry for popup operations
      baseDelay: 2000,
      maxDelay: 2000,
      retryableErrors: [
        AuthErrorType.POPUP_BLOCKED,
        AuthErrorType.BROWSER_COMPATIBILITY
      ]
    })
  }
}

// Factory function for creating retry managers
export function createAuthRetryManager(
  type: 'token' | 'profile' | 'popup' | 'custom',
  customConfig?: RetryConfig
): AuthRetryManager {
  switch (type) {
    case 'token':
      return new TokenExchangeRetryManager()
    case 'profile':
      return new ProfileFetchRetryManager()
    case 'popup':
      return new PopupRetryManager()
    case 'custom':
      return new AuthRetryManager(customConfig)
    default:
      return new AuthRetryManager()
  }
}
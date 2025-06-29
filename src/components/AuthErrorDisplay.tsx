import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw, X, ExternalLink, HelpCircle, Clock } from 'lucide-react'
import { AuthError, AuthErrorType } from '../utils/AuthErrorHandler'

interface AuthErrorDisplayProps {
  error: AuthError | null
  onRetry?: () => void
  onDismiss?: () => void
  onAlternativeAuth?: () => void
  retryInProgress?: boolean
  retryCountdown?: number
  className?: string
}

const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  onAlternativeAuth,
  retryInProgress = false,
  retryCountdown = 0,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [error])

  if (!error || !isVisible) {
    return null
  }

  const getErrorIcon = () => {
    switch (error.type) {
      case AuthErrorType.POPUP_BLOCKED:
        return <ExternalLink className="text-orange-500 mt-0.5" size={20} />
      case AuthErrorType.NETWORK_ERROR:
      case AuthErrorType.TIMEOUT:
        return <RefreshCw className="text-blue-500 mt-0.5" size={20} />
      case AuthErrorType.RATE_LIMITED:
        return <Clock className="text-yellow-500 mt-0.5" size={20} />
      case AuthErrorType.USER_CANCELLED:
        return <X className="text-gray-500 mt-0.5" size={20} />
      default:
        return <AlertCircle className="text-red-500 mt-0.5" size={20} />
    }
  }

  const getErrorColorScheme = () => {
    switch (error.type) {
      case AuthErrorType.POPUP_BLOCKED:
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-200',
          button: 'text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50'
        }
      case AuthErrorType.NETWORK_ERROR:
      case AuthErrorType.TIMEOUT:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          button: 'text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50'
        }
      case AuthErrorType.USER_CANCELLED:
        return {
          bg: 'bg-gray-50 dark:bg-gray-950/20',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-200',
          button: 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/50'
        }
      case AuthErrorType.RATE_LIMITED:
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          button: 'text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
        }
      default:
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          button: 'text-red-700 dark:text-red-300 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/50'
        }
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case AuthErrorType.POPUP_BLOCKED:
        return 'Popup Bloqueado'
      case AuthErrorType.NETWORK_ERROR:
        return 'Problema de Conexão'
      case AuthErrorType.TIMEOUT:
        return 'Tempo Esgotado'
      case AuthErrorType.RATE_LIMITED:
        return 'Muitas Tentativas'
      case AuthErrorType.USER_CANCELLED:
        return 'Login Cancelado'
      case AuthErrorType.THIRD_PARTY_COOKIES:
        return 'Cookies Bloqueados'
      case AuthErrorType.BROWSER_COMPATIBILITY:
        return 'Navegador Incompatível'
      case AuthErrorType.SERVER_ERROR:
        return 'Erro do Servidor'
      case AuthErrorType.OAUTH_ERROR:
        return 'Erro de Autorização'
      default:
        return 'Problema na Autenticação'
    }
  }

  const getSuggestedSolutions = () => {
    switch (error.type) {
      case AuthErrorType.POPUP_BLOCKED:
        return [
          'Permita popups para este site',
          'Desative bloqueadores de popup temporariamente',
          'Use o botão de login novamente'
        ]
      case AuthErrorType.NETWORK_ERROR:
        return [
          'Verifique sua conexão com a internet',
          'Tente novamente em alguns segundos',
          'Recarregue a página se o problema persistir'
        ]
      case AuthErrorType.THIRD_PARTY_COOKIES:
        return [
          'Permita cookies de terceiros',
          'Desative bloqueadores de tracking',
          'Use modo anônimo/privado'
        ]
      case AuthErrorType.BROWSER_COMPATIBILITY:
        return [
          'Atualize seu navegador',
          'Use Chrome, Firefox ou Safari atualizados',
          'Desative extensões que possam interferir'
        ]
      default:
        return [error.suggestedAction]
    }
  }

  const colorScheme = getErrorColorScheme()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.4 }}
        className={`${colorScheme.bg} ${colorScheme.border} border rounded-xl p-4 shadow-lg backdrop-blur-sm ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          {getErrorIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={`font-semibold ${colorScheme.text} text-sm`}>
                {getErrorTitle()}
              </h4>
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${colorScheme.text} hover:opacity-70 transition-opacity p-1 rounded`}
                  aria-label="Fechar erro"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <p className={`${colorScheme.text} text-sm mb-3 opacity-90`}>
              {error.userMessage}
            </p>

            {/* Solutions */}
            <div className={`${colorScheme.text} text-xs mb-4 opacity-80`}>
              <p className="font-medium mb-1">Soluções:</p>
              <ul className="list-disc list-inside space-y-1">
                {getSuggestedSolutions().map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {error.retryable && onRetry && (
                <button
                  onClick={onRetry}
                  disabled={retryInProgress}
                  className={`
                    inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg
                    transition-colors duration-200 ${colorScheme.button}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {retryInProgress ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      Tentando...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      {retryCountdown > 0 ? `Tentar em ${retryCountdown}s` : 'Tentar Novamente'}
                    </>
                  )}
                </button>
              )}

              {(error.type === AuthErrorType.POPUP_BLOCKED || 
                error.type === AuthErrorType.BROWSER_COMPATIBILITY) && onAlternativeAuth && (
                <button
                  onClick={onAlternativeAuth}
                  className={`
                    inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg
                    transition-colors duration-200 ${colorScheme.button}
                  `}
                >
                  <ExternalLink size={14} />
                  Método Alternativo
                </button>
              )}

              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg
                  transition-colors duration-200 ${colorScheme.button}
                `}
              >
                <HelpCircle size={14} />
                {showDetails ? 'Ocultar' : 'Detalhes'}
              </button>
            </div>

            {/* Technical details (collapsible) */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`${colorScheme.text} text-xs p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10`}>
                    <p className="font-medium mb-2">Detalhes Técnicos:</p>
                    <div className="space-y-1 font-mono">
                      <p><span className="opacity-70">Tipo:</span> {error.type}</p>
                      <p><span className="opacity-70">Timestamp:</span> {new Date(error.timestamp).toLocaleString()}</p>
                      {error.technicalDetails && (
                        <p><span className="opacity-70">Erro:</span> {error.technicalDetails}</p>
                      )}
                      {error.context && (
                        <p><span className="opacity-70">Contexto:</span> {JSON.stringify(error.context, null, 2)}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthErrorDisplay
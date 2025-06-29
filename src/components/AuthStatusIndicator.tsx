import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { storage } from '../utils/storage'

type AuthStatus = 'idle' | 'in_progress' | 'completed' | 'failed' | 'interrupted'

interface AuthStatusIndicatorProps {
  className?: string
}

const AuthStatusIndicator: React.FC<AuthStatusIndicatorProps> = ({ className }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkAuthStatus = () => {
      const authInProgress = storage.getItem('auth_in_progress')
      const navigationDuringAuth = storage.getItem('navigation_during_auth')
      
      if (navigationDuringAuth) {
        setAuthStatus('interrupted')
        setMessage('Autenticação interrompida pela navegação')
        
        // Auto-clear after showing the message
        setTimeout(() => {
          setAuthStatus('idle')
          storage.removeItem('navigation_during_auth')
        }, 3000)
        
      } else if (authInProgress) {
        const authStartTime = parseInt(authInProgress, 10)
        const elapsed = Date.now() - authStartTime
        const maxAuthTime = 5 * 60 * 1000 // 5 minutes
        
        if (elapsed > maxAuthTime) {
          setAuthStatus('failed')
          setMessage('Autenticação expirou')
          
          setTimeout(() => {
            setAuthStatus('idle')
            storage.removeItem('auth_in_progress')
          }, 3000)
          
        } else {
          setAuthStatus('in_progress')
          const remainingTime = Math.ceil((maxAuthTime - elapsed) / 1000)
          setMessage(`Autenticando com LinkedIn... (${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')})`)
        }
      } else {
        setAuthStatus('idle')
        setMessage('')
      }
    }

    // Check immediately
    checkAuthStatus()

    // Check periodically while status is active
    if (authStatus !== 'idle') {
      interval = setInterval(checkAuthStatus, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [authStatus])

  // Listen for auth success/failure events
  useEffect(() => {
    const handleAuthSuccess = () => {
      setAuthStatus('completed')
      setMessage('Autenticação concluída com sucesso!')
      
      setTimeout(() => {
        setAuthStatus('idle')
      }, 2000)
    }

    const handleAuthFailure = () => {
      setAuthStatus('failed')
      setMessage('Falha na autenticação')
      
      setTimeout(() => {
        setAuthStatus('idle')
      }, 3000)
    }

    // Listen for custom events
    window.addEventListener('linkedin-auth-success', handleAuthSuccess)
    window.addEventListener('linkedin-auth-failure', handleAuthFailure)

    return () => {
      window.removeEventListener('linkedin-auth-success', handleAuthSuccess)
      window.removeEventListener('linkedin-auth-failure', handleAuthFailure)
    }
  }, [])

  const getStatusConfig = () => {
    switch (authStatus) {
      case 'in_progress':
        return {
          icon: <Loader className="w-4 h-4 animate-spin" />,
          bgColor: 'bg-blue-100 dark:bg-blue-950/50',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-700 dark:text-blue-300'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-100 dark:bg-green-950/50',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-300'
        }
      case 'failed':
        return {
          icon: <XCircle className="w-4 h-4" />,
          bgColor: 'bg-red-100 dark:bg-red-950/50',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-300'
        }
      case 'interrupted':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-orange-100 dark:bg-orange-950/50',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-700 dark:text-orange-300'
        }
      default:
        return null
    }
  }

  const statusConfig = getStatusConfig()

  if (!statusConfig || authStatus === 'idle') {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`fixed top-4 right-4 z-50 ${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-3 shadow-lg backdrop-blur-sm ${className || ''}`}
        role="status"
        aria-live="polite"
      >
        <div className={`flex items-center gap-2 ${statusConfig.textColor}`}>
          {statusConfig.icon}
          <span className="text-sm font-medium">{message}</span>
        </div>
        
        {authStatus === 'in_progress' && (
          <motion.div
            className="mt-2 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
          >
            <motion.div
              className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        )}
        
        {authStatus === 'failed' && (
          <div className="mt-2">
            <button
              onClick={() => setAuthStatus('idle')}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
            >
              Dispensar
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthStatusIndicator
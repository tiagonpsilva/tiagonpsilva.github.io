import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthErrorDisplay from './AuthErrorDisplay'

const AuthErrorDisplayWrapper: React.FC = () => {
  const { authError, clearAuthError, isRetrying, signInWithLinkedIn } = useAuth()

  const handleRetry = async () => {
    try {
      // Clear the current error before retrying
      clearAuthError()
      
      // Retry the authentication
      await signInWithLinkedIn()
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }

  const handleAlternativeAuth = () => {
    // Clear error and provide alternative methods
    clearAuthError()
    
    // Could open a modal with alternative auth methods
    // For now, just show instructions
    alert('Método alternativo: Entre em contato conosco através do formulário de contato com o link do seu perfil LinkedIn.')
  }

  if (!authError) {
    return null
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto">
      <AuthErrorDisplay
        error={authError}
        onRetry={handleRetry}
        onDismiss={clearAuthError}
        onAlternativeAuth={handleAlternativeAuth}
        retryInProgress={isRetrying}
      />
    </div>
  )
}

export default AuthErrorDisplayWrapper
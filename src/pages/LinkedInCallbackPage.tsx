import React, { useEffect, useState } from 'react'

// LinkedIn OAuth Callback Page - funciona DENTRO do React Router
const LinkedInCallbackPage: React.FC = () => {
  const [status, setStatus] = useState('Processando autenticação...')
  const [isSuccess, setIsSuccess] = useState(false)

  const log = (message: string) => {
    // Keep console logs for debugging but hide from UI
    console.log(`[REACT CALLBACK] ${message}`)
  }

  useEffect(() => {
    const handleCallback = () => {
      log('🔍 Processando callback no React Router...')
      
      // Parse URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')

      log(`📋 Parameters: code=${!!code}, state=${!!state}, error=${error || 'none'}`)

      // Handle errors
      if (error) {
        log(`❌ OAuth error: ${error} - ${errorDescription}`)
        setStatus('Erro na autenticação. Fechando...')
        
        if (window.opener && !window.opener.closed) {
          log('📤 Sending error to parent window')
          try {
            window.opener.postMessage({
              type: 'LINKEDIN_AUTH_ERROR',
              error: error,
              errorDescription: errorDescription
            }, window.location.origin)
            log('✅ Error message sent')
          } catch (e) {
            log(`❌ Failed to send error: ${(e as Error).message}`)
          }
          
          setTimeout(() => {
            log('🔒 Closing popup...')
            window.close()
          }, 3000)
        }
        return
      }

      // Handle missing parameters
      if (!code) {
        log('❌ Authorization code missing')
        setStatus('Dados de autenticação inválidos')
        setTimeout(() => window.close(), 2000)
        return
      }

      if (!state) {
        log('❌ State parameter missing')
        setStatus('Dados de autenticação inválidos')
        setTimeout(() => window.close(), 2000)
        return
      }

      // Success case
      log('✅ All parameters present - processing success')
      setStatus('Autenticação realizada com sucesso!')
      setIsSuccess(true)

      if (window.opener && !window.opener.closed) {
        log('📤 Sending success message to parent window')
        
        try {
          window.opener.postMessage({
            type: 'LINKEDIN_AUTH_CODE',
            code: code,
            state: state
          }, window.location.origin)
          
          log('✅ Success message sent!')
          setStatus('Conectando... Popup será fechado automaticamente.')
          
          setTimeout(() => {
            log('🔒 Closing popup...')
            window.close()
          }, 2000)
          
        } catch (e) {
          log(`❌ Error sending message: ${(e as Error).message}`)
          setStatus('Erro na comunicação. Fechando popup...')
        }
        
      } else {
        log('⚠️ No parent window found - handling as redirect flow')
        setStatus('Processando autenticação...')
        
        // Store OAuth data in sessionStorage for main app to pick up
        try {
          sessionStorage.setItem('linkedin_oauth_result', JSON.stringify({
            code: code,
            state: state,
            timestamp: Date.now()
          }))
          log('💾 OAuth data stored in sessionStorage for main app')
          setStatus('Autenticação concluída! Redirecionando...')
          setIsSuccess(true)
          
          // Redirect to home page where main app will process the data
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
          
        } catch (e) {
          log(`❌ Storage error: ${(e as Error).message}`)
          setStatus('Erro no processamento. Redirecionando...')
          
          // Fallback: redirect to home anyway
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
        }
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* LinkedIn Logo */}
        <div style={{
          width: '60px',
          height: '60px',
          background: '#0077b5',
          borderRadius: '8px',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          color: 'white',
          fontWeight: 'bold'
        }}>
          in
        </div>
        
        {/* Status Icon */}
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          {isSuccess ? '✅' : '🔄'}
        </div>
        
        {/* Status Message */}
        <h2 style={{
          margin: '0 0 10px 0',
          color: '#333',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          LinkedIn
        </h2>
        
        <p style={{
          margin: '0 0 20px 0',
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          {status}
        </p>
        
        {/* Loading indicator */}
        {!isSuccess && (
          <div style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '2px solid #e3e3e3',
            borderRadius: '50%',
            borderTop: '2px solid #0077b5',
            animation: 'spin 1s linear infinite'
          }} />
        )}
      </div>
      
      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LinkedInCallbackPage
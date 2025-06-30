import React, { useEffect, useState } from 'react'

// LinkedIn OAuth Callback Page - funciona DENTRO do React Router
const LinkedInCallbackPage: React.FC = () => {
  const [status, setStatus] = useState('Iniciando processamento...')
  const [logs, setLogs] = useState<string[]>(['🚀 Página de callback React carregada...'])
  const [params, setParams] = useState<any>({})

  const log = (message: string) => {
    console.log(`[REACT CALLBACK] ${message}`)
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
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

      setParams({
        code: code ? `✅ Present (${code.slice(0, 15)}...)` : '❌ Missing',
        state: state ? `✅ Present (${state})` : '❌ Missing',
        error: error || '✅ None',
        errorDescription: errorDescription || '✅ None',
        windowOpener: window.opener ? '✅ Present' : '❌ Missing',
        openerClosed: window.opener ? (window.opener.closed ? '❌ Closed' : '✅ Open') : 'N/A'
      })

      log(`📋 Parameters: code=${!!code}, state=${!!state}, error=${error || 'none'}`)

      // Handle errors
      if (error) {
        log(`❌ OAuth error: ${error} - ${errorDescription}`)
        setStatus(`❌ Erro OAuth: ${errorDescription || error}`)
        
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
        setStatus('❌ Código de autorização ausente')
        setTimeout(() => window.close(), 2000)
        return
      }

      if (!state) {
        log('❌ State parameter missing')
        setStatus('❌ Parâmetro state ausente')
        setTimeout(() => window.close(), 2000)
        return
      }

      // Success case
      log('✅ All parameters present - processing success')
      setStatus('✅ Parâmetros OK - enviando para janela pai...')

      if (window.opener && !window.opener.closed) {
        log('📤 Sending success message to parent window')
        
        try {
          window.opener.postMessage({
            type: 'LINKEDIN_AUTH_CODE',
            code: code,
            state: state
          }, window.location.origin)
          
          log('✅ Success message sent!')
          setStatus('✅ Dados enviados! Fechando popup...')
          
          setTimeout(() => {
            log('🔒 Closing popup...')
            window.close()
          }, 2000)
          
        } catch (e) {
          log(`❌ Error sending message: ${(e as Error).message}`)
          setStatus(`❌ Erro ao enviar: ${(e as Error).message}`)
        }
        
      } else {
        log('⚠️ No parent window found')
        setStatus('⚠️ Janela pai não encontrada')
        
        // Fallback: redirect to home
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      background: '#e6f3ff',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '3px solid #007bff'
      }}>
        <div style={{
          background: '#007bff',
          color: 'white',
          textAlign: 'center',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🔵 CALLBACK REACT ROUTER FUNCIONANDO!
        </div>
        
        <h2>🔍 LinkedIn OAuth - React Router</h2>
        
        <div style={{
          padding: '15px',
          borderRadius: '4px',
          margin: '10px 0',
          background: status.includes('❌') ? '#f8d7da' : status.includes('✅') ? '#d4edda' : '#d1ecf1',
          color: status.includes('❌') ? '#721c24' : status.includes('✅') ? '#155724' : '#0c5460',
          fontWeight: 'bold'
        }}>
          {status}
        </div>
        
        <div style={{
          background: '#fff3cd',
          padding: '15px',
          borderRadius: '4px',
          margin: '15px 0'
        }}>
          <h3>📋 URL Atual:</h3>
          <code>{window.location.href}</code>
        </div>
        
        <div style={{
          background: '#fff3cd',
          padding: '15px',
          borderRadius: '4px',
          margin: '15px 0'
        }}>
          <h3>🔗 Parâmetros OAuth:</h3>
          <ul style={{ margin: 0 }}>
            <li><strong>code:</strong> {params.code}</li>
            <li><strong>state:</strong> {params.state}</li>
            <li><strong>error:</strong> {params.error}</li>
            <li><strong>error_description:</strong> {params.errorDescription}</li>
            <li><strong>window.opener:</strong> {params.windowOpener}</li>
            <li><strong>opener.closed:</strong> {params.openerClosed}</li>
            <li><strong>Component Type:</strong> ✅ React Router Component</li>
          </ul>
        </div>
        
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          padding: '15px',
          margin: '15px 0',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LinkedInCallbackPage
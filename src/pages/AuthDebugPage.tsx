import React from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from '../components/ui/magic-card'
import { useAuth } from '../contexts/AuthContext'

const AuthDebugPage: React.FC = () => {
  const { user, isAuthenticated, signInWithLinkedIn } = useAuth()
  
  const debugInfo = {
    currentUrl: window.location.href,
    origin: window.location.origin,
    hasClientId: !!import.meta.env.VITE_LINKEDIN_CLIENT_ID,
    clientIdPreview: import.meta.env.VITE_LINKEDIN_CLIENT_ID?.substring(0, 8) + '...',
    userAgent: navigator.userAgent,
    isPopupBlocked: false, // Will be updated by test
    redirectUri: `${window.location.origin}/auth/linkedin/callback`
  }

  const testPopup = () => {
    const popup = window.open('about:blank', 'test-popup', 'width=100,height=100')
    if (popup) {
      popup.close()
      debugInfo.isPopupBlocked = false
      alert('✅ Popup funcionando!')
    } else {
      debugInfo.isPopupBlocked = true
      alert('❌ Popup bloqueado!')
    }
  }

  const testBackendEndpoint = async () => {
    try {
      const response = await fetch('/api/auth/linkedin/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'test' })
      })
      
      const data = await response.text()
      alert(`Backend test: ${response.status}\n${data}`)
    } catch (error) {
      alert(`Backend error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8 text-center">🔧 LinkedIn OAuth Debug</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Status */}
            <MagicCard className="p-6">
              <h2 className="text-xl font-bold mb-4">📊 Status Atual</h2>
              <div className="space-y-2 text-sm font-mono">
                <div>✅ Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                <div>👤 User: {user?.name || 'None'}</div>
                <div>📧 Email: {user?.email || 'None'}</div>
              </div>
            </MagicCard>

            {/* Environment */}
            <MagicCard className="p-6">
              <h2 className="text-xl font-bold mb-4">🌍 Environment</h2>
              <div className="space-y-2 text-sm font-mono">
                <div>🌐 Origin: {debugInfo.origin}</div>
                <div>🔑 Has Client ID: {debugInfo.hasClientId ? 'Yes' : 'No'}</div>
                <div>🔑 Client ID: {debugInfo.clientIdPreview}</div>
                <div>📍 Redirect: {debugInfo.redirectUri}</div>
              </div>
            </MagicCard>

            {/* Browser Info */}
            <MagicCard className="p-6">
              <h2 className="text-xl font-bold mb-4">🌐 Browser</h2>
              <div className="space-y-2 text-sm font-mono">
                <div>📱 UA: {debugInfo.userAgent.substring(0, 50)}...</div>
                <div>🚫 Popup Blocked: {debugInfo.isPopupBlocked ? 'Yes' : 'Unknown'}</div>
              </div>
            </MagicCard>

            {/* Actions */}
            <MagicCard className="p-6">
              <h2 className="text-xl font-bold mb-4">🧪 Tests</h2>
              <div className="space-y-3">
                <button 
                  onClick={testPopup}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Popup
                </button>
                <button 
                  onClick={testBackendEndpoint}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Test Backend
                </button>
                <button 
                  onClick={signInWithLinkedIn}
                  className="w-full px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
                >
                  Test LinkedIn OAuth
                </button>
              </div>
            </MagicCard>
          </div>

          {/* Raw Debug Data */}
          <MagicCard className="p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">🔍 Raw Debug Data</h2>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </MagicCard>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthDebugPage
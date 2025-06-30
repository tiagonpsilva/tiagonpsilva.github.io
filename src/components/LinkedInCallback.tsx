import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const LinkedInCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        // Check for OAuth errors first
        if (error) {
          console.error('LinkedIn OAuth error:', error)
          navigate('/', { replace: true })
          return
        }

        // CRITICAL: Validate state parameter for security (CSRF protection)
        const savedState = sessionStorage.getItem('linkedin_oauth_state')
        
        if (!state) {
          console.error('Security error: No state parameter received')
          navigate('/', { replace: true })
          return
        }
        
        if (!savedState) {
          console.error('Security error: No saved state found')
          navigate('/', { replace: true })
          return
        }
        
        if (state !== savedState) {
          console.error('Security error: State parameter mismatch')
          sessionStorage.removeItem('linkedin_oauth_state')
          navigate('/', { replace: true })
          return
        }

        // Validate authorization code
        if (!code) {
          console.error('No authorization code received')
          navigate('/', { replace: true })
          return
        }

        // Environment-specific logging
        if (import.meta.env.DEV) {
          console.log('LinkedIn callback processing:', { 
            codeLength: code.length, 
            stateValid: true 
          })
        }

        // For development: Use mock user data since API endpoints need Vercel environment
        let userData
        
        if (import.meta.env.DEV) {
          console.log('🧪 Using mock user data for development')
          userData = {
            id: 'dev_user_' + Date.now(),
            name: 'Usuário de Desenvolvimento',
            email: 'dev@example.com',
            headline: 'Desenvolvedor LinkedIn Local',
            location: 'Brasil',
            industry: 'Technology',
            publicProfileUrl: 'https://linkedin.com/in/dev-user',
            picture: `https://ui-avatars.com/api/?name=Dev+User&background=0077B5&color=fff&size=200`
          }
        } else {
          // Production: Use real API endpoints
          const tokenResponse = await fetch('/api/auth/linkedin/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
          })

          if (!tokenResponse.ok) {
            console.error('Token exchange failed:', tokenResponse.status)
            navigate('/', { replace: true })
            return
          }

          const { access_token } = await tokenResponse.json()

          // Get user profile with access token
          const profileResponse = await fetch('/api/auth/linkedin/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            }
          })

          if (!profileResponse.ok) {
            console.error('Profile fetch failed:', profileResponse.status)
            navigate('/', { replace: true })
            return
          }

          userData = await profileResponse.json()
        }

        // Send user data to parent window (popup flow)
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'LINKEDIN_AUTH_SUCCESS',
            userData: userData
          }, window.location.origin)
          
          // Clean up state and close popup
          sessionStorage.removeItem('linkedin_oauth_state')
          window.close()
        } else {
          // Mobile/redirect flow: save to localStorage and navigate back
          try {
            localStorage.setItem('linkedin_user', JSON.stringify(userData))
            sessionStorage.removeItem('linkedin_oauth_state')
            
            // Check if we should return to a specific page (mobile flow)
            const returnUrl = sessionStorage.getItem('linkedin_auth_return_url')
            if (returnUrl) {
              sessionStorage.removeItem('linkedin_auth_return_url')
              console.log('📱 Returning to:', returnUrl)
              navigate(returnUrl, { replace: true })
            } else {
              console.log('🏠 Redirecting to home')
              navigate('/', { replace: true })
            }
            
            // Force page reload to trigger auth context update
            setTimeout(() => {
              window.location.reload()
            }, 100)
            
          } catch (error) {
            console.error('Failed to save user data:', error)
            navigate('/', { replace: true })
          }
        }

      } catch (error) {
        console.error('LinkedIn authentication error:', error instanceof Error ? error.message : String(error))
        
        // Clean up state on any error
        try {
          sessionStorage.removeItem('linkedin_oauth_state')
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        
        // Redirect to home on any error
        navigate('/', { replace: true })
      }
    }

    handleLinkedInCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
        />
        <p className="text-muted-foreground">
          Processando autenticação LinkedIn...
        </p>
        {import.meta.env.DEV && (
          <p className="text-xs text-muted-foreground">
            Validando parâmetros OAuth...
          </p>
        )}
      </motion.div>
    </div>
  )
}

export default LinkedInCallback
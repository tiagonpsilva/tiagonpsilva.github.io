import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

const LinkedInCallback: React.FC = () => {
  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        // Check for errors
        if (error) {
          console.error('LinkedIn OAuth error:', error)
          window.close()
          return
        }

        // Verify state to prevent CSRF attacks
        const savedState = sessionStorage.getItem('linkedin_oauth_state')
        if (!state || state !== savedState) {
          console.error('Invalid state parameter')
          window.close()
          return
        }

        if (!code) {
          console.error('No authorization code received')
          window.close()
          return
        }

        // Exchange code for access token
        const tokenResponse = await fetch('/api/auth/linkedin/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        })

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token')
        }

        const { access_token } = await tokenResponse.json()

        // Get user profile information
        const profileResponse = await fetch('/api/auth/linkedin/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          }
        })

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const userData = await profileResponse.json()

        // Save user data and close popup
        localStorage.setItem('linkedin_user', JSON.stringify(userData))
        sessionStorage.removeItem('linkedin_oauth_state')
        
        // Close the popup window
        window.close()

      } catch (error) {
        console.error('LinkedIn authentication error:', error)
        // You might want to show an error message or redirect
        window.close()
      }
    }

    handleLinkedInCallback()
  }, [])

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
      </motion.div>
    </div>
  )
}

export default LinkedInCallback
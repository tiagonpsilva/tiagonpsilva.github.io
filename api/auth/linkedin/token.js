// Vercel API Route for LinkedIn OAuth token exchange
const { withTracing, trackExternalApiCall, trackAuthEvent } = require('../../utils/telemetry')

async function tokenHandler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    // Enhanced logging for debugging
    console.log('🔄 Token exchange request received')
    console.log('🔧 Environment check:', {
      hasClientId: !!process.env.VITE_LINKEDIN_CLIENT_ID || !!process.env.LINKEDIN_CLIENT_ID,
      hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
      origin: req.headers.origin,
      codeLength: code?.length,
      nodeEnv: process.env.NODE_ENV
    })
    
    const clientId = process.env.VITE_LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    
    if (!clientId) {
      console.error('❌ Missing CLIENT_ID')
      return res.status(500).json({ error: 'LinkedIn CLIENT_ID not configured' })
    }
    
    if (!clientSecret) {
      console.error('❌ Missing CLIENT_SECRET')
      return res.status(500).json({ error: 'LinkedIn CLIENT_SECRET not configured' })
    }

    // Exchange authorization code for access token
    const redirectUri = `${req.headers.origin}/oauth/linkedin/callback`
    console.log('🔄 Making request to LinkedIn token endpoint:', {
      clientIdPreview: clientId.substring(0, 8) + '...',
      redirectUri,
      codePreview: code.substring(0, 20) + '...'
    })
    
    const tokenStartTime = Date.now()
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    })
    
    console.log('📡 LinkedIn token response status:', tokenResponse.status)
    const tokenDuration = Date.now() - tokenStartTime

    // Track external API call
    trackExternalApiCall(
      'https://www.linkedin.com/oauth/v2/accessToken',
      'POST',
      tokenResponse.status,
      tokenDuration,
      {
        'oauth.provider': 'linkedin',
        'oauth.step': 'token_exchange'
      }
    )

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ LinkedIn token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      
      // Track auth failure
      trackAuthEvent('token_exchange', 'anonymous', 'linkedin', false, {
        'error.status': tokenResponse.status,
        'error.message': errorText.substring(0, 200)
      })
      
      return res.status(500).json({ 
        error: 'Token exchange failed',
        details: `LinkedIn API returned ${tokenResponse.status}: ${errorText}`,
        status: tokenResponse.status
      })
    }

    const tokenData = await tokenResponse.json()
    
    // Track successful token exchange
    trackAuthEvent('token_exchange', 'anonymous', 'linkedin', true, {
      'token.expires_in': tokenData.expires_in || 'unknown'
    })
    
    // Success logging only in development to prevent TTY issues
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ LinkedIn token exchange successful')
    }
    
    return res.status(200).json({
      access_token: tokenData.access_token
    })

  } catch (error) {
    console.error('❌ Token exchange exception:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Track auth error
    trackAuthEvent('token_exchange', 'anonymous', 'linkedin', false, {
      'error.type': 'exception',
      'error.message': error.message
    })
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message,
      type: 'exception'
    })
  }
}

// Export with tracing wrapper
export default withTracing('linkedin_token_exchange', tokenHandler)
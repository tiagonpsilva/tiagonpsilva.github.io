// Simplified LinkedIn OAuth token exchange without telemetry
async function tokenHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ LinkedIn token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      
      return res.status(500).json({ 
        error: 'Token exchange failed',
        details: `LinkedIn API returned ${tokenResponse.status}: ${errorText}`,
        status: tokenResponse.status
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Token exchange successful')
    
    return res.status(200).json({
      access_token: tokenData.access_token
    })

  } catch (error) {
    console.error('❌ Token exchange exception:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message,
      type: 'exception'
    })
  }
}

export default tokenHandler
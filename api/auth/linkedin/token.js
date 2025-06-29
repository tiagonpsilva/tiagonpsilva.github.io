// Vercel API Route for LinkedIn OAuth token exchange
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    // Log only essential information to avoid TTY issues in serverless environment
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Exchanging LinkedIn code for token...')
      console.log('🔧 Environment check:', {
        hasClientId: !!process.env.VITE_LINKEDIN_CLIENT_ID || !!process.env.LINKEDIN_CLIENT_ID,
        hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
        origin: req.headers.origin
      })
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.VITE_LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: `${req.headers.origin}/auth/linkedin/callback`
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      // Always log errors but avoid excessive console output in production
      console.error('LinkedIn token exchange failed:', tokenResponse.status)
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    
    // Success logging only in development to prevent TTY issues
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ LinkedIn token exchange successful')
    }
    
    return res.status(200).json({
      access_token: tokenData.access_token
    })

  } catch (error) {
    // Log errors without emojis to prevent TTY issues in serverless
    console.error('Token exchange error:', error.message)
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    })
  }
}
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

    console.log('🔄 Exchanging LinkedIn code for token...')

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.VITE_LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : req.headers.origin || 'http://localhost:3000'}/auth/linkedin/callback`
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ LinkedIn token exchange failed:', errorText)
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    
    console.log('✅ LinkedIn token exchange successful')
    
    return res.status(200).json({
      access_token: tokenData.access_token
    })

  } catch (error) {
    console.error('❌ Token exchange error:', error)
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    })
  }
}
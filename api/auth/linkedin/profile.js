// Vercel API Route for LinkedIn profile retrieval
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const accessToken = authHeader.replace('Bearer ', '')

    console.log('🔄 Fetching LinkedIn profile...')

    // Use OpenID Connect userinfo endpoint (works with approved "Sign In with LinkedIn using OpenID Connect" product)
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!userinfoResponse.ok) {
      const errorText = await userinfoResponse.text()
      console.error('❌ LinkedIn userinfo failed:', errorText)
      throw new Error(`Failed to fetch userinfo: ${userinfoResponse.status}`)
    }

    const userinfo = await userinfoResponse.json()
    console.log('✅ LinkedIn profile received:', userinfo)

    // Format user data from OpenID Connect response
    const userData = {
      id: userinfo.sub,
      name: userinfo.name,
      email: userinfo.email,
      headline: userinfo.job_title || userinfo.title,
      location: userinfo.locale,
      picture: userinfo.picture,
      publicProfileUrl: userinfo.profile || `https://linkedin.com/in/${userinfo.sub}`
    }

    console.log('✅ Formatted user data:', userData)

    return res.status(200).json(userData)

  } catch (error) {
    console.error('❌ Profile fetch error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    })
  }
}
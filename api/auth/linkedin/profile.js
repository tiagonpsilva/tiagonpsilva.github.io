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

    // Log only in development to avoid TTY issues in serverless
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching LinkedIn profile...')
    }

    // Use OpenID Connect userinfo endpoint (works with approved "Sign In with LinkedIn using OpenID Connect" product)
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!userinfoResponse.ok) {
      const errorText = await userinfoResponse.text()
      console.error('LinkedIn userinfo failed:', userinfoResponse.status)
      throw new Error(`Failed to fetch userinfo: ${userinfoResponse.status}`)
    }

    const userinfo = await userinfoResponse.json()
    
    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ LinkedIn profile received:', userinfo)
      console.log('🔍 Locale debug:', {
        locale: userinfo.locale,
        localeType: typeof userinfo.locale,
        localeKeys: userinfo.locale && typeof userinfo.locale === 'object' ? Object.keys(userinfo.locale) : 'N/A'
      })
    }

    // Format user data from OpenID Connect response
    const userData = {
      id: userinfo.sub,
      name: userinfo.name,
      email: userinfo.email,
      headline: userinfo.job_title || userinfo.title,
      location: typeof userinfo.locale === 'object' && userinfo.locale 
        ? `${userinfo.locale.country || ''} ${userinfo.locale.language || ''}`.trim()
        : typeof userinfo.locale === 'string' 
        ? userinfo.locale 
        : null,
      picture: userinfo.picture,
      publicProfileUrl: userinfo.profile || `https://linkedin.com/in/${userinfo.sub}`
    }

    // Log formatted data only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Formatted user data:', userData)
    }

    return res.status(200).json(userData)

  } catch (error) {
    // Log errors without emojis to prevent TTY issues
    console.error('Profile fetch error:', error.message)
    return res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    })
  }
}
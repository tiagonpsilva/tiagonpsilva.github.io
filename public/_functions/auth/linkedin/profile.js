// Cloudflare Pages Function for LinkedIn profile retrieval
export async function onRequestGet(context) {
  const { request } = context
  
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Access token required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const accessToken = authHeader.replace('Bearer ', '')

    // Use OpenID Connect userinfo endpoint (simpler and works with approved product)
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!userinfoResponse.ok) {
      const errorText = await userinfoResponse.text()
      throw new Error(`Failed to fetch userinfo: ${errorText}`)
    }

    const userinfo = await userinfoResponse.json()

    // Format user data from OpenID Connect response
    const userData = {
      id: userinfo.sub,
      name: userinfo.name,
      email: userinfo.email,
      headline: userinfo.job_title || userinfo.title,
      location: userinfo.locale,
      picture: userinfo.picture,
      publicProfileUrl: userinfo.profile
    }

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch profile',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
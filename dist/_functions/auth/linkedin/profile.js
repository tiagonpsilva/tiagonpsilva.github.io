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

    // Fetch user profile from LinkedIn API
    const [profileResponse, emailResponse] = await Promise.all([
      fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,headline,location,industry,publicProfileUrl,profilePicture(displayImage~:playableStreams))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
    ])

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile data')
    }

    const profile = await profileResponse.json()
    const emailData = emailResponse.ok ? await emailResponse.json() : null

    // Format user data
    const userData = {
      id: profile.id,
      name: `${profile.firstName?.localized?.en_US || ''} ${profile.lastName?.localized?.en_US || ''}`.trim(),
      email: emailData?.elements?.[0]?.['handle~']?.emailAddress,
      headline: profile.headline?.localized?.en_US,
      location: profile.location?.country?.localized?.en_US,
      industry: profile.industry?.localized?.en_US,
      publicProfileUrl: profile.publicProfileUrl,
      picture: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
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
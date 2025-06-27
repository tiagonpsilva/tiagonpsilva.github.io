import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageTracking } from '../contexts/MixpanelContext'

// Route names mapping
const getPageName = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Home'
    case '/cases':
      return 'Cases'
    case '/labs':
    case '/projects':
      return 'Labs'
    case '/contact':
      return 'Contact'
    case '/blog':
      return 'Blog'
    default:
      if (pathname.startsWith('/blog/')) {
        return 'Blog Article'
      }
      return 'Unknown Page'
  }
}

export const useRouteTracking = () => {
  const location = useLocation()
  const { trackPageView } = usePageTracking()

  useEffect(() => {
    const pageName = getPageName(location.pathname)
    
    // Track page view with additional context
    trackPageView(pageName, {
      pathname: location.pathname,
      search: location.search,
      referrer: document.referrer || 'Direct',
      timestamp: new Date().toISOString()
    })
  }, [location, trackPageView])
}
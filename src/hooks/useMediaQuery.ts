import { useState, useEffect } from 'react'

/**
 * Hook for responsive media queries and device detection
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    window.addEventListener('resize', listener)
    
    return () => window.removeEventListener('resize', listener)
  }, [matches, query])

  return matches
}

/**
 * Hook to detect mobile devices
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      // Check both screen size and user agent
      const hasSmallScreen = window.matchMedia('(max-width: 768px)').matches
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const userAgentMobile = /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      return hasSmallScreen || (hasTouchScreen && userAgentMobile)
    }

    setIsMobile(checkIfMobile())

    const handleResize = () => {
      setIsMobile(checkIfMobile())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

/**
 * Hook to detect if popups are likely to be blocked
 */
export const usePopupSupport = () => {
  const [isPopupSupported, setIsPopupSupported] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Mobile browsers often block popups by default
    if (isMobile) {
      setIsPopupSupported(false)
      return
    }

    // Test if popups are supported/allowed
    const testPopup = () => {
      try {
        const popup = window.open('', 'test', 'width=1,height=1,left=-1000,top=-1000')
        if (popup) {
          popup.close()
          return true
        }
        return false
      } catch (error) {
        return false
      }
    }

    setIsPopupSupported(testPopup())
  }, [isMobile])

  return { isPopupSupported, isMobile }
}

/**
 * Hook for device capabilities detection
 */
export const useDeviceCapabilities = () => {
  const isMobile = useIsMobile()
  const { isPopupSupported } = usePopupSupport()
  const isSmallScreen = useMediaQuery('(max-width: 640px)')
  const isTouchDevice = useMediaQuery('(pointer: coarse)')

  return {
    isMobile,
    isPopupSupported,
    isSmallScreen,
    isTouchDevice,
    isDesktop: !isMobile && isPopupSupported,
    preferRedirect: isMobile || !isPopupSupported
  }
}
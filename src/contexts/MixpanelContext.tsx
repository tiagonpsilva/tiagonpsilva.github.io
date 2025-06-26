import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import mixpanel from 'mixpanel-browser'
import { getMixpanelConfig, shouldTrack, addEnvironmentProperties } from '../utils/mixpanelConfig'
import { 
  getUserIdentificationData, 
  identifyUserForMixpanel, 
  storeUtmParameters,
  cleanupOldUserData 
} from '../utils/userIdentification'

interface MixpanelContextType {
  track: (event: string, properties?: any) => void
  identify: (userId: string) => void
  setUserProperties: (properties: any) => void
  reset: () => void
}

const MixpanelContext = createContext<MixpanelContextType | undefined>(undefined)

export const useMixpanel = () => {
  const context = useContext(MixpanelContext)
  if (!context) {
    throw new Error('useMixpanel must be used within a MixpanelProvider')
  }
  return context
}

interface MixpanelProviderProps {
  children: ReactNode
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({ children }) => {
  useEffect(() => {
    const config = getMixpanelConfig()
    
    if (config.enabled && config.token) {
      // Clean up old user data first
      cleanupOldUserData()
      
      // Store UTM parameters for attribution
      storeUtmParameters()
      
      mixpanel.init(config.token, {
        debug: config.debug,
        track_pageview: config.settings.track_pageview,
        persistence: config.settings.persistence,
        ignore_dnt: config.settings.ignore_dnt,
        property_blacklist: config.settings.property_blacklist,
        loaded: () => {
          console.log(`🎯 Mixpanel initialized successfully (${config.environment})`)
          
          // Get user identification data
          const userData = getUserIdentificationData()
          
          // Set environment and user data as super properties
          mixpanel.register({
            environment: config.environment,
            app_version: '1.0.0',
            user_id: userData.user_id,
            session_id: userData.session_id,
            user_type: userData.user_type,
            browser_fingerprint: userData.browser_fingerprint
          })
          
          // Identify the user with comprehensive data
          identifyUserForMixpanel(mixpanel)
          
          console.log(`👤 User identified: ${userData.user_id} (${userData.user_type})`)
        }
      })
    } else {
      console.warn('⚠️ Mixpanel analytics disabled for this environment')
    }
  }, [])

  const track = (event: string, properties?: any) => {
    if (!shouldTrack()) {
      console.log('📊 [DISABLED] Would track:', event, properties)
      return
    }
    
    // Add environment and common properties
    const enhancedProperties = addEnvironmentProperties({
      page_url: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      ...properties
    })
    
    mixpanel.track(event, enhancedProperties)
    
    const config = getMixpanelConfig()
    if (config.debug) {
      console.log('📊 Tracked event:', event, enhancedProperties)
    }
  }

  const identify = (userId: string) => {
    if (!shouldTrack()) {
      console.log('👤 [DISABLED] Would identify:', userId)
      return
    }
    
    mixpanel.identify(userId)
    
    const config = getMixpanelConfig()
    if (config.debug) {
      console.log('👤 User identified:', userId)
    }
  }

  const setUserProperties = (properties: any) => {
    if (!shouldTrack()) {
      console.log('👤 [DISABLED] Would set user properties:', properties)
      return
    }
    
    const enhancedProperties = addEnvironmentProperties(properties)
    mixpanel.people.set(enhancedProperties)
    
    const config = getMixpanelConfig()
    if (config.debug) {
      console.log('👤 User properties set:', enhancedProperties)
    }
  }

  const reset = () => {
    if (!shouldTrack()) {
      console.log('🔄 [DISABLED] Would reset session')
      return
    }
    
    mixpanel.reset()
    
    const config = getMixpanelConfig()
    if (config.debug) {
      console.log('🔄 Mixpanel session reset')
    }
  }

  const value: MixpanelContextType = {
    track,
    identify,
    setUserProperties,
    reset
  }

  return (
    <MixpanelContext.Provider value={value}>
      {children}
    </MixpanelContext.Provider>
  )
}

// Custom hook for page tracking
export const usePageTracking = () => {
  const { track } = useMixpanel()

  const trackPageView = (pageName: string, additionalProperties?: any) => {
    track('Page Viewed', {
      page_name: pageName,
      ...additionalProperties
    })
  }

  return { trackPageView }
}

// Custom hook for interaction tracking
export const useInteractionTracking = () => {
  const { track } = useMixpanel()

  const trackClick = (elementName: string, location?: string, additionalProperties?: any) => {
    track('Element Clicked', {
      element_name: elementName,
      location,
      ...additionalProperties
    })
  }

  const trackExternalLink = (url: string, linkText?: string) => {
    track('External Link Clicked', {
      destination_url: url,
      link_text: linkText
    })
  }

  const trackDownload = (fileName: string, fileType?: string) => {
    track('File Downloaded', {
      file_name: fileName,
      file_type: fileType
    })
  }

  const trackContact = (method: string, additionalInfo?: any) => {
    track('Contact Initiated', {
      contact_method: method,
      ...additionalInfo
    })
  }

  return {
    trackClick,
    trackExternalLink,
    trackDownload,
    trackContact
  }
}
interface MixpanelConfig {
  token: string | null
  enabled: boolean
  environment: 'development' | 'production' | 'test'
  debug: boolean
  settings: {
    persistence: 'localStorage' | 'cookie'
    track_pageview: boolean
    ignore_dnt: boolean
    property_blacklist: string[]
  }
}

/**
 * Configuração do Mixpanel por ambiente
 * Estratégias disponíveis:
 * 1. Tokens separados (VITE_MIXPANEL_TOKEN_DEV / VITE_MIXPANEL_TOKEN_PROD)
 * 2. Token único com flag de controle (VITE_MIXPANEL_TOKEN + VITE_ANALYTICS_ENABLED)
 * 3. Detecção automática baseada no hostname
 */
export const getMixpanelConfig = (): MixpanelConfig => {
  const isDev = import.meta.env.DEV
  const mode = import.meta.env.MODE
  
  // Strategy 1: Separate tokens for dev/prod
  const devToken = import.meta.env.VITE_MIXPANEL_TOKEN_DEV
  const prodToken = import.meta.env.VITE_MIXPANEL_TOKEN_PROD
  
  // Strategy 2: Single token with enable/disable flag
  const singleToken = import.meta.env.VITE_MIXPANEL_TOKEN
  const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true'
  
  let token: string | null = null
  let enabled = false
  let environment: 'development' | 'production' | 'test' = 'development'
  
  // Determine configuration based on available settings
  if (devToken && prodToken) {
    // Strategy 1: Separate tokens - BOTH environments enabled
    token = isDev ? devToken : prodToken
    enabled = true  // Enable for both dev and prod
    environment = isDev ? 'development' : 'production'
    console.log(`🎯 Mixpanel: Using ${environment} token - Analytics ENABLED`)
  } else if (singleToken) {
    // Strategy 2: Single token with flag
    token = singleToken
    enabled = analyticsEnabled
    environment = isDev ? 'development' : 'production'
    console.log(`🎯 Mixpanel: Single token mode, analytics ${enabled ? 'enabled' : 'disabled'}`)
  } else {
    // Strategy 3: Auto-detection fallback
    // Check for any available token as fallback
    const fallbackToken = singleToken || devToken || prodToken
    token = fallbackToken || null
    enabled = !!fallbackToken
    environment = isDev ? 'development' : 'production'
    console.log(`🎯 Mixpanel: Auto-detection mode, analytics ${enabled ? 'enabled' : 'disabled'} (${environment})`)
    
    if (!enabled) {
      console.warn('⚠️ No Mixpanel token found! Check environment variables:')
      console.warn('- VITE_MIXPANEL_TOKEN_PROD (recommended for production)')
      console.warn('- VITE_MIXPANEL_TOKEN (alternative)')
      console.warn('- VITE_ANALYTICS_ENABLED=true (if using single token)')
    }
  }
  
  // Environment-specific settings
  const config: MixpanelConfig = {
    token,
    enabled,
    environment,
    debug: isDev,
    settings: {
      persistence: isDev ? 'cookie' : 'localStorage',
      track_pageview: true,
      ignore_dnt: false,
      property_blacklist: isDev ? [] : ['$current_url', '$initial_referrer', '$referrer']
    }
  }
  
  // Log configuration (always in production for debugging)
  console.log('🔧 Mixpanel Configuration:', {
    environment: config.environment,
    enabled: config.enabled,
    hasToken: !!config.token,
    tokenPreview: config.token ? config.token.substring(0, 8) + '...' : 'none',
    debug: config.debug,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    mode,
    isDev,
    // Environment variables check (first 8 chars only for security)
    envCheck: {
      VITE_MIXPANEL_TOKEN: singleToken ? singleToken.substring(0, 8) + '...' : 'missing',
      VITE_MIXPANEL_TOKEN_DEV: devToken ? devToken.substring(0, 8) + '...' : 'missing',
      VITE_MIXPANEL_TOKEN_PROD: prodToken ? prodToken.substring(0, 8) + '...' : 'missing',
      VITE_ANALYTICS_ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED || 'missing'
    }
  })
  
  return config
}

/**
 * Verifica se o analytics deve ser executado
 */
export const shouldTrack = (): boolean => {
  const config = getMixpanelConfig()
  return config.enabled && !!config.token
}

/**
 * Adiciona propriedades de ambiente aos eventos
 */
export const addEnvironmentProperties = (properties: any = {}): any => {
  const config = getMixpanelConfig()
  
  return {
    ...properties,
    environment: config.environment,
    app_version: '1.0.0', // Pode vir do package.json
    timestamp: new Date().toISOString(),
    // Adiciona propriedades específicas do ambiente
    ...(config.environment === 'development' && {
      dev_mode: true,
      debug_session: true
    }),
    ...(config.environment === 'production' && {
      production_mode: true
    })
  }
}
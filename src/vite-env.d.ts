/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIXPANEL_TOKEN?: string
  readonly VITE_MIXPANEL_TOKEN_DEV?: string
  readonly VITE_MIXPANEL_TOKEN_PROD?: string
  readonly VITE_ANALYTICS_ENABLED?: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string
  readonly VITE_AUTH0_APP_CLIENT_ID: string
  readonly VITE_AUTH0_AUDIENCE?: string
  readonly VITE_GATEWAY_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

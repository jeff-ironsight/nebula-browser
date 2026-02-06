import './style.css'

import { createAuth0 } from '@auth0/auth0-vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'

import App from './App.vue'

const app = createApp(App)

const { VITE_AUTH0_APP_CLIENT_ID, VITE_AUTH0_AUDIENCE, VITE_AUTH0_DOMAIN } = import.meta.env

app.use(
  createAuth0({
    domain: VITE_AUTH0_DOMAIN,
    clientId: VITE_AUTH0_APP_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: VITE_AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    useRefreshTokens: true,
    cacheLocation: 'localstorage',
  }),
)
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(VueQueryPlugin)

app.mount('#app')

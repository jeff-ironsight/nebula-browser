import './style.css'

import { createAuth0 } from '@auth0/auth0-vue'
import { createPinia } from 'pinia'
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
    },
  }),
)

app.use(createPinia())

app.mount('#app')

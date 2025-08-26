import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify()
const app = createApp(App)

import { useAuthStore } from './modules/auth/store/auth.store'
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(vuetify)

// Sincronizar el store con localStorage al iniciar la app
const authStore = useAuthStore()
const user = JSON.parse(localStorage.getItem('auth_user') || 'null')
const token = localStorage.getItem('auth_token')
if (user) authStore.setUser(user)
if (token) authStore.setToken(token)

app.mount('#app')

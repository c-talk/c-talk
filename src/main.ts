import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'

import '@/styles/main.scss'
import 'uno.css'
import App from './App.vue'

const routes = setupLayouts(generatedRoutes)
const router = createRouter({
  // ...
  history: createWebHistory(),
  routes
})
const pinia = createPinia()
const head = createHead()

const app = createApp(App)
app.use(head)
app.use(router)
app.use(pinia)
app.mount('#app')

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  imports: {
    dirs: ['types']
  },
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
  ],

  css: ['@unocss/reset/tailwind.css'],

  devtools: { enabled: true },

  typescript: {
    strict: true,
    typeCheck: false // Disable during dev
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Poker Pool Pal',
      short_name: 'PokerPoolPal',
      description: '3D Ultra Cool Pool - Local multiplayer poker pool companion',
      theme_color: '#0f766e',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: false // DISABLE PWA IN DEVELOPMENT
    }
  },

  app: {
    head: {
      title: 'Poker Pool Pal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '3D Ultra Cool Pool' },
        { name: 'theme-color', content: '#0f766e' }
      ]
    }
  }
})

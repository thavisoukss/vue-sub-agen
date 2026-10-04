export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001',
    },
  },

  compatibilityDate: '2026-06-30',
})

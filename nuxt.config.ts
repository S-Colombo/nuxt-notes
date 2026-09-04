// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/icon',
    '@nuxt/test-utils/module',
    'nuxt-icons',
  ],

  css: ['~/assets/styles/main.scss'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
})
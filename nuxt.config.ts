// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Módulos: Tailwind para estilização e Pinia para state management.
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  // CSS global (Tailwind diretivas + estilos base do app).
  css: ['~/assets/css/main.css'],

  // Componentes auto-importados sem o prefixo do diretório.
  // (com prefixo, `components/forms/ReleaseForm.vue` viraria `<FormsReleaseForm>`.)
  components: [{ path: '~/components', pathPrefix: false }],

  // Variáveis privadas (servidor) e públicas (cliente).
  // MONGODB_URI deve ser definida em .env na raiz do projeto.
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/release-notes',
    public: {
      appName: 'Release & Issue Tracker'
    }
  },

  app: {
    head: {
      title: 'Release & Issue Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})

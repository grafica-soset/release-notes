import { createPersistedState } from 'pinia-plugin-persistedstate'

/**
 * Registra o plugin de persistência do Pinia apenas no client.
 * Habilita `persist: true` nas stores que precisarem.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as any
  pinia.use(createPersistedState({
    storage: localStorage
  }))
})

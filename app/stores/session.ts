import { defineStore } from 'pinia'
import type { UserRole } from '~/types'

/**
 * Sessão simples (sem auth real) — guarda nome e papel (ADMIN / CLIENT).
 * Persistida no localStorage para sobreviver a reloads.
 */
export const useSessionStore = defineStore('session', {
  state: () => ({
    name: '' as string,
    role: 'CLIENT' as UserRole
  }),
  getters: {
    isLogged: (s) => s.name.trim().length > 0,
    isAdmin: (s) => s.role === 'ADMIN'
  },
  actions: {
    login(name: string, role: UserRole) {
      this.name = name.trim()
      this.role = role
    },
    logout() {
      this.name = ''
      this.role = 'CLIENT'
    }
  },
  persist: true
})

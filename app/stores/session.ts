import { defineStore } from 'pinia'
import type { User, UserRole } from '~/types'

/**
 * Sessão simples (sem auth real): grava login + nome + role após o usuário
 * digitar o login. A role vem do cadastro no backend — não é mais escolhida
 * pelo próprio usuário. Persistida em localStorage para sobreviver a reloads.
 */
export const useSessionStore = defineStore('session', {
  state: () => ({
    userId: '' as string,
    name: '' as string,
    login: '' as string,
    role: 'CLIENT' as UserRole
  }),
  getters: {
    isLogged: (s) => s.login.trim().length > 0,
    isAdmin: (s) => s.role === 'ADMIN' && s.login.trim().length > 0
  },
  actions: {
    setUser(user: User) {
      this.userId = user._id
      this.name = user.name
      this.login = user.login
      this.role = user.role
    },
    /**
     * Busca o usuário pelo login no backend e popula a sessão.
     * Lança erro com mensagem amigável se não encontrar.
     */
    async loginByLogin(login: string) {
      const value = login.trim().toLowerCase()
      if (!value) throw new Error('Informe um login.')
      const result = await $fetch<User[]>('/api/users', { params: { login: value } })
      const user = result[0]
      if (!user) throw new Error('Login não cadastrado.')
      this.setUser(user)
      return user
    },
    logout() {
      this.userId = ''
      this.name = ''
      this.login = ''
      this.role = 'CLIENT'
    }
  },
  persist: true
})

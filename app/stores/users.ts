import { defineStore } from 'pinia'
import type { User, UserRole } from '~/types'

interface State {
  users: User[]
  loading: boolean
  error: string | null
}

export const useUsersStore = defineStore('users', {
  state: (): State => ({
    users: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        this.users = await $fetch<User[]>('/api/users')
      } catch (e: any) {
        this.error = e?.statusMessage || e?.data?.message || 'Erro ao carregar usuários.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: { name: string; login: string; role: UserRole }) {
      const created = await $fetch<User>('/api/users', { method: 'POST', body: payload })
      this.users.unshift(created)
      return created
    },

    async update(id: string, payload: { name?: string; login?: string; role?: UserRole }) {
      const updated = await $fetch<User>(`/api/users/${id}`, { method: 'PUT', body: payload })
      const idx = this.users.findIndex((u) => u._id === id)
      if (idx >= 0) this.users[idx] = updated
      return updated
    },

    async remove(id: string) {
      await $fetch(`/api/users/${id}`, { method: 'DELETE' })
      this.users = this.users.filter((u) => u._id !== id)
    }
  }
})

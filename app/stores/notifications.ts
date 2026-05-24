import { defineStore } from 'pinia'
import type { CommentNotification } from '~/types'

interface State {
  items: CommentNotification[]
  loading: boolean
  loaded: boolean
  error: string | null
}

/**
 * Fila de notificações do admin: comentários de clientes ainda não tratados.
 * Compartilhada entre o sino do header e a página /notifications.
 */
export const useNotificationsStore = defineStore('notifications', {
  state: (): State => ({
    items: [],
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    count: (s) => s.items.length
  },

  actions: {
    async fetch() {
      this.loading = true
      this.error = null
      try {
        this.items = await $fetch<CommentNotification[]>('/api/comments/notifications')
        this.loaded = true
      } catch (e: any) {
        this.error = e?.statusMessage || e?.data?.message || 'Erro ao carregar notificações.'
      } finally {
        this.loading = false
      }
    },

    /** Arquiva (trata) a notificação e a remove da fila localmente. */
    async archive(id: string) {
      await $fetch(`/api/comments/${id}/archive`, { method: 'POST' })
      this.items = this.items.filter((c) => c._id !== id)
    },

    async archiveAll() {
      const ids = this.items.map((c) => c._id)
      await Promise.all(
        ids.map((id) => $fetch(`/api/comments/${id}/archive`, { method: 'POST' }))
      )
      this.items = []
    }
  }
})

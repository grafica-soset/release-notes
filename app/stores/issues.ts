import { defineStore } from 'pinia'
import type { Issue, IssueStatus } from '~/types'

interface State {
  issues: Issue[]
  loading: boolean
  error: string | null
}

/**
 * Store de gerenciamento das Issues (criação, listagem e mudança de status).
 */
export const useIssuesStore = defineStore('issues', {
  state: (): State => ({
    issues: [],
    loading: false,
    error: null
  }),

  getters: {
    byStatus: (s) => (status: IssueStatus) => s.issues.filter((i) => i.status === status)
  },

  actions: {
    async fetchAll(params: { status?: IssueStatus; releaseId?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        this.issues = await $fetch<Issue[]>('/api/issues', { params })
      } catch (e: any) {
        this.error = e?.statusMessage || 'Erro ao carregar issues.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: {
      title: string
      description?: string
      status?: IssueStatus
      releaseId?: string | null
      commentId?: string | null
    }) {
      const created = await $fetch<Issue>('/api/issues', {
        method: 'POST',
        body: payload
      })
      this.issues.unshift(created)
      return created
    },

    async updateStatus(id: string, status: IssueStatus) {
      const updated = await $fetch<Issue>(`/api/issues/${id}`, {
        method: 'PATCH',
        body: { status }
      })
      const idx = this.issues.findIndex((i) => i._id === id)
      if (idx >= 0) this.issues[idx] = updated
      return updated
    },

    async remove(id: string) {
      await $fetch(`/api/issues/${id}`, { method: 'DELETE' })
      this.issues = this.issues.filter((i) => i._id !== id)
    }
  }
})

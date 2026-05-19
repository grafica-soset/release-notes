import { defineStore } from 'pinia'
import type { Issue, IssueEventType, IssueStatus } from '~/types'

interface State {
  issues: Issue[]
  archivedIssues: Issue[]
  archivedLoaded: boolean
  loading: boolean
  error: string | null
}

/**
 * Store de gerenciamento das Issues (criação, listagem e edição).
 */
export const useIssuesStore = defineStore('issues', {
  state: (): State => ({
    issues: [],
    archivedIssues: [],
    archivedLoaded: false,
    loading: false,
    error: null
  }),

  getters: {
    byStatus: (s) => (status: IssueStatus) => s.issues.filter((i) => i.status === status),
    byId: (s) => (id: string) => s.issues.find((i) => i._id === id) || null
  },

  actions: {
    async fetchAll(params: { status?: IssueStatus; releaseId?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        // API retorna apenas issues ativas (não arquivadas) por padrão.
        this.issues = await $fetch<Issue[]>('/api/issues', { params })
      } catch (e: any) {
        this.error = e?.statusMessage || e?.data?.message || 'Erro ao carregar issues.'
      } finally {
        this.loading = false
      }
    },

    async fetchArchived() {
      this.archivedIssues = await $fetch<Issue[]>('/api/issues', {
        params: { archived: 'true' }
      })
      this.archivedLoaded = true
    },

    async create(payload: {
      title: string
      description?: string
      prUrl?: string
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

    /** Atualização parcial — usada tanto por troca de status quanto edição completa. */
    async update(
      id: string,
      payload: {
        title?: string
        description?: string
        prUrl?: string
        status?: IssueStatus
        releaseId?: string | null
      }
    ) {
      const updated = await $fetch<Issue>(`/api/issues/${id}`, {
        method: 'PATCH',
        body: payload
      })
      const idx = this.issues.findIndex((i) => i._id === id)
      if (idx >= 0) this.issues[idx] = updated
      return updated
    },

    /** Atalho usado pela board (drag-like select). */
    updateStatus(id: string, status: IssueStatus) {
      return this.update(id, { status })
    },

    /**
     * Arquiva uma issue. `type` distingue aprovação do cliente (`APPROVED`)
     * de arquivamento manual do admin (`ARCHIVED`). O usuário responsável é
     * enviado no body (sem auth real — ver CLAUDE.md).
     */
    async archive(
      id: string,
      type: IssueEventType,
      actor: { userId?: string; userName?: string; userLogin?: string } = {}
    ) {
      const updated = await $fetch<Issue>(`/api/issues/${id}/archive`, {
        method: 'POST',
        body: { type, ...actor }
      })
      // Sai da board ativa e entra na lista de arquivadas (se já carregada).
      this.issues = this.issues.filter((i) => i._id !== id)
      if (this.archivedLoaded) {
        const idx = this.archivedIssues.findIndex((i) => i._id === id)
        if (idx >= 0) this.archivedIssues[idx] = updated
        else this.archivedIssues.unshift(updated)
      }
      return updated
    },

    async remove(id: string) {
      await $fetch(`/api/issues/${id}`, { method: 'DELETE' })
      this.issues = this.issues.filter((i) => i._id !== id)
      this.archivedIssues = this.archivedIssues.filter((i) => i._id !== id)
    }
  }
})

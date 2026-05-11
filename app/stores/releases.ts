import { defineStore } from 'pinia'
import type { Release, ReleaseDetail } from '~/types'

interface State {
  releases: Release[]
  current: ReleaseDetail | null
  loading: boolean
  error: string | null
}

/**
 * Store responsável por listar releases e gerenciar o detalhe (release atual
 * com issues populadas). A timeline de comentários é gerenciada pelo
 * componente `CommentTimeline`.
 */
export const useReleasesStore = defineStore('releases', {
  state: (): State => ({
    releases: [],
    current: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        this.releases = await $fetch<Release[]>('/api/releases')
      } catch (e: any) {
        this.error = e?.statusMessage || e?.data?.message || 'Erro ao carregar releases.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: {
      version: string
      description?: string
      prUrl?: string
      issueIds?: string[]
    }) {
      const created = await $fetch<Release>('/api/releases', {
        method: 'POST',
        body: payload
      })
      this.releases.unshift(created)
      return created
    },

    async update(
      id: string,
      payload: {
        version?: string
        description?: string
        prUrl?: string
        issueIds?: string[]
      }
    ) {
      const updated = await $fetch<Release>(`/api/releases/${id}`, {
        method: 'PUT',
        body: payload
      })
      const idx = this.releases.findIndex((r) => r._id === id)
      if (idx >= 0) this.releases[idx] = updated
      if (this.current?._id === id) {
        await this.fetchOne(id)
      }
      return updated
    },

    async fetchOne(id: string) {
      this.loading = true
      this.error = null
      try {
        this.current = await $fetch<ReleaseDetail>(`/api/releases/${id}`)
      } catch (e: any) {
        this.error = e?.statusMessage || e?.data?.message || 'Erro ao carregar release.'
      } finally {
        this.loading = false
      }
    }
  }
})

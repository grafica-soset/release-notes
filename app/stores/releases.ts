import { defineStore } from 'pinia'
import type { Release, Comment } from '~/types'

interface State {
  releases: Release[]
  current: Release | null
  comments: Comment[]
  loading: boolean
  error: string | null
}

/**
 * Store responsável por listar releases e gerenciar a tela de detalhe
 * (release atual + comentários).
 */
export const useReleasesStore = defineStore('releases', {
  state: (): State => ({
    releases: [],
    current: null,
    comments: [],
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
        this.error = e?.statusMessage || 'Erro ao carregar releases.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: { version: string; description?: string; prUrl?: string }) {
      const created = await $fetch<Release>('/api/releases', {
        method: 'POST',
        body: payload
      })
      this.releases.unshift(created)
      return created
    },

    async fetchOne(id: string) {
      this.loading = true
      this.error = null
      try {
        const [release, comments] = await Promise.all([
          $fetch<Release>(`/api/releases/${id}`),
          $fetch<Comment[]>('/api/comments', { params: { releaseId: id } })
        ])
        this.current = release
        this.comments = comments
      } catch (e: any) {
        this.error = e?.statusMessage || 'Erro ao carregar release.'
      } finally {
        this.loading = false
      }
    },

    async addComment(payload: { releaseId: string; authorName: string; content: string }) {
      const created = await $fetch<Comment>('/api/comments', {
        method: 'POST',
        body: payload
      })
      this.comments.push(created)
      return created
    },

    async removeComment(id: string) {
      await $fetch(`/api/comments/${id}`, { method: 'DELETE' })
      this.comments = this.comments.filter((c) => c._id !== id)
    }
  }
})

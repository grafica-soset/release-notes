/**
 * Tipos compartilhados pelo frontend.
 * Mantemos espelho dos schemas do Mongoose com `_id` como string
 * (após a serialização JSON / .lean()).
 */
export interface Release {
  _id: string
  version: string
  description: string
  prUrl: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  releaseId: string
  authorName: string
  content: string
  createdAt: string
  updatedAt: string
}

export type IssueStatus = 'BACKLOG' | 'IN_PROGRESS' | 'CLOSED'

export interface Issue {
  _id: string
  releaseId: string | null
  commentId: string | null
  title: string
  description: string
  status: IssueStatus
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'CLIENT'

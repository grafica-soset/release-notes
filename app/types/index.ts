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
  issueIds: string[]
  createdAt: string
  updatedAt: string
}

/** Variante usada no endpoint de detalhe — `issueIds` vem populated. */
export interface ReleaseDetail extends Omit<Release, 'issueIds'> {
  issueIds: Issue[]
}

export interface Comment {
  _id: string
  releaseId: string | null
  issueId: string | null
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
  prUrl: string
  status: IssueStatus
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'CLIENT'

export interface User {
  _id: string
  name: string
  login: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

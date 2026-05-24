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
  authorRole: UserRole
  content: string
  archived: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Comentário enriquecido para a fila de notificações do admin. */
export interface CommentNotification extends Comment {
  /** Versão da release de origem (direta ou via issue-pai). */
  releaseVersion: string | null
  /** Título da issue, quando o comentário foi feito na timeline de uma issue. */
  issueTitle: string | null
  /** Release à qual uma nova issue criada daqui deve ser vinculada. */
  targetReleaseId: string | null
}

export type IssueStatus = 'BACKLOG' | 'IN_PROGRESS' | 'CLOSED'

export type IssueEventType = 'APPROVED' | 'ARCHIVED'

export interface IssueEvent {
  type: IssueEventType
  userId: string | null
  userName: string
  userLogin: string
  at: string
}

/** Detalhes de bug report (issues vindas da API de integração). */
export interface BugReport {
  url: string
  stepsToReproduce: string
  reporterLogin: string
  reporterName: string
}

export interface Issue {
  _id: string
  releaseId: string | null
  commentId: string | null
  title: string
  description: string
  prUrl: string
  status: IssueStatus
  archived: boolean
  archivedAt: string | null
  eventLog: IssueEvent[]
  bugReport: BugReport | null
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

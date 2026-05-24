import mongoose from 'mongoose'
import type { InferSchemaType, Model, Types } from 'mongoose'

const { Schema, model, models } = mongoose

export const ISSUE_STATUSES = ['BACKLOG', 'IN_PROGRESS', 'CLOSED'] as const
export type IssueStatus = (typeof ISSUE_STATUSES)[number]

export const ISSUE_EVENT_TYPES = ['APPROVED', 'ARCHIVED'] as const
export type IssueEventType = (typeof ISSUE_EVENT_TYPES)[number]

const IssueEventSchema = new Schema(
  {
    type: { type: String, enum: ISSUE_EVENT_TYPES, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: '' },
    userLogin: { type: String, default: '' },
    at: { type: Date, default: () => new Date() }
  },
  { _id: false }
)

/**
 * Detalhes de bug report — preenchido quando a issue chega pela API de
 * integração (`POST /api/public/issues`). Sua presença marca a issue como
 * um bug reportado de fora; issues internas têm `bugReport = null`.
 */
const BugReportSchema = new Schema(
  {
    url: { type: String, default: '', trim: true }, // tela/rota onde o erro ocorreu
    stepsToReproduce: { type: String, default: '' },
    reporterLogin: { type: String, default: '', trim: true, lowercase: true },
    reporterName: { type: String, default: '' }
  },
  { _id: false }
)

/**
 * Schema da entidade `Issue` (tarefa/problema gerado a partir de um comentário
 * ou criado manualmente pelo admin).
 */
const IssueSchema = new Schema(
  {
    releaseId: { type: Schema.Types.ObjectId, ref: 'Release', default: null, index: true },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    prUrl: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: 'BACKLOG',
      index: true
    },
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null },
    eventLog: { type: [IssueEventSchema], default: [] },
    bugReport: { type: BugReportSchema, default: null }
  },
  { timestamps: true }
)

export type IssueDoc = InferSchemaType<typeof IssueSchema> & {
  _id: Types.ObjectId
}

const Issue: Model<IssueDoc> =
  (models.Issue as Model<IssueDoc>) || model<IssueDoc>('Issue', IssueSchema)

export default Issue

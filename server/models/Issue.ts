import mongoose from 'mongoose'
import type { InferSchemaType, Model, Types } from 'mongoose'

const { Schema, model, models } = mongoose

export const ISSUE_STATUSES = ['BACKLOG', 'IN_PROGRESS', 'CLOSED'] as const
export type IssueStatus = (typeof ISSUE_STATUSES)[number]

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
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: 'BACKLOG',
      index: true
    }
  },
  { timestamps: true }
)

export type IssueDoc = InferSchemaType<typeof IssueSchema> & {
  _id: Types.ObjectId
}

const Issue: Model<IssueDoc> =
  (models.Issue as Model<IssueDoc>) || model<IssueDoc>('Issue', IssueSchema)

export default Issue

import mongoose from 'mongoose'
import type { InferSchemaType, Model, Types } from 'mongoose'

const { Schema, model, models } = mongoose

/**
 * Schema de `Comment`. Um comentário sempre pertence a **um** alvo:
 * ou uma Release (feedback do cliente sobre a entrega) ou uma Issue
 * (discussão sobre a tarefa). Exatamente um dos dois IDs é preenchido —
 * a validação fica nas rotas POST.
 */
const CommentSchema = new Schema(
  {
    releaseId: { type: Schema.Types.ObjectId, ref: 'Release', default: null, index: true },
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', default: null, index: true },
    authorName: { type: String, required: true, trim: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
)

export type CommentDoc = InferSchemaType<typeof CommentSchema> & {
  _id: Types.ObjectId
}

const Comment: Model<CommentDoc> =
  (models.Comment as Model<CommentDoc>) || model<CommentDoc>('Comment', CommentSchema)

export default Comment

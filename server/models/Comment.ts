import mongoose from 'mongoose'
import type { InferSchemaType, Model, Types } from 'mongoose'

const { Schema, model, models } = mongoose

/**
 * Schema de `Comment`. Um comentário sempre pertence a **um** alvo:
 * ou uma Release (feedback do cliente sobre a entrega) ou uma Issue
 * (discussão sobre a tarefa). Exatamente um dos dois IDs é preenchido —
 * a validação fica nas rotas POST.
 */
export const COMMENT_AUTHOR_ROLES = ['ADMIN', 'CLIENT'] as const
export type CommentAuthorRole = (typeof COMMENT_AUTHOR_ROLES)[number]

const CommentSchema = new Schema(
  {
    releaseId: { type: Schema.Types.ObjectId, ref: 'Release', default: null, index: true },
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', default: null, index: true },
    authorName: { type: String, required: true, trim: true },
    /**
     * Papel de quem escreveu, capturado na criação. Usado para a fila de
     * notificações do admin: só comentários de CLIENT geram notificação.
     * Default 'CLIENT' porque a esmagadora maioria do histórico é feedback
     * de cliente em release.
     */
    authorRole: { type: String, enum: COMMENT_AUTHOR_ROLES, default: 'CLIENT', index: true },
    content: { type: String, required: true },
    /** Notificação tratada/arquivada pelo admin (some da fila). */
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

export type CommentDoc = InferSchemaType<typeof CommentSchema> & {
  _id: Types.ObjectId
}

const Comment: Model<CommentDoc> =
  (models.Comment as Model<CommentDoc>) || model<CommentDoc>('Comment', CommentSchema)

export default Comment

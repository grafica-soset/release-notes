import mongoose from 'mongoose'
import type { InferSchemaType, Model, Types } from 'mongoose'

const { Schema, model, models } = mongoose

/**
 * Schema da entidade `Comment` (feedback do cliente sobre uma Release).
 */
const CommentSchema = new Schema(
  {
    releaseId: { type: Schema.Types.ObjectId, ref: 'Release', required: true, index: true },
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

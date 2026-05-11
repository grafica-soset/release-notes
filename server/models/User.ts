import mongoose from 'mongoose'
import type { InferSchemaType, Model, Types } from 'mongoose'

const { Schema, model, models } = mongoose

export const USER_ROLES = ['ADMIN', 'CLIENT'] as const
export type UserRole = (typeof USER_ROLES)[number]

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    login: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    role: { type: String, enum: USER_ROLES, default: 'CLIENT' }
  },
  { timestamps: true }
)

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: Types.ObjectId
}

const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>('User', UserSchema)

export default User

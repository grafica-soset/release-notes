import mongoose from 'mongoose'
import type { InferSchemaType, Model } from 'mongoose'

const { Schema, model, models } = mongoose

/**
 * Schema da entidade `Release` (versão entregue ao cliente).
 * `timestamps: true` cria automaticamente `createdAt` e `updatedAt`.
 */
const ReleaseSchema = new Schema(
  {
    version: { type: String, required: true, trim: true },
    description: { type: String, default: '' }, // markdown / texto rico
    prUrl: { type: String, default: '', trim: true }
  },
  { timestamps: true }
)

export type ReleaseDoc = InferSchemaType<typeof ReleaseSchema> & { _id: string }

// Reutiliza o model se já estiver registrado (importante em dev/HMR).
const Release: Model<ReleaseDoc> =
  (models.Release as Model<ReleaseDoc>) || model<ReleaseDoc>('Release', ReleaseSchema)

export default Release

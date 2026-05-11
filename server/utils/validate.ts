import mongoose from 'mongoose'

/**
 * Helper para validar ObjectId no path param e devolver um 400 amigável
 * caso seja inválido.
 */
export function assertObjectId(id: string | undefined, label = 'id'): string {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, statusMessage: `Parâmetro "${label}" inválido.` })
  }
  return id
}

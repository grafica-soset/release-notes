import Release from '../../models/Release'
import Comment from '../../models/Comment'
import { assertObjectId } from '../../utils/validate'

/**
 * DELETE /api/releases/:id
 * Remove uma release e os comentários atrelados a ela.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))

  const deleted = await Release.findByIdAndDelete(id).lean()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Release não encontrada.' })
  }

  // Mantém a base coerente: remove comentários órfãos.
  await Comment.deleteMany({ releaseId: id })

  return { ok: true }
})

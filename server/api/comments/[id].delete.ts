import Comment from '../../models/Comment'
import { assertObjectId } from '../../utils/validate'

/**
 * DELETE /api/comments/:id
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const deleted = await Comment.findByIdAndDelete(id).lean()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Comentário não encontrado.' })
  }
  return { ok: true }
})

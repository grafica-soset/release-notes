import Comment from '../../../models/Comment'
import { assertObjectId } from '../../../utils/validate'

/**
 * POST /api/comments/:id/archive
 * Marca a notificação como tratada — sai da fila do admin.
 * (Não apaga o comentário: ele continua na timeline da release/issue.)
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))

  const updated = await Comment.findByIdAndUpdate(
    id,
    { archived: true, archivedAt: new Date() },
    { new: true }
  ).lean()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Comentário não encontrado.' })
  }
  return updated
})

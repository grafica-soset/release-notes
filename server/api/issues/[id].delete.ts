import Issue from '../../models/Issue'
import { assertObjectId } from '../../utils/validate'

/**
 * DELETE /api/issues/:id
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const deleted = await Issue.findByIdAndDelete(id).lean()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Issue não encontrada.' })
  }
  return { ok: true }
})

import User from '../../models/User'
import { assertObjectId } from '../../utils/validate'

/**
 * DELETE /api/users/:id
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'), 'id')
  const user = await User.findByIdAndDelete(id).lean()
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado.' })
  return { ok: true }
})

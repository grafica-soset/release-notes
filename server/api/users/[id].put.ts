import User, { USER_ROLES, type UserRole } from '../../models/User'
import { assertObjectId } from '../../utils/validate'

/**
 * PUT /api/users/:id
 * Atualiza nome, login e/ou role.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'), 'id')
  const body = await readBody<{ name?: string; login?: string; role?: UserRole }>(event)

  const update: Record<string, unknown> = {}
  if (body?.name !== undefined) {
    const name = body.name.trim()
    if (!name) throw createError({ statusCode: 400, statusMessage: 'Campo "name" não pode ficar vazio.' })
    update.name = name
  }
  if (body?.login !== undefined) {
    const login = body.login.trim().toLowerCase()
    if (!login) throw createError({ statusCode: 400, statusMessage: 'Campo "login" não pode ficar vazio.' })
    const clash = await User.findOne({ login, _id: { $ne: id } }).select('_id').lean()
    if (clash) throw createError({ statusCode: 409, statusMessage: 'Login já cadastrado.' })
    update.login = login
  }
  if (body?.role !== undefined) {
    if (!USER_ROLES.includes(body.role)) {
      throw createError({ statusCode: 400, statusMessage: 'Role inválido.' })
    }
    update.role = body.role
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true }).lean()
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado.' })
  return user
})

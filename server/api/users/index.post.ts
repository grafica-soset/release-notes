import User, { USER_ROLES, type UserRole } from '../../models/User'

/**
 * POST /api/users
 * Body: { name, login, role }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; login?: string; role?: UserRole }>(event)

  const name = body?.name?.trim()
  const login = body?.login?.trim().toLowerCase()
  const role = body?.role ?? 'CLIENT'

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "name" é obrigatório.' })
  }
  if (!login) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "login" é obrigatório.' })
  }
  if (!USER_ROLES.includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Role inválido.' })
  }

  const existing = await User.findOne({ login }).select('_id').lean()
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Login já cadastrado.' })
  }

  const user = await User.create({ name, login, role })
  return user.toObject()
})

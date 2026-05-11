import User from '../../models/User'

/**
 * POST /api/users/seed
 * Body opcional: { name?, login? } — padrões: "Admin Inicial" / "admin".
 *
 * Cria o primeiro admin do app. Só funciona enquanto não houver nenhum ADMIN
 * cadastrado — depois disso, novos usuários devem ser criados via /api/users
 * pela tela /users.
 */
export default defineEventHandler(async (event) => {
  const existing = await User.findOne({ role: 'ADMIN' }).select('_id').lean()
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Já existe um admin cadastrado. Use a tela /users para criar novos.'
    })
  }

  const body = await readBody<{ name?: string; login?: string }>(event).catch(() => ({}))
  const name = body?.name?.trim() || 'Admin Inicial'
  const login = (body?.login?.trim() || 'admin').toLowerCase()

  const clash = await User.findOne({ login }).select('_id').lean()
  if (clash) {
    throw createError({ statusCode: 409, statusMessage: 'Login já cadastrado.' })
  }

  const user = await User.create({ name, login, role: 'ADMIN' })
  return user.toObject()
})

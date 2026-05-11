import User from '../../models/User'

/**
 * GET /api/users?login=<login>
 * Lista usuários, ou retorna um único quando filtrado por login (usado pelo login do front).
 */
export default defineEventHandler(async (event) => {
  const { login } = getQuery<{ login?: string }>(event)
  if (login) {
    const user = await User.findOne({ login: login.trim().toLowerCase() }).lean()
    return user ? [user] : []
  }
  return User.find().sort({ createdAt: -1 }).lean()
})

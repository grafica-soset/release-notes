import Release from '../../models/Release'

/**
 * GET /api/releases
 * Lista todas as releases (mais recentes primeiro).
 */
export default defineEventHandler(async () => {
  const releases = await Release.find().sort({ createdAt: -1 }).lean()
  return releases
})

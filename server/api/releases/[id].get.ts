import Release from '../../models/Release'
import { assertObjectId } from '../../utils/validate'

/**
 * GET /api/releases/:id
 * Retorna o detalhe de uma release específica.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))

  const release = await Release.findById(id).lean()
  if (!release) {
    throw createError({ statusCode: 404, statusMessage: 'Release não encontrada.' })
  }

  return release
})

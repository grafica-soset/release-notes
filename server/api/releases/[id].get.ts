import Release from '../../models/Release'
import '../../models/Issue' // garante registro do model antes do populate
import { assertObjectId } from '../../utils/validate'

/**
 * GET /api/releases/:id
 * Retorna a release com as Issues vinculadas (populated).
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))

  const release = await Release.findById(id).populate('issueIds').lean()
  if (!release) {
    throw createError({ statusCode: 404, statusMessage: 'Release não encontrada.' })
  }

  return release
})

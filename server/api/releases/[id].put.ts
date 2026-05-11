import Release from '../../models/Release'
import { assertObjectId } from '../../utils/validate'

/**
 * PUT /api/releases/:id
 * Atualiza uma release existente.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const body = await readBody<{ version?: string; description?: string; prUrl?: string }>(event)

  const updated = await Release.findByIdAndUpdate(
    id,
    {
      ...(body.version !== undefined && { version: body.version.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.prUrl !== undefined && { prUrl: body.prUrl })
    },
    { new: true }
  ).lean()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Release não encontrada.' })
  }

  return updated
})

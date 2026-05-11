import Release from '../../models/Release'
import { assertObjectId } from '../../utils/validate'
import { syncReleaseIssues } from '../../utils/syncReleaseIssues'

/**
 * PUT /api/releases/:id
 * Atualiza uma release existente. Quando `issueIds` é enviado, sincroniza
 * a relação bidirecional com a coleção de Issues.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const body = await readBody<{
    version?: string
    description?: string
    prUrl?: string
    issueIds?: string[]
  }>(event)

  const current = await Release.findById(id)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Release não encontrada.' })
  }

  if (body.version !== undefined) current.version = body.version.trim()
  if (body.description !== undefined) current.description = body.description
  if (body.prUrl !== undefined) current.prUrl = body.prUrl

  if (body.issueIds !== undefined) {
    const finalIds = await syncReleaseIssues(id, body.issueIds, current.issueIds as any)
    current.issueIds = finalIds as any
  }

  await current.save()
  return current.toObject()
})

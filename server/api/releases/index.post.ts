import Release from '../../models/Release'
import { syncReleaseIssues } from '../../utils/syncReleaseIssues'

/**
 * POST /api/releases
 * Cria uma nova release.
 * Body: { version, description?, prUrl?, issueIds? }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    version?: string
    description?: string
    prUrl?: string
    issueIds?: string[]
  }>(event)

  if (!body?.version?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "version" é obrigatório.' })
  }

  // Cria a release sem issues; depois sincroniza e persiste a lista final.
  const release = await Release.create({
    version: body.version.trim(),
    description: body.description ?? '',
    prUrl: body.prUrl ?? '',
    issueIds: []
  })

  const finalIds = await syncReleaseIssues(String(release._id), body.issueIds)
  release.issueIds = finalIds as any
  await release.save()

  return release.toObject()
})

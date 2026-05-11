import Release from '../../models/Release'

/**
 * POST /api/releases
 * Cria uma nova release.
 * Body: { version, description?, prUrl? }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ version?: string; description?: string; prUrl?: string }>(event)

  if (!body?.version?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "version" é obrigatório.' })
  }

  const release = await Release.create({
    version: body.version.trim(),
    description: body.description ?? '',
    prUrl: body.prUrl ?? ''
  })

  return release.toObject()
})

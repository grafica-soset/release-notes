import Issue from '../../models/Issue'

/**
 * GET /api/issues?status=BACKLOG&releaseId=...
 * Lista issues com filtros opcionais.
 */
export default defineEventHandler(async (event) => {
  const { status, releaseId } = getQuery<{ status?: string; releaseId?: string }>(event)

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (releaseId) filter.releaseId = releaseId

  const issues = await Issue.find(filter).sort({ createdAt: -1 }).lean()
  return issues
})

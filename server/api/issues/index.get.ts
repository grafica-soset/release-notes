import Issue from '../../models/Issue'

/**
 * GET /api/issues?status=BACKLOG&releaseId=...&archived=true|all
 * Lista issues com filtros opcionais.
 *
 * `archived`:
 *   - ausente/false: apenas issues ativas (não arquivadas) — padrão da board.
 *   - 'true': apenas arquivadas.
 *   - 'all': todas, independente do estado de arquivamento.
 */
export default defineEventHandler(async (event) => {
  const { status, releaseId, archived } = getQuery<{
    status?: string
    releaseId?: string
    archived?: string
  }>(event)

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (releaseId) filter.releaseId = releaseId

  if (archived === 'true') filter.archived = true
  else if (archived !== 'all') filter.archived = { $ne: true }

  const issues = await Issue.find(filter).sort({ createdAt: -1 }).lean()
  return issues
})

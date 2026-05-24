import Release from '../../models/Release'
import { assertIntegrationKey } from '../../utils/integrationAuth'

/**
 * GET /api/public/releases?limit=10
 * API de integração: últimas releases (mais recentes primeiro) para alimentar
 * dashboards externos. Default 10, máximo 50.
 *
 * Retorno enxuto por item: { id, version, description, createdAt }.
 * `version` funciona como título e número da release; `id` permite montar o
 * link de volta para o sistema de releases (ex.: /releases/<id>).
 */
export default defineEventHandler(async (event) => {
  assertIntegrationKey(event)

  const { limit } = getQuery<{ limit?: string }>(event)
  const parsed = Number.parseInt(String(limit ?? ''), 10)
  const take = Math.min(Math.max(Number.isNaN(parsed) ? 10 : parsed, 1), 50)

  const releases = await Release.find()
    .sort({ createdAt: -1 })
    .limit(take)
    .select('version description createdAt')
    .lean()

  return releases.map((r) => ({
    id: String(r._id),
    version: r.version,
    description: r.description,
    createdAt: r.createdAt
  }))
})

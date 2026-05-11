import Comment from '../../models/Comment'
import { assertObjectId } from '../../utils/validate'

/**
 * GET /api/comments?releaseId=...  → comentários da release
 * GET /api/comments?issueId=...    → comentários da issue
 *
 * Exatamente um dos dois precisa ser informado (evita dump da coleção).
 */
export default defineEventHandler(async (event) => {
  const { releaseId, issueId } = getQuery<{ releaseId?: string; issueId?: string }>(event)

  if (!releaseId && !issueId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Informe "releaseId" ou "issueId".'
    })
  }
  if (releaseId && issueId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Use apenas um filtro: "releaseId" ou "issueId".'
    })
  }

  const filter: Record<string, unknown> = {}
  if (releaseId) {
    assertObjectId(releaseId, 'releaseId')
    filter.releaseId = releaseId
  } else {
    assertObjectId(issueId, 'issueId')
    filter.issueId = issueId
  }

  return await Comment.find(filter).sort({ createdAt: 1 }).lean()
})

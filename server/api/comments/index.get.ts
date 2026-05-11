import Comment from '../../models/Comment'
import { assertObjectId } from '../../utils/validate'

/**
 * GET /api/comments?releaseId=...
 * Lista os comentários (mais antigos primeiro, formando uma timeline).
 * O `releaseId` é obrigatório para evitar retornar a base inteira.
 */
export default defineEventHandler(async (event) => {
  const { releaseId } = getQuery<{ releaseId?: string }>(event)
  assertObjectId(releaseId, 'releaseId')

  const comments = await Comment.find({ releaseId }).sort({ createdAt: 1 }).lean()
  return comments
})

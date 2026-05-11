import Comment from '../../models/Comment'
import Release from '../../models/Release'
import { assertObjectId } from '../../utils/validate'

/**
 * POST /api/comments
 * Cria um comentário associado a uma release.
 * Body: { releaseId, authorName, content }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ releaseId?: string; authorName?: string; content?: string }>(event)

  assertObjectId(body.releaseId, 'releaseId')

  if (!body?.authorName?.trim() || !body?.content?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: '"authorName" e "content" são obrigatórios.'
    })
  }

  // Verifica se a release existe (integridade referencial leve).
  const release = await Release.findById(body.releaseId).select('_id').lean()
  if (!release) {
    throw createError({ statusCode: 404, statusMessage: 'Release não encontrada.' })
  }

  const comment = await Comment.create({
    releaseId: body.releaseId,
    authorName: body.authorName.trim(),
    content: body.content.trim()
  })

  return comment.toObject()
})

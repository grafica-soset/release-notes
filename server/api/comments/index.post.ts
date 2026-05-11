import Comment from '../../models/Comment'
import Release from '../../models/Release'
import Issue from '../../models/Issue'
import { assertObjectId } from '../../utils/validate'

/**
 * POST /api/comments
 * Body: { authorName, content, releaseId?, issueId? }
 *
 * Exatamente um entre `releaseId` ou `issueId` deve estar presente.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    releaseId?: string
    issueId?: string
    authorName?: string
    content?: string
  }>(event)

  const hasRelease = !!body?.releaseId
  const hasIssue = !!body?.issueId

  if (hasRelease === hasIssue) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Informe exatamente um entre "releaseId" e "issueId".'
    })
  }

  if (!body?.authorName?.trim() || !body?.content?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: '"authorName" e "content" são obrigatórios.'
    })
  }

  if (hasRelease) {
    assertObjectId(body.releaseId, 'releaseId')
    const release = await Release.findById(body.releaseId).select('_id').lean()
    if (!release) {
      throw createError({ statusCode: 404, statusMessage: 'Release não encontrada.' })
    }
  } else {
    assertObjectId(body.issueId, 'issueId')
    const issue = await Issue.findById(body.issueId).select('_id').lean()
    if (!issue) {
      throw createError({ statusCode: 404, statusMessage: 'Issue não encontrada.' })
    }
  }

  const comment = await Comment.create({
    releaseId: hasRelease ? body.releaseId : null,
    issueId: hasIssue ? body.issueId : null,
    authorName: body.authorName.trim(),
    content: body.content.trim()
  })

  return comment.toObject()
})

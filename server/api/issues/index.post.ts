import Issue, { ISSUE_STATUSES, type IssueStatus } from '../../models/Issue'
import mongoose from 'mongoose'

/**
 * POST /api/issues
 * Cria uma issue. `releaseId` e `commentId` são opcionais para suportar
 * tanto a criação livre quanto a conversão de comentário em issue.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title?: string
    description?: string
    status?: IssueStatus
    releaseId?: string | null
    commentId?: string | null
  }>(event)

  if (!body?.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "title" é obrigatório.' })
  }

  if (body.status && !ISSUE_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status inválido.' })
  }

  const releaseId =
    body.releaseId && mongoose.Types.ObjectId.isValid(body.releaseId) ? body.releaseId : null
  const commentId =
    body.commentId && mongoose.Types.ObjectId.isValid(body.commentId) ? body.commentId : null

  const issue = await Issue.create({
    title: body.title.trim(),
    description: body.description ?? '',
    status: body.status ?? 'BACKLOG',
    releaseId,
    commentId
  })

  return issue.toObject()
})

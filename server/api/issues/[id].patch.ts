import mongoose from 'mongoose'
import Issue, { ISSUE_STATUSES, type IssueStatus } from '../../models/Issue'
import { assertObjectId } from '../../utils/validate'

/**
 * PATCH /api/issues/:id
 * Atualização parcial — usada para mudança de status na board e para
 * edição completa da issue (modal).
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const body = await readBody<{
    title?: string
    description?: string
    status?: IssueStatus
    prUrl?: string
    releaseId?: string | null
  }>(event)

  if (body.status && !ISSUE_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status inválido.' })
  }

  // `releaseId` pode chegar como string válida, null explícito ou ausente.
  let releaseIdUpdate: string | null | undefined = undefined
  if (body.releaseId === null) releaseIdUpdate = null
  else if (typeof body.releaseId === 'string') {
    releaseIdUpdate = mongoose.Types.ObjectId.isValid(body.releaseId) ? body.releaseId : null
  }

  const updated = await Issue.findByIdAndUpdate(
    id,
    {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.prUrl !== undefined && { prUrl: body.prUrl.trim() }),
      ...(body.status !== undefined && { status: body.status }),
      ...(releaseIdUpdate !== undefined && { releaseId: releaseIdUpdate })
    },
    { new: true }
  ).lean()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Issue não encontrada.' })
  }
  return updated
})

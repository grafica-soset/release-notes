import Issue, { ISSUE_STATUSES, type IssueStatus } from '../../models/Issue'
import { assertObjectId } from '../../utils/validate'

/**
 * PATCH /api/issues/:id
 * Atualização parcial — usada principalmente para mudar o status na board.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const body = await readBody<{
    title?: string
    description?: string
    status?: IssueStatus
  }>(event)

  if (body.status && !ISSUE_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status inválido.' })
  }

  const updated = await Issue.findByIdAndUpdate(
    id,
    {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status })
    },
    { new: true }
  ).lean()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Issue não encontrada.' })
  }
  return updated
})

import mongoose from 'mongoose'
import Issue, { ISSUE_EVENT_TYPES, type IssueEventType } from '../../../models/Issue'
import { assertObjectId } from '../../../utils/validate'

/**
 * POST /api/issues/:id/archive
 * Arquiva uma issue registrando um evento no `eventLog`.
 * - type `APPROVED`: cliente aprovou o feedback (também arquiva).
 * - type `ARCHIVED`: admin arquivou manualmente.
 *
 * Sem auth real (ver CLAUDE.md): o usuário responsável vem no body.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const body = await readBody<{
    type?: IssueEventType
    userId?: string | null
    userName?: string
    userLogin?: string
  }>(event)

  const type = body.type
  if (!type || !ISSUE_EVENT_TYPES.includes(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de evento inválido.' })
  }

  const userId =
    body.userId && mongoose.Types.ObjectId.isValid(body.userId) ? body.userId : null

  const now = new Date()
  const updated = await Issue.findByIdAndUpdate(
    id,
    {
      archived: true,
      archivedAt: now,
      $push: {
        eventLog: {
          type,
          userId,
          userName: body.userName?.trim() ?? '',
          userLogin: body.userLogin?.trim() ?? '',
          at: now
        }
      }
    },
    { new: true }
  ).lean()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Issue não encontrada.' })
  }
  return updated
})

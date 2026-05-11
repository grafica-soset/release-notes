import Issue from '../../models/Issue'
import Comment from '../../models/Comment'
import Release from '../../models/Release'
import { assertObjectId } from '../../utils/validate'

/**
 * DELETE /api/issues/:id
 * Remove a issue, seus comentários atrelados e tira a referência dela
 * de qualquer Release.issueIds.
 */
export default defineEventHandler(async (event) => {
  const id = assertObjectId(getRouterParam(event, 'id'))
  const deleted = await Issue.findByIdAndDelete(id).lean()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Issue não encontrada.' })
  }

  await Promise.all([
    Comment.deleteMany({ issueId: id }),
    Release.updateMany({ issueIds: id }, { $pull: { issueIds: id } })
  ])

  return { ok: true }
})

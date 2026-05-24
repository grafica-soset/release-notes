import Comment from '../../models/Comment'
import Release from '../../models/Release'
import Issue from '../../models/Issue'

/**
 * GET /api/comments/notifications
 * Fila de notificações do admin: comentários de CLIENT ainda não arquivados,
 * tanto em releases quanto em issues, mais recentes primeiro.
 *
 * Cada item é enriquecido com contexto para a UI:
 *  - `releaseVersion` / `issueTitle`: rótulo de origem.
 *  - `targetReleaseId`: release à qual uma nova issue deve ser vinculada
 *    (a própria release, ou a release-pai da issue comentada).
 */
export default defineEventHandler(async () => {
  const comments = await Comment.find({ authorRole: 'CLIENT', archived: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean()

  if (!comments.length) return []

  const releaseIds = new Set<string>()
  const issueIds = new Set<string>()
  for (const c of comments) {
    if (c.releaseId) releaseIds.add(String(c.releaseId))
    if (c.issueId) issueIds.add(String(c.issueId))
  }

  const [releases, issues] = await Promise.all([
    Release.find({ _id: { $in: [...releaseIds] } }).select('version').lean(),
    Issue.find({ _id: { $in: [...issueIds] } }).select('title releaseId').lean()
  ])

  const versionById = new Map(releases.map((r) => [String(r._id), r.version]))
  const issueById = new Map(issues.map((i) => [String(i._id), i]))

  // Issues podem apontar para releases não buscadas acima — completa o mapa.
  const extraReleaseIds = issues
    .map((i) => i.releaseId && String(i.releaseId))
    .filter((id): id is string => !!id && !versionById.has(id))
  if (extraReleaseIds.length) {
    const extra = await Release.find({ _id: { $in: extraReleaseIds } }).select('version').lean()
    for (const r of extra) versionById.set(String(r._id), r.version)
  }

  return comments.map((c) => {
    const issue = c.issueId ? issueById.get(String(c.issueId)) : null
    const targetReleaseId = c.releaseId
      ? String(c.releaseId)
      : issue?.releaseId
        ? String(issue.releaseId)
        : null

    return {
      ...c,
      releaseVersion: targetReleaseId ? versionById.get(targetReleaseId) ?? null : null,
      issueTitle: issue?.title ?? null,
      targetReleaseId
    }
  })
})

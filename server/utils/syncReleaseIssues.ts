import mongoose from 'mongoose'
import Issue from '../models/Issue'

/**
 * Mantém Release.issueIds e Issue.releaseId em sincronia.
 *
 * - Issues novas (em `nextIds` mas não em `prevIds`) → `releaseId = releaseId`.
 * - Issues removidas (em `prevIds` mas não em `nextIds`) → `releaseId = null`.
 *
 * Aceita qualquer iterável de strings; filtra IDs inválidos.
 */
export async function syncReleaseIssues(
  releaseId: string,
  nextIdsRaw: unknown[] | undefined,
  prevIdsRaw: unknown[] = []
): Promise<string[]> {
  const toValidStrings = (arr: unknown[]) =>
    arr
      .map((v) => String(v))
      .filter((v) => mongoose.Types.ObjectId.isValid(v))

  const next = new Set(toValidStrings(nextIdsRaw ?? []))
  const prev = new Set(toValidStrings(prevIdsRaw))

  const added = [...next].filter((id) => !prev.has(id))
  const removed = [...prev].filter((id) => !next.has(id))

  if (added.length) {
    await Issue.updateMany({ _id: { $in: added } }, { releaseId })
  }
  if (removed.length) {
    await Issue.updateMany({ _id: { $in: removed } }, { releaseId: null })
  }

  return [...next]
}

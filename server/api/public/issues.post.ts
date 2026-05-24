import Issue from '../../models/Issue'
import Release from '../../models/Release'
import User from '../../models/User'
import { assertIntegrationKey } from '../../utils/integrationAuth'

/**
 * POST /api/public/issues
 * API de integração: abre uma issue (bug report) a partir de outro sistema.
 *
 * Body: {
 *   title, description?,
 *   url?,               // tela/rota onde o erro ocorreu
 *   stepsToReproduce?,  // passo a passo para reproduzir
 *   reporterLogin       // handle de quem reportou (mesmo login do nosso sistema)
 * }
 *
 * Regras:
 *  - A issue é sempre vinculada à ÚLTIMA release (mais recente).
 *  - Se `reporterLogin` não existir como usuário, criamos um (role CLIENT).
 */
export default defineEventHandler(async (event) => {
  assertIntegrationKey(event)

  const body = await readBody<{
    title?: string
    description?: string
    url?: string
    stepsToReproduce?: string
    reporterLogin?: string
  }>(event)

  if (!body?.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "title" é obrigatório.' })
  }

  const reporterLogin = body.reporterLogin?.trim().toLowerCase()
  if (!reporterLogin) {
    throw createError({ statusCode: 400, statusMessage: 'Campo "reporterLogin" é obrigatório.' })
  }

  // Última release — alvo do bug report.
  const latest = await Release.findOne().sort({ createdAt: -1 })
  if (!latest) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Nenhuma release cadastrada para vincular o bug.'
    })
  }

  // Garante o usuário reporter (cria se ainda não existir).
  let user = await User.findOne({ login: reporterLogin })
  if (!user) {
    user = await User.create({ name: reporterLogin, login: reporterLogin, role: 'CLIENT' })
  }

  const issue = await Issue.create({
    title: body.title.trim(),
    description: body.description ?? '',
    status: 'BACKLOG',
    releaseId: latest._id,
    bugReport: {
      url: body.url?.trim() ?? '',
      stepsToReproduce: body.stepsToReproduce ?? '',
      reporterLogin,
      reporterName: user.name
    }
  })

  // Vincula nos dois lados (Release.issueIds é a fonte das telas internas).
  await Release.updateOne({ _id: latest._id }, { $addToSet: { issueIds: issue._id } })

  return issue.toObject()
})

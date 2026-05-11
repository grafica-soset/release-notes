import { ensureDb } from '../utils/db'

/**
 * Middleware Nitro que garante conexão com o MongoDB antes de qualquer
 * rota `/api/*` (exceto `/api/health`, que deve responder mesmo com DB caído
 * para servir como diagnóstico).
 *
 * Se a conexão falhar, devolve 503 com a mensagem real — assim o erro
 * aparece no devtools/console do cliente em vez de virar um 502 opaco do Netlify.
 */
export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (!path.startsWith('/api/')) return
  if (path.startsWith('/api/health')) return

  try {
    await ensureDb()
  } catch (err: any) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Banco de dados indisponível.',
      data: {
        reason: err?.message || String(err),
        name: err?.name,
        code: err?.code,
        hint: 'Cheque /api/health para diagnóstico.'
      }
    })
  }
})

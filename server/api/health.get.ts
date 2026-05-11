import mongoose from 'mongoose'
import { ensureDb, getDbState } from '../utils/db'

/**
 * GET /api/health
 * Endpoint de diagnóstico — não exige conexão prévia com o DB (não passa
 * pelo middleware de `ensureDb`). Retorna:
 *
 *  - status da env var MONGODB_URI (presente? host?)
 *  - readyState do mongoose (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
 *  - último erro registrado
 *  - resultado de um ping ao DB (tenta reconectar se necessário)
 *  - info do runtime (versão node, plataforma)
 *
 * Use isso para verificar rapidamente se a variável de ambiente do Netlify
 * está chegando à função e se o Atlas/Mongo está alcançável.
 */
export default defineEventHandler(async () => {
  const before = getDbState()

  let ping: { ok: boolean; ms?: number; error?: string } = { ok: false }
  const start = Date.now()
  try {
    await ensureDb()
    const admin = mongoose.connection.db?.admin()
    await admin?.ping()
    ping = { ok: true, ms: Date.now() - start }
  } catch (err: any) {
    ping = {
      ok: false,
      ms: Date.now() - start,
      error: `${err?.name ?? 'Error'}: ${err?.message ?? String(err)}`
    }
  }

  const after = getDbState()

  return {
    db: {
      hasUri: after.hasUri,
      uriHost: after.uriHost,
      readyState: after.readyState,
      readyStateLabel: after.readyStateLabel,
      connectedAt: after.connectedAt,
      lastError: after.lastError,
      stateBeforePing: before.readyStateLabel
    },
    ping,
    runtime: {
      node: process.version,
      platform: process.platform,
      // Indica se está rodando na Netlify (existe em todas as Functions deles).
      isNetlify: !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      region: process.env.AWS_REGION ?? null
    },
    now: new Date().toISOString()
  }
})

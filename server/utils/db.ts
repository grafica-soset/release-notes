import mongoose from 'mongoose'

/**
 * Estado e helpers de conexão com o MongoDB.
 *
 * Em ambientes serverless (Netlify Functions), a função pode ser congelada
 * e descongelada entre invocações. O plugin Nitro abre a conexão no boot,
 * mas se ela falhou ou caiu, qualquer endpoint que use o DB precisa
 * conseguir tentar de novo ou reportar um erro claro — não silenciar.
 *
 * Por isso `ensureDb()` deve ser chamado antes de operações de DB
 * (já é injetado em todas as rotas `/api/*` pelo middleware `server/middleware/db.ts`).
 */

const readyStateLabels: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized'
}

export interface DbState {
  hasUri: boolean
  uriHost: string | null
  readyState: number
  readyStateLabel: string
  lastError: string | null
  connectedAt: string | null
}

let lastError: Error | null = null
let connectedAt: Date | null = null
let connectingPromise: Promise<typeof mongoose> | null = null

export function recordConnected() {
  connectedAt = new Date()
  lastError = null
}

export function recordError(err: Error) {
  lastError = err
}

/** Extrai apenas host:porta da URI (sem usuário/senha) para logs. */
export function maskUri(uri: string | undefined): string | null {
  if (!uri) return null
  try {
    const u = new URL(uri.replace(/^mongodb\+srv:/, 'https:').replace(/^mongodb:/, 'http:'))
    return u.host || null
  } catch {
    return uri.replace(/\/\/.*@/, '//***@').slice(0, 80)
  }
}

export function getDbState(): DbState {
  const uri = process.env.MONGODB_URI
  return {
    hasUri: !!uri,
    uriHost: maskUri(uri),
    readyState: mongoose.connection.readyState,
    readyStateLabel: readyStateLabels[mongoose.connection.readyState] ?? 'unknown',
    lastError: lastError ? `${lastError.name}: ${lastError.message}` : null,
    connectedAt: connectedAt ? connectedAt.toISOString() : null
  }
}

/**
 * Garante que a conexão esteja pronta. Reutiliza a promise se já houver
 * uma tentativa em andamento. Lança erro descritivo se MONGODB_URI ausente
 * ou se a conexão falhar.
 */
export async function ensureDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return

  const uri = process.env.MONGODB_URI
  if (!uri) {
    const err = new Error(
      'MONGODB_URI não está definida no ambiente. Configure em Netlify → Site settings → Environment.'
    )
    recordError(err)
    throw err
  }

  if (mongoose.connection.readyState === 2 && connectingPromise) {
    await connectingPromise
    return
  }

  connectingPromise = mongoose.connect(uri, {
    // Timeouts curtos para falhar rápido em vez de pendurar a função.
    serverSelectionTimeoutMS: 8_000,
    socketTimeoutMS: 20_000,
    connectTimeoutMS: 8_000
  })

  try {
    await connectingPromise
    recordConnected()
    // eslint-disable-next-line no-console
    console.log('[mongoose] conectado em', maskUri(uri))
  } catch (err) {
    recordError(err as Error)
    // eslint-disable-next-line no-console
    console.error('[mongoose] falha ao conectar:', err)
    throw err
  } finally {
    connectingPromise = null
  }
}

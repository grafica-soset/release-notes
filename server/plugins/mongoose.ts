import mongoose from 'mongoose'
import { ensureDb, recordError, recordConnected, maskUri } from '../utils/db'

/**
 * Plugin Nitro responsável por inicializar a conexão com o MongoDB
 * quando o servidor sobe.
 *
 * A URI é lida de `process.env.MONGODB_URI` em runtime — fora do
 * `runtimeConfig` para evitar inlining em build artifacts (scanner do Netlify).
 *
 * Em serverless, a conexão pode cair entre invocações. Por isso, além de
 * tentar conectar no boot, registramos listeners para reagir a eventos da
 * conexão e expomos `ensureDb()` (chamado pelo middleware) para reconectar
 * sob demanda.
 */
export default defineNitroPlugin(async () => {
  mongoose.set('strictQuery', true)

  // Listeners de diagnóstico — aparecem nos logs do Netlify (Functions → Logs).
  mongoose.connection.on('connected', () => {
    recordConnected()
    // eslint-disable-next-line no-console
    console.log('[mongoose] evento "connected"', maskUri(process.env.MONGODB_URI))
  })
  mongoose.connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('[mongoose] evento "disconnected"')
  })
  mongoose.connection.on('error', (err) => {
    recordError(err as Error)
    // eslint-disable-next-line no-console
    console.error('[mongoose] evento "error":', err)
  })
  mongoose.connection.on('reconnected', () => {
    recordConnected()
    // eslint-disable-next-line no-console
    console.log('[mongoose] evento "reconnected"')
  })

  // Tenta uma primeira conexão no boot. Se falhar, não derruba o servidor —
  // o `ensureDb()` no middleware vai tentar de novo e devolver erro descritivo
  // no payload da resposta HTTP (mais útil pra debugar do que 502 do Netlify).
  try {
    await ensureDb()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mongoose] conexão inicial falhou (vai tentar novamente por request):', err)
  }
})

import mongoose from 'mongoose'

/**
 * Plugin Nitro responsável por inicializar a conexão com o MongoDB
 * quando o servidor sobe.
 *
 * A URI é lida de `process.env.MONGODB_URI` em runtime (não via
 * `runtimeConfig`) para evitar que o Nitro embuta o segredo nos artefatos
 * de build — o scanner do Netlify bloqueia builds com segredos inlineados.
 *
 * O Mongoose mantém um pool de conexões internamente, então não precisamos
 * abrir/fechar a conexão a cada request.
 */
export default defineNitroPlugin(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/release-notes'

  // Evita reconectar em hot-reload do dev (HMR).
  if (mongoose.connection.readyState >= 1) return

  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri)
    // eslint-disable-next-line no-console
    console.log('[mongoose] conectado em', uri.replace(/\/\/.*:.*@/, '//***:***@'))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mongoose] falha ao conectar:', err)
  }
})

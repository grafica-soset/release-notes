import mongoose from 'mongoose'

/**
 * Plugin Nitro responsável por inicializar a conexão com o MongoDB
 * quando o servidor sobe. A URI é lida do runtimeConfig (env MONGODB_URI).
 *
 * O Mongoose mantém um pool de conexões internamente, então não precisamos
 * abrir/fechar a conexão a cada request.
 */
export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri as string

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

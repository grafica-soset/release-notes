/**
 * Plugin Nitro que loga TODO erro com contexto (path, método, stack, data)
 * — facilita debugar pelas Functions Logs do Netlify, que de outra forma
 * mostram só uma 500 genérica sem corpo.
 *
 * O hook `error` do Nitro recebe o erro e o evento HTTP.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: any, ctx: any) => {
    const event = ctx?.event
    // eslint-disable-next-line no-console
    console.error('[nitro:error]', {
      path: event?.path,
      method: event?.method,
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
      message: error?.message,
      name: error?.name,
      code: error?.code,
      data: error?.data,
      stack: error?.stack
    })
  })
})

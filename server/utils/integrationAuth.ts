import type { H3Event } from 'h3'

/**
 * Autenticação simples por chave de API para a API de integração (`/api/public/*`).
 *
 * Lê `INTEGRATION_API_KEY` direto do ambiente (mesmo padrão do MONGODB_URI —
 * ver nuxt.config.ts: segredos não entram no runtimeConfig para não vazarem
 * no build). Comportamento:
 *   - chave configurada → exige header `x-api-key` idêntico, senão 401.
 *   - chave ausente no ambiente → endpoint fica aberto (sem auth).
 */
export function assertIntegrationKey(event: H3Event): void {
  const expected = process.env.INTEGRATION_API_KEY
  if (!expected) return

  const provided = getHeader(event, 'x-api-key')
  if (provided !== expected) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Chave de API inválida ou ausente (header "x-api-key").'
    })
  }
}

# Integração com o Release & Issue Tracker

Guia para sistemas externos consumirem a **API de integração** do release-notes.
Hoje a API expõe dois recursos:

1. **Listar as últimas releases** — para montar um painel de evolução do sistema.
2. **Abrir uma issue (bug report)** — para o cliente reportar um bug a partir de outro sistema.

Todos os endpoints de integração ficam sob o prefixo **`/api/public`** e retornam **JSON**.

---

## Base URL

```
https://<seu-host>
```

Substitua `<seu-host>` pelo domínio onde o release-notes está publicado
(ex.: `https://release-notes.suaempresa.com`). Em desenvolvimento local:
`http://localhost:3000`.

---

## Autenticação

A API usa uma **chave estática** enviada no header `x-api-key`.

```
x-api-key: SUA_CHAVE_AQUI
```

- A chave é definida na variável de ambiente **`INTEGRATION_API_KEY`** do release-notes.
- **Se a variável estiver definida**, todos os endpoints `/api/public/*` exigem o header
  com o valor exato — caso contrário respondem **`401`**.
- **Se a variável não estiver definida**, os endpoints ficam **abertos** (sem auth).
  Recomendado apenas para ambiente local/testes.

> A chave é um segredo: guarde-a no cofre de segredos do sistema integrador,
> nunca no código-fonte versionado nem no frontend exposto ao usuário.

---

## 1. Listar últimas releases

Retorna as releases mais recentes primeiro. Útil para um dashboard que mostra
a evolução do sistema.

```
GET /api/public/releases
```

### Query params

| Param   | Tipo | Default | Descrição                                  |
| ------- | ---- | ------- | ------------------------------------------ |
| `limit` | int  | `10`    | Quantidade de releases. Faixa: `1`–`50`.   |

### Resposta `200 OK`

Array de releases (mais recente primeiro):

```json
[
  {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "version": "v2.4.0",
    "description": "## Novidades\n- Exportação em PDF\n- Correções de performance",
    "createdAt": "2026-05-20T14:30:00.000Z"
  },
  {
    "id": "664e0918a1b2c3d4e5f60718",
    "version": "v2.3.1",
    "description": "Correção do cálculo de impostos.",
    "createdAt": "2026-05-12T09:05:00.000Z"
  }
]
```

| Campo         | Tipo   | Descrição                                                        |
| ------------- | ------ | ---------------------------------------------------------------- |
| `id`          | string | ID da release. Use para o link de detalhe: `/releases/<id>`.     |
| `version`     | string | Versão — serve como título **e** número da release (ex.: `v2.4.0`). |
| `description` | string | Descrição em **Markdown** (pode conter `#`, listas, etc.).       |
| `createdAt`   | string | Data de publicação no formato ISO 8601 (UTC).                    |

### Exemplo — cURL

```bash
curl -s \
  -H "x-api-key: SUA_CHAVE_AQUI" \
  "https://<seu-host>/api/public/releases?limit=5"
```

### Exemplo — JavaScript (fetch)

```js
const res = await fetch('https://<seu-host>/api/public/releases?limit=5', {
  headers: { 'x-api-key': process.env.RELEASE_NOTES_API_KEY }
})
const releases = await res.json()

// Link de volta para o sistema de releases:
releases.forEach((r) => {
  console.log(r.version, `https://<seu-host>/releases/${r.id}`)
})
```

---

## 2. Abrir uma issue (bug report)

Cria uma issue no release-notes. A issue é **sempre vinculada à última release**
(a mais recente). Pensado para o cliente reportar um bug a partir de outro sistema.

```
POST /api/public/issues
Content-Type: application/json
```

### Corpo da requisição

| Campo              | Tipo   | Obrigatório | Descrição                                                           |
| ------------------ | ------ | ----------- | ------------------------------------------------------------------- |
| `title`            | string | **sim**     | Título da issue / resumo do bug.                                    |
| `reporterLogin`    | string | **sim**     | Login (handle) de quem reporta — o **mesmo login** do release-notes. |
| `description`      | string | não         | Descrição livre do problema.                                        |
| `url`              | string | não         | URL da tela/rota onde o erro ocorreu.                               |
| `stepsToReproduce` | string | não         | Passo a passo para reproduzir (use `\n` para quebras de linha).     |

> **`reporterLogin`**: se o login ainda não existir como usuário no release-notes,
> um usuário novo é criado automaticamente (papel `CLIENT`, nome igual ao login).

### Resposta `201 Created` *(ou `200`)*

Retorna a issue criada:

```json
{
  "_id": "6660b7c8d9e0f1a2b3c4d5e6",
  "title": "Erro ao salvar pedido",
  "description": "Tela trava ao confirmar o pedido.",
  "status": "BACKLOG",
  "releaseId": "665f1a2b3c4d5e6f7a8b9c0d",
  "commentId": null,
  "prUrl": "",
  "archived": false,
  "archivedAt": null,
  "eventLog": [],
  "bugReport": {
    "url": "https://app.cliente.com/pedidos/123",
    "stepsToReproduce": "1. Abrir pedido\n2. Confirmar\n3. Erro 500",
    "reporterLogin": "joao.silva",
    "reporterName": "joao.silva"
  },
  "createdAt": "2026-05-24T16:42:00.000Z",
  "updatedAt": "2026-05-24T16:42:00.000Z"
}
```

Campos úteis para o integrador:

| Campo       | Descrição                                                       |
| ----------- | --------------------------------------------------------------- |
| `_id`       | ID da issue criada.                                             |
| `releaseId` | ID da release à qual o bug foi vinculado (a última release).    |
| `status`    | Sempre começa em `BACKLOG`.                                     |
| `bugReport` | Dados do bug report exatamente como enviados.                   |

### Exemplo — cURL

```bash
curl -s -X POST "https://<seu-host>/api/public/issues" \
  -H "x-api-key: SUA_CHAVE_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Erro ao salvar pedido",
    "description": "Tela trava ao confirmar o pedido.",
    "url": "https://app.cliente.com/pedidos/123",
    "stepsToReproduce": "1. Abrir pedido\n2. Confirmar\n3. Erro 500",
    "reporterLogin": "joao.silva"
  }'
```

### Exemplo — JavaScript (fetch)

```js
const res = await fetch('https://<seu-host>/api/public/issues', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.RELEASE_NOTES_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Erro ao salvar pedido',
    description: 'Tela trava ao confirmar o pedido.',
    url: window.location.href,        // tela onde o erro ocorreu
    stepsToReproduce: '1. Abrir pedido\n2. Confirmar\n3. Erro 500',
    reporterLogin: usuarioLogado.login
  })
})

if (!res.ok) {
  const erro = await res.json()
  throw new Error(erro.statusMessage || 'Falha ao abrir o bug')
}
const issue = await res.json()
```

Depois de criado, o bug aparece nas telas internas do release-notes com um selo
**🐞 Bug**, vinculado à última release, exibindo a URL, os passos e quem reportou.

---

## Erros

Em caso de erro, a resposta tem status HTTP apropriado e um corpo JSON no formato:

```json
{
  "statusCode": 400,
  "statusMessage": "Campo \"title\" é obrigatório."
}
```

| Status | Quando ocorre                                                            |
| ------ | ------------------------------------------------------------------------ |
| `400`  | Falta campo obrigatório (`title` ou `reporterLogin`) ou body inválido.   |
| `401`  | Header `x-api-key` ausente ou diferente da chave configurada.            |
| `409`  | (Abrir issue) Não há nenhuma release cadastrada para vincular o bug.     |
| `500`  | Erro interno (ex.: banco indisponível).                                  |

---

## Notas

- **Sem rate limiting** no momento — evite chamadas em loop sem necessidade.
- `createdAt`/`updatedAt` são sempre **UTC** (ISO 8601). Converta para o fuso do
  usuário no frontend do sistema integrador.
- A `description` da release é **Markdown**; renderize adequadamente no dashboard.
- A API de integração é versionada implicitamente pelo prefixo `/api/public`.
  Mudanças incompatíveis futuras serão comunicadas antes de qualquer alteração.

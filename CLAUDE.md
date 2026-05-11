# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install            # instala dependências
cp .env.example .env   # define MONGODB_URI
npm run dev            # dev server em http://localhost:3000 (sobe Nitro + abre conexão Mongoose)
npm run build          # build de produção
npm run preview        # preview do build
npm run generate       # static generation (não recomendado: a app depende de Mongo)
```

Não há suíte de testes configurada.

## Arquitetura

Nuxt 4 full-stack: frontend Vue 3 em `app/` e backend Nitro em `server/` (raiz do projeto, **não** dentro de `app/`).

### Fluxo de dados

`Release` (versão) → tem N `Comment` (feedback do cliente) → cada Comment pode ser **convertido** em `Issue` (tarefa rastreável). A Issue guarda `releaseId` e `commentId` para preservar a origem. Esse fluxo de conversão é o ponto central do produto — é implementado em `app/pages/releases/[id].vue` (botão "Abrir Issue" no `CommentItem`) abrindo um `IssueForm` pré-preenchido com `title = "Feedback de <autor>"`, `description = comment.content` e os IDs vinculados.

### Backend (Nitro)

- `server/plugins/mongoose.ts` conecta no Mongo na subida do servidor lendo `runtimeConfig.mongodbUri`. Usa guard `readyState >= 1` para sobreviver a HMR — **não** abrir/fechar conexão por request.
- Modelos em `server/models/` usam o pattern `models.X || model('X', schema)` para evitar `OverwriteModelError` em dev.
- Rotas em `server/api/` seguem o file-based routing do Nitro com sufixos por método: `index.get.ts`, `index.post.ts`, `[id].put.ts`, `[id].patch.ts`, `[id].delete.ts`.
- **Imports server-side usam caminhos relativos** (`../../models/Release`) — não há alias `~~/` configurado.
- Validação de ObjectId centralizada em `server/utils/validate.ts` (`assertObjectId`). Erros são lançados com `createError({ statusCode, statusMessage })`.
- O enum de status de Issue vive em `server/models/Issue.ts` como `ISSUE_STATUSES` — ao mudar valores, atualizar também `app/types/index.ts` (`IssueStatus`) e o `<select>` em `IssueForm.vue` / `IssueCard.vue`.

### Frontend (`app/`)

- Stores Pinia em `app/stores/` são auto-importadas. A `session` store usa `persist: true` (papel ADMIN/CLIENT salvo em localStorage). A persistência é registrada em `app/plugins/pinia-persist.client.ts` — **client-only** (`.client.ts`), pois usa `localStorage`.
- "Auth" é apenas escolha de papel — não há JWT, cookie de sessão ou middleware no server. Toda checagem de papel acontece no client (`session.isAdmin` esconde botões). Antes de produção, isso precisa ser substituído por auth real.
- **Formulários são componentes independentes em `app/components/forms/`** (`ReleaseForm`, `CommentForm`, `IssueForm`). Eles emitem `submit`/`cancel` — quem chama decide se invoca POST ou PUT e se está dentro de modal ou página. `IssueForm` aceita prop `initial` justamente para o fluxo de conversão.
- `UiModal.vue` é um modal genérico com `v-model` + `Teleport to="body"` + fechamento por ESC. Reaproveitado por todas as ações de criar/editar.
- Tailwind: utilitários componentizados em `app/assets/css/main.css` via `@layer components` — usar `.btn-primary`, `.btn-secondary`, `.input`, `.label`, `.card`, `.badge` em vez de repetir as classes utilitárias. Cor de marca em `tailwind.config.js` (`brand.500` etc.).
- Tipos compartilhados em `app/types/index.ts` espelham os schemas Mongoose após serialização (`_id: string`).
- Descrição da release é renderizada como markdown com `marked` em `app/pages/releases/[id].vue` (`marked.parse(desc, { async: false })`).

### Pontos de atenção

- Ao deletar uma Release, `[id].delete.ts` também apaga os Comments atrelados (cascade manual). Issues vinculadas **não** são apagadas — o `releaseId` continua referenciando um doc que não existe mais.
- Em `server/api/comments/index.get.ts`, `releaseId` na query é **obrigatório** para evitar dump da coleção inteira.
- Ao adicionar uma store nova que precise persistir, ela só funciona no client (o plugin é `.client.ts`).

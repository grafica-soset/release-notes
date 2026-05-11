# Release & Issue Tracker

Aplicação Nuxt 4 (Frontend + Backend via Nitro) para publicar releases,
receber feedback do cliente e converter comentários em issues.

## Stack

- **Nuxt 4** (Vue 3, Vite, Nitro server)
- **Tailwind CSS** (`@nuxtjs/tailwindcss`)
- **Pinia** + `pinia-plugin-persistedstate`
- **MongoDB** via **Mongoose**
- **marked** para renderização markdown na descrição da release

## Setup

```bash
npm install
cp .env.example .env   # defina MONGODB_URI se necessário
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura

```
app/
├── app.vue
├── assets/css/main.css        # diretivas Tailwind + utilitários
├── components/
│   ├── AppHeader.vue
│   ├── CommentItem.vue
│   ├── IssueCard.vue
│   ├── ReleaseCard.vue
│   ├── UiModal.vue
│   └── forms/
│       ├── CommentForm.vue
│       ├── IssueForm.vue
│       └── ReleaseForm.vue
├── layouts/default.vue
├── pages/
│   ├── index.vue
│   ├── issues/index.vue
│   └── releases/
│       ├── [id].vue
│       └── index.vue
├── plugins/pinia-persist.client.ts
├── stores/
│   ├── issues.ts
│   ├── releases.ts
│   └── session.ts
└── types/index.ts

server/
├── api/
│   ├── comments/
│   │   ├── [id].delete.ts
│   │   ├── index.get.ts
│   │   └── index.post.ts
│   ├── issues/
│   │   ├── [id].delete.ts
│   │   ├── [id].patch.ts
│   │   ├── index.get.ts
│   │   └── index.post.ts
│   └── releases/
│       ├── [id].delete.ts
│       ├── [id].get.ts
│       ├── [id].put.ts
│       ├── index.get.ts
│       └── index.post.ts
├── models/
│   ├── Comment.ts
│   ├── Issue.ts
│   └── Release.ts
├── plugins/mongoose.ts
└── utils/validate.ts
```

## Fluxo do usuário

1. **Admin** entra (no header) → cria uma release.
2. **Cliente** acessa a página de uma release e deixa um comentário.
3. **Admin** clica em "Abrir Issue" ao lado do comentário → o `IssueForm`
   abre pré-preenchido (title/description/releaseId/commentId) e gera uma
   issue rastreável.
4. **Admin** gerencia o status das issues (Backlog / Em andamento / Fechada)
   na página `/issues`.

## Endpoints da API

| Método | Rota                       | Descrição                                   |
| ------ | -------------------------- | ------------------------------------------- |
| GET    | `/api/releases`            | Lista todas as releases                     |
| POST   | `/api/releases`            | Cria release                                |
| GET    | `/api/releases/:id`        | Detalhe de uma release                      |
| PUT    | `/api/releases/:id`        | Atualiza release                            |
| DELETE | `/api/releases/:id`        | Remove release (+ comentários atrelados)    |
| GET    | `/api/comments?releaseId=` | Lista comentários de uma release            |
| POST   | `/api/comments`            | Cria comentário                             |
| DELETE | `/api/comments/:id`        | Remove comentário                           |
| GET    | `/api/issues`              | Lista issues (filtros opcionais por status) |
| POST   | `/api/issues`              | Cria issue (manual ou a partir de comment)  |
| PATCH  | `/api/issues/:id`          | Atualização parcial (status etc.)           |
| DELETE | `/api/issues/:id`          | Remove issue                                |

## Notas

- A "autenticação" é apenas uma escolha de papel (Admin / Cliente) salva
  no `localStorage` via Pinia — substitua por uma camada real (JWT, sessões)
  antes de produção.
- Em `npm run dev`, o `server/plugins/mongoose.ts` conecta automaticamente
  no `MONGODB_URI`. Verifique o log do terminal.

<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import { useIssuesStore } from '~/stores/issues'
import { useSessionStore } from '~/stores/session'
import type { CommentNotification, Issue, IssueStatus } from '~/types'

useHead({ title: 'Notificações' })

const notifications = useNotificationsStore()
const issues = useIssuesStore()
const session = useSessionStore()

// Página só faz sentido para admin — cliente é redirecionado.
if (import.meta.client && !session.isAdmin) {
  await navigateTo('/')
}

await notifications.fetch()

// --- Modal de criação de issue a partir do comentário ---
const showIssueModal = ref(false)
const issueDraft = ref<Partial<Issue> | null>(null)
const sourceId = ref<string | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)

function openIssueFromNotification(n: CommentNotification) {
  sourceId.value = n._id
  issueDraft.value = {
    title: `Feedback de ${n.authorName}`,
    description: n.content,
    status: 'BACKLOG',
    releaseId: n.targetReleaseId,
    commentId: n._id
  }
  formError.value = null
  showIssueModal.value = true
}

async function submitIssue(payload: {
  title: string
  description: string
  prUrl: string
  status: IssueStatus
  releaseId: string | null
  commentId: string | null
}) {
  submitting.value = true
  formError.value = null
  try {
    await issues.create(payload)
    // Issue criada = comentário tratado: arquiva a notificação.
    if (sourceId.value) await notifications.archive(sourceId.value)
    showIssueModal.value = false
    issueDraft.value = null
    sourceId.value = null
  } catch (e: any) {
    formError.value = e?.statusMessage || e?.data?.message || 'Erro ao criar issue.'
  } finally {
    submitting.value = false
  }
}

async function archive(n: CommentNotification) {
  await notifications.archive(n._id)
}

async function archiveAll() {
  if (!notifications.count) return
  if (!confirm('Arquivar todas as notificações?')) return
  await notifications.archiveAll()
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

function contextLabel(n: CommentNotification) {
  if (n.issueTitle) return `Issue · ${n.issueTitle}`
  if (n.releaseVersion) return `Release ${n.releaseVersion}`
  return 'Comentário'
}

function contextLink(n: CommentNotification) {
  if (n.releaseId) return `/releases/${n.releaseId}`
  return null
}
</script>

<template>
  <section>
    <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Notificações</h1>
        <p class="text-sm text-slate-500">
          Novos comentários de clientes aguardando sua resposta.
        </p>
      </div>
      <button
        v-if="notifications.count"
        class="btn-secondary self-start sm:self-auto"
        @click="archiveAll"
      >
        Arquivar todas
      </button>
    </header>

    <p v-if="notifications.loading" class="text-sm text-slate-500">Carregando…</p>
    <p v-else-if="notifications.error" class="text-sm text-red-600">{{ notifications.error }}</p>

    <div
      v-else-if="!notifications.items.length"
      class="card p-10 text-center text-slate-500"
    >
      <p class="text-3xl mb-2">🎉</p>
      <p class="text-sm">Nenhuma notificação pendente. Tudo em dia!</p>
    </div>

    <ul v-else class="space-y-3">
      <li v-for="n in notifications.items" :key="n._id" class="card p-4">
        <div class="flex gap-3">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold"
          >
            {{ initials(n.authorName) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="font-medium text-slate-800 text-sm">{{ n.authorName }}</span>
              <NuxtLink
                v-if="contextLink(n)"
                :to="contextLink(n)!"
                class="badge bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                {{ contextLabel(n) }}
              </NuxtLink>
              <span v-else class="badge bg-slate-100 text-slate-600">{{ contextLabel(n) }}</span>
              <time class="text-xs text-slate-400">{{ formatDateTime(n.createdAt) }}</time>
            </div>
            <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ n.content }}</p>

            <div class="flex flex-wrap items-center gap-2 mt-3">
              <button class="btn-primary !py-1 !px-3 text-xs" @click="openIssueFromNotification(n)">
                Abrir Issue
              </button>
              <button
                class="btn-secondary !py-1 !px-3 text-xs"
                title="Marcar como tratada"
                @click="archive(n)"
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- Modal: criar issue a partir do comentário -->
    <UiModal v-model="showIssueModal" title="Abrir issue a partir do comentário">
      <p v-if="formError" class="mb-3 text-sm text-red-600">{{ formError }}</p>
      <IssueForm
        v-if="issueDraft"
        :key="sourceId ?? 'new'"
        :initial="issueDraft"
        :submitting="submitting"
        @submit="submitIssue"
        @cancel="showIssueModal = false"
      />
    </UiModal>
  </section>
</template>

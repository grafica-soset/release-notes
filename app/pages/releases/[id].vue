<script setup lang="ts">
import { marked } from 'marked'
import { useReleasesStore } from '~/stores/releases'
import { useIssuesStore } from '~/stores/issues'
import { useSessionStore } from '~/stores/session'
import type { Comment, Issue, IssueStatus } from '~/types'

const route = useRoute()
const router = useRouter()

const releaseId = computed(() => route.params.id as string)

const releases = useReleasesStore()
const issues = useIssuesStore()
const session = useSessionStore()

// Detalhe + lista global de issues (para alimentar o seletor do form de edição).
await Promise.all([releases.fetchOne(releaseId.value), issues.fetchAll()])

useHead(() => ({
  title: releases.current ? `Release ${releases.current.version}` : 'Release'
}))

// --- Modal de edição da release ---
const showReleaseForm = ref(false)
const releaseSubmitting = ref(false)
const releaseError = ref<string | null>(null)

async function submitReleaseEdit(payload: {
  version: string
  description: string
  prUrl: string
  issueIds: string[]
}) {
  releaseSubmitting.value = true
  releaseError.value = null
  try {
    await releases.update(releaseId.value, payload)
    await issues.fetchAll()
    showReleaseForm.value = false
  } catch (e: any) {
    releaseError.value = e?.statusMessage || e?.data?.message || 'Erro ao salvar release.'
  } finally {
    releaseSubmitting.value = false
  }
}

// --- Modal de issue (criar a partir de comentário, editar, visualizar) ---
type IssueMode = 'create-from-comment' | 'edit' | 'view'
const showIssueModal = ref(false)
const issueMode = ref<IssueMode>('view')
const issueDraft = ref<Partial<Issue> | null>(null)
const issueEditingId = ref<string | null>(null)
const issueSubmitting = ref(false)
const issueError = ref<string | null>(null)

function openIssueFromComment(comment: Comment) {
  issueMode.value = 'create-from-comment'
  issueEditingId.value = null
  issueDraft.value = {
    title: `Feedback de ${comment.authorName}`,
    description: comment.content,
    status: 'BACKLOG',
    releaseId: releaseId.value,
    commentId: comment._id
  }
  issueError.value = null
  showIssueModal.value = true
}

function openIssue(issue: Issue) {
  issueMode.value = session.isAdmin ? 'edit' : 'view'
  issueEditingId.value = issue._id
  issueDraft.value = { ...issue }
  issueError.value = null
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
  issueSubmitting.value = true
  issueError.value = null
  try {
    if (issueEditingId.value) {
      await issues.update(issueEditingId.value, payload)
    } else {
      await issues.create(payload)
    }
    showIssueModal.value = false
    await releases.fetchOne(releaseId.value)
  } catch (e: any) {
    issueError.value = e?.statusMessage || e?.data?.message || 'Erro ao salvar issue.'
  } finally {
    issueSubmitting.value = false
  }
}

// Markdown.
const renderedDescription = computed(() => {
  const desc = releases.current?.description ?? ''
  if (!desc.trim()) return ''
  return marked.parse(desc, { async: false }) as string
})

const linkedIssues = computed<Issue[]>(() => (releases.current?.issueIds as Issue[]) ?? [])

const statusBadge: Record<IssueStatus, string> = {
  BACKLOG: 'bg-slate-200 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  CLOSED: 'bg-emerald-100 text-emerald-700'
}
const statusLabel: Record<IssueStatus, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'Em andamento',
  CLOSED: 'Fechada'
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : ''

const issueModalTitle = computed(() => {
  if (issueMode.value === 'create-from-comment') return 'Abrir issue a partir do comentário'
  if (issueMode.value === 'edit') return 'Editar issue'
  return 'Detalhes da issue'
})
</script>

<template>
  <section v-if="releases.current">
    <button class="text-sm text-slate-500 hover:underline mb-4" @click="router.back()">
      ← Voltar
    </button>

    <!-- Topo: detalhes da release -->
    <article class="card p-6 mb-8">
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div class="flex items-center gap-3">
          <span class="badge bg-brand-100 text-brand-700 text-base !px-3 !py-1">
            {{ releases.current.version }}
          </span>
          <time class="text-sm text-slate-500">
            Publicada em {{ formatDate(releases.current.createdAt) }}
          </time>
        </div>
        <div class="flex items-center gap-2">
          <a
            v-if="releases.current.prUrl"
            :href="releases.current.prUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary"
          >
            Ver Pull Request ↗
          </a>
          <button
            v-if="session.isAdmin"
            class="btn-secondary"
            @click="(releaseError = null), (showReleaseForm = true)"
          >
            Editar
          </button>
        </div>
      </header>

      <div
        v-if="renderedDescription"
        class="prose prose-sm max-w-none text-slate-700"
        v-html="renderedDescription"
      />
      <p v-else class="text-sm text-slate-500 italic">Sem descrição.</p>
    </article>

    <!-- Issues vinculadas -->
    <section v-if="linkedIssues.length || session.isAdmin" class="mb-8">
      <h2 class="text-lg font-semibold text-slate-800 mb-3">
        Issues nesta release
        <span class="text-sm text-slate-400 font-normal">({{ linkedIssues.length }})</span>
      </h2>

      <div v-if="linkedIssues.length" class="grid gap-2 sm:grid-cols-2">
        <button
          v-for="issue in linkedIssues"
          :key="issue._id"
          type="button"
          class="card p-3 text-left hover:border-brand-200 transition"
          @click="openIssue(issue)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-slate-800 truncate">{{ issue.title }}</span>
            <span class="badge shrink-0" :class="statusBadge[issue.status]">
              {{ statusLabel[issue.status] }}
            </span>
          </div>
          <a
            v-if="issue.prUrl"
            :href="issue.prUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-brand-600 hover:underline mt-1 inline-block"
            @click.stop
          >
            PR ↗
          </a>
        </button>
      </div>
      <p v-else class="text-sm text-slate-500">
        Nenhuma issue vinculada — edite a release para incluir issues.
      </p>
    </section>

    <!-- Timeline de comentários da Release -->
    <section class="card p-5">
      <CommentTimeline
        :release-id="releaseId"
        :show-convert-action="session.isAdmin"
        :can-remove="session.isAdmin"
        @convert="openIssueFromComment"
      />
    </section>

    <!-- Modal: edição da release -->
    <UiModal v-model="showReleaseForm" title="Editar release">
      <p v-if="releaseError" class="mb-3 text-sm text-red-600">{{ releaseError }}</p>
      <ReleaseForm
        :initial="releases.current"
        :available-issues="issues.issues"
        :submitting="releaseSubmitting"
        @submit="submitReleaseEdit"
        @cancel="showReleaseForm = false"
      />
    </UiModal>

    <!-- Modal: issue (criar/editar/visualizar) + timeline da issue -->
    <UiModal v-model="showIssueModal" :title="issueModalTitle">
      <p v-if="issueError" class="mb-3 text-sm text-red-600">{{ issueError }}</p>
      <IssueForm
        v-if="issueDraft"
        :key="issueEditingId ?? 'new'"
        :initial="issueDraft"
        :submitting="issueSubmitting"
        :readonly="issueMode === 'view'"
        @submit="submitIssue"
        @cancel="showIssueModal = false"
      />

      <!-- Timeline da issue só aparece em edit/view (issue já existente). -->
      <div v-if="issueEditingId" class="border-t border-slate-200 pt-5 mt-6">
        <CommentTimeline
          :issue-id="issueEditingId"
          :show-convert-action="session.isAdmin"
          :can-remove="session.isAdmin"
          @convert="openIssueFromComment"
        />
      </div>
    </UiModal>
  </section>

  <section v-else-if="releases.loading" class="text-sm text-slate-500">Carregando…</section>
  <section v-else-if="releases.error" class="text-sm text-red-600">{{ releases.error }}</section>
</template>

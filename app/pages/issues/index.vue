<script setup lang="ts">
import { useIssuesStore } from '~/stores/issues'
import { useSessionStore } from '~/stores/session'
import type { Comment, Issue, IssueStatus } from '~/types'

useHead({ title: 'Issues' })

const store = useIssuesStore()
const session = useSessionStore()

await store.fetchAll()

// --- Modal ---
type Mode = 'create' | 'edit' | 'view' | 'create-from-comment'
const mode = ref<Mode>('create')
const showForm = ref(false)
const editing = ref<Issue | null>(null)
const draft = ref<Partial<Issue> | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)

function openCreate() {
  mode.value = 'create'
  editing.value = null
  draft.value = null
  formError.value = null
  showForm.value = true
}

function openIssue(issue: Issue) {
  // Admin edita; cliente apenas visualiza, mas pode comentar via timeline.
  mode.value = session.isAdmin ? 'edit' : 'view'
  editing.value = issue
  draft.value = null
  formError.value = null
  showForm.value = true
}

function openIssueFromComment(comment: Comment) {
  // Admin abrindo nova issue a partir de um comentário (timeline da issue atual).
  const parentReleaseId = editing.value?.releaseId ?? null
  mode.value = 'create-from-comment'
  editing.value = null
  draft.value = {
    title: `Feedback de ${comment.authorName}`,
    description: comment.content,
    status: 'BACKLOG',
    releaseId: parentReleaseId,
    commentId: comment._id
  }
  formError.value = null
  showForm.value = true
}

async function handleSubmit(payload: {
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
    if (mode.value === 'edit' && editing.value) {
      await store.update(editing.value._id, payload)
    } else {
      await store.create(payload)
    }
    showForm.value = false
    draft.value = null
  } catch (e: any) {
    formError.value = e?.statusMessage || e?.data?.message || 'Erro ao salvar issue.'
  } finally {
    submitting.value = false
  }
}

async function updateStatus(id: string, status: IssueStatus) {
  await store.updateStatus(id, status)
}

async function remove(id: string) {
  if (!confirm('Excluir esta issue?')) return
  await store.remove(id)
}

const columns: { status: IssueStatus; label: string; color: string }[] = [
  { status: 'BACKLOG', label: 'Backlog', color: 'bg-slate-200 text-slate-700' },
  { status: 'IN_PROGRESS', label: 'Em andamento', color: 'bg-amber-100 text-amber-700' },
  { status: 'CLOSED', label: 'Fechadas', color: 'bg-emerald-100 text-emerald-700' }
]

function columnIssues(status: IssueStatus): Issue[] {
  return store.byStatus(status)
}

const modalTitle = computed(() => {
  if (mode.value === 'create') return 'Nova issue'
  if (mode.value === 'create-from-comment') return 'Abrir issue a partir do comentário'
  if (mode.value === 'edit') return 'Editar issue'
  return 'Detalhes da issue'
})

const formInitial = computed(() => editing.value ?? draft.value ?? undefined)
const formKey = computed(() => editing.value?._id ?? (mode.value === 'create-from-comment' ? 'from-comment' : 'new'))
</script>

<template>
  <section>
    <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Issues</h1>
        <p class="text-sm text-slate-500">
          Tarefas e problemas derivados do feedback dos clientes.
        </p>
      </div>
      <button
        v-if="session.isAdmin"
        class="btn-primary self-start sm:self-auto"
        @click="openCreate"
      >
        + Nova issue
      </button>
    </header>

    <p v-if="store.loading" class="text-sm text-slate-500">Carregando…</p>
    <p v-else-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>

    <div v-else class="grid gap-4 md:grid-cols-3">
      <div v-for="col in columns" :key="col.status" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="badge" :class="col.color">{{ col.label }}</span>
          <span class="text-xs text-slate-400">{{ columnIssues(col.status).length }}</span>
        </div>

        <div class="space-y-2 min-h-[100px]">
          <IssueCard
            v-for="issue in columnIssues(col.status)"
            :key="issue._id"
            :issue="issue"
            :can-manage="session.isAdmin"
            @update-status="updateStatus"
            @edit="openIssue"
            @remove="remove"
          />
          <p
            v-if="!columnIssues(col.status).length"
            class="text-xs text-slate-400 italic px-2 py-4 text-center border border-dashed border-slate-200 rounded-md"
          >
            Sem issues
          </p>
        </div>
      </div>
    </div>

    <UiModal v-model="showForm" :title="modalTitle">
      <p v-if="formError" class="mb-3 text-sm text-red-600">{{ formError }}</p>
      <IssueForm
        :key="formKey"
        :initial="formInitial"
        :submitting="submitting"
        :readonly="mode === 'view'"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />

      <!-- Timeline só faz sentido em edit/view (issue persistida). -->
      <div v-if="editing?._id" class="border-t border-slate-200 pt-5 mt-6">
        <CommentTimeline
          :issue-id="editing._id"
          :show-convert-action="session.isAdmin"
          :can-remove="session.isAdmin"
          @convert="openIssueFromComment"
        />
      </div>
    </UiModal>
  </section>
</template>

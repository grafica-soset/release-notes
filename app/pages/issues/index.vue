<script setup lang="ts">
import { useIssuesStore } from '~/stores/issues'
import { useSessionStore } from '~/stores/session'
import type { Issue, IssueStatus } from '~/types'

useHead({ title: 'Issues' })

const store = useIssuesStore()
const session = useSessionStore()

await store.fetchAll()

// --- Criação manual de issue ---
const showForm = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)

async function handleCreate(payload: {
  title: string
  description: string
  status: IssueStatus
  releaseId: string | null
  commentId: string | null
}) {
  submitting.value = true
  formError.value = null
  try {
    await store.create(payload)
    showForm.value = false
  } catch (e: any) {
    formError.value = e?.statusMessage || 'Erro ao criar issue.'
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

// Agrupamento por status para exibição em colunas (estilo Kanban).
const columns: { status: IssueStatus; label: string; color: string }[] = [
  { status: 'BACKLOG', label: 'Backlog', color: 'bg-slate-200 text-slate-700' },
  { status: 'IN_PROGRESS', label: 'Em andamento', color: 'bg-amber-100 text-amber-700' },
  { status: 'CLOSED', label: 'Fechadas', color: 'bg-emerald-100 text-emerald-700' }
]

function columnIssues(status: IssueStatus): Issue[] {
  return store.byStatus(status)
}
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
        @click="showForm = true"
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
            @update-status="updateStatus"
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

    <UiModal v-model="showForm" title="Nova issue">
      <p v-if="formError" class="mb-3 text-sm text-red-600">{{ formError }}</p>
      <IssueForm
        :submitting="submitting"
        @submit="handleCreate"
        @cancel="showForm = false"
      />
    </UiModal>
  </section>
</template>

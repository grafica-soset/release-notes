<script setup lang="ts">
import type { Issue, IssueStatus } from '~/types'

withDefaults(
  defineProps<{
    issue: Issue
    /** Habilita ações de admin (mudar status, excluir). */
    canManage?: boolean
  }>(),
  { canManage: false }
)

const emit = defineEmits<{
  'update-status': [id: string, status: IssueStatus]
  edit: [issue: Issue]
  remove: [id: string]
}>()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  })

const statusLabel: Record<IssueStatus, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'Em andamento',
  CLOSED: 'Fechada'
}
const statusBadge: Record<IssueStatus, string> = {
  BACKLOG: 'bg-slate-200 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  CLOSED: 'bg-emerald-100 text-emerald-700'
}
</script>

<template>
  <article class="card p-4 flex flex-col gap-2">
    <header class="flex items-start justify-between gap-2">
      <button
        type="button"
        class="font-medium text-slate-800 text-sm text-left hover:underline"
        @click="emit('edit', issue)"
      >
        {{ issue.title }}
      </button>
      <time class="text-xs text-slate-400 shrink-0">{{ formatDate(issue.createdAt) }}</time>
    </header>

    <p v-if="issue.description" class="text-xs text-slate-600 line-clamp-3 whitespace-pre-wrap">
      {{ issue.description }}
    </p>

    <a
      v-if="issue.prUrl"
      :href="issue.prUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="text-xs text-brand-600 hover:underline truncate"
    >
      PR ↗
    </a>

    <footer class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
      <select
        v-if="canManage"
        :value="issue.status"
        class="input !py-1 !px-2 text-xs w-auto"
        @change="emit('update-status', issue._id, ($event.target as HTMLSelectElement).value as IssueStatus)"
      >
        <option value="BACKLOG">Backlog</option>
        <option value="IN_PROGRESS">Em andamento</option>
        <option value="CLOSED">Fechada</option>
      </select>
      <span v-else class="badge text-[10px]" :class="statusBadge[issue.status]">
        {{ statusLabel[issue.status] }}
      </span>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="text-xs text-brand-600 hover:underline"
          @click="emit('edit', issue)"
        >
          {{ canManage ? 'Editar' : 'Detalhes' }}
        </button>
        <button
          v-if="canManage"
          type="button"
          class="text-xs text-red-600 hover:underline"
          @click="emit('remove', issue._id)"
        >
          Excluir
        </button>
      </div>
    </footer>
  </article>
</template>

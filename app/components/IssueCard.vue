<script setup lang="ts">
import type { Issue, IssueStatus } from '~/types'

const props = withDefaults(
  defineProps<{
    issue: Issue
    /** Habilita ações de admin (mudar status, arquivar, excluir). */
    canManage?: boolean
    /** Habilita o botão de aprovação do cliente. */
    canApprove?: boolean
  }>(),
  { canManage: false, canApprove: false }
)

const emit = defineEmits<{
  'update-status': [id: string, status: IssueStatus]
  edit: [issue: Issue]
  remove: [id: string]
  approve: [issue: Issue]
  archive: [issue: Issue]
}>()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  })

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

// Último evento relevante (aprovação/arquivamento) para exibir no card.
const lastEvent = computed(() => props.issue.eventLog?.[props.issue.eventLog.length - 1] ?? null)
const lastEventLabel = computed(() => {
  const ev = lastEvent.value
  if (!ev) return ''
  const who = ev.userName || ev.userLogin || 'usuário'
  const verb = ev.type === 'APPROVED' ? 'Aprovado' : 'Arquivado'
  return `${verb} por ${who} · ${formatDateTime(ev.at)}`
})
</script>

<template>
  <article class="card p-4 flex flex-col gap-2" :class="{ 'opacity-80': issue.archived }">
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

    <!-- Resumo do event log (aprovação/arquivamento). -->
    <p
      v-if="lastEventLabel"
      class="text-[11px] flex items-center gap-1"
      :class="lastEvent?.type === 'APPROVED' ? 'text-emerald-700' : 'text-slate-500'"
    >
      <span aria-hidden="true">{{ lastEvent?.type === 'APPROVED' ? '✓' : '📦' }}</span>
      {{ lastEventLabel }}
    </p>

    <footer class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
      <template v-if="!issue.archived">
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
      </template>
      <span v-else class="badge text-[10px] bg-slate-200 text-slate-600">Arquivada</span>

      <div class="flex items-center gap-3">
        <button
          v-if="canApprove && !issue.archived"
          type="button"
          class="text-xs font-medium text-emerald-700 hover:underline"
          @click="emit('approve', issue)"
        >
          Aprovar
        </button>
        <button
          v-if="canManage && !issue.archived"
          type="button"
          class="text-xs text-slate-600 hover:underline"
          @click="emit('archive', issue)"
        >
          Arquivar
        </button>
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

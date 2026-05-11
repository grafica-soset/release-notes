<script setup lang="ts">
import type { Issue, IssueStatus } from '~/types'

defineProps<{ issue: Issue }>()
const emit = defineEmits<{
  'update-status': [id: string, status: IssueStatus]
  remove: [id: string]
}>()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  })
</script>

<template>
  <article class="card p-4 flex flex-col gap-2">
    <header class="flex items-start justify-between gap-2">
      <h3 class="font-medium text-slate-800 text-sm">{{ issue.title }}</h3>
      <time class="text-xs text-slate-400 shrink-0">{{ formatDate(issue.createdAt) }}</time>
    </header>
    <p v-if="issue.description" class="text-xs text-slate-600 line-clamp-3 whitespace-pre-wrap">
      {{ issue.description }}
    </p>

    <footer class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
      <select
        :value="issue.status"
        class="input !py-1 !px-2 text-xs w-auto"
        @change="emit('update-status', issue._id, ($event.target as HTMLSelectElement).value as IssueStatus)"
      >
        <option value="BACKLOG">Backlog</option>
        <option value="IN_PROGRESS">Em andamento</option>
        <option value="CLOSED">Fechada</option>
      </select>
      <button
        class="text-xs text-red-600 hover:underline"
        @click="emit('remove', issue._id)"
      >
        Excluir
      </button>
    </footer>
  </article>
</template>

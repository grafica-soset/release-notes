<script setup lang="ts">
import type { Comment } from '~/types'

defineProps<{
  comment: Comment
  showConvertAction?: boolean
  canRemove?: boolean
}>()

const emit = defineEmits<{
  convert: [comment: Comment]
  remove: [comment: Comment]
}>()

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <article class="flex gap-3">
    <div
      class="shrink-0 w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold"
    >
      {{ initials(comment.authorName) }}
    </div>
    <div class="flex-1 card p-4">
      <header class="flex items-center justify-between gap-2 mb-1">
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-800 text-sm">{{ comment.authorName }}</span>
          <time class="text-xs text-slate-400">{{ formatDateTime(comment.createdAt) }}</time>
        </div>
        <div class="flex items-center gap-1">
          <button
            v-if="showConvertAction"
            class="btn-secondary !py-1 !px-2 text-xs"
            @click="emit('convert', comment)"
          >
            Abrir Issue
          </button>
          <button
            v-if="canRemove"
            class="btn-ghost !py-1 !px-2 text-xs text-red-600 hover:bg-red-50"
            title="Remover comentário"
            @click="emit('remove', comment)"
          >
            ✕
          </button>
        </div>
      </header>
      <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ comment.content }}</p>
    </div>
  </article>
</template>

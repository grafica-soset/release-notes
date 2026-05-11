<script setup lang="ts">
import type { Release } from '~/types'

defineProps<{ release: Release }>()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
</script>

<template>
  <NuxtLink
    :to="`/releases/${release._id}`"
    class="flex items-start sm:items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
  >
    <span class="badge bg-brand-100 text-brand-700 shrink-0">{{ release.version }}</span>
    <p class="flex-1 text-sm text-slate-600 line-clamp-1 whitespace-pre-line">
      {{ release.description || 'Sem descrição.' }}
    </p>
    <a
      v-if="release.prUrl"
      :href="release.prUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="hidden sm:inline text-xs text-brand-600 hover:underline shrink-0"
      @click.stop
    >
      PR ↗
    </a>
    <time class="text-xs text-slate-400 shrink-0">{{ formatDate(release.createdAt) }}</time>
  </NuxtLink>
</template>

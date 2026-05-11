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
    class="card p-5 hover:shadow-md hover:border-brand-200 transition-all block"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="badge bg-brand-100 text-brand-700">{{ release.version }}</span>
        <p class="mt-2 text-sm text-slate-600 line-clamp-2 whitespace-pre-line">
          {{ release.description || 'Sem descrição.' }}
        </p>
      </div>
      <time class="text-xs text-slate-400 shrink-0">{{ formatDate(release.createdAt) }}</time>
    </div>
    <div v-if="release.prUrl" class="mt-3 text-xs">
      <a
        :href="release.prUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-brand-600 hover:underline"
        @click.stop
      >
        Ver Pull Request ↗
      </a>
    </div>
  </NuxtLink>
</template>

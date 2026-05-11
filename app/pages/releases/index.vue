<script setup lang="ts">
import { useReleasesStore } from '~/stores/releases'
import { useSessionStore } from '~/stores/session'

useHead({ title: 'Releases' })

const store = useReleasesStore()
const session = useSessionStore()

const showForm = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)

await store.fetchAll()

async function handleSubmit(payload: { version: string; description: string; prUrl: string }) {
  submitting.value = true
  submitError.value = null
  try {
    await store.create(payload)
    showForm.value = false
  } catch (e: any) {
    submitError.value = e?.statusMessage || 'Erro ao salvar.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section>
    <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Releases</h1>
        <p class="text-sm text-slate-500">Histórico de versões publicadas.</p>
      </div>
      <button
        v-if="session.isAdmin"
        class="btn-primary self-start sm:self-auto"
        @click="showForm = true"
      >
        + Nova release
      </button>
    </header>

    <p v-if="store.loading" class="text-sm text-slate-500">Carregando releases…</p>
    <p v-else-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>

    <div
      v-else-if="store.releases.length"
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <ReleaseCard
        v-for="release in store.releases"
        :key="release._id"
        :release="release"
      />
    </div>

    <div v-else class="card p-10 text-center text-slate-500">
      Nenhuma release cadastrada ainda.
      <p v-if="!session.isAdmin" class="mt-2 text-xs">
        Faça login como Admin para criar a primeira.
      </p>
    </div>

    <UiModal v-model="showForm" title="Nova release">
      <p v-if="submitError" class="mb-3 text-sm text-red-600">{{ submitError }}</p>
      <ReleaseForm
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </UiModal>
  </section>
</template>

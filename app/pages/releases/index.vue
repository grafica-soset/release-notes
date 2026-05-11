<script setup lang="ts">
import { useReleasesStore } from '~/stores/releases'
import { useIssuesStore } from '~/stores/issues'
import { useSessionStore } from '~/stores/session'

useHead({ title: 'Releases' })

const releases = useReleasesStore()
const issues = useIssuesStore()
const session = useSessionStore()

// Carrega releases + lista de issues em paralelo (issues alimentam o seletor
// do ReleaseForm).
await Promise.all([releases.fetchAll(), issues.fetchAll()])

const showForm = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)

function openCreate() {
  submitError.value = null
  showForm.value = true
}

async function handleSubmit(payload: {
  version: string
  description: string
  prUrl: string
  issueIds: string[]
}) {
  submitting.value = true
  submitError.value = null
  try {
    await releases.create(payload)
    // Atualiza store de issues — algumas viraram "vinculadas".
    await issues.fetchAll()
    showForm.value = false
  } catch (e: any) {
    submitError.value = e?.statusMessage || e?.data?.message || 'Erro ao salvar.'
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
        @click="openCreate"
      >
        + Nova release
      </button>
    </header>

    <p v-if="releases.loading" class="text-sm text-slate-500">Carregando releases…</p>
    <p v-else-if="releases.error" class="text-sm text-red-600">{{ releases.error }}</p>

    <div v-else-if="releases.releases.length" class="card divide-y divide-slate-100">
      <ReleaseListItem
        v-for="release in releases.releases"
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
        :available-issues="issues.issues"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import type { Release } from '~/types'

/**
 * Formulário reaproveitável para criação/edição de Release.
 * Pode ser embutido em página ou em modal.
 *
 * Eventos:
 *  - submit(payload) → o pai decide se chama POST ou PUT.
 *  - cancel
 */
const props = defineProps<{
  initial?: Partial<Release>
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { version: string; description: string; prUrl: string }]
  cancel: []
}>()

const form = reactive({
  version: props.initial?.version ?? '',
  description: props.initial?.description ?? '',
  prUrl: props.initial?.prUrl ?? ''
})

const errors = reactive<Record<string, string>>({})

function validate() {
  errors.version = ''
  if (!form.version.trim()) errors.version = 'Informe a versão.'
  if (form.prUrl && !/^https?:\/\//i.test(form.prUrl)) {
    errors.prUrl = 'URL deve começar com http(s)://'
  } else {
    errors.prUrl = ''
  }
  return !errors.version && !errors.prUrl
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    version: form.version.trim(),
    description: form.description,
    prUrl: form.prUrl.trim()
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="label" for="release-version">Versão *</label>
      <input
        id="release-version"
        v-model="form.version"
        type="text"
        placeholder="v1.0.0"
        class="input"
      />
      <p v-if="errors.version" class="mt-1 text-xs text-red-600">{{ errors.version }}</p>
    </div>

    <div>
      <label class="label" for="release-pr">URL do Pull Request</label>
      <input
        id="release-pr"
        v-model="form.prUrl"
        type="url"
        placeholder="https://github.com/org/repo/pull/123"
        class="input"
      />
      <p v-if="errors.prUrl" class="mt-1 text-xs text-red-600">{{ errors.prUrl }}</p>
    </div>

    <div>
      <label class="label" for="release-desc">Descrição (markdown suportado)</label>
      <textarea
        id="release-desc"
        v-model="form.description"
        rows="6"
        placeholder="### O que foi entregue&#10;- Item 1&#10;- Item 2"
        class="input font-mono text-sm"
      />
    </div>

    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
      <button type="button" class="btn-secondary" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="submitting">
        <span v-if="submitting">Salvando…</span>
        <span v-else>Salvar release</span>
      </button>
    </div>
  </form>
</template>

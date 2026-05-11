<script setup lang="ts">
import type { Issue, IssueStatus } from '~/types'

/**
 * Formulário reaproveitável para criação/edição de Issue.
 * Pode ser pré-preenchido (ex: ao converter um comentário em issue) via
 * a prop `initial`, incluindo `releaseId` e `commentId` para rastreabilidade.
 */
const props = defineProps<{
  initial?: Partial<Issue>
  submitting?: boolean
  hideStatus?: boolean
}>()

const emit = defineEmits<{
  submit: [
    payload: {
      title: string
      description: string
      status: IssueStatus
      releaseId: string | null
      commentId: string | null
    }
  ]
  cancel: []
}>()

const form = reactive({
  title: props.initial?.title ?? '',
  description: props.initial?.description ?? '',
  status: (props.initial?.status ?? 'BACKLOG') as IssueStatus,
  releaseId: props.initial?.releaseId ?? null,
  commentId: props.initial?.commentId ?? null
})

const errors = reactive<Record<string, string>>({})

function validate() {
  errors.title = form.title.trim() ? '' : 'Informe um título.'
  return !errors.title
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    title: form.title.trim(),
    description: form.description,
    status: form.status,
    releaseId: form.releaseId,
    commentId: form.commentId
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="label" for="issue-title">Título *</label>
      <input
        id="issue-title"
        v-model="form.title"
        type="text"
        class="input"
        placeholder="Ajustar comportamento do botão X"
      />
      <p v-if="errors.title" class="mt-1 text-xs text-red-600">{{ errors.title }}</p>
    </div>

    <div>
      <label class="label" for="issue-desc">Descrição</label>
      <textarea
        id="issue-desc"
        v-model="form.description"
        rows="5"
        class="input"
        placeholder="Contexto, passos para reproduzir, expectativas..."
      />
    </div>

    <div v-if="!hideStatus">
      <label class="label" for="issue-status">Status</label>
      <select id="issue-status" v-model="form.status" class="input">
        <option value="BACKLOG">Backlog</option>
        <option value="IN_PROGRESS">Em andamento</option>
        <option value="CLOSED">Fechada</option>
      </select>
    </div>

    <!-- Campos de rastreabilidade — visíveis só como readonly se vierem preenchidos. -->
    <div v-if="form.releaseId || form.commentId" class="text-xs text-slate-500 space-y-1">
      <p v-if="form.releaseId">Vinculada à Release: <code>{{ form.releaseId }}</code></p>
      <p v-if="form.commentId">Originada do comentário: <code>{{ form.commentId }}</code></p>
    </div>

    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
      <button type="button" class="btn-secondary" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Salvando…' : 'Salvar issue' }}
      </button>
    </div>
  </form>
</template>

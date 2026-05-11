<script setup lang="ts">
import type { Issue, IssueStatus } from '~/types'

/**
 * Formulário reaproveitável para criação/edição de Issue.
 *
 * - Em criação a partir de comentário: passe `initial` com `title`,
 *   `description`, `releaseId`, `commentId` pré-preenchidos.
 * - Em edição: passe a issue existente em `initial` (inclui `_id` apenas
 *   para que o componente saiba que está editando — o ID em si é controlado
 *   pelo pai).
 */
const props = defineProps<{
  initial?: Partial<Issue>
  submitting?: boolean
  hideStatus?: boolean
  /** Modo somente leitura — usado quando o cliente abre uma issue. */
  readonly?: boolean
}>()

const emit = defineEmits<{
  submit: [
    payload: {
      title: string
      description: string
      prUrl: string
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
  prUrl: props.initial?.prUrl ?? '',
  status: (props.initial?.status ?? 'BACKLOG') as IssueStatus,
  releaseId: props.initial?.releaseId ?? null,
  commentId: props.initial?.commentId ?? null
})

const errors = reactive<Record<string, string>>({})

function validate() {
  errors.title = form.title.trim() ? '' : 'Informe um título.'
  if (form.prUrl && !/^https?:\/\//i.test(form.prUrl)) {
    errors.prUrl = 'URL deve começar com http(s)://'
  } else {
    errors.prUrl = ''
  }
  return !errors.title && !errors.prUrl
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    title: form.title.trim(),
    description: form.description,
    prUrl: form.prUrl.trim(),
    status: form.status,
    releaseId: form.releaseId,
    commentId: form.commentId
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <fieldset :disabled="readonly" class="space-y-4 disabled:opacity-90">
      <div>
        <label class="label" for="issue-title">Título *</label>
        <input
          id="issue-title"
          v-model="form.title"
          type="text"
          class="input"
          :readonly="readonly"
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
          :readonly="readonly"
          placeholder="Contexto, passos para reproduzir, expectativas..."
        />
      </div>

      <div>
        <label class="label" for="issue-pr">URL do Pull Request</label>
        <input
          id="issue-pr"
          v-model="form.prUrl"
          type="url"
          class="input"
          :readonly="readonly"
          placeholder="https://github.com/org/repo/pull/123"
        />
        <p v-if="errors.prUrl" class="mt-1 text-xs text-red-600">{{ errors.prUrl }}</p>
      </div>

      <div v-if="!hideStatus">
        <label class="label" for="issue-status">Status</label>
        <select id="issue-status" v-model="form.status" class="input">
          <option value="BACKLOG">Backlog</option>
          <option value="IN_PROGRESS">Em andamento</option>
          <option value="CLOSED">Fechada</option>
        </select>
      </div>

      <!-- Rastreabilidade — só leitura. -->
      <div v-if="form.releaseId || form.commentId" class="text-xs text-slate-500 space-y-1">
        <p v-if="form.releaseId">Vinculada à Release: <code>{{ form.releaseId }}</code></p>
        <p v-if="form.commentId">Originada do comentário: <code>{{ form.commentId }}</code></p>
      </div>
    </fieldset>

    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
      <button type="button" class="btn-secondary" @click="emit('cancel')">
        {{ readonly ? 'Fechar' : 'Cancelar' }}
      </button>
      <button v-if="!readonly" type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Salvando…' : 'Salvar issue' }}
      </button>
    </div>
  </form>
</template>

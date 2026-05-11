<script setup lang="ts">
import type { Comment } from '~/types'
import { useSessionStore } from '~/stores/session'

/**
 * Timeline reaproveitável de comentários.
 *
 * Pode ser ancorada numa Release (`releaseId`) ou numa Issue (`issueId`).
 * O autor do comentário é sempre o usuário logado — visitantes não logados
 * veem somente leitura.
 *
 * Eventos:
 *  - `convert(comment)` — disparado quando o admin clica "Abrir Issue"
 *    em um comentário. Pode acontecer tanto em timeline de Release quanto
 *    de Issue (o pai decide qual contexto usar ao abrir o form).
 */
const props = withDefaults(
  defineProps<{
    releaseId?: string
    issueId?: string
    /** Mostra ação "Abrir Issue" ao lado de cada comentário (admin). */
    showConvertAction?: boolean
    /** Permite remover comentário (admin). */
    canRemove?: boolean
  }>(),
  { showConvertAction: false, canRemove: false }
)

const emit = defineEmits<{
  convert: [comment: Comment]
}>()

const session = useSessionStore()

const comments = ref<Comment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const submitting = ref(false)
const submitError = ref<string | null>(null)

const fetchParams = computed(() =>
  props.releaseId ? { releaseId: props.releaseId } : { issueId: props.issueId }
)

async function load() {
  if (!props.releaseId && !props.issueId) return
  loading.value = true
  error.value = null
  try {
    comments.value = await $fetch<Comment[]>('/api/comments', { params: fetchParams.value })
  } catch (e: any) {
    error.value = e?.statusMessage || e?.data?.message || 'Erro ao carregar comentários.'
  } finally {
    loading.value = false
  }
}

async function add(payload: { content: string }) {
  if (!session.isLogged) return
  submitting.value = true
  submitError.value = null
  try {
    const created = await $fetch<Comment>('/api/comments', {
      method: 'POST',
      body: { ...payload, authorName: session.name, ...fetchParams.value }
    })
    comments.value.push(created)
  } catch (e: any) {
    submitError.value = e?.statusMessage || e?.data?.message || 'Erro ao enviar comentário.'
  } finally {
    submitting.value = false
  }
}

async function remove(comment: Comment) {
  if (!confirm('Remover este comentário?')) return
  await $fetch(`/api/comments/${comment._id}`, { method: 'DELETE' })
  comments.value = comments.value.filter((c) => c._id !== comment._id)
}

watch(
  () => [props.releaseId, props.issueId],
  () => {
    comments.value = []
    load()
  },
  { immediate: true }
)
</script>

<template>
  <section>
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-medium text-slate-800">
        Comentários
        <span class="text-sm text-slate-400 font-normal">({{ comments.length }})</span>
      </h3>
    </header>

    <p v-if="loading" class="text-sm text-slate-500">Carregando…</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-else-if="comments.length" class="space-y-3 mb-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment._id"
        :comment="comment"
        :show-convert-action="showConvertAction"
        :can-remove="canRemove"
        @convert="emit('convert', $event)"
        @remove="remove"
      />
    </div>
    <p v-else class="text-sm text-slate-500 mb-4">Nenhum comentário ainda.</p>

    <div class="border-t border-slate-100 pt-4">
      <template v-if="session.isLogged">
        <p v-if="submitError" class="mb-2 text-sm text-red-600">{{ submitError }}</p>
        <CommentForm :submitting="submitting" @submit="add" />
      </template>
      <p v-else class="text-sm text-slate-500 italic">
        Entre com seu login para comentar.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Formulário reaproveitável para criação de comentário.
 * `authorName` é pré-preenchido com a sessão atual mas pode ser editado.
 */
const props = defineProps<{
  defaultAuthor?: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { authorName: string; content: string }]
}>()

const form = reactive({
  authorName: props.defaultAuthor ?? '',
  content: ''
})

const errors = reactive<Record<string, string>>({})

watch(
  () => props.defaultAuthor,
  (v) => {
    if (v && !form.authorName) form.authorName = v
  }
)

function validate() {
  errors.authorName = form.authorName.trim() ? '' : 'Informe seu nome.'
  errors.content = form.content.trim() ? '' : 'Escreva um comentário.'
  return !errors.authorName && !errors.content
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    authorName: form.authorName.trim(),
    content: form.content.trim()
  })
  form.content = ''
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="onSubmit">
    <div class="grid sm:grid-cols-3 gap-3">
      <div class="sm:col-span-1">
        <label class="label" for="comment-author">Seu nome</label>
        <input
          id="comment-author"
          v-model="form.authorName"
          class="input"
          placeholder="João Cliente"
        />
        <p v-if="errors.authorName" class="mt-1 text-xs text-red-600">{{ errors.authorName }}</p>
      </div>
      <div class="sm:col-span-2">
        <label class="label" for="comment-content">Comentário</label>
        <textarea
          id="comment-content"
          v-model="form.content"
          rows="3"
          class="input"
          placeholder="Achei que o botão X poderia..."
        />
        <p v-if="errors.content" class="mt-1 text-xs text-red-600">{{ errors.content }}</p>
      </div>
    </div>

    <div class="flex justify-end">
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Enviando…' : 'Enviar comentário' }}
      </button>
    </div>
  </form>
</template>

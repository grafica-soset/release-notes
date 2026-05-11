<script setup lang="ts">
/**
 * Formulário de comentário — apenas o conteúdo, o autor vem da sessão.
 */
defineProps<{ submitting?: boolean }>()

const emit = defineEmits<{
  submit: [payload: { content: string }]
}>()

const content = ref('')
const error = ref('')

function onSubmit() {
  if (!content.value.trim()) {
    error.value = 'Escreva um comentário.'
    return
  }
  error.value = ''
  emit('submit', { content: content.value.trim() })
  content.value = ''
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="onSubmit">
    <div>
      <label class="label" for="comment-content">Comentário</label>
      <textarea
        id="comment-content"
        v-model="content"
        rows="3"
        class="input"
        placeholder="Achei que o botão X poderia..."
      />
      <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
    </div>

    <div class="flex justify-end">
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Enviando…' : 'Enviar comentário' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
/**
 * Modal genérico para reaproveitamento dos formulários.
 * Uso:
 *  <UiModal v-model="open" title="Nova release">
 *    <ReleaseForm @submit="..." @cancel="open = false" />
 *  </UiModal>
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    /**
     * Quando true (padrão), o modal NÃO fecha ao clicar fora — evita perder
     * o preenchimento de um formulário por um clique acidental. Fechamento
     * continua disponível pelo botão ✕ e pelos botões Cancelar/Salvar.
     */
    persistent?: boolean
  }>(),
  { persistent: true }
)

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick() {
  if (!props.persistent) close()
}

// ESC fecha apenas modais não-persistentes.
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.modelValue && !props.persistent) close()
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
        @click.self="onBackdropClick"
      >
        <div
          class="card w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-lg"
        >
          <header
            v-if="title || $slots.header"
            class="flex items-center justify-between px-5 py-4 border-b border-slate-200"
          >
            <slot name="header">
              <h2 class="text-lg font-semibold text-slate-800">{{ title }}</h2>
            </slot>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-700"
              aria-label="Fechar"
              @click="close"
            >
              ✕
            </button>
          </header>
          <div class="p-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

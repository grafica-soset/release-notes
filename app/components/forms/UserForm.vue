<script setup lang="ts">
import type { User, UserRole } from '~/types'

const props = defineProps<{
  initial?: Partial<User>
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { name: string; login: string; role: UserRole }]
  cancel: []
}>()

const form = reactive({
  name: props.initial?.name ?? '',
  login: props.initial?.login ?? '',
  role: (props.initial?.role ?? 'CLIENT') as UserRole
})

const errors = reactive<Record<string, string>>({})

function validate() {
  errors.name = form.name.trim() ? '' : 'Informe um nome.'
  errors.login = form.login.trim() ? '' : 'Informe um login.'
  return !errors.name && !errors.login
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    name: form.name.trim(),
    login: form.login.trim().toLowerCase(),
    role: form.role
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="label" for="user-name">Nome *</label>
      <input id="user-name" v-model="form.name" class="input" placeholder="Maria Silva" />
      <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
    </div>

    <div>
      <label class="label" for="user-login">Login *</label>
      <input
        id="user-login"
        v-model="form.login"
        class="input"
        placeholder="maria.silva"
        autocapitalize="none"
      />
      <p v-if="errors.login" class="mt-1 text-xs text-red-600">{{ errors.login }}</p>
    </div>

    <div>
      <label class="label">Papel</label>
      <div class="grid grid-cols-2 gap-2">
        <label
          class="flex items-center gap-2 p-3 border rounded-md cursor-pointer"
          :class="form.role === 'CLIENT' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'"
        >
          <input v-model="form.role" type="radio" value="CLIENT" class="accent-brand-500" />
          <span class="text-sm">Cliente</span>
        </label>
        <label
          class="flex items-center gap-2 p-3 border rounded-md cursor-pointer"
          :class="form.role === 'ADMIN' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'"
        >
          <input v-model="form.role" type="radio" value="ADMIN" class="accent-brand-500" />
          <span class="text-sm">Admin</span>
        </label>
      </div>
    </div>

    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
      <button type="button" class="btn-secondary" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Salvando…' : 'Salvar usuário' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useUsersStore } from '~/stores/users'
import { useSessionStore } from '~/stores/session'
import type { User, UserRole } from '~/types'

useHead({ title: 'Usuários' })

const users = useUsersStore()
const session = useSessionStore()

await users.fetchAll()

const showForm = ref(false)
const editing = ref<User | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)

function openCreate() {
  editing.value = null
  formError.value = null
  showForm.value = true
}

function openEdit(user: User) {
  editing.value = user
  formError.value = null
  showForm.value = true
}

async function handleSubmit(payload: { name: string; login: string; role: UserRole }) {
  submitting.value = true
  formError.value = null
  try {
    if (editing.value) {
      await users.update(editing.value._id, payload)
    } else {
      await users.create(payload)
    }
    showForm.value = false
  } catch (e: any) {
    formError.value = e?.statusMessage || e?.data?.message || 'Erro ao salvar usuário.'
  } finally {
    submitting.value = false
  }
}

async function remove(user: User) {
  if (!confirm(`Excluir o usuário "${user.name}"?`)) return
  await users.remove(user._id)
}

const roleBadge: Record<UserRole, string> = {
  ADMIN: 'bg-brand-100 text-brand-700',
  CLIENT: 'bg-slate-100 text-slate-700'
}
const roleLabel: Record<UserRole, string> = { ADMIN: 'Admin', CLIENT: 'Cliente' }
</script>

<template>
  <section>
    <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Usuários</h1>
        <p class="text-sm text-slate-500">Cadastre logins liberados para entrar no app.</p>
      </div>
      <button
        v-if="session.isAdmin"
        class="btn-primary self-start sm:self-auto"
        @click="openCreate"
      >
        + Novo usuário
      </button>
    </header>

    <div v-if="!session.isAdmin" class="card p-6 text-sm text-slate-600">
      Faça login como Admin para gerenciar usuários.
    </div>

    <template v-else>
      <p v-if="users.loading" class="text-sm text-slate-500">Carregando…</p>
      <p v-else-if="users.error" class="text-sm text-red-600">{{ users.error }}</p>

      <div v-else-if="users.users.length" class="card divide-y divide-slate-100">
        <div
          v-for="user in users.users"
          :key="user._id"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="shrink-0 w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold"
            >
              {{ user.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') }}
            </div>
            <div class="min-w-0">
              <p class="font-medium text-slate-800 truncate">{{ user.name }}</p>
              <p class="text-xs text-slate-500 truncate">{{ user.login }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="badge" :class="roleBadge[user.role]">{{ roleLabel[user.role] }}</span>
            <button class="text-xs text-brand-600 hover:underline" @click="openEdit(user)">
              Editar
            </button>
            <button class="text-xs text-red-600 hover:underline" @click="remove(user)">
              Excluir
            </button>
          </div>
        </div>
      </div>

      <div v-else class="card p-10 text-center text-slate-500">
        Nenhum usuário cadastrado ainda.
      </div>
    </template>

    <UiModal v-model="showForm" :title="editing ? 'Editar usuário' : 'Novo usuário'">
      <p v-if="formError" class="mb-3 text-sm text-red-600">{{ formError }}</p>
      <UserForm
        :key="editing?._id ?? 'new'"
        :initial="editing ?? undefined"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </UiModal>
  </section>
</template>

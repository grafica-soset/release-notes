<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import type { UserRole } from '~/types'

const session = useSessionStore()
const route = useRoute()

const showLogin = ref(false)
const draft = reactive({ name: '', role: 'CLIENT' as UserRole })

function openLogin() {
  draft.name = session.name
  draft.role = session.role
  showLogin.value = true
}

function submitLogin() {
  if (!draft.name.trim()) return
  session.login(draft.name, draft.role)
  showLogin.value = false
}

const navLinks = [
  { to: '/releases', label: 'Releases' },
  { to: '/issues', label: 'Issues' }
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-slate-800">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-brand-500 text-white">
          ◧
        </span>
        <span class="hidden sm:inline">Release & Issue Tracker</span>
      </NuxtLink>

      <nav class="flex items-center gap-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="
            isActive(link.to)
              ? 'bg-brand-50 text-brand-700'
              : 'text-slate-600 hover:bg-slate-100'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <template v-if="session.isLogged">
          <span class="hidden sm:flex items-center gap-2 text-sm">
            <span class="text-slate-600">{{ session.name }}</span>
            <span
              class="badge"
              :class="session.isAdmin ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-700'"
            >
              {{ session.isAdmin ? 'Admin' : 'Cliente' }}
            </span>
          </span>
          <button class="btn-ghost" @click="session.logout()">Sair</button>
        </template>
        <button v-else class="btn-primary" @click="openLogin">Entrar</button>
      </div>
    </div>

    <UiModal v-model="showLogin" title="Identificação">
      <form class="space-y-4" @submit.prevent="submitLogin">
        <div>
          <label class="label" for="login-name">Nome</label>
          <input id="login-name" v-model="draft.name" class="input" autofocus />
        </div>
        <div>
          <label class="label">Papel</label>
          <div class="grid grid-cols-2 gap-2">
            <label
              class="flex items-center gap-2 p-3 border rounded-md cursor-pointer"
              :class="draft.role === 'CLIENT' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'"
            >
              <input v-model="draft.role" type="radio" value="CLIENT" class="accent-brand-500" />
              <span class="text-sm">Cliente</span>
            </label>
            <label
              class="flex items-center gap-2 p-3 border rounded-md cursor-pointer"
              :class="draft.role === 'ADMIN' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'"
            >
              <input v-model="draft.role" type="radio" value="ADMIN" class="accent-brand-500" />
              <span class="text-sm">Admin</span>
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" @click="showLogin = false">Cancelar</button>
          <button type="submit" class="btn-primary">Entrar</button>
        </div>
      </form>
    </UiModal>
  </header>
</template>

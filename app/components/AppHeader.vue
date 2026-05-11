<script setup lang="ts">
import { useSessionStore } from '~/stores/session'

const session = useSessionStore()
const route = useRoute()

const showLogin = ref(false)
const draftLogin = ref('')
const loginError = ref<string | null>(null)
const submitting = ref(false)

function openLogin() {
  draftLogin.value = session.login
  loginError.value = null
  showLogin.value = true
}

async function submitLogin() {
  if (!draftLogin.value.trim()) return
  submitting.value = true
  loginError.value = null
  try {
    await session.loginByLogin(draftLogin.value)
    showLogin.value = false
  } catch (e: any) {
    loginError.value = e?.message || e?.data?.message || 'Login não encontrado.'
  } finally {
    submitting.value = false
  }
}

const navLinks = computed(() => {
  const base = [
    { to: '/releases', label: 'Releases' },
    { to: '/issues', label: 'Issues' }
  ]
  if (session.isAdmin) base.push({ to: '/users', label: 'Usuários' })
  return base
})

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

    <UiModal v-model="showLogin" title="Entrar">
      <form class="space-y-4" @submit.prevent="submitLogin">
        <div>
          <label class="label" for="login-input">Login</label>
          <input
            id="login-input"
            v-model="draftLogin"
            class="input"
            autofocus
            autocomplete="username"
            placeholder="seu.login"
          />
          <p class="mt-1 text-xs text-slate-500">
            Digite seu login para continuar. Sem cadastro? Peça a um admin para criar um usuário.
          </p>
        </div>
        <p v-if="loginError" class="text-sm text-red-600">{{ loginError }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" @click="showLogin = false">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Entrando…' : 'Entrar' }}
          </button>
        </div>
      </form>
    </UiModal>
  </header>
</template>

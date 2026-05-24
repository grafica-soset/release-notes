<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useNotificationsStore } from '~/stores/notifications'
import type { CommentNotification } from '~/types'

const session = useSessionStore()
const notifications = useNotificationsStore()
const route = useRoute()

const showLogin = ref(false)
const draftLogin = ref('')
const loginError = ref<string | null>(null)
const submitting = ref(false)

// --- Sino de notificações (admin) ---
const showBell = ref(false)

// Carrega a fila quando o admin está logado; recarrega ao trocar de login.
watch(
  () => session.isAdmin,
  (isAdmin) => {
    if (isAdmin) notifications.fetch()
    else notifications.$reset()
  },
  { immediate: true }
)

// Fecha o dropdown ao navegar.
watch(
  () => route.path,
  () => {
    showBell.value = false
  }
)

const recentNotifications = computed(() => notifications.items.slice(0, 6))

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

async function archiveFromBell(n: CommentNotification) {
  await notifications.archive(n._id)
}

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
        <!-- Sino de notificações (admin) -->
        <div v-if="session.isAdmin" class="relative">
          <button
            class="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notificações"
            @click="showBell = !showBell"
          >
            <span class="text-lg leading-none">🔔</span>
            <span
              v-if="notifications.count"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center"
            >
              {{ notifications.count > 99 ? '99+' : notifications.count }}
            </span>
          </button>

          <!-- Backdrop para fechar ao clicar fora -->
          <div v-if="showBell" class="fixed inset-0 z-30" @click="showBell = false" />

          <div
            v-if="showBell"
            class="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-slate-200 z-40 overflow-hidden"
          >
            <header class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <span class="text-sm font-semibold text-slate-800">Notificações</span>
              <span class="text-xs text-slate-400">{{ notifications.count }} pendente(s)</span>
            </header>

            <div class="max-h-80 overflow-y-auto">
              <p
                v-if="!recentNotifications.length"
                class="px-4 py-6 text-center text-sm text-slate-500"
              >
                Nenhuma notificação pendente.
              </p>
              <ul v-else class="divide-y divide-slate-100">
                <li
                  v-for="n in recentNotifications"
                  :key="n._id"
                  class="px-4 py-3 hover:bg-slate-50"
                >
                  <div class="flex items-start justify-between gap-2">
                    <span class="text-sm font-medium text-slate-800">{{ n.authorName }}</span>
                    <time class="text-[11px] text-slate-400 shrink-0">{{ formatDateTime(n.createdAt) }}</time>
                  </div>
                  <p class="text-xs text-slate-500 mb-1">
                    {{ n.issueTitle ? `Issue · ${n.issueTitle}` : n.releaseVersion ? `Release ${n.releaseVersion}` : 'Comentário' }}
                  </p>
                  <p class="text-sm text-slate-700 line-clamp-2">{{ n.content }}</p>
                  <button
                    class="mt-1.5 text-xs text-slate-500 hover:text-brand-600"
                    @click="archiveFromBell(n)"
                  >
                    Arquivar
                  </button>
                </li>
              </ul>
            </div>

            <NuxtLink
              to="/notifications"
              class="block px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-slate-50 border-t border-slate-100"
              @click="showBell = false"
            >
              Ver todas →
            </NuxtLink>
          </div>
        </div>

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

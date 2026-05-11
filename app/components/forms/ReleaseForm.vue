<script setup lang="ts">
import type { Release, Issue } from '~/types'

/**
 * Formulário reaproveitável para criação/edição de Release.
 *
 * `availableIssues`: lista de issues que podem ser vinculadas. O pai é
 * responsável por carregar do backend. Em modo edição, inclua também as
 * issues já vinculadas a esta release para que possam aparecer marcadas.
 *
 * `initial.issueIds` aceita tanto array de strings quanto array de Issue
 * (caso vindo do endpoint de detalhe com populate).
 */
const props = defineProps<{
  initial?: Partial<Release> & { issueIds?: string[] | Issue[] }
  availableIssues?: Issue[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [
    payload: { version: string; description: string; prUrl: string; issueIds: string[] }
  ]
  cancel: []
}>()

function normalizeIds(value: string[] | Issue[] | undefined): string[] {
  if (!value || !value.length) return []
  return value.map((v) => (typeof v === 'string' ? v : v._id))
}

const form = reactive({
  version: props.initial?.version ?? '',
  description: props.initial?.description ?? '',
  prUrl: props.initial?.prUrl ?? '',
  issueIds: normalizeIds(props.initial?.issueIds)
})

const errors = reactive<Record<string, string>>({})

const issueSearch = ref('')

const filteredIssues = computed(() => {
  const q = issueSearch.value.trim().toLowerCase()
  const list = props.availableIssues ?? []
  if (!q) return list
  return list.filter((i) => i.title.toLowerCase().includes(q))
})

const selectedCount = computed(() => form.issueIds.length)

function toggleIssue(id: string) {
  const idx = form.issueIds.indexOf(id)
  if (idx >= 0) form.issueIds.splice(idx, 1)
  else form.issueIds.push(id)
}

function validate() {
  errors.version = form.version.trim() ? '' : 'Informe a versão.'
  if (form.prUrl && !/^https?:\/\//i.test(form.prUrl)) {
    errors.prUrl = 'URL deve começar com http(s)://'
  } else {
    errors.prUrl = ''
  }
  return !errors.version && !errors.prUrl
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    version: form.version.trim(),
    description: form.description,
    prUrl: form.prUrl.trim(),
    issueIds: form.issueIds
  })
}

const statusBadge: Record<string, string> = {
  BACKLOG: 'bg-slate-200 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  CLOSED: 'bg-emerald-100 text-emerald-700'
}
const statusLabel: Record<string, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'Em andamento',
  CLOSED: 'Fechada'
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="label" for="release-version">Versão *</label>
      <input
        id="release-version"
        v-model="form.version"
        type="text"
        placeholder="v1.0.0"
        class="input"
      />
      <p v-if="errors.version" class="mt-1 text-xs text-red-600">{{ errors.version }}</p>
    </div>

    <div>
      <label class="label" for="release-pr">URL do Pull Request</label>
      <input
        id="release-pr"
        v-model="form.prUrl"
        type="url"
        placeholder="https://github.com/org/repo/pull/123"
        class="input"
      />
      <p v-if="errors.prUrl" class="mt-1 text-xs text-red-600">{{ errors.prUrl }}</p>
    </div>

    <div>
      <label class="label" for="release-desc">Descrição (markdown suportado)</label>
      <textarea
        id="release-desc"
        v-model="form.description"
        rows="6"
        placeholder="### O que foi entregue&#10;- Item 1&#10;- Item 2"
        class="input font-mono text-sm"
      />
    </div>

    <!-- Seletor de Issues vinculadas -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="label !mb-0">
          Issues incluídas
          <span class="text-xs text-slate-500 font-normal">({{ selectedCount }} selecionada{{ selectedCount === 1 ? '' : 's' }})</span>
        </label>
        <input
          v-model="issueSearch"
          type="search"
          placeholder="Filtrar…"
          class="input !py-1 !text-xs max-w-[140px]"
        />
      </div>

      <div
        class="border border-slate-200 rounded-md max-h-56 overflow-y-auto divide-y divide-slate-100"
      >
        <p
          v-if="!filteredIssues.length"
          class="text-xs text-slate-400 italic px-3 py-4 text-center"
        >
          {{ availableIssues?.length ? 'Nenhuma issue corresponde ao filtro.' : 'Nenhuma issue cadastrada ainda.' }}
        </p>
        <label
          v-for="issue in filteredIssues"
          :key="issue._id"
          class="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            class="accent-brand-500"
            :checked="form.issueIds.includes(issue._id)"
            @change="toggleIssue(issue._id)"
          />
          <span class="flex-1 truncate">{{ issue.title }}</span>
          <span class="badge text-[10px]" :class="statusBadge[issue.status]">
            {{ statusLabel[issue.status] }}
          </span>
        </label>
      </div>
    </div>

    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
      <button type="button" class="btn-secondary" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="submitting">
        <span v-if="submitting">Salvando…</span>
        <span v-else>Salvar release</span>
      </button>
    </div>
  </form>
</template>

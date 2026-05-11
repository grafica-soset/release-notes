<script setup lang="ts">
import { marked } from 'marked'
import { useReleasesStore } from '~/stores/releases'
import { useIssuesStore } from '~/stores/issues'
import { useSessionStore } from '~/stores/session'
import type { Comment, Issue } from '~/types'

const route = useRoute()
const router = useRouter()

const releaseId = computed(() => route.params.id as string)

const releases = useReleasesStore()
const issues = useIssuesStore()
const session = useSessionStore()

await releases.fetchOne(releaseId.value)

useHead(() => ({
  title: releases.current ? `Release ${releases.current.version}` : 'Release'
}))

// --- Conversão de comentário em issue (modal) ---
const showIssueModal = ref(false)
const issueDraft = ref<Partial<Issue> | null>(null)
const issueSubmitting = ref(false)
const issueError = ref<string | null>(null)

function openIssueFromComment(comment: Comment) {
  issueDraft.value = {
    title: `Feedback de ${comment.authorName}`,
    description: comment.content,
    status: 'BACKLOG',
    releaseId: releaseId.value,
    commentId: comment._id
  }
  showIssueModal.value = true
}

async function submitIssue(payload: {
  title: string
  description: string
  status: Issue['status']
  releaseId: string | null
  commentId: string | null
}) {
  issueSubmitting.value = true
  issueError.value = null
  try {
    await issues.create(payload)
    showIssueModal.value = false
  } catch (e: any) {
    issueError.value = e?.statusMessage || 'Erro ao criar issue.'
  } finally {
    issueSubmitting.value = false
  }
}

// --- Novo comentário ---
const commentSubmitting = ref(false)
const commentError = ref<string | null>(null)

async function submitComment(payload: { authorName: string; content: string }) {
  commentSubmitting.value = true
  commentError.value = null
  try {
    await releases.addComment({
      releaseId: releaseId.value,
      ...payload
    })
  } catch (e: any) {
    commentError.value = e?.statusMessage || 'Erro ao enviar comentário.'
  } finally {
    commentSubmitting.value = false
  }
}

async function removeComment(comment: Comment) {
  if (!confirm('Remover este comentário?')) return
  await releases.removeComment(comment._id)
}

// Renderização markdown (modo síncrono).
const renderedDescription = computed(() => {
  const desc = releases.current?.description ?? ''
  if (!desc.trim()) return ''
  return marked.parse(desc, { async: false }) as string
})

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : ''
</script>

<template>
  <section v-if="releases.current">
    <button class="text-sm text-slate-500 hover:underline mb-4" @click="router.back()">
      ← Voltar
    </button>

    <!-- Topo: detalhes da release -->
    <article class="card p-6 mb-8">
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div class="flex items-center gap-3">
          <span class="badge bg-brand-100 text-brand-700 text-base !px-3 !py-1">
            {{ releases.current.version }}
          </span>
          <time class="text-sm text-slate-500">
            Publicada em {{ formatDate(releases.current.createdAt) }}
          </time>
        </div>
        <a
          v-if="releases.current.prUrl"
          :href="releases.current.prUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary"
        >
          Ver Pull Request ↗
        </a>
      </header>

      <div
        v-if="renderedDescription"
        class="prose prose-sm max-w-none text-slate-700"
        v-html="renderedDescription"
      />
      <p v-else class="text-sm text-slate-500 italic">Sem descrição.</p>
    </article>

    <!-- Timeline de comentários -->
    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-4">
        Comentários
        <span class="text-sm text-slate-400 font-normal">
          ({{ releases.comments.length }})
        </span>
      </h2>

      <div v-if="releases.comments.length" class="space-y-4 mb-8">
        <CommentItem
          v-for="comment in releases.comments"
          :key="comment._id"
          :comment="comment"
          :show-convert-action="session.isAdmin"
          @convert="openIssueFromComment"
          @remove="removeComment"
        />
      </div>
      <p v-else class="text-sm text-slate-500 mb-8">
        Nenhum comentário ainda — seja o primeiro a deixar feedback.
      </p>

      <!-- Form de novo comentário -->
      <div class="card p-5">
        <h3 class="font-medium text-slate-800 mb-3">Deixar feedback</h3>
        <p v-if="commentError" class="mb-3 text-sm text-red-600">{{ commentError }}</p>
        <CommentForm
          :default-author="session.name"
          :submitting="commentSubmitting"
          @submit="submitComment"
        />
      </div>
    </section>

    <!-- Modal para conversão em issue -->
    <UiModal v-model="showIssueModal" title="Abrir issue a partir do comentário">
      <p v-if="issueError" class="mb-3 text-sm text-red-600">{{ issueError }}</p>
      <IssueForm
        v-if="issueDraft"
        :initial="issueDraft"
        :submitting="issueSubmitting"
        @submit="submitIssue"
        @cancel="showIssueModal = false"
      />
    </UiModal>
  </section>

  <section v-else-if="releases.loading" class="text-sm text-slate-500">Carregando…</section>
  <section v-else-if="releases.error" class="text-sm text-red-600">{{ releases.error }}</section>
</template>

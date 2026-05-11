<script setup lang="ts">
// Página inicial — destaca o fluxo do produto e direciona o usuário.
useHead({ title: 'Início — Release & Issue Tracker' })
</script>

<template>
  <section class="max-w-3xl mx-auto text-center py-10 sm:py-16">
    <span class="badge bg-brand-100 text-brand-700">Comunicação de entregas</span>
    <h1 class="mt-3 text-3xl sm:text-4xl font-bold text-slate-800">
      Compartilhe releases, colete feedback e organize issues
    </h1>
    <p class="mt-3 text-slate-600">
      Publique versões, receba comentários do cliente em uma timeline e converta o feedback
      em issues acompanháveis — tudo em um único lugar.
    </p>
    <div class="mt-6 flex flex-col sm:flex-row justify-center gap-3">
      <NuxtLink to="/releases" class="btn-primary">Ver releases</NuxtLink>
      <NuxtLink to="/issues" class="btn-secondary">Ir para issues</NuxtLink>
    </div>

    <div class="mt-12 grid sm:grid-cols-3 gap-4 text-left">
      <div class="card p-5">
        <h3 class="font-semibold text-slate-800">1. Publique</h3>
        <p class="text-sm text-slate-600 mt-1">
          Cadastre cada release com versão, descrição (markdown) e link do PR.
        </p>
      </div>
      <div class="card p-5">
        <h3 class="font-semibold text-slate-800">2. Receba feedback</h3>
        <p class="text-sm text-slate-600 mt-1">
          O cliente comenta direto na timeline da release.
        </p>
      </div>
      <div class="card p-5">
        <h3 class="font-semibold text-slate-800">3. Converta em issue</h3>
        <p class="text-sm text-slate-600 mt-1">
          Em um clique, transforme o comentário em uma issue rastreável.
        </p>
      </div>
    </div>
  </section>
</template>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
      <slot />
    </main>
    <footer class="text-center text-xs text-slate-400 py-4">
      © {{ new Date().getFullYear() }} Release & Issue Tracker
    </footer>
  </div>
</template>

<template>
  <section class="goal-card min-w-0">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h5 class="stats-title">{{ title }}</h5>
        <p v-if="sub" class="stats-sub">{{ sub }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; sub?: string | null }>()
</script>

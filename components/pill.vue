<template>
  <span
    class="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border px-8 py-2 font-medium transition-all active:bg-accent"
    :class="{
      'border-accent bg-accent-light hover:bg-accent-light/20': !selected,
      'border-accent-dark bg-accent hover:bg-accent/80': !!selected,
    }"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{ selected?: boolean }>()
</script>

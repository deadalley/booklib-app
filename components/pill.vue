<template>
  <span
    class="relative inline-flex cursor-pointer items-center gap-2 rounded-xl border px-6 py-1 font-medium transition-all active:bg-surface"
    :class="{
      'border-stroke bg-surface-subtle hover:bg-surface-subtle/20': !selected,
      'border-stroke-strong bg-surface hover:bg-surface/80': !!selected,
    }"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{ selected?: boolean }>()
</script>

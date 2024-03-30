<template>
  <span
    class="relative inline-flex cursor-pointer items-center gap-2 rounded-m border border-accent bg-accent-light px-12 py-2 font-medium transition-all hover:bg-accent-light/20"
    :class="{
      'border-main bg-main text-white hover:bg-main/80': !!selected,
    }"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
defineProps<{ selected?: boolean }>()
</script>

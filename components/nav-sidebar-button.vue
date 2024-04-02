<template>
  <NuxtLink
    :to="to"
    class="flex cursor-pointer items-center gap-3 rounded-m px-5 py-3 text-lg transition-all hover:bg-accent/30 active:bg-accent-dark/20"
    :class="{
      'bg-accent/20 hover:bg-accent/20': active,
    }"
  >
    <slot name="icon" :size="ICON_SIZE_MEDIUM" stroke="1.5"></slot>
    <slot></slot>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ active?: boolean; to?: string }>()
</script>

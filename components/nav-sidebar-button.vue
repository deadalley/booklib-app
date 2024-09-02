<template>
  <NuxtLink
    :to="to"
    class="flex cursor-pointer items-center gap-3 rounded-lg px-5 py-3 text-base transition-all hover:bg-accent/30 active:bg-accent-dark/20"
    :class="{
      'bg-main text-white hover:bg-main/80': active,
    }"
  >
    <slot name="icon" :size="ICON_SIZE_MEDIUM" stroke="1.5" />
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ active?: boolean; to?: string }>()
</script>

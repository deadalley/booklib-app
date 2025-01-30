<template>
  <NuxtLink
    :to="disabled ? undefined : to"
    class="flex items-center gap-3 rounded-xl px-5 py-3 text-lg"
    :class="{
      'cursor-pointer transition-all hover:bg-accent/30 active:bg-accent-dark/20':
        !disabled,
      'cursor-default text-accent': disabled,
      'bg-main text-white hover:bg-main/80': active,
    }"
    :disabled="disabled"
  >
    <slot name="icon" :size="ICON_SIZE_MEDIUM" stroke="1.5" />
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ active?: boolean; to?: string; disabled?: boolean }>()
</script>

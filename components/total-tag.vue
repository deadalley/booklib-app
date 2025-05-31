<template>
  <div
    class="relative mt-1 inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-medium"
    :class="{
      'border border-accent bg-accent-light text-accent-darker':
        variant === 'secondary',
      'border border-main bg-main text-white': variant === 'primary',
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' }>(), {
  variant: 'secondary',
})
</script>

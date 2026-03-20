<template>
  <div
    class="relative mt-1 inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-medium"
    :class="{
      'border border-stroke bg-surface-subtle text-ink-secondary':
        variant === 'secondary',
      'border border-primary bg-primary text-ink-inverse': variant === 'primary',
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

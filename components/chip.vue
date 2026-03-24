<template>
  <span
    class="chip"
    :class="{
      'chip-primary': props.variant === 'primary',
    }"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary'
  }>(),
  {
    variant: 'default',
  },
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.chip {
  @apply rounded-scholarly border-stroke bg-surface-container text-ink-secondary inline-flex items-center border px-3 py-1 text-sm font-bold tracking-wider;
}
.chip-primary {
  @apply border-primary bg-primary text-ink-inverse;
}
</style>

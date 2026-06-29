<template>
  <span
    class="chip"
    :class="{
      'chip-primary': props.variant === 'primary',
      'chip-secondary': props.variant === 'secondary',
      primary: props.color === 'primary',
      secondary: props.color === 'secondary',
      bold: props.bold,
      rounded: props.rounded,
    }"
  >
    <slot name="prependIcon" :size="16" stroke="1.5" />
    <slot />
    <slot name="appendIcon" :size="16" stroke="1.5" />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'secondary'
    color?: 'primary' | 'secondary'
    bold?: boolean
    rounded?: boolean
  }>(),
  {
    variant: 'default',
    color: 'primary',
    bold: false,
    rounded: false,
  },
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.chip {
  @apply rounded-scholarly border-stroke bg-surface-container text-ink-secondary inline-flex w-fit items-center gap-2 truncate border px-3 py-1 text-sm font-semibold;
}
.chip-primary,
.chip-primary.primary {
  @apply border-primary bg-primary text-ink-inverse;
}
.chip-primary.secondary {
  @apply border-secondary bg-secondary text-ink-inverse;
}
.chip-secondary,
.chip-secondary.primary {
  @apply text-primary bg-primary-100 border-primary;
}
.chip-secondary.secondary {
  @apply text-secondary-600 bg-secondary-50 border-secondary-400;
}
.bold {
  @apply font-bold tracking-wider;
}
.rounded {
  @apply rounded-full;
}
</style>

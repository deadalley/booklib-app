<template>
  <span
    v-bind="$attrs"
    class="chip"
    :class="[
      {
        'chip-primary': props.variant === 'primary',
        'chip-secondary': props.variant === 'secondary',
        primary: props.color === 'primary',
        secondary: props.color === 'secondary',
        bold: props.bold,
        rounded: props.rounded,
        sm: props.size === 'sm',
        xs: props.size === 'xs',
      },
      $attrs.class,
    ]"
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
    // xs: an uppercase status badge; sm: a compact pill
    size?: 'xs' | 'sm' | 'md'
  }>(),
  {
    variant: 'default',
    bold: false,
    rounded: false,
    size: 'md',
  },
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.chip {
  @apply rounded-scholarly border-stroke bg-surface-container text-ink-secondary inline-flex w-fit items-center gap-2 truncate border px-3 py-1 text-sm font-semibold tracking-wide transition-colors;
}
.chip-primary,
.chip-primary.primary {
  @apply border-primary bg-primary text-ink-inverse;
}
.chip-primary.secondary {
  @apply border-secondary bg-secondary text-ink-inverse;
}
.chip-secondary,
.chip-secondary.primary,
.primary {
  @apply text-primary bg-primary-100 border-primary-300;
}
.chip-secondary.secondary,
.secondary {
  @apply text-secondary-600 bg-secondary-50 border-secondary-200;
}
.bold {
  @apply font-bold tracking-wider;
}
.rounded {
  @apply rounded-full;
}
.sm {
  @apply gap-1 px-2.5 py-0.5 text-xs;
}
.xs {
  @apply gap-1 px-2 py-0.5 text-[0.6875rem] font-bold tracking-widest uppercase;
}
</style>

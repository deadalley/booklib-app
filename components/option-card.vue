<template>
  <button
    type="button"
    class="option-card"
    :class="[
      layout,
      size,
      tone,
      iconWell && `well-${iconWell}`,
      { selected, centered },
    ]"
  >
    <span v-if="indicator === 'check'" class="option-card-check">
      <IconCheck :size="12" stroke="2.6" aria-hidden="true" />
    </span>
    <span v-if="icon" class="option-card-icon" aria-hidden="true">
      <component
        :is="icons[icon]"
        :size="ICON_SIZES[size]"
        :stroke="size === 'lg' ? '1.6' : '1.8'"
      />
    </span>
    <span class="option-card-body">
      <span v-if="title || $slots.title" class="option-card-title">
        <slot name="title">{{ title }}</slot>
      </span>
      <span
        v-if="description || $slots.description"
        class="option-card-description"
      >
        <slot name="description">{{ description }}</slot>
      </span>
      <slot />
    </span>
    <span v-if="$slots.trailing" class="option-card-trailing">
      <slot name="trailing" />
    </span>
    <span v-if="indicator === 'radio'" class="option-card-radio">
      <IconCheck v-if="selected" :size="11" stroke="2.6" aria-hidden="true" />
    </span>
    <span v-if="$slots.footer" class="option-card-footer">
      <slot name="footer" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { icons, IconCheck } from '@tabler/icons-vue'

/**
 * A selectable card: picks an option, a template or a path. Use `selected`
 * for choices that stay picked, with aria-pressed or role="radio" +
 * aria-checked on the card.
 */
withDefaults(
  defineProps<{
    icon?: keyof typeof icons
    title?: string
    description?: string
    selected?: boolean
    // row: icon, text and trailing content side by side; stack: top to bottom
    layout?: 'row' | 'stack'
    size?: 'sm' | 'md' | 'lg'
    // secondary: the amber treatment (e.g. challenges)
    tone?: 'primary' | 'secondary'
    // Puts the icon in a tinted well that fills when selected
    iconWell?: 'square' | 'round'
    // check: a corner badge when selected; radio: a trailing radio dot
    indicator?: 'check' | 'radio'
    // stack layout only: centers the icon and text
    centered?: boolean
  }>(),
  { layout: 'row', size: 'md', tone: 'primary' },
)

const ICON_SIZES = { sm: 16, md: 18, lg: 24 }
</script>

<style scoped>
@reference '../assets/css/main.css';

.option-card {
  @apply border-stroke bg-surface-elevated text-ink-primary rounded-scholarly relative flex min-w-0 cursor-pointer border text-left;
  transition:
    border-color 0.15s,
    background-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.option-card:hover {
  @apply border-primary;
}
.option-card.selected {
  @apply border-primary bg-primary-50;
}
.option-card-icon {
  @apply text-primary flex-none;
}
.option-card-body {
  @apply flex min-w-0 flex-1 flex-col gap-0.5;
}
.option-card-title {
  @apply font-semibold;
}
.option-card-description {
  @apply text-ink-muted text-xs;
}
.option-card-trailing {
  @apply text-ink-muted flex-none;
}

/* Layouts */
.row {
  @apply flex-row items-center gap-3;
}
.stack {
  @apply flex-col items-start gap-1.5;
}

/* Sizes */
.sm {
  @apply px-3 py-2.5 text-sm;
}
.md {
  @apply px-4 py-3 text-sm;
}
.lg {
  @apply gap-2 rounded-xl p-5;
}
.lg:hover {
  @apply -translate-y-px;
  box-shadow: 0 0 0 1px var(--primary);
}
.lg .option-card-icon {
  @apply bg-primary-50 mb-1 grid size-12 place-items-center rounded-xl;
}
.lg .option-card-body {
  @apply gap-2;
}
.lg .option-card-title {
  @apply font-display text-[1.375rem] font-semibold;
}
.lg .option-card-description {
  @apply text-ink-secondary flex-1 text-sm leading-[1.45] text-pretty;
}
.option-card-footer {
  @apply border-stroke-subtle text-ink-muted mt-1 flex w-full items-center gap-2 border-t pt-3 text-[0.8125rem] font-semibold;
}

/* Icon wells */
.well-square .option-card-icon,
.well-round .option-card-icon {
  @apply bg-surface-subtle text-ink-secondary grid size-9 place-items-center transition-colors;
}
.well-square .option-card-icon {
  @apply rounded-lg;
}
.well-round .option-card-icon {
  @apply rounded-full;
}
.selected.well-square .option-card-icon,
.selected.well-round .option-card-icon {
  @apply bg-primary text-ink-inverse;
}
.centered {
  @apply items-center text-center;
}
.centered .option-card-body {
  @apply items-center;
}
.centered.well-round .option-card-icon {
  @apply size-11;
}

/* Indicators */
.option-card-check {
  @apply bg-primary text-ink-inverse absolute top-2.5 right-2.5 hidden size-[18px] place-items-center rounded-full;
}
.selected .option-card-check {
  @apply grid;
}
.option-card-radio {
  @apply border-stroke-strong text-ink-inverse ml-auto grid size-[18px] flex-none place-items-center rounded-full border-[1.5px];
}
.selected .option-card-radio {
  @apply border-primary bg-primary;
}
.option-card.selected {
  box-shadow: inset 0 0 0 1px var(--primary);
}

/* Amber tone */
.secondary.lg {
  @apply bg-secondary-50 border-secondary-200;
}
.secondary:hover {
  @apply border-secondary-700;
}
.secondary.lg:hover {
  box-shadow: 0 0 0 1px var(--secondary-700);
}
.secondary .option-card-icon {
  @apply text-secondary-700;
}
.secondary.lg .option-card-icon {
  @apply bg-secondary-700 text-ink-inverse;
}
.secondary .option-card-footer {
  @apply text-secondary-800 border-secondary-200;
}
</style>

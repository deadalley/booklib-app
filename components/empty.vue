<template>
  <div
    v-bind="$attrs"
    class="empty-state"
    :class="{ 'empty-state-elevated': variant === 'primary' }"
  >
    <span class="empty-state-icon" aria-hidden="true">
      <component :is="icons[icon]" :size="24" stroke="1.6" />
    </span>
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <div v-if="$slots['label']" class="empty-state-label">
        <slot name="label" />
      </div>
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

withDefaults(
  defineProps<{
    icon: keyof typeof icons
    variant?: 'primary' | 'secondary'
  }>(),
  { variant: 'secondary' },
)
</script>

<style scoped>
@reference '../assets/css/main.css';

/* A dashed take on paper-flat, matching the v2 empty states */
.empty-state {
  @apply paper-flat bg-surface-subtle border-stroke flex flex-col items-center justify-center gap-4 border-dashed px-6 py-14;
}
.empty-state-elevated {
  @apply bg-surface-elevated;
}
.empty-state-icon {
  @apply bg-primary-50 text-primary grid size-12 place-items-center rounded-full;
}
.empty-state-label {
  @apply font-display text-ink-primary text-xl;
}
</style>

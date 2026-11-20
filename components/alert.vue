<template>
  <div class="alert" :class="[tone, size]">
    <span class="alert-icon" aria-hidden="true">
      <slot name="icon" :size="size === 'sm' ? 16 : 20" stroke="1.8">
        <component
          :is="icons[icon]"
          :size="size === 'sm' ? 16 : 20"
          stroke="1.8"
        />
      </slot>
    </span>
    <div class="alert-body">
      <p v-if="title || $slots.title" class="alert-title">
        <slot name="title">{{ title }}</slot>
      </p>
      <div class="alert-content"><slot /></div>
      <div v-if="$slots.actions" class="alert-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

/**
 * A message in the page: the demo notice, an error, a hint while
 * reordering. For a short confirmation that goes away, use bl-toast.
 * Give it role="alert" for errors that need attention now, or
 * role="status" for updates.
 */
withDefaults(
  defineProps<{
    // primary: errors and important notices; secondary: amber hints and
    // waiting states; neutral: plain information
    tone?: 'primary' | 'secondary' | 'neutral'
    // md: a full-width banner; sm: a compact inline line
    size?: 'sm' | 'md'
    icon?: keyof typeof icons
    title?: string
  }>(),
  { tone: 'primary', size: 'md', icon: 'IconInfoCircle', title: undefined },
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.alert {
  @apply font-body text-ink-primary flex items-start gap-3 rounded-xl border;
}
.alert-icon {
  @apply flex flex-none;
}
.alert-body {
  @apply flex min-w-0 flex-1 flex-col gap-1;
}
.alert-title {
  @apply font-display text-[1.2rem] leading-snug font-semibold;
}
.alert-content {
  @apply leading-normal;
}
.alert-actions {
  @apply mt-2 flex flex-wrap gap-2;
}

/* Sizes */
.md {
  @apply px-5 py-4;
}
.md .alert-icon {
  @apply mt-0.5;
}
.sm {
  @apply w-fit gap-2 rounded-lg px-3 py-2 text-sm font-semibold;
}
.sm .alert-icon {
  @apply mt-px;
}

/* Tones */
.primary {
  @apply bg-primary/10 border-transparent;
}
.primary .alert-icon {
  @apply text-primary;
}
.secondary {
  @apply bg-secondary-50 border-secondary-200 text-secondary-800;
}
.secondary .alert-icon {
  @apply text-secondary-700;
}
.neutral {
  @apply bg-surface-subtle border-stroke text-ink-secondary;
}
.neutral .alert-icon {
  @apply text-ink-muted;
}
</style>

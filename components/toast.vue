<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="toast"
      :class="{ raised }"
      role="status"
      data-testid="toast"
    >
      <span class="toast-icon" aria-hidden="true">
        <IconCheck :size="14" stroke="2.6" />
      </span>
      <span class="toast-message">{{ message }}</span>
      <button
        v-if="actionLabel"
        type="button"
        class="toast-action"
        @click="$emit('action')"
      >
        <slot name="actionIcon" />
        {{ actionLabel }}
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'

/** A short confirmation at the bottom of the screen, with an optional action */
defineProps<{
  message: string | null
  actionLabel?: string
  // Sits above a floating bar (e.g. bulk actions)
  raised?: boolean
}>()

defineEmits<{ (e: 'action'): void }>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.toast {
  @apply bg-surface-elevated border-stroke text-ink-primary fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl border py-2.5 pr-2.5 pl-4 text-sm font-semibold shadow-[0_24px_48px_-12px_rgba(27,28,28,0.35),0_8px_16px_-8px_rgba(27,28,28,0.2)] sm:bottom-6;
}
.toast.raised {
  @apply bottom-[calc(13rem+env(safe-area-inset-bottom))] sm:bottom-28;
}
.toast-icon {
  @apply bg-primary text-ink-inverse grid size-[26px] flex-none place-items-center rounded-full;
}
.toast-message {
  @apply min-w-0 truncate;
}
.toast-action {
  @apply border-stroke-strong bg-surface-elevated text-primary hover:bg-primary-50 inline-flex h-[34px] flex-none cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-extrabold transition-colors;
  @apply focus-visible:ring-primary/25 focus-visible:ring-2 focus-visible:outline-none;
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

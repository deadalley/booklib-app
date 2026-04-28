<template>
  <div class="paper flex flex-col gap-3 p-5">
    <div class="status-panel">
      <div class="flex items-center justify-between">
        <p class="eyebrow3">Reading Status</p>
        <p
          class="text-primary cursor-pointer text-xs font-semibold tracking-wide uppercase"
        >
          Update
        </p>
      </div>

      <bl-book-status-stepper
        :current-status="currentStatus"
        @step-click="emit('step-change', $event)"
        @status-select="emit('status-select', $event)"
      />
    </div>

    <div class="flex flex-col">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="border-stroke-subtle flex items-start justify-between gap-3 border-t py-2.5 first:border-t-0 first:pt-0"
      >
        <p class="label">{{ stat.label }}</p>
        <p class="value text-right">{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookProgressStatus, Book } from '~/types/book'
import { toFullDateCompact } from '~/utils/date'

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (e: 'step-change', step: number): void
  (e: 'status-select', status: BookProgressStatus): void
}>()

const currentStatus = computed(
  () => props.book.progress.status ?? ('not-owned' as BookProgressStatus),
)

const progress = computed(() => {
  return 23 // TODO: Calculate progress based on book's reading status and pages read
})

const stats = computed(() => {
  const totalPages = props.book.pages
  const pagesRead = totalPages
    ? Math.round((totalPages * progress.value) / 100)
    : undefined
  const pagesRemaining =
    totalPages && pagesRead !== undefined
      ? Math.max(totalPages - pagesRead, 0)
      : undefined

  return [
    {
      label: 'Pages Read',
      value:
        totalPages && pagesRead !== undefined
          ? `${pagesRead} / ${totalPages}`
          : 'Unknown',
    },
    {
      label: 'Remaining',
      value:
        pagesRemaining !== undefined ? `${pagesRemaining} pages` : 'Unknown',
    },
    {
      label: 'Started Reading',
      value: props.book.progress.startedAt
        ? toFullDateCompact(props.book.progress.startedAt)
        : 'Not started',
    },
    {
      label: 'Finished Reading',
      value: props.book.progress.finishedAt
        ? toFullDateCompact(props.book.progress.finishedAt)
        : 'In progress',
    },
  ]
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.eyebrow {
  @apply text-ink-muted text-xs font-bold tracking-widest uppercase;
}

.status-chip {
  @apply border-primary/20 bg-primary/10 text-primary inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase;
}

.status-panel {
  @apply bg-surface-canvas/70 border-stroke-subtle flex flex-col gap-4 rounded-2xl border p-3 sm:p-4;
}

.label {
  @apply text-ink-muted text-xs font-semibold tracking-wider uppercase;
}

.value {
  @apply text-ink-primary text-sm font-semibold;
}
</style>

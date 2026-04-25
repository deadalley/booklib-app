<template>
  <div class="paper flex flex-col gap-3 p-5">
    <p class="eyebrow">Reading Progress</p>

    <p
      class="text-primary text-end text-3xl leading-none font-semibold sm:text-4xl"
    >
      {{ progress }}%
    </p>

    <bl-progress-bar :progress-value="progress" size="sm" color="bg-primary" />

    <p class="text-ink-primary text-end text-sm leading-snug font-semibold">
      {{ subtitle }}
    </p>
  </div>

  <div class="paper flex flex-col gap-3 p-5">
    <div class="status-panel">
      <div class="flex items-center justify-between">
        <p class="eyebrow">Reading Status</p>
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
import type { BookProgressStatus } from '~/types/book'
import type { Book } from '~/types/book'
import { PROGRESS_STATUS_MAP } from '~/utils/constants'
import { toFullDateCompact } from '~/utils/date'

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (e: 'step-change', step: number): void
  (e: 'status-select', status: BookProgressStatus): void
}>()

const currentStatus = computed(
  () => props.book.progressStatus ?? ('not-owned' as BookProgressStatus),
)

const radius = 30
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => circumference * (1 - progress.value / 100))

const progress = computed(() => {
  if (currentStatus.value === 'read') return 100
  if (currentStatus.value === 'not-finished') return 75
  if (currentStatus.value === 'reading' || currentStatus.value === 'paused') {
    return 50
  }
  if (currentStatus.value === 'owned') return 8

  return 0
})

const subtitle = computed(() => {
  const pages = props.book.pages
  if (!pages) {
    return PROGRESS_STATUS_MAP[currentStatus.value].description
  }

  const pagesRead = Math.round((pages * progress.value) / 100)
  return `${pagesRead} of ${pages} pages`
})

const readingTrackingDays = computed(() => {
  if (!props.book.startedAt) return undefined

  const startedAt = new Date(props.book.startedAt)
  const endDate = props.book.finishedAt
    ? new Date(props.book.finishedAt)
    : new Date()
  const diff = endDate.getTime() - startedAt.getTime()

  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const secondaryLabel = computed(() =>
  readingTrackingDays.value ? 'Days Tracked' : 'Current Status',
)

const secondaryValue = computed(() =>
  readingTrackingDays.value
    ? `${readingTrackingDays.value} days`
    : PROGRESS_STATUS_MAP[currentStatus.value].description,
)

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
      value: props.book.startedAt
        ? toFullDateCompact(props.book.startedAt)
        : 'Not started',
    },
    {
      label: 'Finished Reading',
      value: props.book.finishedAt
        ? toFullDateCompact(props.book.finishedAt)
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

<template>
  <section class="paper flex flex-col gap-5 px-5 py-5 sm:px-6">
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-4">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="flex min-w-0 flex-col gap-2">
            <p class="eyebrow">Reading Progress</p>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <p
                class="text-primary text-4xl leading-none font-semibold sm:text-5xl"
              >
                {{ progress }}%
              </p>
              <div class="flex min-w-0 flex-col gap-0.5 sm:pb-0.5">
                <p class="text-ink-primary text-sm font-semibold">
                  {{ subtitle }}
                </p>
                <p class="text-ink-muted text-sm">
                  {{ secondaryLabel }}: {{ secondaryValue }}
                </p>
              </div>
            </div>
          </div>

          <span class="status-chip self-start sm:self-auto">
            {{ badgeLabel }}
          </span>
        </div>

        <bl-progress-bar
          :progress-value="progress"
          size="sm"
          color="bg-primary"
        />
      </div>

      <div class="status-panel">
        <div
          class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
        >
          <p class="eyebrow">Reading Status</p>
          <p
            class="text-ink-muted text-xs font-medium tracking-wide uppercase sm:text-right"
          >
            Update progress
          </p>
        </div>

        <bl-book-status-stepper
          :current-status="currentStatus"
          @step-click="emit('step-change', $event)"
          @status-select="emit('status-select', $event)"
        />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <p class="label">{{ stat.label }}</p>
        <p class="value">{{ stat.value }}</p>
      </div>
    </div>
  </section>
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

const badgeLabel = computed(() => {
  if (currentStatus.value === 'reading' || currentStatus.value === 'paused') {
    return 'Active Tracking'
  }

  if (currentStatus.value === 'read') {
    return 'Finished'
  }

  if (currentStatus.value === 'not-finished') {
    return 'Archived'
  }

  if (currentStatus.value === 'owned') {
    return 'Owned'
  }

  return 'Pending'
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
  @apply text-ink-secondary text-sm font-bold tracking-widest uppercase;
}

.status-chip {
  @apply border-primary/20 bg-primary/10 text-primary inline-flex max-w-full rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase;
}

.status-panel {
  @apply bg-surface-canvas/70 border-stroke-subtle flex flex-col gap-4 rounded-2xl border p-3 sm:p-4;
}

.stat-card {
  @apply bg-surface-canvas/70 flex flex-col gap-1 rounded-2xl p-4;
}

.label {
  @apply text-ink-muted text-sm font-semibold tracking-wider uppercase;
}

.value {
  @apply text-ink-primary text-lg font-bold;
}
</style>

<template>
  <div class="progress-card">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <p class="book-page-section-title">Progress</p>
      <span class="text-ink-muted text-sm font-semibold">
        {{ books.length }} {{ books.length === 1 ? 'book' : 'books' }}
      </span>
    </div>

    <p v-if="!books.length" class="text-ink-muted text-sm leading-normal">
      No books yet.
    </p>
    <div v-else class="flex flex-col gap-2.5">
      <!-- prettier-ignore -->
      <p class="progress-percentage">{{ percentage }}<small>% read</small></p>
      <bl-progress-bar
        :progress-value="percentage"
        size="xs"
        color="bg-primary"
      />
      <div class="progress-stats">
        <div v-for="stat in stats" :key="stat.label" class="progress-stat">
          <span class="progress-stat-value">{{ stat.value }}</span>
          <span class="progress-stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <ul
      v-if="statusRows.length"
      class="border-stroke-subtle flex flex-col gap-2 border-t pt-3"
    >
      <li
        v-for="row in statusRows"
        :key="row.label"
        class="text-ink-secondary flex items-center gap-2 text-sm font-medium"
      >
        <component :is="icons[row.icon]" :size="16" stroke="1.6" />
        <span>{{ row.label }}</span>
        <b class="text-ink-primary ml-auto font-bold">{{ row.count }}</b>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Book, BookProgressStatus } from '~/types/book'

const props = defineProps<{
  books: Pick<Book, 'progress'>[]
}>()

function countStatus(status: BookProgressStatus | null) {
  return props.books.filter(
    ({ progress }) => (progress.status ?? null) === status,
  ).length
}

const percentage = computed(() =>
  props.books.length
    ? Math.round((countStatus('read') / props.books.length) * 100)
    : 0,
)

const stats = computed(() => [
  { label: 'Read', value: countStatus('read') },
  {
    label: 'In progress',
    value: countStatus('reading') + countStatus('paused'),
  },
  { label: 'Not started', value: countStatus(null) },
])

const statusRows = computed(() =>
  [
    ...Object.values(PROGRESS_STATUS_MAP).map(({ id, icon, description }) => ({
      icon,
      label: description,
      count: countStatus(id),
    })),
    {
      icon: 'IconBook2' as keyof typeof icons,
      label: 'Not started',
      count: countStatus(null),
    },
  ].filter(({ count }) => count > 0),
)
</script>

<template>
  <bl-stats-empty
    v-if="!buckets.some(({ books }) => books.length)"
    label="No books finished in this period"
  />
  <div v-else class="flex flex-col gap-4">
    <div class="plot" :style="{ '--n': buckets.length }">
      <button
        v-for="bucket in buckets"
        :key="bucket.key"
        type="button"
        class="column"
        :class="{
          selected: bucket.key === selected,
          zero: !bucket.books.length,
        }"
        :aria-pressed="bucket.key === selected"
        :aria-label="`${bucket.label}: ${bucket.books.length} ${bucket.books.length === 1 ? 'book' : 'books'}`"
        @click="selected = bucket.key === selected ? null : bucket.key"
      >
        <span class="value">{{ bucket.books.length || '' }}</span>
        <span
          class="bar"
          :style="{ height: `${(bucket.books.length / max) * 100}%` }"
        />
        <span class="label">{{ bucket.short }}</span>
      </button>
    </div>

    <div
      v-if="current"
      class="border-stroke-subtle flex flex-col gap-2 border-t pt-3"
    >
      <p class="stats-sub">
        {{
          current.books.length
            ? `Finished in ${current.label}`
            : `Nothing finished in ${current.label}`
        }}
      </p>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="book in current.books"
          :key="book.id"
          :to="`/library/books/${book.id}`"
          class="chip"
        >
          {{ book.title }}
          <span v-if="book.rating != null">{{ book.rating }} ★</span>
        </NuxtLink>
      </div>
    </div>
    <p v-else class="stats-sub mt-1">Select a bar to see the books.</p>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

export type StatsActivityBucket = {
  key: string
  label: string
  short: string
  books: Book[]
}

const props = defineProps<{ buckets: StatsActivityBucket[] }>()

const selected = defineModel<string | null>({ default: null })

const max = computed(() =>
  Math.max(1, ...props.buckets.map(({ books }) => books.length)),
)

const current = computed(() =>
  props.buckets.find(({ key }) => key === selected.value),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.plot {
  @apply grid h-52 items-end gap-1.5;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  background: repeating-linear-gradient(
    to top,
    var(--color-stroke-subtle, #ece8e7) 0 1px,
    transparent 1px 25%
  );
  background-size: 100% calc(100% - 1.5rem);
  background-repeat: no-repeat;
}
.column {
  @apply grid h-full min-w-0 cursor-pointer grid-rows-[auto_1fr_auto] justify-items-center gap-1 p-0;
}
.bar {
  @apply bg-primary-200 block min-h-[3px] w-full max-w-11 self-end rounded-t-md rounded-b-[2px] transition-colors duration-150;
}
.column:hover .bar {
  @apply bg-primary-400;
}
.column.selected .bar {
  @apply bg-primary;
}
.column.zero .bar {
  @apply bg-surface-container;
}
.value {
  @apply text-ink-secondary min-h-4 text-[0.8125rem] font-bold;
}
.label {
  @apply text-ink-muted text-xs font-semibold whitespace-nowrap;
}
.column.selected .label {
  @apply text-primary;
}
.chip {
  @apply text-ink-primary bg-surface-subtle border-stroke rounded-scholarly hover:border-primary hover:text-primary inline-flex items-center gap-2 border px-3 py-1 text-sm font-semibold;
}
.chip span {
  @apply text-ink-muted font-medium;
}
</style>

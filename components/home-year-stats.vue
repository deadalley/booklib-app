<template>
  <bl-home-card
    title="Year in review"
    class="glimpse"
    data-testid="home-year-review"
  >
    <!-- A new year with nothing logged yet -->
    <div v-if="!review.hasActivity" class="empty">
      <span class="empty-icon" aria-hidden="true">
        <IconSparkles :size="28" stroke="1.6" />
      </span>
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h4 class="glimpse-title">Your {{ year }} starts here</h4>
          <p class="text-ink-secondary mt-1 max-w-[52ch] text-[0.9375rem]">
            Finish a book or log some pages and your year in review begins to
            take shape.
          </p>
        </div>
        <bl-button
          v-if="previousHasActivity"
          :to="`/stats/year/${year - 1}`"
          variant="secondary"
          class="w-fit"
        >
          Revisit your {{ year - 1 }} in review →
        </bl-button>
      </div>
      <div class="flex flex-wrap gap-2">
        <bl-button to="/library/books/new">Add a book</bl-button>
        <bl-button to="/library/books" variant="secondary">Log pages</bl-button>
      </div>
    </div>

    <div v-else class="filled">
      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <h4 class="glimpse-title">Your {{ year }} in books</h4>
        <div class="numbers">
          <div v-for="stat in stats" :key="stat.unit">
            <p class="number">{{ stat.value }}</p>
            <p class="unit">{{ stat.unit }}</p>
            <bl-chip
              v-if="stat.delta"
              rounded
              bold
              size="sm"
              class="delta mt-2"
            >
              <template #prependIcon>
                <IconTrendingUp
                  v-if="stat.delta.direction === 'up'"
                  :size="12"
                  stroke="2.4"
                  class="text-primary"
                />
              </template>
              {{ stat.delta.label }}
            </bl-chip>
          </div>
        </div>
        <div
          v-if="insight"
          class="insight"
          aria-live="polite"
          v-on="carousel.listeners"
        >
          <span class="insight-big">{{ insight.big }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-ink-primary text-[0.9375rem] font-bold">
              {{ insight.headline }}
            </p>
            <bl-carousel-dots
              v-if="review.insights.length > 1"
              :model-value="index"
              :count="review.insights.length"
              label="Insight"
              size="sm"
              class="-ml-2"
              @update:model-value="(k) => carousel.pick(k, { hold: true })"
            />
          </div>
        </div>
        <bl-button
          :to="`/stats/year/${year}`"
          variant="secondary"
          class="see-review"
        >
          See your {{ year }} in review →
        </bl-button>
      </div>

      <div v-if="review.top.length" class="top">
        <h5 class="stats-title text-xs!">Your top {{ topBooks.length }}</h5>
        <div class="top-books">
          <bl-book-tile
            v-for="(book, rank) in topBooks"
            :key="book.id"
            :book="book"
            :rank="rank + 1"
          />
        </div>
      </div>
    </div>
  </bl-home-card>
</template>

<script setup lang="ts">
import { IconSparkles, IconTrendingUp } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Goal } from '~/types/goal'

const props = defineProps<{
  books: Book[]
  authors: Author[]
  goals: Goal[]
}>()

const year = getCurrentYear()

const authorName = (id: string | null) =>
  props.authors.find((author) => author.id === id)?.name ?? 'Unknown author'

const review = computed(() =>
  getYearReview(
    year,
    props.books.map((book) => ({
      ...book,
      authorName: authorName(book.author),
    })),
    props.goals,
    authorName,
  ),
)

const previousHasActivity = computed(() => {
  const totals = getYearTotals(props.books, year - 1)
  return totals.books > 0 || totals.days > 0
})

const stats = computed(() => {
  const { totals, previous, previousYear, hasLogs } = review.value
  const format = (value: number) => value.toLocaleString('en-US')
  const stat = (
    unit: string,
    current: number,
    before: number,
    logged = true,
  ) =>
    logged
      ? {
          unit,
          value: format(current),
          delta: formatYearDelta(current, before, previousYear),
        }
      : { unit, value: '—', delta: null }
  return [
    stat('Books finished', totals.books, previous.books),
    stat('Pages logged', totals.pages, previous.pages, hasLogs),
    stat('Reading days', totals.days, previous.days, hasLogs),
  ]
})

const topBooks = computed(() => review.value.top.slice(0, 3) as ViewBook[])

const carousel = useCarousel(() => review.value.insights.length, 5000)
const { index } = carousel
const insight = computed(() => review.value.insights[index.value])
</script>

<style scoped>
@reference '../assets/css/main.css';

.glimpse {
  container-type: inline-size;
}
.glimpse-title {
  @apply font-display text-ink-primary text-3xl leading-[1.15] font-semibold;
}
.filled {
  @apply flex flex-row gap-10;
}
.numbers {
  @apply grid grid-cols-3 gap-7;
}
.number {
  @apply font-display text-ink-primary text-[44px] leading-none font-semibold;
}
.unit {
  @apply text-ink-muted mt-1.5 text-xs font-bold tracking-[0.12em] uppercase;
}
.insight {
  @apply bg-primary-50 border-primary-200 flex items-start gap-3 rounded-[10px] border px-3.5 py-3;
}
.insight-big {
  @apply font-display text-primary min-w-11 flex-none text-[26px] leading-none font-semibold;
}
.see-review {
  @apply w-fit;
}
.top {
  @apply border-stroke-subtle flex w-[460px] flex-none flex-col gap-3 border-l pl-10;
}
.top-books {
  @apply grid grid-cols-3 gap-3;
}
.empty {
  @apply flex flex-row items-center gap-10;
}
.empty-icon {
  @apply bg-secondary-50 text-secondary-700 grid size-14 flex-none place-items-center rounded-[14px];
}

@container (max-width: 900px) {
  .filled,
  .empty {
    @apply flex-col items-stretch gap-5;
  }
  .glimpse-title {
    @apply text-2xl;
  }
  .numbers {
    @apply gap-2;
  }
  .number {
    @apply text-[32px];
  }
  .see-review {
    @apply w-full;
  }
  /* Let "vs 2025: +540" wrap instead of overflowing the column */
  .delta {
    @apply max-w-full whitespace-normal!;
  }
  .top {
    @apply border-stroke-subtle w-full border-t border-l-0 pt-4.5 pl-0;
  }
}
</style>

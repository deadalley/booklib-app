<template>
  <NuxtLayout name="dashboard" title="Year in review">
    <div class="review">
      <!-- Header -->
      <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div class="min-w-0 flex-1">
          <NuxtLink to="/stats" class="back-link">
            <IconChevronLeft :size="16" stroke="2" />
            Statistics
          </NuxtLink>
          <p class="eyebrow">
            {{ isCurrent ? 'Year in progress' : 'Year in review' }}
          </p>
          <h1 class="page-title">Your {{ year }} in books</h1>
        </div>
        <div
          v-if="years.length > 1"
          role="group"
          aria-label="Choose a year"
          class="flex items-center gap-2"
        >
          <bl-icon-button
            variant="secondary"
            class="size-11"
            aria-label="Previous year"
            :disabled="!olderYear"
            @click="goToYear(olderYear)"
          >
            <IconChevronLeft :size="18" stroke="2" />
          </bl-icon-button>
          <bl-stats-select
            :model-value="String(year)"
            label="Year"
            :options="yearOptions"
            @update:model-value="(value) => goToYear(Number(value))"
          />
          <bl-icon-button
            variant="secondary"
            class="size-11"
            aria-label="Next year"
            :disabled="!newerYear"
            @click="goToYear(newerYear)"
          >
            <IconChevronRight :size="18" stroke="2" />
          </bl-icon-button>
        </div>
      </div>

      <template v-if="loaded && review">
        <!-- Empty past year -->
        <div
          v-if="!review.hasActivity && !isCurrent"
          class="card items-center px-8 py-14 text-center"
          data-testid="year-empty"
        >
          <span class="icon-well size-16 rounded-2xl">
            <IconBooks :size="32" stroke="1.5" />
          </span>
          <h2 class="text-[28px]">Nothing logged in {{ year }}</h2>
          <p class="text-ink-secondary max-w-[44ch]">
            No books were finished and no pages were logged this year, so there
            is nothing to look back on. Your other years are one tap away.
          </p>
          <div class="mt-2 flex flex-wrap justify-center gap-2">
            <bl-button :to="`/stats/year/${currentYear}`">
              Go to your {{ currentYear }} review
            </bl-button>
            <bl-button to="/stats" variant="secondary">
              Back to Statistics
            </bl-button>
          </div>
        </div>

        <!-- A new year with nothing logged yet -->
        <template v-else-if="!review.hasActivity">
          <div class="card starts-here" data-testid="year-starts-here">
            <span class="icon-well secondary size-14 rounded-[14px]">
              <IconSparkles :size="28" stroke="1.6" />
            </span>
            <div class="min-w-0 flex-1">
              <h2 class="text-[26px]">Your {{ year }} starts here</h2>
              <p class="text-ink-secondary max-w-[56ch]">
                Finish a book or log some pages and your reading days will begin
                to fill in below. Nothing to set up.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <bl-button to="/library/books">Log pages</bl-button>
              <bl-button to="/library/books/new" variant="secondary">
                Add a book
              </bl-button>
            </div>
          </div>
          <bl-section-tile
            v-if="previousHasActivity"
            :href="`/stats/year/${year - 1}`"
            icon="IconTrophy"
          >
            <template #label>Your {{ year - 1 }} in review is ready</template>
            <template #description>Look back on the whole year.</template>
          </bl-section-tile>
          <section class="section" aria-labelledby="h-rhythm">
            <div class="section-head">
              <h2 id="h-rhythm" class="section-title">Reading rhythm</h2>
              <p class="section-sub">
                One square per day. They fill in as you log pages and finish
                books.
              </p>
            </div>
            <div class="card">
              <bl-year-heatmap
                :year="year"
                :days="review.days"
                :cell-size="19"
                title="Your reading days"
                :label="`Calendar of reading days for ${year}. No reading days yet.`"
              />
            </div>
          </section>
        </template>

        <!-- The review -->
        <template v-else>
          <div class="flex flex-col gap-5">
            <div class="kpis">
              <bl-stats-kpi
                v-for="kpi in kpis"
                :key="kpi.unit"
                :icon="kpi.icon"
                :value="kpi.value"
                :unit="kpi.unit"
              >
                <bl-chip v-if="kpi.delta" rounded bold class="mt-1 text-xs">
                  <template #prependIcon>
                    <component
                      :is="DELTA_ICONS[kpi.delta.direction]"
                      :size="14"
                      stroke="2.2"
                      class="text-primary"
                    />
                  </template>
                  {{ kpi.delta.label }}
                </bl-chip>
                <p v-else class="text-ink-muted text-[0.8125rem] font-semibold">
                  Log pages to see this.
                </p>
              </bl-stats-kpi>
            </div>
            <bl-year-highlights
              v-if="review.insights.length"
              :insights="review.insights"
            />
          </div>

          <!-- Reading rhythm -->
          <section class="section" aria-labelledby="h-rhythm">
            <div class="section-head">
              <h2 id="h-rhythm" class="section-title">Reading rhythm</h2>
              <p class="section-sub">
                A day counts when you logged pages or finished a book.
              </p>
            </div>
            <div class="rhythm">
              <div v-if="review.hasLogs" class="card min-w-0">
                <bl-year-heatmap
                  :year="year"
                  :days="review.days"
                  title="Days you read"
                  :label="`Calendar of reading days for ${year}: ${review.totals.days} days with page logs or finished books.`"
                />
              </div>
              <div v-else class="card log-hint">
                <span class="icon-well muted size-11">
                  <IconCalendar :size="22" stroke="1.7" />
                </span>
                <div class="min-w-0 flex-1">
                  <h5 class="stats-title">Reading days</h5>
                  <p class="text-ink-primary mt-1 font-semibold">
                    Log pages to see your reading days
                  </p>
                  <p class="text-ink-secondary text-sm">
                    Your calendar and longest streak appear once you log pages
                    as you read.
                  </p>
                </div>
                <bl-button to="/library/books" variant="secondary">
                  Log pages
                </bl-button>
              </div>
              <bl-stats-tile
                title="Started, finished, set aside"
                :sub="carryOver"
              >
                <bl-stats-donut :items="flowItems" :total="flowTotal" />
              </bl-stats-tile>
            </div>
          </section>

          <!-- Your books -->
          <section class="section" aria-labelledby="h-books">
            <div class="section-head">
              <h2 id="h-books" class="section-title">Your books</h2>
              <p class="section-sub">
                The ones that stood out, and the two that opened and closed your
                year.
              </p>
            </div>
            <div class="books">
              <div class="flex min-w-0 flex-col gap-3">
                <h5 class="stats-title">Top {{ topBooks.length }} books</h5>
                <p class="text-ink-secondary -mt-1.5 text-sm">
                  {{
                    review.rankedByRating
                      ? 'Ranked by your rating. Ties go to the longer book.'
                      : 'Ranked by page count, longest first. Rate your books to rank them by rating.'
                  }}
                </p>
                <div class="top-books">
                  <bl-book-tile
                    v-for="(book, index) in topBooks"
                    :key="book.id"
                    :book="book"
                    :rank="index + 1"
                  />
                </div>
              </div>
              <div
                v-if="firstAndLast.length"
                class="flex min-w-0 flex-col gap-3"
              >
                <h5 class="stats-title">First and last</h5>
                <p class="text-ink-secondary -mt-1.5 text-sm">
                  {{
                    isCurrent
                      ? 'The book that opened your year, and the latest one you finished.'
                      : 'The book that opened your year, and the one that closed it.'
                  }}
                </p>
                <NuxtLink
                  v-for="item in firstAndLast"
                  :key="item.label"
                  :to="`/library/books/${item.book.id}`"
                  class="card book-row"
                >
                  <bl-home-book-cover
                    :book="item.book"
                    class="book-row-cover"
                  />
                  <div class="flex min-w-0 flex-1 flex-col gap-1 py-3.5 pr-4">
                    <p class="stats-title text-xs!">{{ item.label }}</p>
                    <h3 class="book-row-title">{{ item.book.title }}</h3>
                    <p class="text-ink-secondary text-sm">
                      {{ item.book.authorName ?? 'Unknown author' }}
                    </p>
                    <p class="text-ink-secondary text-[0.8125rem] font-bold">
                      {{ item.meta }}
                    </p>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </section>

          <!-- Goals & challenges -->
          <section
            v-if="review.goals.length"
            class="section"
            aria-labelledby="h-goals"
          >
            <div class="section-head">
              <h2 id="h-goals" class="section-title">Goals &amp; challenges</h2>
              <p class="section-sub">
                Every goal you set in {{ year }}, with the completed ones
                highlighted.
              </p>
            </div>
            <div class="kpis">
              <bl-stats-kpi
                v-for="kpi in goalKpis"
                :key="kpi.unit"
                :icon="kpi.icon"
                :value="kpi.value"
                :unit="kpi.unit"
                :hint="kpi.hint"
              />
            </div>
            <ul class="card goal-list" data-testid="year-goals">
              <li
                v-for="row in review.goals"
                :key="row.goal.id"
                class="goal-row"
                :class="{ done: row.status === 'completed' }"
              >
                <span class="goal-check" aria-hidden="true">
                  <IconCheck
                    v-if="row.status === 'completed'"
                    :size="16"
                    stroke="2.6"
                  />
                </span>
                <div class="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
                  <span class="flex flex-wrap items-center gap-2 font-bold">
                    <NuxtLink
                      :to="`/tracking#goal-${row.goal.id}`"
                      class="hover:text-primary"
                    >
                      {{ row.goal.title }}
                    </NuxtLink>
                    <bl-challenge-badge
                      v-if="row.challengeLevel"
                      :level="row.challengeLevel"
                    />
                  </span>
                  <span class="text-ink-muted text-sm font-semibold">
                    {{ row.detail }}
                  </span>
                </div>
                <div class="flex min-w-0 flex-[1_1_140px] items-center gap-3">
                  <bl-progress-bar
                    :progress-value="row.pct"
                    size="sm"
                    :color="GOAL_BAR[row.status]"
                  />
                  <span class="w-11 text-right text-sm font-bold">
                    {{ row.pct }}%
                  </span>
                </div>
                <bl-chip
                  rounded
                  bold
                  class="text-xs"
                  v-bind="GOAL_CHIP[row.status]"
                >
                  {{ goalStatusLabel(row) }}
                </bl-chip>
              </li>
            </ul>
          </section>

          <!-- Notes -->
          <section
            v-if="review.notes.length"
            class="section"
            aria-labelledby="h-notes"
          >
            <div class="section-head">
              <h2 id="h-notes" class="section-title">Notes</h2>
              <p class="section-sub">What you wrote down while you read.</p>
            </div>
            <div class="notes">
              <div class="card justify-between gap-5">
                <div>
                  <h5 class="stats-title">Notes written</h5>
                  <p class="mt-2 flex items-baseline gap-2">
                    <span class="big-number">{{ review.notes.length }}</span>
                    <span class="unit">notes</span>
                  </p>
                </div>
                <div
                  v-if="review.mostNoted"
                  class="border-stroke-subtle border-t pt-3.5"
                >
                  <p class="unit mb-1">Most-noted book</p>
                  <p class="book-row-title">
                    {{ review.mostNoted.book.title }}
                  </p>
                  <p class="text-ink-secondary text-sm">
                    {{ review.mostNoted.count }}
                    {{ review.mostNoted.count === 1 ? 'note' : 'notes' }}
                  </p>
                </div>
              </div>
              <figure
                v-for="{ book, note } in review.notes.slice(0, 2)"
                :key="`${book.id}-${note.createdAt}`"
                class="card quote"
              >
                <blockquote>“{{ note.content }}”</blockquote>
                <figcaption
                  class="text-ink-secondary text-[0.8125rem] font-bold"
                >
                  {{ book.title }}
                  <span class="text-ink-muted font-semibold">
                    · {{ formatDay(note.createdAt) }}
                  </span>
                </figcaption>
              </figure>
            </div>
          </section>

          <!-- Authors & genres -->
          <section class="section" aria-labelledby="h-ag">
            <div class="section-head">
              <h2 id="h-ag" class="section-title">Authors &amp; genres</h2>
              <p class="section-sub">
                Who you met for the first time, who you came back to, and what
                you gravitated toward.
              </p>
            </div>
            <div class="authors-genres">
              <bl-stats-tile title="New authors">
                <p class="flex items-baseline gap-2">
                  <span class="big-number">{{ review.newAuthors.length }}</span>
                  <span class="unit">first time reading them</span>
                </p>
                <ul v-if="review.newAuthors.length" class="name-list">
                  <li v-for="name in review.newAuthors" :key="name">
                    <span class="bg-primary" />
                    {{ name }}
                  </li>
                </ul>
              </bl-stats-tile>
              <bl-stats-tile title="Recurring authors">
                <p class="flex items-baseline gap-2">
                  <span class="big-number">
                    {{ review.recurringAuthors.length }}
                  </span>
                  <span class="unit">you came back to</span>
                </p>
                <bl-stats-donut
                  v-if="review.recurringAuthors.length"
                  :items="toDonut(review.recurringAuthors)"
                  :total="sumOf(review.recurringAuthors)"
                />
              </bl-stats-tile>
              <bl-stats-tile title="New genres">
                <p class="flex items-baseline gap-2">
                  <span class="big-number">{{ review.newGenres.length }}</span>
                  <span class="unit">you hadn’t read before</span>
                </p>
                <ul v-if="review.newGenres.length" class="name-list">
                  <li v-for="genre in review.newGenres" :key="genre">
                    <span class="bg-secondary-700" />
                    {{ genre }}
                  </li>
                </ul>
              </bl-stats-tile>
              <bl-stats-tile title="Most read genres">
                <bl-stats-donut
                  :items="toDonut(review.topGenres)"
                  :total="sumOf(review.topGenres)"
                />
              </bl-stats-tile>
            </div>
          </section>

          <p v-if="hasUndatedBooks" class="text-ink-muted text-[0.8125rem]">
            Books marked as read without a date aren’t included in this review.
          </p>
        </template>
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconBooks,
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMinus,
  IconSparkles,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-vue'
import type { icons } from '@tabler/icons-vue'
import dayjs from 'dayjs'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Goal, GoalDisplayStatus } from '~/types/goal'
import type { StatsDonutItem } from '~/components/stats-donut.vue'
import type { CountItem, YearGoalRow } from '~/utils/year-review'

const DELTA_ICONS = {
  up: IconTrendingUp,
  down: IconTrendingDown,
  same: IconMinus,
}
const DONUT_TONES = [
  'tone-primary',
  'tone-secondary-400',
  'tone-primary-200',
  'tone-ink-subtle',
]
const GOAL_BAR: Record<GoalDisplayStatus, string> = {
  completed: 'bg-primary',
  tracking: 'bg-primary-200',
  'not-tracking': 'bg-primary-200',
  expired: 'bg-ink-subtle',
}
const GOAL_CHIP: Record<
  GoalDisplayStatus,
  { variant?: 'primary' | 'secondary'; color?: 'primary' | 'secondary' }
> = {
  completed: { variant: 'primary' },
  tracking: { variant: 'secondary', color: 'secondary' },
  'not-tracking': { variant: 'secondary', color: 'secondary' },
  expired: {},
}

const route = useRoute()
const { getBooks, getAuthors, getGoals } = useBookLibrary()

const books = ref<Book[]>([])
const authors = ref<Author[]>([])
const goals = ref<Goal[]>([])
const loaded = ref(false)

onMounted(async () => {
  const [bookData, authorData, goalData] = await Promise.all([
    getBooks(),
    getAuthors(),
    getGoals(),
  ])
  books.value = bookData
  authors.value = authorData
  goals.value = goalData
  loaded.value = true
})

const currentYear = getCurrentYear()
const year = computed(() => {
  const value = Number(route.params.year)
  return Number.isInteger(value) && value > 0 ? value : currentYear
})
const isCurrent = computed(() => year.value === currentYear)

const authorName = (id: string | null) =>
  authors.value.find((author) => author.id === id)?.name ?? 'Unknown author'

const viewBooks = computed<ViewBook[]>(() =>
  books.value.map((book) => ({ ...book, authorName: authorName(book.author) })),
)

const review = computed(() =>
  loaded.value
    ? getYearReview(year.value, viewBooks.value, goals.value, authorName)
    : null,
)

const previousHasActivity = computed(() => {
  const totals = getYearTotals(books.value, year.value - 1)
  return totals.books > 0 || totals.days > 0
})

// Year picker: years with activity, plus the one being viewed
const years = computed(() =>
  [...new Set([...getReviewYears(books.value), year.value])].sort(
    (a, b) => b - a,
  ),
)
const yearOptions = computed(() =>
  years.value.map((value) => ({ value: String(value), label: String(value) })),
)
const olderYear = computed(() =>
  years.value.find((value) => value < year.value),
)
const newerYear = computed(() =>
  [...years.value].reverse().find((value) => value > year.value),
)

function goToYear(value: number | undefined) {
  if (value) navigateTo(`/stats/year/${value}`)
}

const formatCount = (value: number) => value.toLocaleString('en-US')
const formatDay = (date: string) =>
  dayjs.utc(toSimpleDate(date)).format('MMMM D')

const kpis = computed(() => {
  const value = review.value!
  const { totals, previous, previousYear, hasLogs } = value
  const delta = (current: number, before: number) =>
    formatYearDelta(current, before, previousYear)
  const logged = (current: number, before: number) =>
    hasLogs
      ? { value: formatCount(current), delta: delta(current, before) }
      : { value: '—', delta: null }

  return [
    {
      icon: 'IconBooks' as keyof typeof icons,
      unit: 'books finished',
      value: formatCount(totals.books),
      delta: delta(totals.books, previous.books),
    },
    {
      icon: 'IconNotebook' as keyof typeof icons,
      unit: 'pages logged',
      ...logged(totals.pages, previous.pages),
    },
    {
      icon: 'IconCalendar' as keyof typeof icons,
      unit: 'reading days',
      ...logged(totals.days, previous.days),
    },
    {
      icon: 'IconBolt' as keyof typeof icons,
      unit: 'longest streak',
      ...logged(totals.streak, previous.streak),
    },
  ]
})

const flowItems = computed<StatsDonutItem[]>(() => {
  const value = review.value!
  return [
    { label: 'Finished', value: value.finished.length, tone: 'tone-primary' },
    {
      label: 'Still reading',
      value: value.stillReading.length,
      tone: 'tone-secondary-400',
    },
    {
      label: 'Did not finish',
      value: value.didNotFinish.length,
      tone: 'tone-ink-subtle',
    },
  ].filter(({ value }) => value > 0)
})
const flowTotal = computed(() =>
  flowItems.value.reduce((total, { value }) => total + value, 0),
)
const carryOver = computed(() => {
  const count = review.value?.stillReading.length ?? 0
  if (!count) return null
  return isCurrent.value
    ? `${count} carry over into ${year.value + 1}`
    : `${count} carried into ${year.value + 1}`
})

const topBooks = computed(() => review.value!.top as ViewBook[])

const firstAndLast = computed(() => {
  const value = review.value!
  const meta = (book: Book) => {
    const finishedAt = getBookFinishedAt(book)
    return [
      finishedAt ? `Finished ${formatDay(finishedAt)}` : null,
      book.pages ? `${book.pages} pages` : null,
    ]
      .filter(Boolean)
      .join(' · ')
  }
  return [
    value.first && {
      label: 'First book of the year',
      book: value.first as ViewBook,
      meta: meta(value.first),
    },
    value.last && {
      label: isCurrent.value ? 'Latest finished' : 'Last book finished',
      book: value.last as ViewBook,
      meta: meta(value.last),
    },
  ].filter((item): item is NonNullable<typeof item> => !!item)
})

const goalKpis = computed(() => {
  const value = review.value!
  const total = value.goals.length
  const running = value.goals.filter(
    ({ status }) => status === 'tracking' || status === 'not-tracking',
  ).length
  const expired = value.goals.filter(
    ({ status }) => status === 'expired',
  ).length
  return [
    {
      icon: 'IconTarget' as keyof typeof icons,
      unit: total === 1 ? 'goal set' : 'goals set',
      value: String(total),
      hint: `${running} running, ${expired} expired`,
    },
    {
      icon: 'IconCheck' as keyof typeof icons,
      unit: 'goals reached',
      value: String(value.goalsReached),
      hint: `${Math.round((value.goalsReached / total) * 100)}% of your goals`,
    },
    {
      icon: 'IconFlame' as keyof typeof icons,
      unit: 'challenges taken',
      value: String(value.challengesTaken),
      hint: `${value.challengesCompleted} completed`,
    },
    ...(value.hoursRead
      ? [
          {
            icon: 'IconClockHour3' as keyof typeof icons,
            unit: 'hours read',
            value: formatCount(Math.round(value.hoursRead)),
            hint: 'From your hours goals',
          },
        ]
      : []),
  ]
})

function goalStatusLabel(row: YearGoalRow) {
  switch (row.status) {
    case 'completed':
      return row.completedOn
        ? `Completed ${dayjs.utc(row.completedOn).format('MMM D')}`
        : 'Completed'
    case 'tracking':
      return 'Running'
    case 'not-tracking':
      return 'Paused'
    case 'expired':
      return 'Expired'
  }
}

const toDonut = (items: CountItem[]): StatsDonutItem[] =>
  items.map((item, index) => ({
    ...item,
    tone: DONUT_TONES[index % DONUT_TONES.length]!,
  }))
const sumOf = (items: CountItem[]) =>
  items.reduce((total, { value }) => total + value, 0)

const hasUndatedBooks = computed(() =>
  books.value.some((book) => isBookFinished(book) && !getBookFinishedAt(book)),
)

useHead({ title: () => `BookLib | ${year.value} in review` })
</script>

<style scoped>
@reference '../../../assets/css/main.css';

.review {
  @apply mx-auto flex w-full max-w-[90rem] flex-col gap-18;
  container-type: inline-size;
}
.review > :first-child {
  @apply -mb-8;
}
.back-link {
  @apply text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-bold;
}
.eyebrow {
  @apply text-primary mt-2 mb-1.5 text-[0.8125rem] font-bold tracking-[0.12em] uppercase;
}
.page-title {
  @apply font-display text-ink-primary text-[64px] leading-[1.05] font-semibold tracking-[-0.01em];
}
.card {
  @apply shadow-card;
}
.icon-well {
  @apply bg-primary-50 text-primary grid flex-none place-items-center;
}
.icon-well.secondary {
  @apply bg-secondary-50 text-secondary-700;
}
.icon-well.muted {
  @apply bg-surface-container text-ink-muted rounded-xl;
}
.starts-here,
.log-hint {
  @apply flex-row flex-wrap items-center gap-5;
}
.section {
  @apply border-stroke-subtle flex flex-col gap-6 border-t pt-10;
}
.section-head {
  @apply flex flex-col gap-1.5;
}
.section-title {
  @apply font-display text-ink-primary text-[34px] leading-[1.15] font-semibold;
}
.section-sub {
  @apply text-ink-secondary max-w-[62ch];
}
.kpis {
  @apply grid grid-cols-2 gap-3 @min-[900px]:grid-cols-4 @min-[900px]:gap-4;
}
.rhythm {
  @apply grid grid-cols-1 gap-5 @min-[900px]:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)];
}
.books {
  @apply grid grid-cols-1 gap-8 @min-[1100px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)];
}
.top-books {
  @apply grid grid-cols-5 gap-3;
}
.book-row {
  @apply hover:border-primary/40 flex-row gap-4 overflow-hidden p-0;
}
.book-row-cover {
  @apply min-h-39 w-26 flex-none self-stretch rounded-none;
}
.book-row-title {
  @apply font-display text-ink-primary text-[19px] leading-[1.2] font-semibold;
}
.goal-list {
  @apply gap-0 overflow-hidden p-0;
}
.goal-row {
  @apply flex flex-wrap items-center gap-x-5 gap-y-3 px-6.5 py-4;
}
.goal-row + .goal-row {
  @apply border-stroke-subtle border-t;
}
.goal-row.done {
  @apply bg-primary-50;
}
.goal-check {
  @apply border-stroke grid size-7 flex-none place-items-center rounded-full border-2;
}
.goal-row.done .goal-check {
  @apply bg-primary text-ink-inverse border-primary;
}
.notes {
  @apply grid grid-cols-1 gap-4 @min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)];
}
.quote {
  @apply bg-surface-subtle m-0 justify-between gap-4;
}
.quote blockquote {
  @apply font-display text-ink-primary text-xl leading-[1.45] font-medium italic;
}
.big-number {
  @apply font-display text-ink-primary text-[52px] leading-none font-semibold;
}
.unit {
  @apply text-ink-muted text-xs font-bold tracking-[0.12em] uppercase;
}
.authors-genres {
  @apply grid grid-cols-1 gap-4 @min-[900px]:grid-cols-2;
}
.name-list {
  @apply grid grid-cols-1 gap-x-6 @min-[640px]:grid-cols-2;
}
.name-list li {
  @apply border-stroke-subtle text-ink-primary flex min-h-10 items-center gap-2.5 border-t font-semibold;
}
.name-list li span {
  @apply size-1.5 flex-none rounded-full;
}

@container (max-width: 760px) {
  .review {
    @apply gap-12;
  }
  .review > :first-child {
    @apply -mb-6;
  }
  .page-title {
    @apply text-4xl;
  }
  .section {
    @apply gap-4 pt-7;
  }
  .section-title {
    @apply text-[26px];
  }
  .top-books {
    @apply -mx-4 flex overflow-x-auto px-4 pb-1.5;
  }
  .top-books > * {
    @apply flex-[0_0_160px];
  }
  .big-number {
    @apply text-[40px];
  }
  .goal-row {
    @apply px-4 py-3.5;
  }
}
</style>

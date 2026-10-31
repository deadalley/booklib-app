<template>
  <NuxtLayout name="dashboard" title="Statistics">
    <div class="stats">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-primary text-xs font-bold tracking-[0.18em] uppercase">
            Statistics
          </p>
          <h3 class="text-ink-primary text-balance">
            Your reading in {{ RANGE_TITLES[range] }}
          </h3>
        </div>
        <bl-switch v-model="range">
          <bl-switch-option
            v-for="option in RANGE_OPTIONS"
            :key="option.value"
            :value="option.value"
            :selected-value="range"
          >
            <template #label>{{ option.label }}</template>
          </bl-switch-option>
        </bl-switch>
      </div>

      <div class="hero">
        <bl-stats-goal-card :goal="featuredGoal" />
        <div class="kpis">
          <bl-stats-kpi
            icon="IconBooks"
            :value="formatCount(finished.length)"
            unit="books finished"
          />
          <bl-stats-kpi
            icon="IconBook"
            :value="formatCount(pagesRead)"
            unit="pages read"
            :hint="longestBook ? `Longest: ${longestBook.title}` : null"
          />
          <bl-stats-kpi
            icon="IconClockHour3"
            :value="averageDays === null ? '–' : formatCount(averageDays)"
            unit="avg. days per book"
          />
          <bl-stats-kpi
            icon="IconFeather"
            :value="formatCount(authorsRead)"
            :unit="authorsRead === 1 ? 'author read' : 'authors read'"
          />
        </div>
      </div>

      <div class="grid-12">
        <bl-stats-tile
          class="span-8"
          title="Finished books"
          :sub="range === 'all' ? 'By year' : 'By month'"
        >
          <bl-stats-activity v-model="selectedBucket" :buckets="buckets" />
        </bl-stats-tile>

        <bl-stats-tile
          class="span-4"
          title="Currently reading"
          :sub="
            currentlyReading.length
              ? `${currentlyReading.length} in progress`
              : null
          "
        >
          <bl-stats-current :books="currentlyReading" />
        </bl-stats-tile>

        <p class="section-label mt-4">
          Across your library · {{ books.length }}
          {{ books.length === 1 ? 'book' : 'books' }}
        </p>

        <bl-stats-tile class="span-5" title="Share by">
          <template #actions>
            <bl-stats-select
              v-model="share"
              label="Share by"
              :options="SHARE_OPTIONS"
            />
          </template>
          <bl-stats-donut :items="shareItems" :total="books.length" />
        </bl-stats-tile>

        <bl-stats-tile
          class="span-7"
          title="Distribution"
          :sub="distributionSummary"
        >
          <template #actions>
            <bl-stats-select
              v-model="distribution"
              label="Distribution of"
              :options="DISTRIBUTION_OPTIONS"
            />
          </template>
          <bl-stats-columns
            :items="distributionItems"
            :empty-label="
              distribution === 'rating' ? 'No rated books yet' : 'No data'
            "
          />
        </bl-stats-tile>

        <bl-stats-tile class="span-6" :title="`${rankTitle} books`">
          <template #actions>
            <bl-stats-select
              v-model="rankBy"
              label="Rank by"
              :options="RANK_OPTIONS"
            />
            <bl-switch v-model="rankOrder">
              <bl-switch-option value="top" :selected-value="rankOrder">
                <template #icon="iconProps">
                  <IconArrowUp v-bind="iconProps" />
                </template>
                <template #tooltip>Highest first</template>
              </bl-switch-option>
              <bl-switch-option value="low" :selected-value="rankOrder">
                <template #icon="iconProps">
                  <IconArrowDown v-bind="iconProps" />
                </template>
                <template #tooltip>Lowest first</template>
              </bl-switch-option>
            </bl-switch>
          </template>
          <bl-stats-ranked :items="rankedBooks" :format="formatRank" />
        </bl-stats-tile>

        <bl-stats-tile
          class="span-6"
          :title="
            groupBy === 'averageRatingAuthor'
              ? 'Top rated authors'
              : 'Most books by'
          "
          :sub="groups.length > 10 ? `Top 10 of ${groups.length}` : null"
        >
          <template #actions>
            <bl-stats-select
              v-model="groupBy"
              label="Group by"
              :options="GROUP_OPTIONS"
            />
          </template>
          <bl-stats-columns
            :items="groups.slice(0, 10)"
            :format="
              groupBy === 'averageRatingAuthor'
                ? (value) => `${value} ★`
                : String
            "
          />
        </bl-stats-tile>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconArrowDown, IconArrowUp } from '@tabler/icons-vue'
import { useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import type { Author } from '~/types/author'
import type { Book, BookProgressStatus } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import languageOptions from '~/public/languages-2.json'
import type { StatsActivityBucket } from '~/components/stats-activity.vue'
import type { StatsColumnItem } from '~/components/stats-columns.vue'
import type { StatsDonutItem } from '~/components/stats-donut.vue'

type Range = 'year' | '12m' | 'all'
type Share = 'status' | 'format' | 'ownership' | 'language' | 'originalLanguage'
type Distribution =
  | 'rating'
  | 'pages'
  | 'year'
  | 'decade'
  | 'language'
  | 'originalLanguage'
type RankBy = 'rating' | 'year' | 'pages'
type GroupBy =
  | 'author'
  | 'genres'
  | 'publisher'
  | 'collections'
  | 'averageRatingAuthor'

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: 'year', label: 'This year' },
  { value: '12m', label: '12 months' },
  { value: 'all', label: 'All time' },
]
const SHARE_OPTIONS: { value: Share; label: string }[] = [
  { value: 'status', label: 'Reading status' },
  { value: 'format', label: 'Format' },
  { value: 'ownership', label: 'Ownership' },
  { value: 'language', label: 'Language' },
  { value: 'originalLanguage', label: 'Original language' },
]
const DISTRIBUTION_OPTIONS: { value: Distribution; label: string }[] = [
  { value: 'rating', label: 'Rating' },
  { value: 'pages', label: 'Length' },
  { value: 'year', label: 'Publication year' },
  { value: 'decade', label: 'Publication decade' },
  { value: 'language', label: 'Language' },
  { value: 'originalLanguage', label: 'Original language' },
]
const RANK_OPTIONS: { value: RankBy; label: string }[] = [
  { value: 'rating', label: 'Rating' },
  { value: 'year', label: 'Year' },
  { value: 'pages', label: 'Pages' },
]
const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'author', label: 'Author' },
  { value: 'genres', label: 'Genre' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'collections', label: 'Collection' },
  { value: 'averageRatingAuthor', label: 'Avg. author rating' },
]

const STATUS_SLICES: {
  status: BookProgressStatus | null
  label: string
  tone: string
}[] = [
  { status: 'read', label: 'Read', tone: 'tone-primary' },
  { status: 'reading', label: 'Reading', tone: 'tone-primary-400' },
  { status: 'paused', label: 'Paused', tone: 'tone-secondary-400' },
  { status: 'not-finished', label: 'Not finished', tone: 'tone-ink-subtle' },
  { status: null, label: 'Not started', tone: 'tone-surface-container' },
]
const PALETTE = [
  'tone-primary',
  'tone-primary-400',
  'tone-secondary-400',
  'tone-primary-200',
  'tone-secondary-200',
  'tone-ink-subtle',
]
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const { getBooks, getAuthors, getCollections, getGoals } = useBookLibrary()

const books = ref<Book[]>([])
const authors = ref<Author[]>([])
const collections = ref<Collection[]>([])
const goals = ref<Goal[]>([])

onMounted(async () => {
  const [bookData, authorData, collectionData, goalData] = await Promise.all([
    getBooks(),
    getAuthors(),
    getCollections(),
    getGoals(),
  ])
  books.value = bookData
  authors.value = authorData
  collections.value = collectionData
  goals.value = goalData
})

function storedOption<T extends string>(
  key: string,
  options: { value: T }[],
  fallback: T,
) {
  const stored = useLocalStorage<T>(key, fallback)
  if (!options.some(({ value }) => value === stored.value)) {
    stored.value = fallback
  }
  return stored
}

const range = storedOption('bl-stats-range', RANGE_OPTIONS, 'year')
const share = storedOption('bl-stats-share', SHARE_OPTIONS, 'status')
const distribution = storedOption(
  'bl-stats-dist',
  DISTRIBUTION_OPTIONS,
  'rating',
)
const groupBy = storedOption('bl-stats-grp', GROUP_OPTIONS, 'author')
const rankBy = ref<RankBy>('rating')
const rankOrder = ref<'top' | 'low'>('top')
const selectedBucket = ref<string | null>(null)

watch(range, () => (selectedBucket.value = null))

const RANGE_TITLES = computed<Record<Range, string>>(() => ({
  year: String(getCurrentYear()),
  '12m': 'the last 12 months',
  all: 'all time',
}))

const formatCount = (value: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: 0 })

const today = dayjs.utc(todaySimpleDate())

const rangeStart = computed(() => {
  if (range.value === 'year') return today.startOf('year')
  if (range.value === '12m') return today.startOf('month').subtract(11, 'month')
  return null
})

const finishedAll = computed(() =>
  books.value.filter(
    ({ progress }) => progress.status === 'read' && !!progress.finishedAt,
  ),
)

const finishedOn = (book: Book) =>
  dayjs.utc(toSimpleDate(book.progress.finishedAt!))

const finished = computed(() =>
  finishedAll.value.filter(
    (book) => !rangeStart.value || !finishedOn(book).isBefore(rangeStart.value),
  ),
)

const pagesRead = computed(() =>
  finished.value.reduce((total, { pages }) => total + (pages ?? 0), 0),
)

const longestBook = computed(() =>
  finished.value.reduce<Book | null>(
    (longest, book) =>
      (book.pages ?? 0) > (longest?.pages ?? 0) ? book : longest,
    null,
  ),
)

const averageDays = computed(() => {
  const durations = finished.value
    .filter(({ progress }) => !!progress.startedAt)
    .map((book) =>
      Math.max(
        1,
        finishedOn(book).diff(
          dayjs.utc(toSimpleDate(book.progress.startedAt!)),
          'day',
        ),
      ),
    )
  return durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null
})

const authorsRead = computed(
  () =>
    new Set(finished.value.map(({ author }) => author).filter(Boolean)).size,
)

const featuredGoal = computed(() =>
  getFeaturedGoal(goals.value.map((goal) => resolveGoal(goal, books.value))),
)

const buckets = computed<StatsActivityBucket[]>(() => {
  if (range.value === 'all') {
    const years = finishedAll.value.map((book) => finishedOn(book).year())
    const first = years.length ? Math.min(...years) : today.year()
    return Array.from({ length: today.year() - first + 1 }, (_, index) => {
      const year = first + index
      return {
        key: `y${year}`,
        label: String(year),
        short: String(year),
        books: finishedAll.value.filter(
          (book) => finishedOn(book).year() === year,
        ),
      }
    })
  }

  return Array.from({ length: 12 }, (_, index) => {
    const month = rangeStart.value!.add(index, 'month')
    const monthName = MONTHS[month.month()]!
    return {
      key: month.format('YYYY-MM'),
      label: `${monthName} ${month.year()}`,
      short:
        range.value === 'year'
          ? monthName
          : `${monthName[0]}${month.month() === 0 ? ` '${month.format('YY')}` : ''}`,
      books: finishedAll.value.filter((book) =>
        finishedOn(book).isSame(month, 'month'),
      ),
    }
  })
})

const currentlyReading = computed(() =>
  books.value.filter(
    ({ progress }) =>
      progress.status === 'reading' || progress.status === 'paused',
  ),
)

function languageLabel(code: string | null) {
  return code
    ? (languageOptions[code as keyof typeof languageOptions] ?? code)
    : 'Not set'
}

function tally(
  keyOf: (book: Book) => string,
  labelOf: (key: string) => string,
  order?: string[],
): StatsDonutItem[] {
  const counts = new Map<string, number>()
  books.value.forEach((book) => {
    const key = keyOf(book)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  let items = [...counts.entries()].map(([key, value]) => ({ key, value }))
  items = order
    ? items.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
    : items.sort((a, b) => b.value - a.value)

  const slices = items.map((item, index) => ({
    label: labelOf(item.key),
    value: item.value,
    tone: PALETTE[index % PALETTE.length]!,
  }))

  if (slices.length <= 6) return slices

  const rest = slices.slice(5)
  return [
    ...slices.slice(0, 5),
    {
      label: `Other (${rest.length})`,
      value: rest.reduce((total, { value }) => total + value, 0),
      tone: 'tone-surface-container',
    },
  ]
}

const shareItems = computed<StatsDonutItem[]>(() => {
  switch (share.value) {
    case 'status':
      return STATUS_SLICES.map(({ status, label, tone }) => ({
        label,
        tone,
        value: books.value.filter(
          ({ progress }) => (progress.status ?? null) === status,
        ).length,
      })).filter(({ value }) => value > 0)
    case 'format':
      return tally(
        (book) => book.format ?? '',
        (key) =>
          BOOK_FORMAT_MAP[key as keyof typeof BOOK_FORMAT_MAP]?.description ??
          'Not set',
      )
    case 'ownership':
      return tally(
        (book) => book.propertyStatus ?? 'not-owned',
        (key) =>
          PROPERTY_STATUS_MAP[key as keyof typeof PROPERTY_STATUS_MAP]
            ?.description ?? key,
        ['owned', 'not-owned'],
      )
    default:
      return tally(
        (book) => book[share.value as 'language' | 'originalLanguage'] ?? '',
        (key) => languageLabel(key || null),
      )
  }
})

const PAGE_BINS: [number, number, string][] = [
  [0, 100, '<100'],
  [100, 200, '100–199'],
  [200, 300, '200–299'],
  [300, 400, '300–399'],
  [400, 500, '400–499'],
  [500, Infinity, '500+'],
]

const distributionItems = computed<StatsColumnItem[]>(() => {
  if (distribution.value === 'rating') {
    return Array.from({ length: 10 }, (_, index) => {
      const rating = (index + 1) / 2
      return {
        label: `${rating} stars`,
        short: String(rating),
        value: books.value.filter((book) => book.rating === rating).length,
      }
    })
  }

  if (distribution.value === 'pages') {
    return PAGE_BINS.map(([low, high, label]) => ({
      label: `${label} pages`,
      short: label,
      value: books.value.filter(
        ({ pages }) => pages != null && pages >= low && pages < high,
      ).length,
    }))
  }

  if (distribution.value === 'year') {
    const years = [
      ...new Set(
        books.value
          .map(({ year }) => year)
          .filter((value): value is number => !!value),
      ),
    ].sort((a, b) => a - b)
    // Thin the axis labels when there are many years
    const every = years.length > 16 ? Math.ceil(years.length / 10) : 1
    return years.map((year, index) => ({
      label: String(year),
      short: index % every === 0 ? String(year) : '',
      value: books.value.filter((book) => book.year === year).length,
    }))
  }

  if (
    distribution.value === 'language' ||
    distribution.value === 'originalLanguage'
  ) {
    return languageCounts.value.slice(0, 10)
  }

  const decades = books.value
    .filter(({ year }) => !!year)
    .map(({ year }) => Math.floor(year! / 10) * 10)
  if (!decades.length) return []
  const first = Math.min(...decades)
  const last = Math.max(...decades)
  return Array.from({ length: (last - first) / 10 + 1 }, (_, index) => {
    const decade = first + index * 10
    return {
      label: `${decade}s`,
      short: decade >= 2000 ? `${decade}s` : `'${String(decade).slice(2)}s`,
      value: decades.filter((value) => value === decade).length,
    }
  })
})

const languageCounts = computed<StatsColumnItem[]>(() => {
  const key = distribution.value as 'language' | 'originalLanguage'
  const counts = new Map<string, number>()
  books.value.forEach((book) => {
    const code = book[key]
    if (code) counts.set(code, (counts.get(code) ?? 0) + 1)
  })
  return [...counts.entries()]
    .map(([code, value]) => ({ label: languageLabel(code), value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
})

const distributionSummary = computed(() => {
  if (distribution.value === 'rating') {
    const rated = books.value.filter(({ rating }) => rating != null)
    if (!rated.length) return null
    const average =
      rated.reduce((total, { rating }) => total + rating!, 0) / rated.length
    return `Average ${average.toFixed(1)} ★ · ${rated.length} of ${books.value.length} rated`
  }

  if (distribution.value === 'pages') {
    const pages = books.value
      .map(({ pages }) => pages)
      .filter((value): value is number => !!value)
      .sort((a, b) => a - b)
    if (!pages.length) return null
    const median = pages[Math.floor(pages.length / 2)]!
    const total = pages.reduce((a, b) => a + b, 0)
    return `Median ${formatCount(median)} pages · ${formatCount(total)} pages in total`
  }

  if (
    distribution.value === 'language' ||
    distribution.value === 'originalLanguage'
  ) {
    const languages = languageCounts.value
    if (!languages.length) return null
    const total = languages.reduce((sum, { value }) => sum + value, 0)
    return `${languages.length} ${languages.length === 1 ? 'language' : 'languages'} · ${total} of ${books.value.length} with one set${
      languages.length > 10 ? ' · top 10 shown' : ''
    }`
  }

  const years = books.value
    .map(({ year }) => year)
    .filter((value): value is number => !!value)
    .sort((a, b) => a - b)
  if (!years.length) return null
  return `Oldest ${years[0]} · newest ${years[years.length - 1]} · ${years.length} with a year`
})

const RANK_TITLES: Record<RankBy, [string, string]> = {
  rating: ['Highest rated', 'Lowest rated'],
  year: ['Newest', 'Oldest'],
  pages: ['Longest', 'Shortest'],
}

const rankTitle = computed(
  () => RANK_TITLES[rankBy.value][rankOrder.value === 'top' ? 0 : 1],
)

const rankedBooks = computed(() =>
  books.value
    .filter((book) => book[rankBy.value] != null)
    .sort((a, b) =>
      rankOrder.value === 'top'
        ? b[rankBy.value]! - a[rankBy.value]!
        : a[rankBy.value]! - b[rankBy.value]!,
    )
    .slice(0, 8)
    .map((book) => ({
      id: book.id,
      label: book.title,
      value: book[rankBy.value]!,
    })),
)

function formatRank(value: number) {
  if (rankBy.value === 'rating') return `${value} ★`
  if (rankBy.value === 'pages') return `${formatCount(value)} p`
  return String(value)
}

const groups = computed<StatsColumnItem[]>(() => {
  const count = (
    keysOf: (book: Book) => (string | null | undefined)[],
    labelOf: (key: string) => string,
    linkOf?: (key: string) => string,
  ) => {
    const counts = new Map<string, number>()
    books.value.forEach((book) =>
      keysOf(book)
        .filter((key): key is string => !!key)
        .forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1)),
    )
    return [...counts.entries()].map(([key, value]) => ({
      label: labelOf(key),
      value,
      to: linkOf?.(key),
    }))
  }

  const authorName = (id: string) =>
    authors.value.find((author) => author.id === id)?.name || 'Unknown author'

  let items: StatsColumnItem[]
  switch (groupBy.value) {
    case 'author':
      items = count(
        (book) => [book.author],
        authorName,
        (id) => `/library/authors/${id}`,
      )
      break
    case 'collections':
      items = count(
        (book) => book.collections ?? [],
        (id) => collections.value.find((c) => c.id === id)?.name ?? id,
        (id) => `/library/collections/${id}`,
      )
      break
    case 'genres':
      items = count(
        (book) => book.genres ?? [],
        (genre) => genre,
      )
      break
    case 'publisher':
      items = count(
        (book) => [book.publisher],
        (publisher) => publisher,
      )
      break
    case 'averageRatingAuthor': {
      const ratings = new Map<string, number[]>()
      books.value
        .filter((book) => book.author && book.rating != null)
        .forEach((book) =>
          ratings.set(book.author!, [
            ...(ratings.get(book.author!) ?? []),
            book.rating!,
          ]),
        )
      items = [...ratings.entries()].map(([id, values]) => ({
        label: authorName(id),
        value:
          Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) /
          10,
        to: `/library/authors/${id}`,
      }))
      break
    }
  }

  return items.sort(
    (a, b) => b.value - a.value || a.label.localeCompare(b.label),
  )
})

useHead({
  title: 'BookLib | Statistics',
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.stats {
  @apply mx-auto flex w-full max-w-[90rem] flex-col gap-6;
  container-type: inline-size;
}
.stats :deep(:is(button, a, select):focus-visible) {
  @apply outline-primary! outline-offset-2!;
  outline-style: solid !important;
  outline-width: 2px !important;
}
.hero {
  @apply grid grid-cols-[minmax(0,1fr)] gap-4;
  @apply @min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)];
}
.kpis {
  @apply grid grid-cols-2 gap-4 @min-[640px]:grid-cols-4;
}
.grid-12 {
  @apply grid grid-cols-[minmax(0,1fr)] gap-4 @min-[900px]:grid-cols-12;
}
.grid-12 > * {
  grid-column: 1 / -1;
}
@container (min-width: 900px) {
  .grid-12 > .span-8 {
    grid-column: span 8;
  }
  .grid-12 > .span-7 {
    grid-column: span 7;
  }
  .grid-12 > .span-6 {
    grid-column: span 6;
  }
  .grid-12 > .span-5 {
    grid-column: span 5;
  }
  .grid-12 > .span-4 {
    grid-column: span 4;
  }
}
</style>

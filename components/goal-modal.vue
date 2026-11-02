<template>
  <bl-modal v-model="open" size="sm" icon="IconChartAreaLine">
    <template #title>{{ TITLES[mode] }}</template>

    <form
      ref="formRef"
      class="goal-form"
      novalidate
      @submit.prevent="onSubmit"
      @keydown.enter.prevent="onEnter"
    >
      <div v-if="mode === 'new'" class="flex flex-col gap-2">
        <span class="form-label">Start from</span>
        <div
          class="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2"
        >
          <button
            v-for="template in templates"
            :key="template.label"
            type="button"
            class="template"
            @click="applyTemplate(template.values)"
          >
            <component :is="icons[template.icon]" :size="18" stroke="1.6" />
            {{ template.label }}
          </button>
        </div>
      </div>

      <label class="form-wrapper">
        <span class="form-label">Goal title</span>
        <span class="form-inner" :class="{ error: errors.title }">
          <input
            ref="titleInput"
            v-model="form.title"
            class="form-input"
            placeholder="e.g. Read 24 books this year"
          />
        </span>
        <span v-if="errors.title" class="form-error">{{ errors.title }}</span>
      </label>

      <fieldset class="fieldset">
        <legend>
          <IconTarget :size="18" stroke="1.6" class="text-primary" />
          Target
        </legend>
        <div class="row">
          <label class="form-wrapper w-28 flex-none">
            <span class="form-label">Amount</span>
            <span class="form-inner" :class="{ error: errors.amount }">
              <input
                v-model="form.amount"
                type="number"
                min="1"
                class="form-input"
              />
            </span>
          </label>
          <label class="form-wrapper">
            <span class="form-label">Of</span>
            <span class="form-inner">
              <select v-model="form.type" class="form-input">
                <option
                  v-for="type in Object.values(GOAL_TYPE_MAP)"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.description }}
                </option>
              </select>
            </span>
          </label>
          <label class="form-wrapper">
            <span class="form-label">Every</span>
            <span class="form-inner">
              <select v-model="form.interval" class="form-input">
                <option
                  v-for="interval in Object.values(GOAL_INTERVAL_MAP)"
                  :key="interval.id"
                  :value="interval.id"
                >
                  {{ interval.description }}
                </option>
              </select>
            </span>
          </label>
        </div>
        <span v-if="errors.amount" class="form-error">{{ errors.amount }}</span>

        <label class="form-wrapper">
          <span class="form-label">From author</span>
          <span class="form-inner">
            <select v-model="form.author" class="form-input">
              <option value="">Any author</option>
              <option
                v-for="author in sortedAuthors"
                :key="author.id"
                :value="author.id"
              >
                {{ author.name }}
              </option>
            </select>
          </span>
        </label>

        <div v-if="genres.length" class="form-wrapper">
          <span class="form-label">From genres</span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="genre in genres"
              :key="genre"
              type="button"
              class="pill small-pill"
              :class="{ 'pill-selected': form.genres.includes(genre) }"
              :aria-pressed="form.genres.includes(genre)"
              @click="toggleGenre(genre)"
            >
              {{ genre }}
            </button>
          </div>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend>
          <IconCalendar :size="18" stroke="1.6" class="text-primary" />
          Duration
        </legend>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in PRESETS"
            :key="preset.value"
            type="button"
            class="pill small-pill"
            :class="{ 'pill-selected': isPresetSelected(preset.value) }"
            @click="applyPreset(preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="row">
          <label class="form-wrapper">
            <span class="form-label">Start on</span>
            <span class="form-inner" :class="{ error: errors.dates }">
              <input v-model="form.startAt" type="date" class="form-input" />
            </span>
          </label>
          <label class="form-wrapper">
            <span class="form-label">Finish on</span>
            <span class="form-inner" :class="{ error: errors.dates }">
              <input v-model="form.finishAt" type="date" class="form-input" />
            </span>
          </label>
        </div>
        <span v-if="errors.dates" class="form-error">{{ errors.dates }}</span>
      </fieldset>

      <label v-if="form.type === 'books'" class="checkbox-label">
        <input v-model="form.auto" type="checkbox" class="checkbox-input" />
        <span class="flex flex-col gap-0.5">
          Count finished books automatically
          <span class="text-ink-muted text-[0.8125rem] font-medium">
            Books you mark as read in this period count toward the goal. You can
            still add entries by hand.
          </span>
        </span>
      </label>
      <label class="checkbox-label">
        <input v-model="form.tracking" type="checkbox" class="checkbox-input" />
        <span>Track this goal now</span>
      </label>

      <p class="summary">
        <IconTarget :size="16" stroke="1.8" class="text-primary flex-none" />
        {{ summary }}
      </p>

      <div class="flex justify-end gap-2">
        <bl-button variant="secondary" @click="open = false">
          {{ mode === 'edit' ? 'Discard changes' : 'Cancel' }}
        </bl-button>
        <bl-button @click="onSubmit">
          {{ mode === 'edit' ? 'Save changes' : 'Create goal' }}
        </bl-button>
      </div>
    </form>
  </bl-modal>
</template>

<script setup lang="ts">
import { IconCalendar, IconTarget, icons } from '@tabler/icons-vue'
import { uniq } from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Goal, GoalInterval, GoalType } from '~/types/goal'
import type { GoalRangePreset } from '~/utils/goal'

type GoalForm = {
  title: string
  type: GoalType
  interval: GoalInterval
  amount: string
  author: string
  genres: string[]
  startAt: string
  finishAt: string
  tracking: boolean
  auto: boolean
}

const props = defineProps<{
  goal: Goal | null
  mode: 'new' | 'edit' | 'repeat'
  authors: Author[]
  books: Book[]
}>()

const emit = defineEmits<{ (e: 'save', goal: Goal): void }>()

const open = defineModel<boolean>({ default: false })

const TITLES = { new: 'New goal', edit: 'Edit goal', repeat: 'Repeat goal' }

const PRESETS: { value: GoalRangePreset; label: string }[] = [
  { value: 'currentYear', label: 'This year' },
  { value: 'nextYear', label: 'Next year' },
  { value: 'halfYear', label: 'Next 6 months' },
  { value: 'month', label: 'This month' },
  { value: 'nextMonth', label: 'Next month' },
  { value: 'week', label: 'This week' },
]

const titleInput = ref<HTMLInputElement>()
const formRef = ref<HTMLFormElement>()
const touched = ref(false)
const form = reactive<GoalForm>(defaultForm())

function defaultForm(): GoalForm {
  const [startAt, finishAt] = getGoalRangePreset('currentYear')
  return {
    title: '',
    type: 'books',
    interval: 'total',
    amount: '12',
    author: '',
    genres: [],
    startAt,
    finishAt,
    tracking: true,
    auto: true,
  }
}

function formFromGoal(goal: Goal): GoalForm {
  return {
    title: goal.title,
    type: goal.type,
    interval: goal.interval,
    amount: String(goal.amount),
    author: goal.author ?? '',
    genres: [...(goal.genres ?? [])],
    startAt: toSimpleDate(goal.startAt),
    finishAt: toSimpleDate(goal.finishAt),
    tracking: goal.status === 'tracking',
    auto: !!goal.auto,
  }
}

watch(
  open,
  (isOpen) => {
    if (!isOpen) return
    touched.value = false
    Object.assign(form, props.goal ? formFromGoal(props.goal) : defaultForm())
    nextTick(() => titleInput.value?.focus())
  },
  { immediate: true },
)

const templates = computed(() => {
  const year = getCurrentYear()
  const range = (preset: GoalRangePreset) => {
    const [startAt, finishAt] = getGoalRangePreset(preset)
    return { startAt, finishAt }
  }

  return [
    {
      label: '24 books this year',
      icon: 'IconBooks' as const,
      values: {
        title: `Read 24 books in ${year}`,
        type: 'books' as const,
        interval: 'total' as const,
        amount: '24',
        auto: true,
        ...range('currentYear'),
      },
    },
    {
      label: '30 pages a day',
      icon: 'IconFileDescription' as const,
      values: {
        title: '30 pages a day',
        type: 'pages' as const,
        interval: 'daily' as const,
        amount: '30',
        ...range('month'),
      },
    },
    {
      label: '5 hours a week',
      icon: 'IconClockHour4' as const,
      values: {
        title: '5 hours a week',
        type: 'hours' as const,
        interval: 'weekly' as const,
        amount: '5',
        ...range('halfYear'),
      },
    },
    {
      label: 'Read an author',
      icon: 'IconFeather' as const,
      values: {
        title: '',
        type: 'books' as const,
        interval: 'total' as const,
        amount: '3',
        auto: true,
        ...range('currentYear'),
      },
    },
  ]
})

const sortedAuthors = computed(() =>
  // Imports can create authors without a name
  props.authors
    .filter((author) => !!author.name)
    .sort((a, b) => a.name.localeCompare(b.name)),
)

const genres = computed(() =>
  uniq(props.books.flatMap((book) => book.genres ?? []))
    .filter((genre): genre is string => typeof genre === 'string' && !!genre)
    .sort((a, b) => a.localeCompare(b)),
)

const validation = computed(() => ({
  title: !form.title.trim() ? 'Give your goal a name' : '',
  amount: !(+form.amount > 0) ? 'Enter an amount above 0' : '',
  dates:
    !form.startAt || !form.finishAt || form.finishAt < form.startAt
      ? 'Finish date must be after the start date'
      : '',
}))

const errors = computed(() =>
  touched.value ? validation.value : { title: '', amount: '', dates: '' },
)

const summary = computed(() => {
  const amount = +form.amount
  const parts = [
    `${form.amount || '?'} ${getGoalUnit(form, amount)} ${GOAL_INTERVAL_MAP[form.interval].description}${
      !validation.value.dates
        ? `, ${formatGoalRange(form.startAt, form.finishAt)}`
        : ''
    }`,
  ]
  const author = props.authors.find(({ id }) => id === form.author)
  if (author) parts.push(author.name)
  if (form.genres.length) parts.push(form.genres.join(', '))
  return parts.join(' · ')
})

function applyTemplate(values: Partial<GoalForm>) {
  Object.assign(form, { genres: [], author: '' }, values)
}

function isPresetSelected(preset: GoalRangePreset) {
  const [startAt, finishAt] = getGoalRangePreset(preset)
  return form.startAt === startAt && form.finishAt === finishAt
}

function applyPreset(preset: GoalRangePreset) {
  const [startAt, finishAt] = getGoalRangePreset(preset)
  form.startAt = startAt
  form.finishAt = finishAt
}

function toggleGenre(genre: string) {
  form.genres = form.genres.includes(genre)
    ? form.genres.filter((g) => g !== genre)
    : [...form.genres, genre]
}

function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'BUTTON') {
    target.click()
  } else {
    onSubmit()
  }
}

function onSubmit() {
  touched.value = true
  if (Object.values(validation.value).some(Boolean)) {
    nextTick(() =>
      formRef.value
        ?.querySelector<HTMLInputElement>('.form-inner.error input')
        ?.focus(),
    )
    return
  }

  const original = props.mode === 'edit' ? props.goal : null
  const keepEntries = !!original && original.type === form.type

  emit('save', {
    ...(original ?? {}),
    id: original?.id ?? uuidv4(),
    createdAt: original?.createdAt ?? now(),
    completedAt: original?.completedAt ?? null,
    title: form.title.trim(),
    type: form.type,
    interval: form.interval,
    amount: +form.amount,
    author: form.author || null,
    genres: form.genres,
    startAt: toStartOfDay(fromSimpleDate(form.startAt)),
    finishAt: toEndOfDay(fromSimpleDate(form.finishAt)),
    status: form.tracking ? 'tracking' : 'not-tracking',
    auto: form.type === 'books' && form.auto,
    entries: keepEntries ? original!.entries : [],
  } as Goal)
  open.value = false
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.goal-form {
  @apply -m-0.5 flex max-h-[min(70vh,44rem)] flex-col gap-5 overflow-y-auto p-0.5;
  container-type: inline-size;
}
.template {
  @apply border-stroke bg-surface-elevated rounded-scholarly text-ink-primary hover:border-primary hover:bg-primary-50 flex cursor-pointer flex-col items-start gap-1.5 border px-3 py-2.5 text-left text-sm font-semibold;
}
.template svg {
  @apply text-primary;
}
.fieldset {
  @apply m-0 flex flex-col gap-3 border-0 p-0;
}
.fieldset legend {
  @apply text-ink-primary mb-3 flex items-center gap-2 p-0 font-bold;
}
.row {
  @apply flex flex-col gap-4 @min-[440px]:flex-row;
}
.row > .form-wrapper:not(.flex-none) {
  @apply min-w-0 flex-1;
}
.small-pill {
  @apply text-ink-secondary px-3 py-1 text-[0.8125rem] font-semibold whitespace-nowrap;
}
.form-inner.error {
  @apply border-primary-500;
}
.summary {
  @apply text-ink-secondary bg-surface-subtle rounded-scholarly flex items-center gap-2 px-3 py-2 text-sm font-semibold;
}
</style>

<template>
  <form
    ref="formRef"
    class="review"
    novalidate
    data-testid="challenge-review"
    @submit.prevent="onSubmit"
  >
    <div class="hero" :class="`lv${challenge.level}`">
      <span class="hero-icon">
        <component :is="icons[challenge.icon]" :size="24" stroke="1.7" />
      </span>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span class="hero-name">{{ challenge.name }}</span>
        <bl-challenge-difficulty-badge :level="challenge.level" />
      </div>
      <p class="hero-description">{{ challenge.description }}</p>
      <p v-if="challenge.rule" class="rule">
        <IconFlag :size="14" stroke="2" />
        {{ challenge.rule }}
      </p>
    </div>

    <label class="form-wrapper">
      <span class="form-label">Name</span>
      <span class="form-inner" :class="{ 'form-inner-error': errors.title }">
        <input v-model="form.title" class="form-input" />
      </span>
      <span v-if="errors.title" class="form-error">{{ errors.title }}</span>
    </label>

    <label class="form-wrapper">
      <span class="form-label">Target</span>
      <span class="form-inner" :class="{ 'form-inner-error': errors.amount }">
        <input
          v-model="form.amount"
          type="number"
          min="1"
          class="form-input"
          :aria-label="`Target, ${unitLabel}`"
        />
        <span class="text-ink-muted font-semibold whitespace-nowrap">
          {{ unitLabel }}
        </span>
      </span>
    </label>

    <div class="dates">
      <label class="form-wrapper">
        <span class="form-label">Start on</span>
        <span class="form-inner" :class="{ 'form-inner-error': errors.dates }">
          <input v-model="form.startAt" type="date" class="form-input" />
        </span>
      </label>
      <label class="form-wrapper">
        <span class="form-label">Finish on</span>
        <span class="form-inner" :class="{ 'form-inner-error': errors.dates }">
          <input v-model="form.finishAt" type="date" class="form-input" />
        </span>
      </label>
    </div>
    <span v-if="errors.amount || errors.dates" class="form-error -mt-2">
      {{ errors.amount || errors.dates }}
    </span>

    <div class="pace" data-testid="challenge-pace">
      <IconChartAreaLine :size="18" stroke="1.8" class="text-primary" />
      <span class="flex min-w-0 flex-[1_1_12rem] flex-col gap-0.5">
        <b class="text-ink-primary text-base">
          {{ isValid ? getChallengePace(target) : '—' }}
        </b>
        <span class="text-ink-muted text-[0.8125rem] font-semibold">
          {{
            isValid
              ? formatGoalRange(form.startAt, form.finishAt)
              : 'Set a target and dates'
          }}
        </span>
      </span>
      <bl-chip size="sm" rounded bold v-bind="COMPARISON_CHIPS[comparison]">
        {{ CHALLENGE_COMPARISON_LABELS[comparison] }}
      </bl-chip>
    </div>

    <button
      v-if="changed"
      type="button"
      class="link -mt-2"
      @click="Object.assign(form, presetForm())"
    >
      Reset to preset
    </button>

    <div class="actions">
      <bl-button variant="tertiary" class="mr-auto" @click="$emit('back')">
        <template #prependIcon="iconProps">
          <IconArrowLeft v-bind="iconProps" />
        </template>
        Back
      </bl-button>
      <bl-button variant="secondary" @click="$emit('cancel')">Cancel</bl-button>
      <bl-button @click="onSubmit">
        <template #prependIcon="iconProps">
          <IconFlame v-bind="iconProps" />
        </template>
        Accept challenge
      </bl-button>
    </div>
    <!-- Lets Enter in a field submit the form -->
    <button type="submit" hidden />
  </form>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconChartAreaLine,
  IconFlag,
  IconFlame,
  icons,
} from '@tabler/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import type { Goal } from '~/types/goal'
import type { ChallengePreset, ChallengeTarget } from '~/utils/challenges'

type ReviewForm = {
  title: string
  amount: string
  startAt: string
  finishAt: string
}

const props = defineProps<{ challenge: ChallengePreset }>()

const emit = defineEmits<{
  (e: 'back' | 'cancel'): void
  (e: 'save', goal: Goal): void
}>()

const formRef = ref<HTMLFormElement>()
const touched = ref(false)

function presetForm(): ReviewForm {
  const [startAt, finishAt] = getChallengeRange(props.challenge)
  return {
    title: props.challenge.name,
    amount: String(props.challenge.amount),
    startAt,
    finishAt,
  }
}

const form = reactive<ReviewForm>(presetForm())

const unitLabel = computed(() => getChallengeUnitLabel(props.challenge))

const validation = computed(() => ({
  title: !form.title.trim() ? 'Give your challenge a name' : '',
  amount: !(+form.amount > 0) ? 'Enter an amount above 0' : '',
  dates:
    !form.startAt || !form.finishAt || form.finishAt < form.startAt
      ? 'Finish date must be after the start date'
      : '',
}))

const isValid = computed(
  () => !validation.value.amount && !validation.value.dates,
)

const errors = computed(() =>
  touched.value ? validation.value : { title: '', amount: '', dates: '' },
)

const target = computed<ChallengeTarget>(() => ({
  type: props.challenge.type,
  interval: props.challenge.interval,
  amount: +form.amount,
  startAt: form.startAt,
  finishAt: form.finishAt,
}))

const COMPARISON_CHIPS = {
  preset: { variant: 'secondary', color: 'secondary' },
  tougher: { variant: 'secondary', color: 'primary' },
  easier: {},
} as const

const comparison = computed(() => {
  if (!isValid.value) return 'preset'
  const preset = presetForm()
  return compareToPreset(target.value, {
    ...target.value,
    amount: props.challenge.amount,
    startAt: preset.startAt,
    finishAt: preset.finishAt,
  })
})

const changed = computed(() => {
  const preset = presetForm()
  return (Object.keys(preset) as (keyof ReviewForm)[]).some(
    (key) => String(form[key]) !== preset[key],
  )
})

function onSubmit() {
  touched.value = true
  if (Object.values(validation.value).some(Boolean)) {
    nextTick(() =>
      formRef.value
        ?.querySelector<HTMLInputElement>('.form-inner-error input')
        ?.focus(),
    )
    return
  }

  const { challenge } = props
  emit('save', {
    id: uuidv4(),
    createdAt: now(),
    completedAt: null,
    title: form.title.trim(),
    type: challenge.type,
    interval: challenge.interval,
    amount: +form.amount,
    author: null,
    genres: [],
    startAt: toStartOfDay(fromSimpleDate(form.startAt)),
    finishAt: toEndOfDay(fromSimpleDate(form.finishAt)),
    status: 'tracking',
    auto: challenge.type === 'books' && !!challenge.auto,
    entries: [],
    challenge: challenge.id,
    level: challenge.level,
  } as Goal)
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.review {
  @apply -m-0.5 flex max-h-[min(74vh,48rem)] flex-col gap-4.5 overflow-y-auto p-0.5;
  container-type: inline-size;
}
.hero {
  @apply bg-secondary-50 border-secondary-200 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-1.5 rounded-xl border p-5;
}
.hero.lv3 {
  @apply bg-primary-50 border-primary-200;
}
.hero-icon {
  @apply bg-secondary-700 text-ink-inverse row-span-3 grid size-12 place-items-center rounded-xl;
}
.hero.lv3 .hero-icon {
  @apply bg-primary;
}
.hero-name {
  @apply font-display text-ink-primary text-2xl leading-[1.15] font-semibold;
}
.hero-description {
  @apply text-ink-secondary text-[0.9375rem] text-pretty;
}
.rule {
  @apply text-ink-secondary inline-flex items-center gap-1.5 text-[0.8125rem] font-bold;
}
.rule svg {
  @apply text-secondary-700;
}
.hero.lv3 .rule svg {
  @apply text-primary;
}
.dates {
  @apply flex flex-row gap-4;
}
.pace {
  @apply bg-surface-subtle border-stroke-subtle rounded-scholarly flex flex-wrap items-center gap-x-3 gap-y-2 border px-4 py-3;
}
.actions {
  @apply flex flex-wrap items-center justify-end gap-2;
}

@container (max-width: 440px) {
  .dates {
    @apply flex-col;
  }
  .hero {
    @apply grid-cols-1 p-4;
  }
  .hero-icon {
    @apply row-span-1 size-10;
  }
}
@container (max-width: 440px) {
  .actions > * {
    @apply flex-1 justify-center;
  }
}
</style>

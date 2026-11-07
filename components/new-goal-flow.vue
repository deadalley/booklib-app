<template>
  <bl-goal-modal
    v-if="step === 'custom'"
    v-model="open"
    flow
    mode="new"
    :goal="null"
    :authors="authors"
    :books="books"
    @back="step = 'choose'"
    @save="(created) => $emit('save', created)"
  />

  <bl-modal
    v-else
    v-model="open"
    :size="step === 'challenges' ? 'lg' : 'sm'"
    :icon="step === 'choose' ? 'IconTarget' : 'IconFlame'"
  >
    <template #title>{{ TITLES[step] }}</template>
    <template #subtitle>{{ SUBTITLES[step] }}</template>

    <div v-if="step === 'choose'" class="paths">
      <button
        type="button"
        class="path"
        data-testid="path-custom"
        @click="step = 'custom'"
      >
        <span class="path-icon">
          <IconTarget :size="24" stroke="1.6" />
        </span>
        <span class="path-heading">Custom goal</span>
        <span class="path-description">
          Choose what to count, how often and for how long. Filter by author or
          genre.
        </span>
        <span class="path-foot">
          Books, pages or hours
          <IconArrowRight :size="16" stroke="2" class="path-arrow" />
        </span>
      </button>
      <button
        type="button"
        class="path challenge"
        data-testid="path-challenge"
        @click="step = 'challenges'"
      >
        <span class="path-icon">
          <IconFlame :size="24" stroke="1.6" />
        </span>
        <span class="path-heading">Challenge</span>
        <span class="path-description">
          A preset stretch target on a fixed clock. Harder by design, and marked
          on your goal.
        </span>
        <span class="path-foot">
          <span class="text-secondary-700 inline-flex gap-1.5">
            <bl-challenge-difficulty-meter
              v-for="level in LEVELS"
              :key="level"
              :level="level"
            />
          </span>
          {{ CHALLENGES.length }} challenges
          <IconArrowRight :size="16" stroke="2" class="path-arrow" />
        </span>
      </button>
    </div>

    <div v-else-if="step === 'challenges'" class="browse">
      <div class="browse-bar">
        <bl-button
          v-if="initialStep !== 'challenges'"
          variant="tertiary"
          @click="step = 'choose'"
        >
          <template #prependIcon="iconProps">
            <IconArrowLeft v-bind="iconProps" />
          </template>
          Back
        </bl-button>
        <bl-switch
          v-model="levelFilter"
          aria-label="Difficulty"
          class="max-w-full overflow-x-auto"
        >
          <bl-switch-option
            v-for="option in FILTERS"
            :key="option.value"
            :value="option.value"
            :selected-value="levelFilter"
          >
            <template #label>{{ option.label }}</template>
          </bl-switch-option>
        </bl-switch>
      </div>
      <div class="grid-list">
        <bl-challenge-card
          v-for="preset in filteredChallenges"
          :key="preset.id"
          :challenge="preset"
          :active="liveChallenges.has(preset.id)"
          @pick="pick"
        />
      </div>
    </div>

    <bl-challenge-review
      v-else-if="step === 'review' && challenge"
      :key="challenge.id"
      :challenge="challenge"
      @back="step = 'challenges'"
      @cancel="open = false"
      @save="(created) => $emit('save', created)"
    />
  </bl-modal>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconArrowRight,
  IconFlame,
  IconTarget,
} from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { ChallengeLevel, Goal, NewGoalStep } from '~/types/goal'
import type { ChallengePreset } from '~/utils/challenges'

const props = defineProps<{
  initialStep?: NewGoalStep
  challengeId?: string
  goals: Goal[]
  authors: Author[]
  books: Book[]
}>()

defineEmits<{ (e: 'save', goal: Goal): void }>()

const open = defineModel<boolean>({ default: false })

const TITLES: Record<Exclude<NewGoalStep, 'custom'>, string> = {
  choose: 'New goal',
  challenges: 'Choose a challenge',
  review: 'Review challenge',
}

const SUBTITLES: Record<Exclude<NewGoalStep, 'custom'>, string> = {
  choose: 'Step 1 · How do you want to set it?',
  challenges: 'Step 2 of 3 · Preset stretch goals with a fixed window',
  review: 'Step 3 of 3 · Adjust before you commit',
}

const LEVELS: ChallengeLevel[] = [1, 2, 3]

// Option values double as the radios' accessible names
const FILTERS = [
  { value: 'all', label: 'All', level: null },
  ...LEVELS.map((level) => ({
    value: CHALLENGE_LEVEL_LABELS[level].toLowerCase(),
    label: CHALLENGE_LEVEL_LABELS[level],
    level,
  })),
]

const challenge = ref<ChallengePreset | null>(getChallenge(props.challengeId))
const step = ref<NewGoalStep>(
  props.initialStep === 'review' && !challenge.value
    ? 'challenges'
    : (props.initialStep ?? 'choose'),
)
const levelFilter = ref('all')

const filteredChallenges = computed(() => {
  const filter = FILTERS.find(({ value }) => value === levelFilter.value)
  return CHALLENGES.filter(
    ({ level }) => !filter?.level || level === filter.level,
  )
})

const liveChallenges = computed(
  () =>
    new Set(props.goals.filter(isLiveChallenge).map((goal) => goal.challenge!)),
)

function pick(picked: ChallengePreset) {
  challenge.value = picked
  step.value = 'review'
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.paths {
  @apply mt-1 grid gap-4;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}
.path {
  @apply border-stroke bg-surface-elevated flex cursor-pointer flex-col gap-2 rounded-xl border p-5 text-left;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.path:hover {
  @apply border-primary -translate-y-px;
  box-shadow: 0 0 0 1px var(--primary);
}
.path-icon {
  @apply bg-primary-50 text-primary mb-1 grid size-12 place-items-center rounded-xl;
}
.path-heading {
  @apply font-display text-ink-primary text-[1.375rem] font-semibold;
}
.path-description {
  @apply text-ink-secondary flex-1 text-sm leading-[1.45] text-pretty;
}
.path-foot {
  @apply border-stroke-subtle text-ink-muted mt-1 flex items-center gap-2 border-t pt-3 text-[0.8125rem] font-semibold;
}
.path-arrow {
  @apply text-primary ml-auto;
}
.path.challenge {
  @apply bg-secondary-50 border-secondary-200;
}
.path.challenge:hover {
  @apply border-secondary-700;
  box-shadow: 0 0 0 1px var(--secondary-700);
}
.path.challenge .path-icon {
  @apply bg-secondary-700 text-ink-inverse;
}
.path.challenge .path-foot {
  @apply text-secondary-800 border-secondary-200;
}
.path.challenge .path-arrow {
  @apply text-secondary-700;
}
.browse {
  @apply flex min-h-0 flex-col gap-4;
  container-type: inline-size;
}
.browse-bar {
  @apply flex flex-wrap items-center justify-between gap-3;
}
.grid-list {
  @apply -mx-1 grid max-h-[min(62vh,38rem)] gap-4 overflow-y-auto p-1;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}
@container (max-width: 560px) {
  .grid-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

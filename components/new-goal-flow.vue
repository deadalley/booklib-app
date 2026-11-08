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
      <bl-option-card
        layout="stack"
        size="lg"
        icon="IconTarget"
        title="Custom goal"
        description="Choose what to count, how often and for how long. Filter by author or genre."
        data-testid="path-custom"
        @click="step = 'custom'"
      >
        <template #footer>
          Books, pages or hours
          <IconArrowRight :size="16" stroke="2" class="text-primary ml-auto" />
        </template>
      </bl-option-card>
      <bl-option-card
        layout="stack"
        size="lg"
        tone="secondary"
        icon="IconFlame"
        title="Challenge"
        description="A preset stretch target on a fixed clock. Harder by design, and marked on your goal."
        data-testid="path-challenge"
        @click="step = 'challenges'"
      >
        <template #footer>
          <span class="text-secondary-700 inline-flex gap-1.5">
            <bl-challenge-difficulty-meter
              v-for="level in LEVELS"
              :key="level"
              :level="level"
            />
          </span>
          {{ CHALLENGES.length }} challenges
          <IconArrowRight
            :size="16"
            stroke="2"
            class="text-secondary-700 ml-auto"
          />
        </template>
      </bl-option-card>
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
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-vue'
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

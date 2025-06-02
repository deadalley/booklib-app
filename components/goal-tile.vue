<template>
  <bl-tile v-if="goal" v-bind="$attrs" :default-open="defaultOpen">
    <template #title>
      <div class="flex items-center gap-2">
        <component
          :is="icons[GOAL_TYPE_MAP[goal.type].icon]"
          :class="getProgressColor(goal.status, 'text')"
          :size="ICON_SIZE_LARGE"
          stroke="1.5"
        />
        <h5>{{ goal.title }}</h5>
        <span class="ml-2">
          <bl-total-tag
            :variant="goal.status === 'tracking' ? 'primary' : 'secondary'"
          >
            <IconConfetti
              v-if="goal.status === 'finished'"
              class="text-main"
              :size="16"
            />
            {{ GOAL_STATUS_MAP[goal.status].description }}
          </bl-total-tag>
        </span>
      </div>
    </template>
    <div class="mt-8 flex flex-col gap-2">
      <bl-progress-bar
        v-model:progress-value="goal.progress"
        size="sm"
        :color="getProgressColor(goal.status, 'bg')"
      />
      <div class="flex justify-between">
        <p class="text-accent-darker">{{ toFullDate(goal.startAt) }}</p>
        <p class="text-accent-darker">{{ toFullDate(goal.finishAt) }}</p>
      </div>
    </div>
    <template #collapsible>
      <bl-tabs default-value="progress" class="mt-4" full>
        <template #options="options">
          <bl-tab-option v-bind="options" value="progress">
            Progress
          </bl-tab-option>
          <bl-tab-option v-bind="options" value="tracked">
            Entries
          </bl-tab-option>
        </template>

        <bl-tab value="progress">
          <template v-if="goal.interval === 'total'">
            <bl-line-chart
              :height="200"
              :items="[
                {
                  label: 'achieved',
                  color: tailwind.theme.colors.main,
                  values: [
                    { x: toFullDateCompact('2020-01-01'), y: 0 },
                    { x: toFullDateCompact('2020-02-01'), y: 11 },
                    { x: toFullDateCompact('2020-03-01'), y: 16 },
                    { x: toFullDateCompact('2020-04-01'), y: 18 },
                    { x: toFullDateCompact('2020-05-01'), y: 41 },
                    { x: toFullDateCompact('2020-06-01'), y: 41 },
                    { x: toFullDateCompact('2020-07-01'), y: 41 },
                  ],
                },
              ]"
            />
          </template>
        </bl-tab>
        <bl-tab value="tracked">
          <div class="mt-2 flex max-h-[502px] flex-col gap-2 overflow-y-auto">
            <bl-empty
              v-if="goal.entries.length === 0"
              icon="IconNotebook"
              class="py-4"
            >
              <template #label>This goal has no entries</template>
              <template #action>
                <bl-button> Create first entry </bl-button>
              </template>
            </bl-empty>
            <bl-goal-entry
              v-for="(_entry, index) in goal.entries"
              :key="_entry.id"
              v-model:goal="goal"
              v-model:entry="goal.entries[index]"
              :books="books"
              :reload-goals="reloadGoals"
            />
            <bl-goal-entry
              v-if="addingNew"
              v-model:goal="goal"
              v-model:entry="entry"
              v-model:editing="addingNew"
              :books="books"
              :reload-goals="reloadGoals"
            />
            <div class="flex items-center justify-center">
              <bl-button
                class="w-full"
                variant="tertiary"
                @click="addingNew = true"
              >
                <template #prependIcon="iconProps">
                  <IconPlus v-bind="iconProps" class="!text-main" />
                </template>
                Add new entry
              </bl-button>
            </div>
          </div>
        </bl-tab>
      </bl-tabs>
    </template>
  </bl-tile>
</template>

<script setup lang="ts">
import { icons, IconConfetti, IconPlus } from '@tabler/icons-vue'
import type { ViewBook } from '~/types/book'
import type {
  BookGoalEntry,
  HourGoalEntry,
  PageGoalEntry,
  ViewGoal,
} from '~/types/goal'

defineProps<{
  defaultOpen?: boolean
  books: ViewBook[]
  reloadGoals: () => Promise<void>
}>()

const goal = defineModel<ViewGoal>('goal')
const entry = ref<BookGoalEntry | PageGoalEntry | HourGoalEntry | undefined>()
const addingNew = ref<boolean>(false)

function getProgressColor(
  status: string,
  type: 'bg' | 'text',
): string | undefined {
  if (status === 'not-tracking' || status === 'expired') {
    return `${type}-accent-dark`
  }

  if (status === 'tracking') {
    return `${type}-main`
  }

  // bg-main-light text-main-light
  if (status === 'finished') {
    return `${type}-main-light`
  }

  return undefined
}
</script>

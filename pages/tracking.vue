<template>
  <NuxtLayout name="dashboard" title="Tracking">
    <div class="mb-3 flex justify-between">
      <h3>Goals</h3>
      <bl-goal-modal
        v-if="authors && books"
        v-model="selectedGoal"
        is-new
        :authors="authors"
        :books="books"
        :reload-goals="refresh"
      >
        <template #trigger="triggerProps">
          <bl-button v-bind="triggerProps">
            <template #prependIcon="iconProps">
              <IconPlus v-bind="iconProps" />
            </template>
            Goal
          </bl-button>
        </template>
      </bl-goal-modal>
    </div>
    <div class="grid grid-cols-12 gap-4">
      <bl-tile
        v-if="!goals?.length"
        class="col-span-12 items-center justify-center gap-4 py-8"
      >
        <IconChartAreaLine class="text-main" size="70" stroke="1.5" />
        You don't have any goals yet.
        <bl-goal-modal
          v-if="authors && books"
          v-model="selectedGoal"
          is-new
          :authors="authors"
          :books="books"
          :reload-goals="refresh"
        >
          <template #trigger="triggerProps">
            <bl-button v-bind="triggerProps">Create a new goal</bl-button>
          </template>
        </bl-goal-modal>
      </bl-tile>

      <template v-if="sortedGoals?.length">
        <bl-goal-tile
          v-for="(goal, index) in sortedGoals"
          :key="goal.id"
          :goal="goal"
          class="col-span-12"
          :default-open="index === 0"
        />
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconChartAreaLine, IconPlus } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { ViewGoal, Goal } from '~/types/goal'

const { data: authors } = await useFetch<Author[]>('/api/authors')
const { data: books } = await useFetch<Book[]>('/api/books')
const { data: goals, refresh } = await useFetch<Goal[]>('/api/goals')

const selectedGoal = ref<Goal | undefined>()

const sortedGoals = computed(() =>
  sortGoals(goals.value ?? []).map<ViewGoal>((goal) => ({
    ...goal,
    progress: getGoalTimeProgress(goal),
  })),
)

function getGoalTimeProgress(goal: Goal): number {
  return getElapsedTimePercentage(new Date(), {
    start: goal.startAt,
    end: goal.finishAt,
  })
}

useHead({
  title: 'BookLib | Tracking',
})
</script>

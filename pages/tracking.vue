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
        <bl-tile v-for="goal in sortedGoals" :key="goal.id" class="col-span-12">
          <div class="flex items-center gap-2">
            <component
              :is="icons[GOAL_TYPE_MAP[goal.type].icon]"
              class="text-main"
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
        </bl-tile>
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconChartAreaLine,
  IconConfetti,
  IconPlus,
  icons,
} from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Goal } from '~/types/goal'

const { data: authors } = await useFetch<Author[]>('/api/authors')
const { data: books } = await useFetch<Book[]>('/api/books')
const { data: goals, refresh } = await useFetch<Goal[]>('/api/goals')

const selectedGoal = ref<Goal | undefined>()

const sortedGoals = computed(() => sortGoals(goals.value ?? []))

useHead({
  title: 'BookLib | Tracking',
})
</script>

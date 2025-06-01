<template>
  <bl-tile v-if="goal" v-bind="$attrs">
    <div class="mb-2 flex items-center gap-2">
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
    <div class="flex flex-col gap-2">
      <bl-progress-bar
        v-model:progress-value="goal.progress"
        size="sm"
        :color="getProgressColor(goal.status, 'bg')"
      />
      <div class="flex justify-between">
        <p class="text-accent-darker">{{ toFullDate(goal.startedAt) }}</p>
        <p class="text-accent-darker">{{ toFullDate(goal.finishedAt) }}</p>
      </div>
    </div>
  </bl-tile>
</template>

<script setup lang="ts">
import { icons, IconConfetti } from '@tabler/icons-vue'
import type { ViewGoal } from '~/types/goal'

const goal = defineModel<ViewGoal>('goal')

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

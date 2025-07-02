<template>
  <bl-tooltip class="w-full">
    <div class="flex flex-col gap-2">
      <bl-progress-bar
        v-model:progress-value="progress"
        size="sm"
        :color="getGoalProgressColor(goal.status, 'bg')"
      />
      <div class="flex justify-between">
        <p class="text-accent-darker">{{ toFullDate(goal.startAt) }}</p>
        <p class="text-accent-darker">{{ toFullDate(goal.finishAt) }}</p>
      </div>
    </div>
    <template #tooltip-content="tooltipProps">
      <span v-bind="tooltipProps" class="flex gap-1">
        <p class="font-semibold text-main">{{ getGoalProgress(goal) }}</p>
        <p>{{ getGoalUnit(goal, progress) }} read</p>
      </span>
    </template>
  </bl-tooltip>
</template>

<script setup lang="ts">
// bg-accent-dark
// text-accent-dark
import type { Goal } from '~/types/goal'
import { getGoalProgressPercentage } from '~/utils'

const props = defineProps<{ goal: Goal }>()

const progress = ref(getGoalProgressPercentage(props.goal))
</script>

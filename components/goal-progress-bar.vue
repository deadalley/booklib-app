<template>
  <bl-tooltip class="w-full">
    <div class="flex flex-col gap-2">
      <bl-progress-bar
        v-model:progress-value="progress"
        size="sm"
        :color="getGoalProgressColor(goal, 'bg')"
      />
      <div class="flex justify-between">
        <p class="text-ink-secondary">{{ toFullDate(goal.startAt) }}</p>
        <p class="text-ink-secondary">{{ toFullDate(goal.finishAt) }}</p>
      </div>
    </div>
    <template #tooltip-content="tooltipProps">
      <span v-bind="tooltipProps" class="flex gap-1">
        <p class="text-primary font-semibold">{{ getGoalProgress(goal) }}</p>
        <p>{{ getGoalUnit(goal, progress) }} read</p>
      </span>
    </template>
  </bl-tooltip>
</template>

<script setup lang="ts">
import type { Goal } from '~/types/goal'
import { getGoalProgressPercentage } from '~/utils'

const props = defineProps<{ goal: Goal }>()

const progress = ref(getGoalProgressPercentage(props.goal))
</script>

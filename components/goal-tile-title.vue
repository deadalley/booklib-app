<template>
  <div class="flex max-w-80 flex-1 items-center gap-2 sm:max-w-[unset]">
    <component
      :is="icons[GOAL_TYPE_MAP[goal.type].icon]"
      :class="getGoalProgressColor(goal.status, 'text')"
      :size="ICON_SIZE_LARGE"
      stroke="1.5"
    />
    <h5 class="truncate">{{ goal.title }}</h5>
    <span v-if="showActiveTag" class="mb-1 ml-2">
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

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Goal } from '~/types/goal'

defineProps<{
  goal: Goal
  showActiveTag?: boolean
}>()
</script>

<template>
  <div class="flex max-w-80 flex-1 items-center gap-2 sm:max-w-[unset]">
    <component
      :is="icons[GOAL_TYPE_MAP[goal.type].icon]"
      :class="getGoalProgressColor(goal, 'text')"
      :size="ICON_SIZE_LARGE"
      stroke="1.5"
    />
    <h5 class="truncate">{{ goal.title }}</h5>
    <span v-if="showActiveTag" class="mb-1 ml-2">
      <bl-total-tag
        :variant="goalStatus === 'tracking' ? 'primary' : 'secondary'"
      >
        <IconConfetti
          v-if="goalStatus === 'completed'"
          class="text-primary"
          :size="16"
        />
        {{ goalStatusLabel }}
      </bl-total-tag>
    </span>
  </div>
</template>

<script setup lang="ts">
import { icons, IconConfetti } from '@tabler/icons-vue'
import type { Goal } from '~/types/goal'

const props = defineProps<{
  goal: Goal
  showActiveTag?: boolean
}>()

const goalStatus = computed(() => getGoalStatus(props.goal))
const goalStatusLabel = computed(() => getGoalStatusLabel(props.goal))
</script>

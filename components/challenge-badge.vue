<template>
  <span
    class="challenge-badge"
    :title="`${CHALLENGE_LEVEL_LABELS[level]} challenge`"
  >
    <IconFlame :size="13" stroke="2" />
    Challenge
    <bl-challenge-difficulty-meter :level="level" class="ml-0.5" />
  </span>
</template>

<script setup lang="ts">
import { IconFlame } from '@tabler/icons-vue'
import type { ChallengeLevel } from '~/types/goal'

defineProps<{ level: ChallengeLevel }>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.challenge-badge {
  @apply bg-secondary-50 text-secondary-800 border-secondary-200 inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-2 text-[0.6875rem] font-bold tracking-widest whitespace-nowrap uppercase;
}
</style>

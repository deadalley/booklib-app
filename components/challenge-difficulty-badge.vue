<template>
  <span class="difficulty" :class="`lv${level}`">
    <bl-challenge-difficulty-meter :level="level" />
    {{ CHALLENGE_LEVEL_LABELS[level] }}
  </span>
</template>

<script setup lang="ts">
import type { ChallengeLevel } from '~/types/goal'

defineProps<{ level: ChallengeLevel }>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.difficulty {
  @apply inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-0.75 text-[0.6875rem] font-bold tracking-widest whitespace-nowrap uppercase;
}
.lv1 {
  @apply bg-secondary-50 text-secondary-800 border-secondary-200;
}
.lv2 {
  @apply bg-secondary-700 text-ink-inverse;
}
.lv3 {
  @apply bg-primary text-ink-inverse;
}
</style>

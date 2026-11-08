<template>
  <bl-chip size="xs" rounded v-bind="LEVEL_CHIPS[level]">
    <bl-challenge-difficulty-meter :level="level" />
    {{ CHALLENGE_LEVEL_LABELS[level] }}
  </bl-chip>
</template>

<script setup lang="ts">
import type { ChallengeLevel } from '~/types/goal'

defineProps<{ level: ChallengeLevel }>()

// Moderate: amber tint · Hard: solid amber · Extreme: solid red
const LEVEL_CHIPS = {
  1: { variant: 'secondary', color: 'secondary' },
  2: { variant: 'primary', color: 'secondary' },
  3: { variant: 'primary' },
} as const
</script>

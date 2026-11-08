<template>
  <bl-chip
    size="xs"
    rounded
    variant="secondary"
    color="secondary"
    :title="`${CHALLENGE_LEVEL_LABELS[level]} challenge`"
  >
    <IconFlame :size="13" stroke="2" />
    Challenge
    <bl-challenge-difficulty-meter :level="level" class="ml-0.5" />
  </bl-chip>
</template>

<script setup lang="ts">
import { IconFlame } from '@tabler/icons-vue'
import type { ChallengeLevel } from '~/types/goal'

defineProps<{ level: ChallengeLevel }>()
</script>

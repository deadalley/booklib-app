<template>
  <div class="featured">
    <bl-challenge-card
      v-for="challenge in featured"
      :key="challenge.id"
      :challenge="challenge"
      @pick="(picked) => $emit('pick', picked)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChallengePreset } from '~/utils/challenges'

defineEmits<{ (e: 'pick', challenge: ChallengePreset): void }>()

const featured = FEATURED_CHALLENGE_IDS.map((id) => getChallenge(id)!)
</script>

<style scoped>
@reference '../assets/css/main.css';

.featured {
  @apply grid grid-cols-3 gap-4;
}

/* Narrow containers: a scroll-snap row */
@container (max-width: 760px) {
  .featured {
    /* Bleeds to the tile edges (the tile has 1.5rem side padding) */
    @apply -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pt-1 pb-2;
    scroll-padding: 0 1.5rem;
    scrollbar-width: none;
  }
  .featured > * {
    @apply flex-[0_0_84%] snap-start;
  }
}
</style>

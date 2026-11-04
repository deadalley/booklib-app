<template>
  <span class="meter" aria-hidden="true">
    <i v-for="bar in 3" :key="bar" :class="{ on: bar <= level }" />
  </span>
</template>

<script setup lang="ts">
import type { ChallengeLevel } from '~/types/goal'

defineProps<{ level: ChallengeLevel }>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.meter {
  @apply inline-flex h-2.5 items-end gap-0.5;
}
.meter i {
  @apply block w-[3px] rounded-[1px] bg-current opacity-30;
}
.meter i:nth-child(1) {
  @apply h-[5px];
}
.meter i:nth-child(2) {
  @apply h-[7.5px];
}
.meter i:nth-child(3) {
  @apply h-2.5;
}
.meter i.on {
  @apply opacity-100;
}
</style>

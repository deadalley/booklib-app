<template>
  <button
    type="button"
    class="challenge-card"
    :class="`lv${challenge.level}`"
    :disabled="active"
    :data-testid="`challenge-${challenge.id}`"
    @click="$emit('pick', challenge)"
  >
    <span class="top">
      <span class="icon-well">
        <component :is="icons[challenge.icon]" :size="20" stroke="1.7" />
      </span>
      <bl-challenge-difficulty-badge :level="challenge.level" />
    </span>
    <span class="name">{{ challenge.name }}</span>
    <span class="description">{{ challenge.description }}</span>
    <span class="foot">
      <span>
        {{ GOAL_TYPE_MAP[challenge.type].description }} ·
        {{ formatChallengeDuration(challenge) }}
      </span>
      <span v-if="active" class="in-progress">
        <IconCheck :size="14" stroke="2.2" />
        In progress
      </span>
      <span v-else class="start">
        Start
        <IconArrowRight :size="14" stroke="2" />
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { IconArrowRight, IconCheck, icons } from '@tabler/icons-vue'
import type { ChallengePreset } from '~/utils/challenges'

defineProps<{ challenge: ChallengePreset; active?: boolean }>()
defineEmits<{ (e: 'pick', challenge: ChallengePreset): void }>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.challenge-card {
  @apply bg-surface-elevated border-stroke-subtle flex min-w-0 cursor-pointer flex-col gap-2 rounded-xl border px-4.5 py-4 text-left shadow-sm;
  transition:
    border-color 0.15s,
    transform 0.15s,
    box-shadow 0.15s;
}
.challenge-card:hover:not(:disabled) {
  @apply border-secondary-400 -translate-y-0.5 shadow-md;
}
.challenge-card:focus-visible {
  @apply outline-secondary-700! outline-offset-2!;
  outline-style: solid !important;
  outline-width: 2px !important;
}
.challenge-card.lv3 {
  @apply border-primary-200;
  background-image: repeating-linear-gradient(
    135deg,
    transparent 0 12px,
    color-mix(in srgb, var(--primary) 5%, transparent) 12px 13px
  );
}
.challenge-card.lv3:hover:not(:disabled) {
  @apply border-primary-400;
}
.top {
  @apply mb-1 flex items-center justify-between gap-2;
}
.icon-well {
  @apply bg-secondary-50 text-secondary-700 rounded-scholarly grid size-10 flex-none place-items-center;
}
.lv3 .icon-well {
  @apply bg-primary text-ink-inverse;
}
.name {
  @apply font-display text-ink-primary text-[1.1875rem] leading-[1.2] font-semibold text-balance;
}
.description {
  @apply text-ink-secondary flex-1 text-sm leading-[1.45] text-pretty;
}
.foot {
  @apply border-stroke-subtle text-ink-muted mt-1 flex items-center justify-between gap-2 border-t pt-2.5 text-[0.8125rem] font-semibold whitespace-nowrap;
}
.start {
  @apply text-secondary-700 inline-flex items-center gap-1 font-bold;
}
.lv3 .start {
  @apply text-primary;
}
.challenge-card:disabled {
  @apply bg-surface-subtle cursor-default shadow-none;
}
.challenge-card:disabled .name,
.challenge-card:disabled .description {
  @apply text-ink-muted;
}
.in-progress {
  @apply text-ink-secondary inline-flex items-center gap-1 font-bold;
}
</style>

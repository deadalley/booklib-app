<template>
  <section
    class="card section"
    aria-label="Reading challenges"
    data-testid="challenge-callout"
  >
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 flex-[1_1_20rem] flex-col gap-1">
        <h5 class="stats-title">Challenges</h5>
        <p class="text-ink-secondary max-w-[54ch] text-[0.9375rem] text-pretty">
          Bigger targets on a fixed clock. Pick one and see how far you can push
          your reading.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="link inline-flex items-center gap-1 self-center"
          @click="$emit('browse')"
        >
          Browse all
          <IconArrowRight :size="14" stroke="2" />
        </button>
        <bl-icon-button
          variant="tertiary"
          aria-label="Minimize challenges"
          title="Minimize"
          @click="$emit('minimize')"
        >
          <IconChevronUp :size="16" stroke="2" />
        </bl-icon-button>
      </div>
    </header>
    <bl-challenge-featured @pick="(picked) => $emit('pick', picked)" />
  </section>
</template>

<script setup lang="ts">
import { IconArrowRight, IconChevronUp } from '@tabler/icons-vue'
import type { ChallengePreset } from '~/utils/challenges'

defineEmits<{
  (e: 'browse' | 'minimize'): void
  (e: 'pick', challenge: ChallengePreset): void
}>()
</script>

<style scoped>
@reference '../assets/css/main.css';

/* Same tile as the other sections on the page */
.section {
  @apply px-6 py-5 shadow-sm;
  container-type: inline-size;
}
</style>

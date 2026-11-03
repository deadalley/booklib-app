<template>
  <section
    class="callout"
    aria-label="Reading challenges"
    data-testid="challenge-callout"
  >
    <header class="head">
      <span class="icon-well">
        <IconFlame :size="24" stroke="1.7" />
      </span>
      <div class="flex min-w-0 flex-col gap-1">
        <p class="eyebrow">Challenges</p>
        <h4 class="heading">Take on a reading challenge</h4>
        <p class="subtitle">
          Bigger targets on a fixed clock. Pick one and see how far you can push
          your reading.
        </p>
      </div>
    </header>
    <div class="cta">
      <bl-button color="secondary" @click="$emit('browse')">
        Browse all challenges
        <template #appendIcon="iconProps">
          <IconArrowRight v-bind="iconProps" />
        </template>
      </bl-button>
    </div>
    <button
      type="button"
      class="dismiss"
      aria-label="Dismiss challenges"
      @click="$emit('dismiss')"
    >
      <IconX :size="18" stroke="2" />
    </button>
    <div class="cards">
      <bl-challenge-card
        v-for="challenge in featured"
        :key="challenge.id"
        :challenge="challenge"
        @pick="(picked) => $emit('pick', picked)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { IconArrowRight, IconFlame, IconX } from '@tabler/icons-vue'
import type { ChallengePreset } from '~/utils/challenges'

defineEmits<{
  (e: 'browse' | 'dismiss'): void
  (e: 'pick', challenge: ChallengePreset): void
}>()

const featured = FEATURED_CHALLENGE_IDS.map((id) => getChallenge(id)!)
</script>

<style scoped>
@reference '../assets/css/main.css';

.callout {
  @apply border-secondary-200 bg-secondary-50 relative grid items-center gap-x-6 gap-y-5 rounded-xl border p-6;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'head cta' 'cards cards';
}
.head {
  @apply flex min-w-0 items-start gap-4;
  grid-area: head;
}
.icon-well {
  @apply bg-secondary-700 text-ink-inverse grid size-12 flex-none place-items-center rounded-xl;
}
.eyebrow {
  @apply text-secondary-800 tracking-caps text-xs font-bold uppercase;
}
.heading {
  @apply text-ink-primary text-[1.625rem] leading-[1.15] text-balance;
}
.subtitle {
  @apply text-ink-secondary max-w-[54ch] text-[0.9375rem] text-pretty;
}
.cta {
  @apply flex pr-11;
  grid-area: cta;
}
.dismiss {
  @apply text-ink-muted hover:text-ink-primary rounded-scholarly absolute top-3.5 right-3.5 grid size-9 cursor-pointer place-items-center;
}
.dismiss:hover {
  background: color-mix(in srgb, var(--secondary) 16%, transparent);
}
.cards {
  @apply grid grid-cols-3 gap-4;
  grid-area: cards;
}

@container (max-width: 760px) {
  .callout {
    @apply gap-4 p-5;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'head' 'cards' 'cta';
  }
  .head {
    @apply gap-3 pr-8;
  }
  .icon-well {
    @apply size-10;
  }
  .heading {
    @apply text-[1.375rem];
  }
  .subtitle {
    @apply text-sm;
  }
  .cta {
    @apply pr-0;
  }
  .cta :deep(.button) {
    @apply w-full;
  }
  .cards {
    @apply -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pt-1 pb-2;
    scroll-padding: 0 1.25rem;
    scrollbar-width: none;
  }
  .cards > * {
    @apply flex-[0_0_84%] snap-start;
  }
}
</style>

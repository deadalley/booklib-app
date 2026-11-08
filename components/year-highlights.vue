<template>
  <section
    class="card highlights"
    aria-roledescription="carousel"
    aria-label="Year highlights"
    data-testid="year-highlights"
    v-on="carousel.listeners"
  >
    <div class="body" aria-live="polite">
      <p class="big" :class="{ long: slide.big.length > 3 }">{{ slide.big }}</p>
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <span class="chip">{{ slide.chip }}</span>
        <p class="headline">{{ slide.headline }}</p>
        <p class="sub">{{ slide.sub }}</p>
      </div>
    </div>
    <div
      v-if="insights.length > 1"
      class="flex items-center justify-between gap-3"
    >
      <div role="group" aria-label="Choose a highlight" class="flex">
        <button
          v-for="(insight, k) in insights"
          :key="insight.headline"
          type="button"
          class="dot-button"
          :aria-label="`Highlight ${k + 1} of ${insights.length}`"
          :aria-current="k === index"
          @click="carousel.pick(k)"
        >
          <span class="dot" :class="{ on: k === index }" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <bl-icon-button
          variant="secondary"
          class="size-11"
          :aria-label="
            paused
              ? 'Resume automatic highlights'
              : 'Pause automatic highlights'
          "
          @click="paused = !paused"
        >
          <component
            :is="paused ? IconPlayerPlay : IconPlayerPause"
            :size="18"
            stroke="2"
          />
        </bl-icon-button>
        <bl-icon-button
          variant="secondary"
          class="size-11"
          aria-label="Previous highlight"
          @click="carousel.go(-1)"
        >
          <IconChevronLeft :size="18" stroke="2" />
        </bl-icon-button>
        <bl-icon-button
          variant="secondary"
          class="size-11"
          aria-label="Next highlight"
          @click="carousel.go(1)"
        >
          <IconChevronRight :size="18" stroke="2" />
        </bl-icon-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-vue'
import type { YearInsight } from '~/utils/year-review'

const props = defineProps<{ insights: YearInsight[] }>()

const carousel = useCarousel(() => props.insights.length, 6000)
const { index, paused } = carousel

const slide = computed(() => props.insights[index.value] ?? props.insights[0]!)
</script>

<style scoped>
@reference '../assets/css/main.css';

.highlights {
  @apply gap-3 px-9 pt-8 pb-3 shadow-sm;
  container-type: inline-size;
}
.body {
  @apply flex min-h-35 items-center gap-12;
}
.big {
  @apply font-display text-primary min-w-[300px] text-[104px] leading-[0.95] font-semibold tracking-[-0.02em];
}
.big.long {
  @apply text-[84px];
}
.chip {
  @apply bg-surface-container text-ink-secondary w-fit rounded-full px-2.5 py-0.75 text-xs font-bold tracking-[0.06em] uppercase;
}
.headline {
  @apply font-display text-ink-primary text-[38px] leading-[1.15] font-semibold text-balance;
}
.sub {
  @apply text-ink-secondary text-lg;
}
.dot-button {
  @apply grid h-11 w-6 cursor-pointer place-items-center p-0;
}
.dot {
  @apply bg-stroke block h-2 w-2 rounded-full transition-all;
}
.dot.on {
  @apply bg-primary w-[22px];
}

@container (max-width: 640px) {
  .highlights {
    @apply px-4 pt-5 pb-2;
  }
  .body {
    @apply min-h-50 flex-col items-start gap-3;
  }
  .big {
    @apply min-w-0 text-[64px];
  }
  .big.long {
    @apply text-[52px];
  }
  .headline {
    @apply text-[26px];
  }
  .sub {
    @apply text-[0.9375rem];
  }
  .dot-button {
    @apply w-[22px];
  }
}
</style>

<template>
  <section
    v-if="!items.length"
    class="home-card text-ink-muted flex-row! items-center gap-3! p-6!"
  >
    <IconSparkles :size="22" stroke="1.6" class="flex-none" />
    <p>You’re all caught up. No suggestions right now.</p>
  </section>
  <section
    v-else
    class="home-card carousel"
    aria-roledescription="carousel"
    aria-label="Suggestions"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="onFocusOut"
    @keydown.left="go(-1)"
    @keydown.right="go(1)"
  >
    <div class="track" :style="{ transform: `translateX(-${index * 100}%)` }">
      <article
        v-for="(item, k) in items"
        :key="item.id"
        class="slide"
        :class="{ almost: item.kind === 'almost' }"
        aria-roledescription="slide"
        :aria-label="`${k + 1} of ${items.length}`"
        :aria-hidden="k !== index"
      >
        <div class="cover">
          <bl-home-book-cover :book="item.book" class="size-full p-4!" />
          <span v-if="item.kind === 'almost'" class="cover-pct">
            {{ item.progress }}%
          </span>
        </div>
        <div class="flex min-w-0 flex-col gap-2">
          <p class="eyebrow">
            <component :is="KIND_ICONS[item.kind]" :size="14" stroke="2" />
            {{ item.eyebrow }}
          </p>
          <h4 class="slide-title">{{ item.title }}</h4>
          <p v-if="item.body" class="slide-text">{{ item.body }}</p>
          <bl-progress-bar
            v-if="item.kind === 'almost'"
            :progress-value="item.progress"
            size="xs"
            class="max-w-80"
          />
          <div class="mt-2 flex flex-wrap gap-2">
            <bl-button
              size="sm"
              :tabindex="k === index ? 0 : -1"
              :loading="busy === item.id"
              @click="emit('act', item)"
            >
              {{ item.cta }}
            </bl-button>
            <bl-button
              size="sm"
              variant="tertiary"
              :tabindex="k === index ? 0 : -1"
              @click="emit('dismiss', item.id)"
            >
              Not now
            </bl-button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="items.length > 1" class="nav">
      <div class="flex flex-1 gap-1.5">
        <button
          v-for="(item, k) in items"
          :key="item.id"
          type="button"
          class="dot"
          :class="{ on: k === index }"
          :aria-label="`Suggestion ${k + 1}`"
          :aria-current="k === index"
          @click="index = k"
        />
      </div>
      <span class="count">{{ index + 1 }} / {{ items.length }}</span>
      <bl-icon-button
        variant="secondary"
        class="size-8"
        aria-label="Previous suggestion"
        @click="go(-1)"
      >
        <IconChevronLeft :size="16" stroke="2" />
      </bl-icon-button>
      <bl-icon-button
        variant="secondary"
        class="size-8"
        aria-label="Next suggestion"
        @click="go(1)"
      >
        <IconChevronRight :size="16" stroke="2" />
      </bl-icon-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  IconChevronLeft,
  IconChevronRight,
  IconFeather,
  IconFlag,
  IconHourglass,
  IconSparkles,
  IconTarget,
} from '@tabler/icons-vue'
import type { Component } from 'vue'
import type { Suggestion, SuggestionKind } from '~/utils/suggestions'

const AUTOPLAY_MS = 7000

const KIND_ICONS: Record<SuggestionKind, Component> = {
  almost: IconFlag,
  log: IconTarget,
  author: IconFeather,
  old: IconHourglass,
}

const props = defineProps<{ items: Suggestion[]; busy?: string | null }>()

const emit = defineEmits<{
  (e: 'act', item: Suggestion): void
  (e: 'dismiss', id: string): void
}>()

const index = ref(0)
const hovered = ref(false)
const focused = ref(false)

function go(step: number) {
  const n = props.items.length
  if (n) index.value = (index.value + step + n) % n
}

function onFocusOut(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement
  if (!root.contains(event.relatedTarget as Node | null)) focused.value = false
}

// A dismissal can leave the index past the end
watch(
  () => props.items.length,
  (n) => {
    if (n && index.value >= n) index.value = n - 1
  },
)

watchEffect((onCleanup) => {
  if (hovered.value || focused.value || props.items.length < 2) return
  const timer = setInterval(() => go(1), AUTOPLAY_MS)
  onCleanup(() => clearInterval(timer))
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.carousel {
  @apply relative gap-0 overflow-hidden p-0;
}
.track {
  @apply flex;
  transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
}
@media (prefers-reduced-motion: reduce) {
  .track {
    transition: none;
  }
}
.slide {
  @apply grid flex-[0_0_100%] grid-cols-[9rem_minmax(0,1fr)] items-center gap-6 px-6 pt-6 pb-15;
}
.slide.almost {
  @apply from-primary-50 bg-linear-to-r to-transparent to-70%;
}
.cover {
  @apply relative aspect-[2/3] w-36 overflow-hidden rounded-lg shadow-[0_6px_16px_rgba(0,0,0,0.12)];
}
.cover > :first-child {
  @apply rounded-none;
}
.cover-pct {
  @apply bg-primary text-ink-inverse absolute right-1.5 bottom-1.5 rounded-full px-2 py-0.5 text-xs font-bold;
}
.eyebrow {
  @apply text-primary inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] uppercase;
}
.slide-title {
  @apply font-display text-ink-primary text-[1.625rem] leading-[1.2] font-semibold text-balance;
}
.slide-text {
  @apply text-ink-secondary text-[0.9375rem] text-pretty;
}
.nav {
  @apply absolute right-6 bottom-4 left-48 flex items-center gap-2;
}
.dot {
  @apply bg-stroke size-2 cursor-pointer rounded-full p-0;
  transition:
    width 0.2s,
    background-color 0.2s;
}
.dot.on {
  @apply bg-primary w-6;
}
.count {
  @apply text-ink-muted mr-1 text-[0.8125rem] font-semibold tabular-nums;
}
@container (max-width: 620px) {
  .slide {
    @apply grid-cols-[5.5rem_minmax(0,1fr)] gap-4 px-5 pt-5 pb-14;
  }
  .cover {
    @apply w-22;
  }
  .cover > :first-child {
    @apply p-2!;
  }
  .cover :deep(span) {
    @apply hidden;
  }
  .slide-title {
    @apply text-xl;
  }
  .nav {
    @apply right-5 left-5;
  }
}
</style>

<template>
  <bl-stats-empty v-if="!items.length" label="No data" />
  <div v-else class="flex flex-wrap items-center gap-6">
    <svg
      viewBox="0 0 160 160"
      class="w-44 flex-none overflow-visible"
      role="img"
      :aria-label="
        items.map(({ label, value }) => `${label} ${value}`).join(', ')
      "
    >
      <g transform="rotate(-90 80 80)">
        <circle
          v-for="(segment, index) in segments"
          :key="segment.label"
          cx="80"
          cy="80"
          :r="R"
          fill="none"
          class="segment"
          :class="segment.tone"
          :stroke-width="hovered === index ? 24 : 20"
          :stroke-dasharray="`${segment.length} ${CIRCUMFERENCE}`"
          :stroke-dashoffset="-segment.offset"
          :style="{ opacity: hovered === null || hovered === index ? 1 : 0.35 }"
          @mouseenter="hovered = index"
          @mouseleave="hovered = null"
        >
          <title>{{ segment.label }}: {{ segment.value }}</title>
        </circle>
      </g>
      <text x="80" y="78" text-anchor="middle" class="center-number">
        {{ hoveredItem ? hoveredItem.value : total }}
      </text>
      <text x="80" y="96" text-anchor="middle" class="center-label">
        {{ hoveredItem ? `${percentage(hoveredItem.value)}%` : 'BOOKS' }}
      </text>
    </svg>

    <ul class="flex min-w-0 flex-[1_1_12rem] flex-col gap-0.5">
      <li
        v-for="(item, index) in items"
        :key="item.label"
        class="legend-row"
        :class="{ hovered: hovered === index }"
        @mouseenter="hovered = index"
        @mouseleave="hovered = null"
      >
        <span class="swatch" :class="item.tone" />
        <span class="truncate">{{ item.label }}</span>
        <b class="text-ink-primary">{{ item.value }}</b>
        <span class="text-ink-muted text-right text-[0.8125rem]">
          {{ percentage(item.value) }}%
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
export type StatsDonutItem = { label: string; value: number; tone: string }

const props = defineProps<{ items: StatsDonutItem[]; total: number }>()

const R = 62
const CIRCUMFERENCE = 2 * Math.PI * R

const hovered = ref<number | null>(null)

const sum = computed(
  () => props.items.reduce((total, { value }) => total + value, 0) || 1,
)

const segments = computed(() => {
  const gap = props.items.length > 1 ? 2.5 : 0
  let offset = 0
  return props.items.map((item) => {
    const length = (item.value / sum.value) * CIRCUMFERENCE
    const segment = { ...item, length: Math.max(0, length - gap), offset }
    offset += length
    return segment
  })
})

const hoveredItem = computed(() =>
  hovered.value === null ? null : props.items[hovered.value],
)

function percentage(value: number) {
  return Math.round((value / sum.value) * 100)
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.segment {
  transition:
    stroke-width 0.15s,
    opacity 0.15s;
}
.center-number {
  @apply font-display fill-ink-primary pointer-events-none text-[28px] font-semibold;
}
.center-label {
  @apply fill-ink-muted pointer-events-none text-[10px] font-bold tracking-[0.14em];
}
.legend-row {
  @apply text-ink-secondary rounded-scholarly grid grid-cols-[auto_minmax(0,1fr)_auto_2.75rem] items-center gap-2.5 px-2 py-1.5 text-[0.9375rem];
}
.legend-row.hovered {
  @apply bg-surface-subtle;
}
.swatch {
  @apply border-stroke-subtle size-3 flex-none rounded-[3px] border;
}

/* Tones: stroke for segments, background for swatches */
.tone-primary {
  @apply stroke-primary bg-primary;
}
.tone-primary-400 {
  @apply stroke-primary-400 bg-primary-400;
}
.tone-primary-200 {
  @apply stroke-primary-200 bg-primary-200;
}
.tone-secondary-400 {
  @apply stroke-secondary-400 bg-secondary-400;
}
.tone-secondary-200 {
  @apply stroke-secondary-200 bg-secondary-200;
}
.tone-ink-subtle {
  @apply stroke-ink-subtle bg-ink-subtle;
}
.tone-surface-container {
  @apply stroke-surface-container bg-surface-container;
}
</style>

<template>
  <bl-stats-empty
    v-if="!items.some(({ value }) => value)"
    :label="emptyLabel"
  />
  <div v-else class="flex flex-col gap-2" :style="{ '--n': items.length }">
    <div class="plot">
      <component
        :is="item.to ? NuxtLink : 'div'"
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        :to="item.to"
        class="column"
        :class="{
          zero: !item.value,
          clickable: !!item.to,
        }"
        :title="`${item.label}: ${format(item.value)}`"
      >
        <span class="value">{{ item.value ? format(item.value) : '' }}</span>
        <span class="bar" :style="{ height: `${(item.value / max) * 100}%` }" />
      </component>
    </div>
    <div class="axis">
      <span
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        :title="item.label"
      >
        {{ item.short ?? item.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

export type StatsColumnItem = {
  label: string
  short?: string
  value: number
  to?: string
}

const props = withDefaults(
  defineProps<{
    items: StatsColumnItem[]
    format?: (value: number) => string
    emptyLabel?: string
  }>(),
  { format: (value: number) => String(value), emptyLabel: 'No data' },
)

const max = computed(() =>
  Math.max(1, ...props.items.map(({ value }) => value)),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.plot {
  @apply border-stroke grid h-44 items-end gap-1.5 border-b;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  background: repeating-linear-gradient(
    to top,
    var(--color-stroke-subtle, #ece8e7) 0 1px,
    transparent 1px 25%
  );
}
.column {
  @apply flex h-full min-w-0 flex-col items-center justify-end gap-1 p-0;
}
.value {
  @apply text-ink-secondary text-xs font-bold whitespace-nowrap;
}
.bar {
  @apply bg-primary block min-h-0.5 w-full max-w-10 rounded-t-[5px] transition-colors duration-150;
}
.column.clickable:hover .bar {
  @apply bg-primary-800;
}
.column.clickable:hover .value {
  @apply text-primary;
}
.column.zero .bar {
  @apply bg-transparent;
}
.axis {
  @apply grid gap-1.5;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}
.axis span {
  @apply text-ink-muted line-clamp-2 overflow-hidden text-center text-xs leading-[1.2] font-semibold break-words;
}
</style>

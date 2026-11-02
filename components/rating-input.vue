<template>
  <div
    class="text-primary flex flex-wrap items-center gap-0.5"
    @mouseleave="hovered = null"
  >
    <span v-for="star in 5" :key="star" class="relative inline-flex">
      <IconStarFilled v-if="displayed >= star" :size="iconSize" stroke="1.5" />
      <IconStarHalfFilled
        v-else-if="displayed >= star - 0.5"
        :size="iconSize"
        stroke="1.5"
      />
      <IconStar v-else :size="iconSize" stroke="1.5" />
      <button
        v-for="value in [star - 0.5, star]"
        :key="value"
        type="button"
        class="absolute inset-y-0 w-1/2 cursor-pointer"
        :class="value === star ? 'right-0' : 'left-0'"
        :aria-label="`${value} ${value === 1 ? 'star' : 'stars'}`"
        :aria-pressed="rating === value"
        @mouseenter="hovered = value"
        @focus="hovered = value"
        @blur="hovered = null"
        @click="$emit('commit', value)"
      />
    </span>
    <span class="text-ink-primary ml-2 text-sm font-semibold">
      {{ displayed ? displayed.toFixed(1) : 'Not rated' }}
    </span>
    <button
      v-if="rating"
      type="button"
      class="text-ink-muted hover:text-primary ml-1 cursor-pointer text-[0.8125rem] font-semibold underline"
      @click="$emit('commit', null)"
    >
      Clear
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-vue'

const props = withDefaults(
  defineProps<{
    rating: number | null
    iconSize?: number
  }>(),
  { iconSize: 26 },
)

defineEmits<{
  (e: 'commit', rating: number | null): void
}>()

const hovered = ref<number | null>(null)

const displayed = computed(() => hovered.value ?? props.rating ?? 0)
</script>

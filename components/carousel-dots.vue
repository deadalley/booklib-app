<template>
  <div
    role="group"
    :aria-label="`Choose a ${label.toLowerCase()}`"
    class="dots"
    :class="size"
  >
    <button
      v-for="k in count"
      :key="k"
      type="button"
      class="dot-button"
      :aria-label="`${label} ${k} of ${count}`"
      :aria-current="k - 1 === index"
      @click="index = k - 1"
    >
      <span class="dot" :class="{ on: k - 1 === index }" />
    </button>
  </div>
</template>

<script setup lang="ts">
/** Dots that pick a slide in a carousel (see useCarousel). */
withDefaults(
  defineProps<{
    count: number
    // Names one slide, e.g. "Highlight" → "Highlight 2 of 5"
    label: string
    // sm: compact rows; md: 44px tall touch targets
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

const index = defineModel<number>({ required: true })
</script>

<style scoped>
@reference '../assets/css/main.css';

.dots {
  @apply flex;
}
.dot-button {
  @apply grid w-6 cursor-pointer place-items-center p-0;
}
.md .dot-button {
  @apply h-11;
}
.sm .dot-button {
  @apply h-6;
}
.dot {
  @apply bg-stroke block rounded-full transition-all;
}
.md .dot {
  @apply size-2;
}
.md .dot.on {
  @apply w-[22px];
}
.sm .dot {
  @apply size-1.5;
}
.sm .dot.on {
  @apply w-4;
}
.dot.on {
  @apply bg-primary;
}
</style>

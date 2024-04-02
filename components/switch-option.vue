<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <RadioGroupOption
    v-slot="{ checked }"
    as="li"
    :value="value"
    class="radio-group-option flex cursor-pointer items-center border-r border-r-accent bg-accent-light text-black ring-inset transition-all first:rounded-l-3xl last:rounded-r-3xl last:border-0 hover:bg-accent-light/20 hover:ring-1 hover:ring-accent active:bg-accent-dark active:shadow-inner-m lg:w-full"
  >
    <span
      class="flex items-center rounded-[inherit] px-3 transition-all lg:w-full"
      :class="{
        'bg-accent-dark shadow-inner-m': !!checked,
        'py-2': compact,
        'py-3': !compact,
      }"
    >
      <slot name="icon" :size="iconSize" stroke="1.5"></slot>
    </span>
  </RadioGroupOption>
</template>

<script setup lang="ts">
import { RadioGroupOption } from '@headlessui/vue'

const props = defineProps<{ compact?: boolean; value: string | number }>()

const iconSize = computed(() =>
  props.compact ? ICON_SIZE_MEDIUM : ICON_SIZE_SMALL,
)
</script>

<style scoped>
.radio-group-option:first-child * {
  @apply pl-5;
}

.radio-group-option:last-child * {
  @apply pr-5;
}
</style>

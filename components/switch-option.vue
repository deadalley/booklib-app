<template>
  <RadioGroupOption
    v-slot="{ checked }"
    as="li"
    :value="value"
    class="flex cursor-pointer items-center border-r border-accent-dark first:rounded-l-3xl last:rounded-r-3xl last:border-0 hover:bg-accent active:bg-accent-dark lg:w-full"
  >
    <span
      class="flex items-center rounded-[inherit] px-3 first:pl-5 last:pr-5 lg:w-full"
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

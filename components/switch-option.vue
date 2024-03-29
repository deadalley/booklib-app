<template>
  <RadioGroupOption
    v-slot="{ checked }"
    :value="value"
    class="flex items-center w-full first:rounded-l-3xl last:rounded-r-3xl border-r last:border-0 border-accent-dark cursor-pointer hover:bg-accent active:bg-accent-dark"
  >
    <li
      class="flex items-center w-full px-3 first:pl-5 last:pr-5 rounded-[inherit]"
      :class="{
        'bg-accent-dark shadow-inner-m': !!checked,
        'py-2': compact,
        'py-3': !compact,
      }"
    >
      <slot name="icon" :size="iconSize" stroke="1.5"></slot>
    </li>
  </RadioGroupOption>
</template>

<script setup lang="ts">
import { RadioGroupOption } from '@headlessui/vue'
import { ICON_SIZE_MEDIUM, ICON_SIZE_SMALL } from '~/utils'

const props = defineProps<{ compact?: boolean; value: string | number }>()

const iconSize = computed(() =>
  props.compact ? ICON_SIZE_MEDIUM : ICON_SIZE_SMALL,
)
</script>

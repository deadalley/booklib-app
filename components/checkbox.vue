<template>
  <label
    :for="$attrs.id as string"
    class="flex size-full cursor-pointer items-center gap-3 text-lg text-black"
    :class="{
      'justify-center': !$slots['default'],
    }"
    @click="onClick"
  >
    <span v-if="$slots['default']" class="size-full">
      <slot />
    </span>

    <input
      v-bind="$attrs"
      v-model="_checked"
      type="checkbox"
      class="relative aspect-square size-5 cursor-pointer appearance-none rounded-lg border border-accent-dark transition-all checked:border-main checked:bg-main"
    />
  </label>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{ checked?: boolean }>()

const emit = defineEmits(['update:checked'])

const _checked = useVModel(props, 'checked', emit)

function onClick(event: Event) {
  event.stopPropagation()
}
</script>

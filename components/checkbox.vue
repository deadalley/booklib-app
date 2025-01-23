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
      class="peer relative aspect-square size-5 cursor-pointer appearance-none rounded-lg border border-accent-dark transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:size-12 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-lg before:opacity-0 before:transition-opacity checked:border-main checked:bg-main checked:before:bg-main"
    />
    <span
      class="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="aspect-square size-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="1"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
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

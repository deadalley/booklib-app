<template>
  <div
    class="size-full rounded-xl bg-accent-light p-10 text-lg"
    v-bind="$attrs"
  >
    <div
      class="flex size-full w-full flex-col items-center justify-center gap-3 rounded-[inherit] border-2 border-dashed border-accent-dark p-2 text-accent-dark"
    >
      <component :is="icons[icon]" stroke="1.5" :size="iconSize" />
      <span
        class="w-full truncate text-center font-normal leading-tight text-black"
      >
        <slot />
        <template v-if="!$slots['default']">
          <slot name="emptyLabel" />
          <template v-if="!$slots['emptyLabel']">
            Book
            <br />
            Cover
          </template>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

withDefaults(defineProps<{ icon?: keyof typeof icons; iconSize?: number }>(), {
  icon: 'IconPhoto',
  iconSize: 32,
})
</script>

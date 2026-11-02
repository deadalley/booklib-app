<template>
  <div
    class="rounded-scholarly bg-surface-subtle size-full p-10 text-lg"
    v-bind="$attrs"
  >
    <div
      class="border-stroke-strong text-ink-muted flex size-full w-full flex-col items-center justify-center gap-3 rounded-[inherit] border-2 border-dashed p-2"
    >
      <component :is="icons[icon]" stroke="1.5" :size="iconSize" />
      <span
        class="text-ink-primary w-full truncate text-center leading-tight font-normal"
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

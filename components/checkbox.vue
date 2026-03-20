<template>
  <label
    :for="$attrs.id as string"
    class="flex size-full cursor-pointer items-center gap-3 text-ink-primary"
    :class="{
      'justify-center': !$slots['default'],
      'flex-row-reverse': align === 'left',
    }"
  >
    <span v-if="$slots['default']" class="size-full">
      <slot />
    </span>
    <input
      v-bind="$attrs"
      v-model="checked"
      type="checkbox"
      class="relative aspect-square size-5 cursor-pointer appearance-none rounded-md border border-stroke-strong transition-all checked:border-primary checked:bg-primary"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ align?: 'right' | 'left' }>(), { align: 'right' })

const checked = defineModel<boolean>()
</script>

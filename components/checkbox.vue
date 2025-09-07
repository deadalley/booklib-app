<template>
  <label
    :for="$attrs.id as string"
    class="flex size-full cursor-pointer items-center gap-3 text-black"
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
      class="relative aspect-square size-4 cursor-pointer appearance-none rounded-md border border-accent-dark transition-all checked:border-main checked:bg-main"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ align?: 'right' | 'left' }>(), { align: 'right' })

const checked = defineModel<boolean>()
</script>

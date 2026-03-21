<template>
  <label
    :for="$attrs.id as string"
    class="checkbox-label"
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
      class="checkbox-input"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ align?: 'right' | 'left' }>(), { align: 'right' })

const checked = defineModel<boolean>()
</script>

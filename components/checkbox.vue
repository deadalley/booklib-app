<template>
  <label
    :for="$attrs.id as string"
    class="checkbox-label"
    :class="{
      'flex-row-reverse justify-end': align === 'left',
      [$attrs.class as string]: !!$attrs.class,
    }"
    @click="$emit('change', !!checked)"
  >
    <span>
      <slot />
    </span>
    <input
      :id="$attrs.id as string"
      :checked="$attrs.checked as boolean"
      v-model="checked"
      type="checkbox"
      class="checkbox-input"
      @input="emit('change', !!checked)"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ align?: 'right' | 'left' }>(), { align: 'left' })

const checked = defineModel<boolean>()

const emit = defineEmits<{
  (e: 'change', value: boolean): void
}>()
</script>

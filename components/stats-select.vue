<template>
  <label class="relative inline-flex items-center">
    <select v-model="model" :aria-label="label" class="select">
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <IconChevronDown
      :size="14"
      stroke="2"
      class="text-ink-muted pointer-events-none absolute right-2.5"
    />
  </label>
</template>

<script setup lang="ts" generic="T extends string">
import { IconChevronDown } from '@tabler/icons-vue'

defineProps<{ label: string; options: { value: T; label: string }[] }>()

const model = defineModel<T>({ required: true })
</script>

<style scoped>
@reference '../assets/css/main.css';

.select {
  @apply text-ink-secondary bg-surface-subtle border-stroke hover:border-stroke-strong rounded-scholarly cursor-pointer appearance-none border py-1.5 pr-8 pl-2.5 text-sm font-semibold;
}
</style>

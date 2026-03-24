<template>
  <div class="grid grid-cols-3 gap-6">
    <div
      v-for="field in fields"
      :key="field.label"
      class="bg-surface-canvas/70 flex flex-col gap-1 rounded-2xl p-4"
    >
      <p class="label">{{ field.label }}</p>
      <div class="flex items-center gap-2">
        <component
          v-if="field.icon"
          :is="icons[field.icon]"
          :size="ICON_SIZE_SMALL"
        />
        <p class="value">{{ field.value || '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

defineProps<{
  fields: {
    label: string
    value?: string | null
    icon?: keyof typeof icons
  }[]
}>()
</script>

<style scoped>
@reference '../../assets/css/main.css';

.label {
  @apply text-ink-muted text-sm font-semibold tracking-wider uppercase;
}
.value {
  @apply text-ink-primary text-xl font-bold;
}
</style>

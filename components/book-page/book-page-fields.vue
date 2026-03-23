<template>
  <div class="grid grid-cols-3 gap-6">
    <div
      v-for="field in fields"
      :key="field.label"
      class="bg-surface-canvas/70 flex flex-col gap-1 rounded-2xl p-4"
    >
      <p class="label">{{ field.label }}</p>
      <p class="value">{{ field.value || '-' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  fields: {
    label: string
    value?: string
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

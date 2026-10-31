<template>
  <div class="goal-card kpi">
    <span
      class="bg-primary-50 text-primary rounded-scholarly mb-2 grid size-9 place-items-center"
    >
      <component :is="icons[icon]" :size="20" stroke="1.6" />
    </span>
    <p
      class="font-display text-ink-primary text-[2.25rem] leading-none font-semibold"
    >
      {{ value }}
    </p>
    <p class="text-ink-secondary text-xs font-bold tracking-widest uppercase">
      {{ unit }}
    </p>
    <p
      v-if="hint"
      class="text-ink-muted truncate text-[0.8125rem]"
      :title="hint"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

defineProps<{
  icon: keyof typeof icons
  value: string
  unit: string
  hint?: string | null
}>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.kpi {
  @apply gap-1 p-5;
}
</style>

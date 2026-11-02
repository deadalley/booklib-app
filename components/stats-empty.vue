<template>
  <div
    class="text-ink-muted flex min-h-40 flex-col items-center justify-center gap-2 text-sm font-medium"
  >
    <IconChartBar :size="28" stroke="1.3" />
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { IconChartBar } from '@tabler/icons-vue'

defineProps<{ label: string }>()
</script>

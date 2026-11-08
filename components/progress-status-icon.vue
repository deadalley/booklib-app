<template>
  <!-- The tooltip always carries the full label: the chip may be truncated -->
  <bl-tooltip v-if="PROGRESS_STATUS_MAP[status]" class="max-w-full min-w-0">
    <bl-chip
      v-if="!iconOnly"
      size="sm"
      rounded
      variant="primary"
      class="max-w-full min-w-0 cursor-default"
    >
      <component
        :is="icons[PROGRESS_STATUS_MAP[status].icon]"
        :size="14"
        stroke="1.75"
        class="shrink-0"
        aria-hidden="true"
      />
      <span class="truncate">
        {{ PROGRESS_STATUS_MAP[status].description }}
      </span>
    </bl-chip>
    <bl-icon-button v-if="iconOnly" disabled keep-style>
      <template #default="iconProps">
        <component
          :is="icons[PROGRESS_STATUS_MAP[status].icon]"
          v-bind="iconProps"
        />
      </template>
    </bl-icon-button>
    <template #tooltip-content>
      {{ PROGRESS_STATUS_MAP[status].description }}
    </template>
  </bl-tooltip>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { BookProgressStatus } from '~/types/book'

defineProps<{ status: BookProgressStatus; iconOnly?: boolean }>()
</script>

<style scoped>
@reference '../assets/css/main.css';
</style>

<template>
  <bl-tooltip>
    <div
      v-if="!iconOnly"
      class="relative flex w-fit cursor-default items-center gap-2 rounded-xl bg-main px-4 py-1 text-base text-white"
    >
      {{ PROGRESS_STATUS_MAP[status].description }}
      <component
        :is="icons[PROGRESS_STATUS_MAP[status].icon]"
        :size="18"
        stroke="1.5"
      />
    </div>
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

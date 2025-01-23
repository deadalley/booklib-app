<template>
  <bl-icon-button disabled keep-style>
    <template #default="iconProps">
      <component
        :is="icons[PROGRESS_STATUS_MAP[status].icon]"
        v-bind="iconProps"
      />
    </template>
  </bl-icon-button>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { BookProgressStatus } from '~/types/book'

defineProps<{ status: BookProgressStatus }>()
</script>

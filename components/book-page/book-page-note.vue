<template>
  <div class="note-section">
    <div class="note-date-wrapper">
      <IconNote :size="ICON_SIZE_SMALL" stroke="1.5" class="note-icon" />
    </div>

    <div class="note-values-wrapper">
      <div class="flex items-center gap-3">
        <span class="note-date">
          {{ new Date(note.createdAt).toLocaleDateString() }}
        </span>
        <span v-if="note.page !== undefined" class="note-page">
          p. {{ note.page }}
        </span>
      </div>
      <div v-if="note.content" class="note-values">
        <p class="note-content">{{ note.content }}</p>
      </div>
    </div>

    <bl-icon-button variant="tertiary" class="p-0!" @click="emit('edit')">
      <template #default="iconProps">
        <IconEdit v-bind="iconProps" />
      </template>
    </bl-icon-button>
    <bl-icon-button variant="tertiary" class="p-0!" @click="emit('delete')">
      <template #default="iconProps">
        <IconTrash v-bind="iconProps" />
      </template>
    </bl-icon-button>
  </div>
</template>

<script setup lang="ts">
import { IconEdit, IconNote, IconTrash } from '@tabler/icons-vue'
import { ICON_SIZE_SMALL } from '~/utils/constants'
import type { BookNote } from '~/types/book'

defineProps<{ note: BookNote }>()
const emit = defineEmits<{ (e: 'edit' | 'delete'): void }>()
</script>

<style scoped>
@reference '../../assets/css/main.css';

.note-section {
  @apply flex items-start justify-between gap-2 px-3 py-2;
  @apply bg-surface-elevated rounded-scholarly border-stroke border border-dashed;
}

.note-content {
  @apply text-ink-primary flex-1 whitespace-pre-wrap;
}

.note-page {
  @apply text-ink-muted text-sm font-semibold;
}

.note-icon {
  @apply text-primary mt-0.5 shrink-0;
}

.note-date-wrapper {
  @apply flex flex-col items-end gap-2;
}

.note-date {
  @apply text-primary text-base font-medium tracking-wider;
}

.note-values-wrapper {
  @apply mr-2 flex min-w-0 flex-1 flex-col gap-2;
}

.note-values {
  @apply flex gap-3;
}
</style>

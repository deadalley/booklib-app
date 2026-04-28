<template>
  <div class="note-section" :class="{ editing: isEditing }">
    <div class="note-date-wrapper" :class="{ 'text-ink-muted': isNew }">
      <IconNote :size="ICON_SIZE_SMALL" stroke="1.5" class="note-icon" />
    </div>

    <div :class="{ 'note-values-wrapper': true, new: isNew }">
      <span v-if="!isNew" class="note-date">
        {{ new Date(note.createdAt).toLocaleDateString() }}
      </span>

      <div class="note-values">
        <bl-input
          v-if="isEditing"
          class="w-24! min-w-24! flex-none!"
          :model-value="pageInput"
          type="number"
          min="1"
          placeholder="Page (opt.)"
          @update:model-value="
            emit(
              'update:pageInput',
              $event && $event !== '' ? $event : undefined,
            )
          "
        />
        <span
          v-if="!isNew && note.page !== undefined && !isEditing"
          class="note-page"
        >
          p. {{ note.page }}
        </span>

        <bl-input
          v-if="isEditing"
          class="min-w-0 flex-1!"
          :model-value="contentInput"
          type="textarea"
          placeholder="Write a note..."
          :rows="3"
          autofocus
          @update:model-value="emit('update:contentInput', $event ?? '')"
        />
        <p
          v-else
          class="note-content"
          :class="{ 'text-ink-muted!': isNew }"
          @click="isNew ? emit('edit') : undefined"
        >
          {{ isNew ? 'Add new note' : note.content }}
        </p>
      </div>

      <div class="note-actions">
        <bl-button
          v-if="isEditing"
          variant="secondary"
          class="self-start"
          @click="emit('cancel')"
        >
          Cancel
        </bl-button>
        <bl-button
          v-if="isEditing"
          :disabled="!canSave"
          class="self-start"
          @click="emit('save')"
        >
          <template #prependIcon>
            <IconDeviceFloppy :size="14" />
          </template>
          Save
        </bl-button>
      </div>
    </div>

    <template v-if="!isEditing && !isNew">
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
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  IconEdit,
  IconDeviceFloppy,
  IconNote,
  IconTrash,
} from '@tabler/icons-vue'
import { ICON_SIZE_SMALL } from '~/utils/constants'
import type { BookNote } from '~/types/book'

const props = defineProps<{
  note: BookNote
  isEditing: boolean
  isNew?: boolean
  contentInput: string
  pageInput: string | undefined
}>()

const emit = defineEmits<{
  (e: 'edit' | 'cancel' | 'save' | 'delete'): void
  (e: 'update:contentInput', value: string): void
  (e: 'update:pageInput', value: string | undefined): void
}>()

const canSave = computed(() => (props.contentInput ?? '').trim().length > 0)
</script>

<style scoped>
@reference '../../assets/css/main.css';

.note-section {
  @apply flex items-start justify-between gap-2 p-4;
  @apply bg-surface-elevated rounded-scholarly border-stroke border border-dashed;
}

.note-section.editing {
  @apply bg-surface rounded-scholarly items-start border-none;
}

.note-content {
  @apply text-ink-primary mt-0.5 flex-1 whitespace-pre-wrap;
}

.note-page {
  @apply text-ink-muted mt-1 text-sm font-semibold;
}

.note-icon {
  @apply text-primary mt-1 shrink-0;
}

.note-date-wrapper {
  @apply flex flex-col items-end gap-2;
}

.note-date {
  @apply text-primary mt-1 text-base font-medium tracking-wider;
}

.note-values-wrapper {
  @apply mr-2 flex min-w-0 flex-1 flex-col gap-2;
}

.note-values-wrapper.new {
  @apply mt-0.5;
}

.note-values {
  @apply flex gap-3;
}

.note-actions {
  @apply flex justify-end gap-2;
}
</style>

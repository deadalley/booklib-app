<template>
  <div class="notes">
    <div
      v-for="(note, index) in sortedNotes"
      :key="`${note.createdAt}-${note.content}-${index}`"
      class="note-section"
      :class="{ 'items-start!': editing === index }"
    >
      <div class="note-date-wrapper">
        <IconNote :size="ICON_SIZE_SMALL" stroke="1.5" class="note-icon" />
      </div>

      <div class="note-values-wrapper" :class="{ 'mt-0.5': note.isNew }">
        <span v-if="!note.isNew" class="note-date">
          {{ new Date(note.createdAt).toLocaleDateString() }}
        </span>

        <div class="note-values">
          <bl-input
            v-if="editing === index"
            class="w-24! min-w-24! flex-none!"
            v-model="notePageInput"
            type="number"
            min="1"
            placeholder="Page (opt.)"
          />
          <span
            v-if="note.page !== undefined && editing !== index"
            class="note-page"
          >
            p. {{ note.page }}
          </span>

          <bl-input
            v-if="editing === index"
            class="min-w-0 flex-1!"
            v-model="noteContentInput"
            type="textarea"
            placeholder="Write a note..."
            :rows="3"
          />
          <p
            v-else
            class="note-content"
            @click="note.isNew ? onEdit(index) : undefined"
          >
            {{ note.isNew ? 'Add new note' : note.content }}
          </p>
        </div>

        <div class="note-actions">
          <bl-button
            v-if="editing === index"
            variant="secondary"
            class="self-start"
            @click="onCancel()"
          >
            Cancel
          </bl-button>
          <bl-button
            v-if="editing === index"
            :disabled="!canAddNote"
            class="self-start"
            @click="onSave"
          >
            <template #prependIcon>
              <IconDeviceFloppy :size="14" />
            </template>
            Save
          </bl-button>
        </div>
      </div>

      <template v-if="editing !== index && !note.isNew">
        <bl-icon-button variant="tertiary" class="p-0!" @click="onEdit(index)">
          <template #default="iconProps">
            <IconEdit v-bind="iconProps" />
          </template>
        </bl-icon-button>
        <bl-icon-button
          variant="tertiary"
          class="p-0!"
          @click="onDelete(index)"
        >
          <template #default="iconProps">
            <IconTrash v-bind="iconProps" />
          </template>
        </bl-icon-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconEdit,
  IconDeviceFloppy,
  IconNote,
  IconTrash,
} from '@tabler/icons-vue'
import type { BookNote, ViewBook } from '~/types/book'

const props = defineProps<{
  book: ViewBook
}>()

const emit = defineEmits<{
  (e: 'add-note', payload: { content: string; page?: number }): void
  (
    e: 'update-note',
    payload: { index: number; content: string; page?: number },
  ): void
  (e: 'delete-note', payload: { index: number }): void
}>()

const notePageInput = ref<string | undefined>()
const noteContentInput = ref<string | undefined>()
const editing = ref(-1)
const editingBookIndex = ref(-1)

const canAddNote = computed(
  () => (noteContentInput.value ?? '').trim().length > 0,
)

const sortedNotes = computed(() => {
  return [...(props.book.notes ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .concat([
      {
        content: '',
        page: undefined,
        createdAt: new Date().toISOString(),
        isNew: true,
      } as BookNote & { isNew?: boolean },
    ]) as (BookNote & { isNew?: boolean })[]
})

function onEdit(index: number) {
  const note = sortedNotes.value?.[index]

  if (!note) return

  editing.value = index
  editingBookIndex.value = (props.book.notes ?? []).findIndex((n) => n === note)
  notePageInput.value = note.page?.toString()
  noteContentInput.value = note.content
}

function onCancel() {
  editing.value = -1
  editingBookIndex.value = -1
}

function onSave() {
  const content = (noteContentInput.value ?? '').trim()
  if (!content) return

  const pageValue = Number(notePageInput.value)
  const page =
    notePageInput.value && Number.isFinite(pageValue) && pageValue > 0
      ? Math.trunc(pageValue)
      : undefined

  if (editingBookIndex.value !== -1) {
    emit('update-note', { index: editingBookIndex.value, content, page })
  } else {
    emit('add-note', { content, page })
  }

  notePageInput.value = undefined
  noteContentInput.value = ''
  editing.value = -1
  editingBookIndex.value = -1
}

function onDelete(index: number) {
  const note = sortedNotes.value?.[index]

  if (!note) return

  const sourceIndex = (props.book.notes ?? []).findIndex((n) => n === note)
  if (sourceIndex === -1) return

  emit('delete-note', { index: sourceIndex })
}
</script>

<style scoped>
@reference '../../assets/css/main.css';

.notes {
  @apply flex flex-col gap-4;
}

.note-section {
  @apply flex items-start justify-between gap-2 p-4;
  @apply bg-surface rounded-scholarly;
}

.note-content {
  @apply text-ink-secondary mt-0.5 flex-1 italic;
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

.note-values {
  @apply flex gap-3;
}

.note-actions {
  @apply flex gap-2;
}
</style>

<template>
  <div class="notes">
    <!-- Add new note -->
    <div v-if="editing === -2" class="note-edit-form">
      <bl-input
        v-model="noteContentInput"
        type="textarea"
        placeholder="Write a note..."
        :rows="3"
        autofocus
      />
      <div class="note-form-actions">
        <bl-button variant="secondary" size="sm" @click="onCancel">
          Cancel
        </bl-button>
        <bl-button size="sm" :disabled="!canSave" @click="onSave">
          <template #prependIcon>
            <IconDeviceFloppy :size="14" />
          </template>
          Save
        </bl-button>
      </div>
    </div>
    <button v-else class="note-add-new" @click="onEdit(-2)">
      <IconNote :size="ICON_SIZE_SMALL" stroke="1.5" class="note-icon-muted" />
      <span class="text-ink-muted">Add new note</span>
    </button>

    <!-- Existing notes -->
    <template
      v-for="(note, index) in displayedNotes"
      :key="`${note.createdAt}-${note.content}-${index}`"
    >
      <div v-if="editing === index" class="note-edit-form">
        <bl-input
          v-model="noteContentInput"
          type="textarea"
          placeholder="Write a note..."
          :rows="3"
          autofocus
        />
        <div class="note-form-actions">
          <bl-button variant="secondary" size="sm" @click="onCancel">
            Cancel
          </bl-button>
          <bl-button size="sm" :disabled="!canSave" @click="onSave">
            <template #prependIcon>
              <IconDeviceFloppy :size="14" />
            </template>
            Save
          </bl-button>
        </div>
      </div>
      <bl-book-page-note
        v-else
        :note="note"
        @edit="onEdit(index)"
        @delete="onDelete(index)"
      />
    </template>

    <!-- See more button -->
    <div v-if="hasMoreNotes" class="pt-2">
      <bl-button
        variant="tertiary"
        class="w-full"
        @click="showAllNotes = !showAllNotes"
      >
        {{ showAllNotes ? 'Show less' : `Show all (${hiddenCount} more)` }}
        <template #appendIcon="iconProps">
          <IconChevronDown
            :class="showAllNotes ? 'rotate-180' : ''"
            v-bind="iconProps"
          />
        </template>
      </bl-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViewBook } from '~/types/book'
import { IconChevronDown, IconNote, IconDeviceFloppy } from '@tabler/icons-vue'
import { ICON_SIZE_SMALL } from '~/utils/constants'

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

const noteContentInput = ref('')
const editing = ref(-1)
const editingBookIndex = ref(-1)
const showAllNotes = ref(false)

const canSave = computed(() => noteContentInput.value.trim().length > 0)

const sortedNotes = computed(() => {
  return [...(props.book.progress.notes ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
})

const displayedNotes = computed(() => {
  if (showAllNotes.value) {
    return sortedNotes.value
  }
  return sortedNotes.value.slice(0, 3)
})

const hasMoreNotes = computed(() => sortedNotes.value.length > 3)

const hiddenCount = computed(() => {
  const total = sortedNotes.value.length
  return Math.max(0, total - 3)
})

function onEdit(index: number) {
  if (index === -2) {
    editing.value = -2
    editingBookIndex.value = -1
    noteContentInput.value = ''
  } else {
    const note = displayedNotes.value?.[index]
    if (!note) return

    editing.value = index
    editingBookIndex.value = (props.book.progress.notes ?? []).findIndex(
      (n) => n === note,
    )
    noteContentInput.value = note.content
  }
}

function onCancel() {
  editing.value = -1
  editingBookIndex.value = -1
}

function onSave() {
  const content = noteContentInput.value.trim()
  if (!content) return

  if (editingBookIndex.value !== -1) {
    const note = (props.book.progress.notes ?? [])[editingBookIndex.value]
    emit('update-note', { index: editingBookIndex.value, content, page: note?.page })
  } else {
    emit('add-note', { content })
  }

  noteContentInput.value = ''
  editing.value = -1
  editingBookIndex.value = -1
}

function onDelete(index: number) {
  const note = displayedNotes.value?.[index]

  if (!note) return

  const sourceIndex = (props.book.progress.notes ?? []).findIndex(
    (n) => n === note,
  )
  if (sourceIndex === -1) return

  emit('delete-note', { index: sourceIndex })
}
</script>

<style scoped>
@reference '../../assets/css/main.css';

.notes {
  @apply flex flex-col gap-4;
}

.note-add-new {
  @apply flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left;
  @apply bg-surface-elevated rounded-scholarly border-stroke border border-dashed;
}

.note-icon-muted {
  @apply text-ink-muted mt-0.5 shrink-0;
}

.note-edit-form {
  @apply bg-surface rounded-scholarly flex flex-col gap-2;
}

.note-form-actions {
  @apply flex justify-end gap-2;
}
</style>

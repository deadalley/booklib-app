<template>
  <div class="notes">
    <!-- Add new note at top -->
    <bl-book-page-note
      :note="{
        content: '',
        page: undefined,
        createdAt: new Date().toISOString(),
      }"
      :is-editing="editing === -2"
      :is-new="true"
      :content-input="noteContentInput ?? ''"
      :page-input="notePageInput"
      @edit="onEdit(-2)"
      @cancel="onCancel"
      @save="onSave"
      @update:content-input="noteContentInput = $event"
      @update:page-input="notePageInput = $event"
    />

    <!-- Existing notes -->
    <bl-book-page-note
      v-for="(note, index) in displayedNotes"
      :key="`${note.createdAt}-${note.content}-${index}`"
      :note="note"
      :is-editing="editing === index"
      :content-input="noteContentInput ?? ''"
      :page-input="notePageInput"
      @edit="onEdit(index)"
      @cancel="onCancel"
      @save="onSave"
      @delete="onDelete(index)"
      @update:content-input="noteContentInput = $event"
      @update:page-input="notePageInput = $event"
    />

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
import { IconChevronDown, IconChevronUp } from '@tabler/icons-vue'

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
const showAllNotes = ref(false)

const sortedNotes = computed(() => {
  return [...(props.book.notes ?? [])].sort(
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
    // Editing new note
    editing.value = -2
    editingBookIndex.value = -1
    notePageInput.value = undefined
    noteContentInput.value = ''
  } else {
    // Editing existing note
    const note = displayedNotes.value?.[index]
    if (!note) return

    editing.value = index
    editingBookIndex.value = (props.book.notes ?? []).findIndex(
      (n) => n === note,
    )
    notePageInput.value = note.page?.toString()
    noteContentInput.value = note.content
  }
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
  const note = displayedNotes.value?.[index]

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
</style>

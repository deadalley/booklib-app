<template>
  <div class="flex flex-col gap-4">
    <p class="section-title">Notes</p>

    <div
      class="grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)_auto] md:items-start"
    >
      <bl-input
        v-model="notePageInput"
        type="number"
        min="1"
        label="Page"
        placeholder="Page (opt.)"
      />
      <bl-input
        v-model="noteContentInput"
        type="textarea"
        label="Content"
        placeholder="Write a note..."
        :rows="2"
      />
      <bl-button :disabled="!canAddNote" class="self-start" @click="onAddNote">
        Add Note
      </bl-button>
    </div>

    <div v-if="sortedNotes.length" class="flex flex-col gap-3">
      <article
        v-for="(note, index) in sortedNotes"
        :key="`${note.createdAt}-${note.content}-${index}`"
        class="border-stroke-subtle flex flex-col gap-2 rounded-xl border p-3"
      >
        <div class="text-ink-muted flex items-center gap-3 text-sm">
          <span>{{ toFullDateCompact(note.createdAt) }}</span>
          <span v-if="note.page">Page {{ note.page }}</span>
        </div>
        <p class="text-ink-secondary whitespace-pre-wrap">
          {{ note.content }}
        </p>
      </article>
    </div>
    <p v-else class="text-ink-muted">No notes yet.</p>
  </div>
</template>

<script setup lang="ts">
import type { ViewBook } from '~/types/book'

const props = defineProps<{
  book: ViewBook
}>()

const emit = defineEmits<{
  (e: 'add-note', payload: { content: string; page?: number }): void
}>()

const notePageInput = ref<string | undefined>()
const noteContentInput = ref<string | undefined>()

const canAddNote = computed(
  () => (noteContentInput.value ?? '').trim().length > 0,
)

const sortedNotes = computed(() => {
  return [...(props.book.notes ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
})

function onAddNote() {
  const content = (noteContentInput.value ?? '').trim()
  if (!content) return

  const pageValue = Number(notePageInput.value)
  const page =
    notePageInput.value && Number.isFinite(pageValue) && pageValue > 0
      ? Math.trunc(pageValue)
      : undefined

  emit('add-note', { content, page })
  notePageInput.value = undefined
  noteContentInput.value = ''
}
</script>

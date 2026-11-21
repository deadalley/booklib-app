<template>
  <section class="book-page-section" data-testid="book-ebook">
    <p class="book-page-section-title">Ebook</p>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="EBOOK_ACCEPT"
      data-testid="ebook-file-input"
      @change="onFileChange"
    />

    <div v-if="book.ebook" class="ebook-card">
      <span class="ebook-icon" aria-hidden="true">
        <component
          :is="book.ebook.format === 'pdf' ? IconFileTypePdf : IconBook2"
          :size="22"
          stroke="1.6"
        />
      </span>
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <p class="truncate font-semibold" :title="book.ebook.fileName">
          {{ book.ebook.fileName }}
        </p>
        <p class="text-ink-muted text-xs">
          {{ book.ebook.format.toUpperCase() }} · {{ fileSize }} ·
          {{ percent }}% read
        </p>
        <bl-progress-bar :progress-value="percent" size="xs" class="max-w-64" />
      </div>
      <div class="flex flex-none flex-wrap items-center gap-2">
        <bl-button :to="`/read/${book.id}`">
          <template #prependIcon="iconProps">
            <IconBook v-bind="iconProps" />
          </template>
          {{ book.ebook.progress > 0 ? 'Continue reading' : 'Read' }}
        </bl-button>
        <bl-icon-button
          variant="tertiary"
          size="sm"
          aria-label="Replace the ebook file"
          @click="fileInput?.click()"
        >
          <template #default="iconProps">
            <IconReplace v-bind="iconProps" />
          </template>
        </bl-icon-button>
        <bl-icon-button
          variant="tertiary"
          size="sm"
          aria-label="Remove the ebook file"
          @click="confirmingRemove = true"
        >
          <template #default="iconProps">
            <IconTrash v-bind="iconProps" />
          </template>
        </bl-icon-button>
      </div>
    </div>

    <div v-else class="flex flex-col items-start gap-3">
      <p class="text-ink-secondary text-sm">
        Read this book in BookLib: add its EPUB or PDF file. Your place and
        highlights are saved as you read.
      </p>
      <bl-button
        variant="secondary"
        :loading="busy"
        @click="fileInput?.click()"
      >
        <template #prependIcon="iconProps">
          <IconFileUpload v-bind="iconProps" />
        </template>
        Add ebook file
      </bl-button>
    </div>

    <bl-alert v-if="error" icon="IconAlertTriangle" size="sm" role="alert">
      {{ error }}
    </bl-alert>

    <bl-modal v-model="confirmingRemove" size="sm" @confirm="onRemove">
      <template #title>Remove the ebook file?</template>
      <p class="text-ink-secondary">
        The file is removed from this device. The book, its notes and its
        highlights stay.
      </p>
      <template #cancel-label>Cancel</template>
      <template #action-label>Remove</template>
    </bl-modal>
  </section>
</template>

<script setup lang="ts">
import {
  IconBook,
  IconBook2,
  IconFileTypePdf,
  IconFileUpload,
  IconReplace,
  IconTrash,
} from '@tabler/icons-vue'
import { EBOOK_ACCEPT } from '~/services/ebooks'
import type { Book } from '~/types/book'

const props = defineProps<{ book: Book }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const { attachEbook, removeEbook } = useBookLibrary()

const fileInput = ref<HTMLInputElement>()
const busy = ref(false)
const error = ref<string | null>(null)
const confirmingRemove = ref(false)

const percent = computed(() =>
  Math.round((props.book.ebook?.progress ?? 0) * 100),
)

const fileSize = computed(() => {
  const bytes = props.book.ebook?.size ?? 0
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
})

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  busy.value = true
  error.value = null
  try {
    await attachEbook(props.book.id, file)
    emit('changed')
  } catch (caught) {
    error.value =
      caught instanceof Error ? caught.message : 'The file couldn’t be added.'
  } finally {
    busy.value = false
    input.value = ''
  }
}

async function onRemove() {
  await removeEbook(props.book.id)
  emit('changed')
}
</script>

<style scoped>
@reference '../../assets/css/main.css';

.ebook-card {
  @apply bg-surface-subtle border-stroke flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3.5;
}
.ebook-icon {
  @apply bg-primary-50 text-primary grid size-11 flex-none place-items-center rounded-xl;
}
</style>

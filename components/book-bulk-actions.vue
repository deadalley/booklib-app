<template>
  <Transition name="bulk-actions-float">
    <div
      v-if="open"
      class="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 sm:bottom-6"
    >
      <div
        class="bulk-actions-bar pointer-events-auto"
        role="toolbar"
        aria-label="Bulk actions"
      >
        <div class="bulk-actions-section">
          <span class="bulk-actions-count">{{ selectedBooksCount }}</span>
          <div class="flex flex-col gap-0.5">
            <p class="bulk-actions-title">
              {{ selectedBooksCount === 1 ? 'Item' : 'Items' }} Selected
            </p>
            <div class="flex min-h-4 gap-3">
              <button
                v-if="selectedBooksCount < totalBooksCount"
                type="button"
                class="bulk-actions-link"
                @click="emit('select-all')"
              >
                Select all {{ totalBooksCount }}
              </button>
              <button
                v-if="selectedBooksCount > 0"
                type="button"
                class="bulk-actions-link"
                @click="emit('clear')"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div class="bulk-actions-divider" />

        <div class="bulk-actions-section">
          <button
            class="bulk-action-btn"
            type="button"
            :disabled="!hasSelectedBooks"
            @click="moveCollectionModalOpen = true"
          >
            <IconFolder :size="16" stroke="1.75" />
            Collection
          </button>

          <button
            class="bulk-action-btn"
            type="button"
            :disabled="!hasSelectedBooks"
            @click="editAuthorModalOpen = true"
          >
            <IconUser :size="16" stroke="1.75" />
            Author
          </button>

          <button
            class="bulk-action-btn bulk-action-btn-danger"
            type="button"
            :disabled="!hasSelectedBooks"
            @click="deleteModalOpen = true"
          >
            <IconTrash :size="16" stroke="1.75" />
            Remove
          </button>
        </div>

        <div class="bulk-actions-divider" />

        <button
          class="bulk-action-close"
          type="button"
          aria-label="Close bulk actions"
          @click="onClose"
        >
          <IconX :size="20" stroke="1.8" />
        </button>
      </div>
    </div>
  </Transition>

  <bl-modal
    v-model="moveCollectionModalOpen"
    size="sm"
    @confirm="onMoveConfirm"
  >
    <template #title>
      Move {{ selectedBooksCount }} selected
      {{ selectedBooksCount === 1 ? 'book' : 'books' }} to a collection
    </template>
    <div class="flex flex-col gap-2">
      <bl-raw-select
        v-model="selectedCollectionId"
        :options="collectionOptions"
        :with-wrapper="false"
        placeholder="Choose collection"
      />
      <p v-if="!selectedCollectionId" class="text-ink-muted text-sm">
        Select a collection before confirming.
      </p>
    </div>
    <template #cancel-label>Cancel</template>
    <template #action-label>Move</template>
  </bl-modal>

  <bl-modal v-model="editAuthorModalOpen" size="sm" @confirm="onAuthorConfirm">
    <template #title>
      Set author for {{ selectedBooksCount }} selected
      {{ selectedBooksCount === 1 ? 'book' : 'books' }}
    </template>
    <div class="flex flex-col gap-2">
      <bl-raw-select
        v-model="selectedAuthorId"
        :options="authorOptions"
        :with-wrapper="false"
        placeholder="Choose author"
      />
      <p v-if="!selectedAuthorId" class="text-ink-muted text-sm">
        Select an author before confirming.
      </p>
    </div>
    <template #cancel-label>Cancel</template>
    <template #action-label>Apply</template>
  </bl-modal>

  <bl-modal v-model="deleteModalOpen" size="sm" @confirm="emit('delete')">
    <template #title>
      Delete {{ selectedBooksCount }} selected
      {{ selectedBooksCount === 1 ? 'book' : 'books' }}?
    </template>
    <p class="text-ink-secondary text-sm">This action cannot be undone.</p>
    <template #cancel-label>Cancel</template>
    <template #action-label>Delete</template>
  </bl-modal>
</template>

<script setup lang="ts">
import { IconFolder, IconTrash, IconUser, IconX } from '@tabler/icons-vue'

type ActionOption = {
  value: string
  label: string
}

const props = defineProps<{
  selectedBooksCount: number
  totalBooksCount: number
  hasSelectedBooks: boolean
  collectionOptions: ActionOption[]
  authorOptions: ActionOption[]
}>()

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'close' | 'delete' | 'select-all' | 'clear'): void
  (e: 'move-to-collection' | 'edit-author', valueId: string): void
}>()

const moveCollectionModalOpen = ref(false)
const editAuthorModalOpen = ref(false)
const deleteModalOpen = ref(false)
const selectedCollectionId = ref<string>()
const selectedAuthorId = ref<string>()

watch(open, (isOpen) => {
  if (!isOpen) {
    moveCollectionModalOpen.value = false
    editAuthorModalOpen.value = false
    deleteModalOpen.value = false
    selectedCollectionId.value = undefined
    selectedAuthorId.value = undefined
  }
})

const anyModalOpen = computed(
  () =>
    moveCollectionModalOpen.value ||
    editAuthorModalOpen.value ||
    deleteModalOpen.value,
)

function onKeydown(event: KeyboardEvent) {
  if (
    event.key !== 'Escape' ||
    !open.value ||
    anyModalOpen.value ||
    document.querySelector('[role="dialog"]')
  ) {
    return
  }

  onClose()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

function onClose() {
  open.value = false
  emit('close')
}

function onMoveConfirm() {
  if (!selectedCollectionId.value || !props.hasSelectedBooks) {
    return
  }

  emit('move-to-collection', selectedCollectionId.value)
  selectedCollectionId.value = undefined
}

function onAuthorConfirm() {
  if (!selectedAuthorId.value || !props.hasSelectedBooks) {
    return
  }

  emit('edit-author', selectedAuthorId.value)
  selectedAuthorId.value = undefined
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.bulk-actions-bar {
  @apply bg-surface-inverse text-ink-inverse flex max-w-full flex-wrap items-center justify-center gap-6 rounded-xl px-6 py-4 shadow-2xl;
  @apply max-sm:gap-3 max-sm:px-4 max-sm:py-3;
}

.bulk-actions-section {
  @apply flex items-center gap-3;
}

.bulk-actions-count {
  @apply bg-primary text-ink-inverse inline-flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold;
}

.bulk-actions-title {
  @apply text-ink-inverse text-base font-medium tracking-wider whitespace-nowrap;
}

.bulk-actions-link {
  @apply text-ink-inverse/65 hover:text-ink-inverse cursor-pointer text-xs font-semibold tracking-wide underline underline-offset-2;
}

.bulk-actions-subtitle {
  @apply text-ink-inverse/60 text-[10px] font-semibold tracking-wider uppercase;
}

.bulk-actions-divider {
  @apply bg-ink-inverse/15 h-10 w-px max-sm:hidden;
}

.bulk-action-btn {
  @apply text-ink-inverse hover:text-ink-inverse/70 disabled:text-ink-inverse/35 inline-flex cursor-pointer items-center gap-2 px-2 py-1 text-sm font-medium tracking-wider uppercase transition-colors disabled:cursor-not-allowed;
}

.bulk-action-btn-danger {
  @apply text-primary hover:text-primary/70 disabled:text-primary/40;
}

.bulk-action-close {
  @apply text-ink-inverse hover:text-ink-inverse/70 inline-flex cursor-pointer items-center justify-center p-1 pl-0 transition-colors;
}

.bulk-actions-float-enter-active,
.bulk-actions-float-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.bulk-actions-float-enter-from,
.bulk-actions-float-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

.bulk-actions-float-enter-to,
.bulk-actions-float-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

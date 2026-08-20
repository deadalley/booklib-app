<template>
  <!-- Finish modal -->
  <bl-modal
    v-if="showFinishModal"
    v-model="showFinishModal"
    size="sm"
    icon="IconCircleCheck"
  >
    <template #title>Finish "{{ book.title }}"</template>
    <p class="text-ink-muted mt-1 text-sm">How did it go?</p>
    <div class="mt-4 flex flex-col gap-2">
      <bl-button expand @click="onFinishBook">
        <template #prependIcon="$iconProps">
          <component :is="IconCheck" v-bind="$iconProps" />
        </template>
        Finished the book
      </bl-button>
      <bl-button variant="secondary" expand @click="onDNF">
        <template #prependIcon="$iconProps">
          <component :is="IconX" v-bind="$iconProps" />
        </template>
        Did not finish (DNF)
      </bl-button>
    </div>
  </bl-modal>

  <!-- Log entry modal -->
  <bl-modal
    v-if="showLogModal"
    v-model="showLogModal"
    size="sm"
    @confirm="onSaveLogEntry"
  >
    <template #title>
      {{ editingNote ? 'Edit Log Entry' : 'Log Reading Entry' }}
    </template>
    <div class="flex flex-col gap-4">
      <p class="text-ink-muted font-medium">
        {{ book.title }} · {{ book.pages }} total pages
      </p>
      <div class="form-section gap-6">
        <div class="form-row">
          <bl-input v-model="logDate" type="date" label="Date" editing />
          <bl-input
            v-model="logPage"
            type="number"
            label="Page reached"
            min="0"
            :max="String(book.pages)"
            editing
          />
        </div>
        <div class="flex flex-col gap-1">
          <bl-progress-bar
            :progress-value="logProgress"
            size="xs"
            color="bg-primary"
          />
          <p class="text-ink-muted text-xs">
            {{ logProgress }}% complete · {{ logPagesRemaining }} pages
            remaining
          </p>
        </div>
        <div class="form-row">
          <bl-input
            v-model="logNote"
            type="textarea"
            label="Note (optional)"
            placeholder="What did you think?"
            editing
          />
        </div>
      </div>
    </div>
    <template #cancel-label>Cancel</template>
    <template #action-label>Save Entry</template>
  </bl-modal>

  <!-- Start date modal -->
  <bl-modal
    v-if="showStartDateModal"
    v-model="showStartDateModal"
    size="sm"
    icon="IconCalendarEvent"
    @confirm="onConfirmStartDate"
  >
    <template #title>
      <span>
        When did you start reading
        <b>{{ book.title }}</b>
        ?
      </span>
    </template>
    <div class="py-4">
      <div class="form-wrapper">
        <label class="form-label">Start date</label>
        <div class="form-inner border-stroke">
          <input v-model="pendingStartDate" type="date" class="form-input" />
        </div>
      </div>
    </div>
    <template #cancel-label>Cancel</template>
    <template #action-label>Save</template>
  </bl-modal>

  <div class="paper-sm flex flex-col gap-3 p-5">
    <div class="flex justify-between">
      <div class="flex gap-2">
        <!-- Property status -->
        <DropdownMenuRoot>
          <DropdownMenuTrigger as-child>
            <bl-chip
              rounded
              :color="propertyStatusChipColor"
              class="cursor-pointer"
            >
              <component
                :is="icons[PROPERTY_STATUS_MAP[currentPropertyStatus].icon]"
                :size="13"
                stroke="1.9"
              />
              {{ PROPERTY_STATUS_MAP[currentPropertyStatus].description }}
              <IconChevronDown :size="11" stroke="2" />
            </bl-chip>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              align="start"
              :avoid-collisions="false"
              position="popper"
              class="menu-content"
            >
              <DropdownMenuItem
                v-for="status in Object.values(PROPERTY_STATUS_MAP)"
                :key="status.id"
                class="menu-item"
                @click="emit('property-status-select', status.id)"
              >
                <component :is="icons[status.icon]" :size="14" stroke="1.8" />
                {{ status.description }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>

        <!-- Reading status chip -->
        <div v-if="currentStatus !== null" class="flex items-center gap-2">
          <bl-chip :variant="statusVariant" rounded>
            <template #prependIcon="$iconProps">
              <component :is="statusIcon" v-bind="$iconProps" />
            </template>
            {{ statusLabel }}
          </bl-chip>
        </div>
      </div>

      <!-- Date -->
      <div
        v-if="startDate"
        class="text-ink-muted inline-flex cursor-pointer items-center gap-1 text-sm"
        @click="openStartDateModal"
      >
        <IconCalendarEvent class="mr-1 inline-block" size="14" stroke="1.5" />
        {{ startDatePrefix }}
        <p
          class="text-ink-secondary decoration-stroke underline decoration-dashed"
        >
          {{ startDate }}
        </p>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mt-4 flex flex-col gap-4">
      <p class="text-primary text-end text-3xl leading-none font-semibold">
        {{ progress }}%
      </p>
      <bl-progress-bar
        :progress-value="progress"
        size="xs"
        color="bg-primary"
      />
      <p class="text-ink-muted text-end text-sm leading-snug font-semibold">
        {{ progressSubtitle }}
      </p>
    </div>

    <!-- Actions -->
    <div class="mt-2 flex gap-3">
      <bl-button
        v-for="(action, index) in actions"
        :key="index"
        :variant="action.variant"
        expand
        @click="onActionClick(action)"
      >
        <template #prependIcon="$iconProps">
          <component :is="icons[action.icon]" v-bind="$iconProps" />
        </template>
        {{ action.label }}
      </bl-button>
    </div>

    <!-- Reading: log entry prompt -->
    <template v-if="currentStatus === 'reading'">
      <div
        class="border-primary bg-primary-100 rounded-scholarly mt-2 flex items-center justify-between border px-4 py-3"
      >
        <p class="text-primary-600 text-sm font-semibold tracking-wide">
          Ready to log today's reading?
        </p>
        <bl-button size="sm" @click="openLogModal">Log entry</bl-button>
      </div>
    </template>

    <!-- Paused state -->
    <template v-if="currentStatus === 'paused'">
      <div
        class="border-secondary-200 bg-secondary-50 rounded-scholarly mt-2 flex items-center justify-between border px-4 py-3"
      >
        <p class="text-secondary-600 text-sm font-semibold tracking-wide">
          This book is paused.
        </p>
        <bl-button
          color="secondary"
          size="sm"
          @click="emit('status-select', 'reading')"
        >
          Continue →
        </bl-button>
      </div>
    </template>

    <template v-if="currentStatus !== null">
      <hr class="border-stroke-subtle -mx-5 my-2" />

      <div class="flex flex-col gap-3">
        <!-- Empty state -->
        <bl-button
          v-if="!sortedNotes.length"
          variant="tertiary"
          expand
          @click="openLogModal"
        >
          Log first entry
        </bl-button>

        <!-- Log entries -->
        <template v-else>
          <div class="flex items-baseline justify-between">
            <p
              class="text-ink-muted text-xs font-semibold tracking-widest uppercase"
            >
              Log
            </p>
            <p class="text-ink-muted text-xs">
              {{ sortedNotes.length }}
              {{ sortedNotes.length === 1 ? 'entry' : 'entries' }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <bl-book-page-note
              v-for="note in sortedNotes"
              :key="note.createdAt"
              :note="note"
              @edit="openLogModalForEdit(note)"
              @delete="deleteNote(note)"
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import type {
  BookProgressStatus,
  BookPropertyStatus,
  Book,
  BookNote,
} from '~/types/book'
import {
  toFullDateCompact,
  toSimpleDate,
  fromSimpleDate,
  now,
} from '~/utils/date'
import {
  icons,
  IconCheck,
  IconX,
  IconCalendarEvent,
  IconChevronDown,
} from '@tabler/icons-vue'

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (
    e: 'status-select',
    status: BookProgressStatus | null,
    startedAt?: string,
  ): void
  (e: 'property-status-select', status: BookPropertyStatus): void
  (e: 'log-entry', page: number, note: string, date: string): void
  (
    e: 'update-note',
    payload: {
      index: number
      content: string
      page?: number
      createdAt: string
    },
  ): void
  (e: 'delete-note', payload: { index: number }): void
}>()

const showStartDateModal = ref(false)
const pendingStartDate = ref('')
const showFinishModal = ref(false)
const showLogModal = ref(false)
const logPage = ref<string | undefined>(undefined)
const logNote = ref('')
const logDate = ref('')

const editingNote = ref<BookNote | null>(null)

const currentPropertyStatus = computed<BookPropertyStatus>(
  () => props.book.propertyStatus ?? 'not-owned',
)

const currentStatus = computed<BookProgressStatus | null>(
  () => props.book.progress.status ?? null,
)

const propertyStatusChipColor = computed<'primary' | 'secondary' | undefined>(
  () => {
    switch (currentPropertyStatus.value) {
      case 'owned':
        return 'primary'
      case 'wishlist':
        return 'secondary'
      default:
        return undefined
    }
  },
)

const statusLabel = computed(() => {
  if (!currentStatus.value) return ''
  return PROGRESS_STATUS_MAP[currentStatus.value].description
})
const statusIcon = computed(() => {
  if (!currentStatus.value) return undefined
  return icons[PROGRESS_STATUS_MAP[currentStatus.value].icon]
})
const statusVariant = computed<'primary' | 'secondary' | undefined>(() =>
  currentStatus.value === 'read' ? 'primary' : 'secondary',
)

const startDatePrefix = computed(() => {
  if (props.book.progress.startedAt) {
    return 'Started:'
  }

  if (currentStatus.value === 'reading') {
    return 'Missing start date:'
  }

  return undefined
})
const startDate = computed(() => {
  if (props.book.progress.startedAt) {
    return toFullDateCompact(props.book.progress.startedAt)
  }

  if (currentStatus.value === 'reading') {
    return 'Set start date'
  }

  return undefined
})

const progress = computed(() => {
  if (currentStatus.value === 'read') return 100

  const { currentPage } = props.book.progress
  const { pages } = props.book

  if (currentPage && pages) {
    return Math.min(100, Math.round((currentPage / pages) * 100))
  }

  return 0
})
const progressSubtitle = computed(() => {
  const pages = props.book.pages
  if (!pages) {
    return currentStatus.value
      ? PROGRESS_STATUS_MAP[currentStatus.value].description
      : ''
  }

  const pagesRead = Math.round((pages * progress.value) / 100)
  return `${pagesRead} of ${pages} pages`
})

const actions = computed<
  {
    id: string
    icon: keyof typeof icons
    label: string
    variant: 'primary' | 'secondary'
  }[]
>(() => {
  switch (currentStatus.value) {
    case null:
      return [
        {
          id: PROGRESS_STATUS_MAP.reading.id,
          icon: PROGRESS_STATUS_MAP.reading.icon,
          label: 'Start reading',
          variant: 'primary',
        },
      ]
    case 'reading':
      return [
        {
          id: 'stop',
          icon: 'IconNotesOff',
          label: 'Stop',
          variant: 'secondary',
        },
        {
          id: PROGRESS_STATUS_MAP.paused.id,
          icon: 'IconPlayerPause',
          label: 'Pause',
          variant: 'secondary',
        },
        {
          id: PROGRESS_STATUS_MAP.read.id,
          icon: 'IconCircleCheck',
          label: 'Finish',
          variant: 'secondary',
        },
      ]
    case 'read':
      return [
        {
          id: PROGRESS_STATUS_MAP['not-finished'].id,
          icon: 'IconNotesOff',
          label: 'Mark as unread',
          variant: 'secondary',
        },
        {
          id: PROGRESS_STATUS_MAP.reading.id,
          icon: PROGRESS_STATUS_MAP.reading.icon,
          label: 'Start reading again',
          variant: 'primary',
        },
      ]
    case 'paused':
      return [
        {
          id: 'stop',
          icon: 'IconNotesOff',
          label: 'Stop',
          variant: 'secondary',
        },
        {
          id: PROGRESS_STATUS_MAP.reading.id,
          icon: 'IconPlayerPlay',
          label: 'Resume',
          variant: 'primary',
        },
        {
          id: PROGRESS_STATUS_MAP.read.id,
          icon: 'IconCircleCheck',
          label: 'Finish',
          variant: 'secondary',
        },
      ]
    case 'not-finished':
      return [
        {
          id: PROGRESS_STATUS_MAP.reading.id,
          icon: PROGRESS_STATUS_MAP.reading.icon,
          label: 'Start reading again',
          variant: 'primary',
        },
      ]
    default:
      return []
  }
})

const sortedNotes = computed(() =>
  [...(props.book.progress.notes ?? [])]
    .filter((note) => note.page !== undefined)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
)

const logPageNumber = computed(() => Number(logPage.value) || 0)

const logProgress = computed(() => {
  if (!props.book.pages || !logPageNumber.value) return 0
  return Math.min(
    100,
    Math.round((logPageNumber.value / props.book.pages) * 100),
  )
})

const logPagesRemaining = computed(() => {
  if (!props.book.pages) return 0
  return Math.max(0, props.book.pages - logPageNumber.value)
})

function openLogModal() {
  editingNote.value = null
  logPage.value = props.book.progress.currentPage
    ? String(props.book.progress.currentPage)
    : undefined
  logNote.value = ''
  logDate.value = toSimpleDate(now())
  showLogModal.value = true
}

function openLogModalForEdit(note: BookNote) {
  editingNote.value = note
  logPage.value = note.page !== undefined ? String(note.page) : undefined
  logNote.value = note.content
  logDate.value = toSimpleDate(note.createdAt)
  showLogModal.value = true
}

function onSaveLogEntry() {
  if (editingNote.value) {
    const index = (props.book.progress.notes ?? []).indexOf(editingNote.value)
    emit('update-note', {
      index,
      content: logNote.value,
      page: logPageNumber.value || undefined,
      createdAt: fromSimpleDate(logDate.value),
    })
    editingNote.value = null
  } else if (logPageNumber.value) {
    emit(
      'log-entry',
      logPageNumber.value,
      logNote.value,
      fromSimpleDate(logDate.value),
    )
  }
}

function openStartDateModal() {
  pendingStartDate.value = props.book.progress.startedAt
    ? toSimpleDate(props.book.progress.startedAt)
    : toSimpleDate(now())
  showStartDateModal.value = true
}

function onActionClick(action: (typeof actions.value)[number]) {
  switch (action.id) {
    case 'stop':
      emit('status-select', null)
      break
    case PROGRESS_STATUS_MAP.reading.id:
      if (currentStatus.value === null) {
        openStartDateModal()
      } else {
        emit('status-select', PROGRESS_STATUS_MAP.reading.id)
      }
      break
    case PROGRESS_STATUS_MAP.paused.id:
      emit('status-select', PROGRESS_STATUS_MAP.paused.id)
      break
    case PROGRESS_STATUS_MAP.read.id:
      showFinishModal.value = true
      break
    case PROGRESS_STATUS_MAP['not-finished'].id:
      emit('status-select', PROGRESS_STATUS_MAP['not-finished'].id)
      break
  }
}

function onFinishBook() {
  showFinishModal.value = false
  emit('status-select', PROGRESS_STATUS_MAP.read.id)
}

function onDNF() {
  showFinishModal.value = false
  emit('status-select', PROGRESS_STATUS_MAP['not-finished'].id)
}

function onConfirmStartDate() {
  emit(
    'status-select',
    PROGRESS_STATUS_MAP.reading.id,
    fromSimpleDate(pendingStartDate.value),
  )
}

function deleteNote(note: BookNote) {
  const index = (props.book.progress.notes ?? []).indexOf(note)
  emit('delete-note', { index })
}
</script>

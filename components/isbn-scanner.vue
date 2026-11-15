<template>
  <bl-modal
    v-model="open"
    size="sm"
    sheet
    :confirm-disabled="!canConfirm"
    @confirm="onConfirm"
  >
    <template #title>Scan ISBN</template>
    <template #subtitle>
      Point the camera at the barcode on the back of the book.
    </template>

    <div class="flex flex-col gap-4" data-testid="isbn-scanner">
      <!-- Camera -->
      <div v-show="step === 'scan'" class="scanner-frame">
        <video
          ref="video"
          class="scanner-video"
          :class="{ hidden: !cameraShown }"
          muted
          playsinline
          aria-label="Camera preview"
        />
        <div v-if="cameraShown" class="scanner-guide" aria-hidden="true">
          <span class="scanner-line" />
        </div>
        <div v-else class="scanner-message" role="status">
          <component :is="cameraMessage.icon" :size="28" stroke="1.5" />
          <p class="font-semibold">{{ cameraMessage.title }}</p>
          <p class="text-ink-muted text-sm">{{ cameraMessage.text }}</p>
          <bl-button
            v-if="state === 'denied' || state === 'idle'"
            variant="secondary"
            size="sm"
            @click="start"
          >
            {{ state === 'denied' ? 'Try again' : 'Turn on camera' }}
          </bl-button>
        </div>
      </div>
      <p
        v-if="step === 'scan' && sawOtherBarcode"
        class="text-ink-muted text-center text-sm"
        role="status"
      >
        That barcode isn’t an ISBN. Look for the one starting with 978 or 979.
      </p>

      <!-- Typed ISBN -->
      <form
        v-if="step === 'scan'"
        class="flex flex-col gap-2"
        @submit.prevent="onManualLookup"
      >
        <label for="isbn-scanner-input" class="form-label">
          Or type the ISBN
        </label>
        <div class="flex gap-2">
          <input
            id="isbn-scanner-input"
            v-model="typedIsbn"
            class="form-inner min-w-0 flex-1"
            inputmode="numeric"
            autocomplete="off"
            placeholder="978-0-06-051275-0"
          />
          <bl-button variant="secondary" @click="onManualLookup">
            Look up
          </bl-button>
        </div>
        <p v-if="typedError" class="text-primary text-sm" role="alert">
          {{ typedError }}
        </p>
      </form>

      <!-- Looking up -->
      <div v-else-if="step === 'looking'" class="scanner-state" role="status">
        <bl-loading />
        <p>
          Looking up
          <span class="font-semibold">{{ isbn }}</span>
          …
        </p>
      </div>

      <!-- Found -->
      <div v-else-if="step === 'found' && result" class="scanner-result">
        <div class="scanner-result-cover">
          <img
            v-if="result.coverUrl"
            :src="result.coverUrl"
            alt=""
            class="size-full object-cover"
          />
          <IconBook v-else :size="22" stroke="1.5" />
        </div>
        <div class="flex min-w-0 flex-col gap-1">
          <p class="scanner-result-title">{{ result.title }}</p>
          <p v-if="result.author" class="text-ink-secondary text-sm">
            {{ result.author }}
          </p>
          <p class="text-ink-muted text-xs">{{ resultDetails }}</p>
        </div>
      </div>

      <!-- Not found / offline -->
      <div v-else class="scanner-state" role="status">
        <component
          :is="step === 'offline' ? IconWifiOff : IconBookOff"
          class="text-ink-muted"
          :size="28"
          stroke="1.5"
        />
        <p class="font-semibold">
          {{ step === 'offline' ? 'You’re offline' : 'No details found' }}
        </p>
        <p class="text-ink-muted text-sm">
          <template v-if="step === 'offline'">
            Keep the ISBN {{ isbn }} for now. The book’s details are filled in
            when you’re back online.
          </template>
          <template v-else>
            Neither Open Library nor Google Books knows ISBN {{ isbn }}. You can
            keep the ISBN and fill in the rest yourself.
          </template>
        </p>
      </div>

      <bl-button
        v-if="step !== 'scan' && step !== 'looking'"
        type="button"
        expand
        variant="secondary"
        @click="scanAgain"
      >
        <template #prependIcon="iconProps">
          <IconRefresh v-bind="iconProps" />
        </template>
        Scan again
      </bl-button>
    </div>

    <template #cancel-label>Cancel</template>
    <template v-if="confirmLabel" #action-label>{{ confirmLabel }}</template>
  </bl-modal>
</template>

<script setup lang="ts">
import {
  IconBook,
  IconBookOff,
  IconCamera,
  IconCameraOff,
  IconRefresh,
  IconWifiOff,
} from '@tabler/icons-vue'
import {
  lookupIsbn,
  LookupOfflineError,
  type BookLookupResult,
} from '~/services/book-lookup'

/** What the user chose: the details found, or only the ISBN */
export type IsbnScan = {
  isbn: string
  result: BookLookupResult | null
  // Looked up later, when back online
  offline: boolean
}

type Step = 'scan' | 'looking' | 'found' | 'not-found' | 'offline'

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{ (e: 'use', scan: IsbnScan): void }>()

const video = ref<HTMLVideoElement>()
const step = ref<Step>('scan')
const isbn = ref('')
const result = ref<BookLookupResult | null>(null)
const typedIsbn = ref('')
const typedError = ref('')

const { state, sawOtherBarcode, start, stop } = useBarcodeScanner(
  video,
  (code) => lookup(code),
)

const cameraShown = computed(
  () => state.value === 'scanning' || state.value === 'starting',
)

const cameraMessage = computed(() => {
  switch (state.value) {
    case 'denied':
      return {
        icon: IconCameraOff,
        title: 'Camera access is blocked',
        text: 'Allow camera access for BookLib, or type the ISBN below.',
      }
    case 'unavailable':
      return {
        icon: IconCameraOff,
        title: 'No camera found',
        text: 'Type the ISBN below instead.',
      }
    default:
      return {
        icon: IconCamera,
        title: 'Camera is off',
        text: 'Turn it on to scan the barcode.',
      }
  }
})

const resultDetails = computed(() =>
  [
    result.value?.year,
    result.value?.pages && `${result.value.pages} pages`,
    result.value?.publisher,
  ]
    .filter(Boolean)
    .join(' · '),
)

const confirmLabel = computed(() => {
  switch (step.value) {
    case 'found':
      return 'Use these details'
    case 'not-found':
    case 'offline':
      return 'Keep the ISBN'
    default:
      return null
  }
})
const canConfirm = computed(() => !!confirmLabel.value)

async function lookup(code: string) {
  stop()
  isbn.value = code
  result.value = null
  step.value = 'looking'
  try {
    result.value = await lookupIsbn(code)
    step.value = result.value ? 'found' : 'not-found'
  } catch (error) {
    step.value = error instanceof LookupOfflineError ? 'offline' : 'not-found'
  }
}

function onManualLookup() {
  const parsed = parseIsbn(typedIsbn.value)
  if (!parsed) {
    typedError.value =
      'That isn’t a valid ISBN. Check the digits and try again.'
    return
  }
  typedError.value = ''
  lookup(parsed)
}

function scanAgain() {
  step.value = 'scan'
  result.value = null
  typedIsbn.value = ''
  nextTick(start)
}

function onConfirm() {
  emit('use', {
    isbn: isbn.value,
    result: step.value === 'found' ? result.value : null,
    offline: step.value === 'offline',
  })
}

// The video element exists once the dialog has rendered
watch(video, (element) => {
  if (element && open.value && step.value === 'scan') start()
})

watch(open, (isOpen) => {
  if (isOpen) {
    step.value = 'scan'
    result.value = null
    typedIsbn.value = ''
    typedError.value = ''
  } else {
    stop()
  }
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.scanner-frame {
  @apply bg-surface-inverse relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-xl;
}
.scanner-video {
  @apply absolute inset-0 size-full object-cover;
}
.scanner-guide {
  @apply absolute inset-x-[12%] top-1/2 grid h-[38%] -translate-y-1/2 place-items-center rounded-lg border-2 border-white/85;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.35);
}
.scanner-line {
  @apply bg-primary-400 h-0.5 w-[90%] rounded-full opacity-90;
  animation: scanner-sweep 1.8s ease-in-out infinite alternate;
}
@keyframes scanner-sweep {
  from {
    transform: translateY(-2.2rem);
  }
  to {
    transform: translateY(2.2rem);
  }
}
@media (prefers-reduced-motion: reduce) {
  .scanner-line {
    animation: none;
  }
}
.scanner-message {
  @apply bg-surface-subtle text-ink-primary absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center;
}
.scanner-state {
  @apply flex flex-col items-center gap-2 py-6 text-center;
}
.scanner-result {
  @apply bg-surface-subtle border-stroke flex items-center gap-4 rounded-xl border p-4;
}
.scanner-result-cover {
  @apply bg-surface-container text-ink-muted grid h-24 w-16 flex-none place-items-center overflow-hidden rounded shadow-[0_2px_6px_rgba(27,28,28,0.25)];
}
.scanner-result-title {
  @apply font-display text-lg leading-tight font-semibold;
}
</style>

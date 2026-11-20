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
        <template v-if="cameraShown">
          <div class="scanner-guide" aria-hidden="true">
            <span v-if="state === 'scanning'" class="scanner-line" />
          </div>
          <div class="scanner-controls">
            <bl-icon-button
              v-if="torchSupported"
              variant="secondary"
              size="sm"
              :aria-label="torchOn ? 'Turn off the light' : 'Turn on the light'"
              :aria-pressed="torchOn"
              @click="toggleTorch"
            >
              <template #default="iconProps">
                <IconBulbOff v-if="torchOn" v-bind="iconProps" />
                <IconBulb v-else v-bind="iconProps" />
              </template>
            </bl-icon-button>
            <bl-icon-button
              v-if="cameraCount > 1"
              variant="secondary"
              size="sm"
              aria-label="Switch camera"
              @click="switchCamera"
            >
              <template #default="iconProps">
                <IconCameraRotate v-bind="iconProps" />
              </template>
            </bl-icon-button>
          </div>
        </template>
        <div v-else class="scanner-message" role="alert">
          <component :is="cameraMessage.icon" :size="28" stroke="1.5" />
          <p class="font-semibold">{{ cameraMessage.title }}</p>
          <p class="text-ink-muted text-sm">{{ cameraMessage.text }}</p>
          <bl-button
            v-if="cameraMessage.retry"
            variant="secondary"
            size="sm"
            @click="start"
          >
            {{ cameraMessage.retry }}
          </bl-button>
        </div>
      </div>

      <!-- What the camera is doing, and why it may not be working -->
      <div
        v-if="step === 'scan' && cameraShown"
        class="flex flex-col gap-2"
        aria-live="polite"
        data-testid="scanner-status"
      >
        <bl-alert
          v-if="otherCode"
          tone="secondary"
          size="sm"
          icon="IconAlertTriangle"
        >
          {{ otherCodeMessage }}
        </bl-alert>
        <p v-else class="scanner-hint">
          <bl-loading v-if="state === 'starting'" class="size-4!" />
          <IconScan v-else :size="16" stroke="1.8" class="flex-none" />
          {{
            state === 'starting'
              ? 'Starting the camera…'
              : 'Looking for a barcode…'
          }}
        </p>
        <div v-if="struggling && !otherCode" class="scanner-tips">
          <p class="font-semibold">Not reading it?</p>
          <ul>
            <li>Fill the frame with the barcode, keeping it level.</li>
            <li>
              If it looks blurry, move it a little further away. Laptop webcams
              can’t focus up close.
            </li>
            <li>Tilt the book to get rid of glare, or add light.</li>
            <li>Or type the 13 digits printed above the barcode.</li>
          </ul>
        </div>
      </div>

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

      <!-- Not found / offline / services unavailable -->
      <div v-else-if="outcome" class="scanner-state" role="status">
        <component
          :is="outcome.icon"
          class="text-ink-muted"
          :size="28"
          stroke="1.5"
        />
        <p class="font-semibold">{{ outcome.title }}</p>
        <p class="text-ink-muted text-sm">{{ outcome.text }}</p>
        <bl-button
          v-if="step === 'unavailable'"
          variant="secondary"
          size="sm"
          @click="lookup(isbn)"
        >
          Try again
        </bl-button>
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
  IconBulb,
  IconBulbOff,
  IconCamera,
  IconCameraOff,
  IconCameraRotate,
  IconCloudOff,
  IconLock,
  IconRefresh,
  IconScan,
  IconWifiOff,
} from '@tabler/icons-vue'
import {
  lookupIsbn,
  LookupOfflineError,
  LookupUnavailableError,
  type BookLookupResult,
} from '~/services/book-lookup'

/** What the user chose: the details found, or only the ISBN */
export type IsbnScan = {
  isbn: string
  result: BookLookupResult | null
  // The lookup couldn't run (offline, services down): try again later
  lookUpLater: boolean
}

type Step =
  | 'scan'
  | 'looking'
  | 'found'
  | 'not-found'
  | 'offline'
  | 'unavailable'

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{ (e: 'use', scan: IsbnScan): void }>()

const video = ref<HTMLVideoElement>()
const step = ref<Step>('scan')
const isbn = ref('')
const result = ref<BookLookupResult | null>(null)
const unavailableReason = ref<LookupUnavailableError['reason']>('unreachable')
const typedIsbn = ref('')
const typedError = ref('')

const {
  state,
  otherCode,
  struggling,
  torchSupported,
  torchOn,
  cameraCount,
  start,
  stop,
  toggleTorch,
  switchCamera,
} = useBarcodeScanner(video, (code) => lookup(code))

const cameraShown = computed(
  () => state.value === 'scanning' || state.value === 'starting',
)

const cameraMessage = computed(() => {
  switch (state.value) {
    case 'denied':
      return {
        icon: IconCameraOff,
        title: 'Camera access is blocked',
        text: 'Allow camera access for BookLib in your browser or system settings, or type the ISBN below.',
        retry: 'Try again',
      }
    case 'busy':
      return {
        icon: IconCameraOff,
        title: 'The camera is in use',
        text: 'Another app or browser tab is using it. Close that, then try again.',
        retry: 'Try again',
      }
    case 'unavailable':
      return {
        icon: IconCameraOff,
        title: 'No camera found',
        text: 'Connect a camera, or type the ISBN below.',
        retry: 'Try again',
      }
    case 'insecure':
      return {
        icon: IconLock,
        title: 'The camera needs a secure connection',
        text: 'Browsers only allow the camera on https pages. Type the ISBN below instead.',
        retry: null,
      }
    case 'error':
      return {
        icon: IconCameraOff,
        title: 'The scanner couldn’t start',
        text: 'Something went wrong starting the camera or the barcode reader. Try again, or type the ISBN below.',
        retry: 'Try again',
      }
    default:
      return {
        icon: IconCamera,
        title: 'Camera is off',
        text: 'Turn it on to scan the barcode.',
        retry: 'Turn on camera',
      }
  }
})

// 12 digits, or 13 starting with 0: a UPC code (US prices, mass-market)
const otherCodeKind = computed(() =>
  otherCode.value && /^0?\d{12}$/.test(otherCode.value)
    ? 'a price code (UPC)'
    : 'a product code',
)
const otherCodeMessage = computed(() => {
  const advice =
    otherCodeKind.value === 'a price code (UPC)'
      ? 'Some paperbacks have the ISBN barcode inside the front cover. Or type the ISBN printed on the back or the copyright page.'
      : 'Look for the barcode starting with 978 or 979, or type the ISBN.'
  return `Read ${otherCode.value}, but that’s ${otherCodeKind.value}, not the ISBN. ${advice}`
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

const outcome = computed(() => {
  switch (step.value) {
    case 'offline':
      return {
        icon: IconWifiOff,
        title: 'You’re offline',
        text: `Keep the ISBN ${isbn.value} for now. The book’s details are filled in when you’re back online.`,
      }
    case 'unavailable':
      return {
        icon: IconCloudOff,
        title:
          unavailableReason.value === 'busy'
            ? 'The book services are busy'
            : 'Couldn’t reach the book services',
        text: `Open Library or Google Books didn’t answer, so ISBN ${isbn.value} couldn’t be checked. Try again, or keep the ISBN and BookLib looks it up again later.`,
      }
    case 'not-found':
      return {
        icon: IconBookOff,
        title: 'No details found',
        text: `Neither Open Library nor Google Books knows ISBN ${isbn.value}. You can keep the ISBN and fill in the rest yourself.`,
      }
    default:
      return null
  }
})

const confirmLabel = computed(() => {
  switch (step.value) {
    case 'found':
      return 'Use these details'
    case 'not-found':
    case 'offline':
    case 'unavailable':
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
    if (error instanceof LookupUnavailableError) {
      unavailableReason.value = error.reason
      step.value = 'unavailable'
    } else if (error instanceof LookupOfflineError) {
      step.value = 'offline'
    } else {
      console.error('ISBN lookup failed:', error)
      unavailableReason.value = 'unreachable'
      step.value = 'unavailable'
    }
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
    lookUpLater: step.value === 'offline' || step.value === 'unavailable',
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
  @apply absolute inset-x-[8%] top-1/2 grid h-[42%] -translate-y-1/2 place-items-center rounded-lg border-2 border-white/85;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.35);
}
.scanner-controls {
  @apply absolute top-2.5 right-2.5 flex gap-2;
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
.scanner-hint {
  @apply text-ink-secondary flex items-center gap-2 text-sm;
}
.scanner-tips {
  @apply bg-surface-subtle border-stroke text-ink-secondary flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-sm;
}
.scanner-tips ul {
  @apply list-disc pl-5;
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

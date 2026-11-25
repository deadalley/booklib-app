<template>
  <bl-modal v-model="open" size="md" sheet>
    <template #title>{{ title }}</template>
    <template #subtitle>An image to save or send to anyone.</template>

    <div class="flex flex-col gap-4" data-testid="share-card">
      <bl-switch v-model="theme" aria-label="Card style" class="self-start">
        <bl-switch-option
          v-for="option in THEMES"
          :key="option.value"
          :value="option.value"
          :selected-value="theme"
        >
          <template #icon>
            <component :is="option.icon" :size="16" stroke="1.8" />
          </template>
          <template #label>{{ option.label }}</template>
        </bl-switch-option>
      </bl-switch>

      <div class="share-preview">
        <img
          v-if="url"
          :src="url"
          :alt="`Preview of the image: ${title}`"
          class="share-image"
          data-testid="share-preview"
        />
        <bl-loading v-else />
      </div>

      <bl-alert
        v-if="message"
        :tone="message.tone"
        :icon="
          message.tone === 'primary' ? 'IconAlertTriangle' : 'IconCircleCheck'
        "
        size="sm"
        role="status"
      >
        {{ message.text }}
      </bl-alert>
    </div>

    <template #footer>
      <div class="share-actions">
        <bl-button variant="tertiary" @click="open = false">Close</bl-button>
        <span class="flex-1 max-sm:hidden" />
        <bl-button
          v-if="canCopy"
          variant="secondary"
          :disabled="!blob"
          @click="copy"
        >
          <template #prependIcon="iconProps">
            <IconCopy v-bind="iconProps" />
          </template>
          Copy image
        </bl-button>
        <bl-button
          v-if="canShare"
          variant="secondary"
          :disabled="!blob"
          @click="share"
        >
          <template #prependIcon="iconProps">
            <IconShare v-bind="iconProps" />
          </template>
          Share…
        </bl-button>
        <bl-button :disabled="!blob" @click="save">
          <template #prependIcon="iconProps">
            <IconDownload v-bind="iconProps" />
          </template>
          Save image
        </bl-button>
      </div>
    </template>
  </bl-modal>
</template>

<script setup lang="ts">
import {
  IconCopy,
  IconDownload,
  IconMoon,
  IconShare,
  IconSun,
} from '@tabler/icons-vue'
import type { CardTheme } from '~/services/share-cards'

const THEMES = [
  { value: 'light', label: 'Light', icon: IconSun },
  { value: 'dark', label: 'Dark', icon: IconMoon },
] as const

const props = defineProps<{
  title: string
  // Without extension, e.g. "piranesi"
  fileName: string
  render: (theme: CardTheme) => Promise<Blob>
}>()

const open = defineModel<boolean>({ default: false })

const theme = ref<CardTheme>('light')
const blob = shallowRef<Blob | null>(null)
const url = ref<string | null>(null)
const message = ref<{ tone: 'primary' | 'secondary'; text: string } | null>(
  null,
)

const canCopy =
  typeof window !== 'undefined' &&
  'ClipboardItem' in window &&
  !!navigator.clipboard?.write

const file = computed(() =>
  blob.value
    ? new File([blob.value], `${props.fileName}.png`, { type: 'image/png' })
    : null,
)
const canShare = computed(
  () =>
    !!file.value &&
    typeof navigator !== 'undefined' &&
    !!navigator.canShare?.({ files: [file.value] }),
)

function setUrl(next: string | null) {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = next
}

let renderId = 0
async function draw() {
  const id = ++renderId
  blob.value = null
  setUrl(null)
  message.value = null
  try {
    const image = await props.render(theme.value)
    if (id !== renderId) return
    blob.value = image
    setUrl(URL.createObjectURL(image))
  } catch (error) {
    if (id !== renderId) return
    message.value = {
      tone: 'primary',
      text: `The image couldn’t be made: ${error instanceof Error ? error.message : 'unknown error'}.`,
    }
  }
}

async function copy() {
  if (!blob.value) return
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob.value }),
    ])
    message.value = { tone: 'secondary', text: 'Copied. Paste it anywhere.' }
  } catch {
    message.value = {
      tone: 'primary',
      text: 'The image couldn’t be copied here. Save it instead.',
    }
  }
}

function save() {
  if (!blob.value) return
  downloadFile(`${props.fileName}.png`, blob.value, 'image/png')
  message.value = { tone: 'secondary', text: 'Saved to your downloads.' }
}

async function share() {
  if (!file.value) return
  try {
    await navigator.share({ files: [file.value], title: props.title })
  } catch {
    // Cancelled from the share sheet
  }
}

watch([open, theme], ([isOpen]) => {
  if (isOpen) draw()
})

watch(open, (isOpen) => {
  if (isOpen) theme.value = 'light'
  else setUrl(null)
})

onBeforeUnmount(() => setUrl(null))
</script>

<style scoped>
@reference '../assets/css/main.css';

.share-preview {
  @apply bg-surface-subtle border-stroke grid min-h-80 place-items-center rounded-xl border p-4;
}
.share-image {
  @apply max-h-[52vh] w-auto rounded-lg shadow-[0_12px_32px_-8px_rgba(27,28,28,0.35)];
}
.share-actions {
  @apply border-stroke flex flex-wrap items-center gap-2 border-t pt-4;
  @apply max-sm:flex-col-reverse max-sm:items-stretch;
}
.share-actions :deep(.button) {
  @apply max-sm:w-full max-sm:justify-center;
}
</style>

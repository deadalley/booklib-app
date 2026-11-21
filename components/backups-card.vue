<template>
  <section class="paper-flat data-management-card" data-testid="backups-card">
    <div class="data-management-card-header">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <IconHistory
            class="text-primary"
            :size="ICON_SIZE_MEDIUM"
            stroke="1.5"
          />
          <h5>Backups</h5>
        </div>
        <bl-button
          variant="secondary"
          size="sm"
          :loading="busy === 'backup'"
          @click="onBackUp"
        >
          <template #prependIcon="iconProps">
            <IconDeviceFloppy v-bind="iconProps" />
          </template>
          Back up now
        </bl-button>
      </div>
      <p class="text-ink-secondary text-sm">
        BookLib keeps a copy of your library every day, and before restores and
        imports. The newest {{ max }} stay on this device.
      </p>
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

    <ul v-if="backups.length" class="backups" aria-label="Backups">
      <li v-for="backup in backups" :key="backup.name" class="backup">
        <div class="flex min-w-0 flex-col gap-0.5">
          <p class="font-semibold">{{ formatDate(backup.createdAt) }}</p>
          <p class="text-ink-muted text-xs">
            {{ BACKUP_REASONS[backup.reason] }} ·
            {{ pluralBooks(backup.books) }}
          </p>
        </div>
        <div class="flex flex-none items-center gap-1">
          <bl-icon-button
            variant="tertiary"
            size="sm"
            :aria-label="`Download the backup from ${formatDate(backup.createdAt)}`"
            @click="download(backup.name)"
          >
            <template #default="iconProps">
              <IconDownload v-bind="iconProps" />
            </template>
          </bl-icon-button>
          <bl-button variant="tertiary" size="sm" @click="restoring = backup">
            Restore
          </bl-button>
        </div>
      </li>
    </ul>
    <p v-else class="text-ink-muted text-sm">
      No backups yet. The first one is made today.
    </p>

    <bl-modal
      :model-value="!!restoring"
      size="sm"
      @update:model-value="(value) => !value && (restoring = null)"
      @confirm="onRestore"
    >
      <template #title>Restore this backup?</template>
      <template v-if="restoring" #subtitle>
        {{ formatDate(restoring.createdAt) }} ·
        {{ pluralBooks(restoring.books) }}
      </template>
      <p class="text-ink-secondary">
        Your library is replaced with this backup. A copy of the library as it
        is now is kept first, so you can go back.
      </p>
      <template #cancel-label>Cancel</template>
      <template #action-label>Restore</template>
    </bl-modal>
  </section>
</template>

<script setup lang="ts">
import { IconDeviceFloppy, IconDownload, IconHistory } from '@tabler/icons-vue'
import dayjs from 'dayjs'
import { BACKUP_REASONS, maxBackups, type BackupInfo } from '~/services/backups'

const emit = defineEmits<{ (e: 'restored'): void }>()

const { backups, refresh, backUp, restore, download } = useBackups()

const max = maxBackups()
const busy = ref<'backup' | 'restore' | null>(null)
const restoring = ref<BackupInfo | null>(null)
const message = ref<{ tone: 'secondary' | 'primary'; text: string } | null>(
  null,
)

const formatDate = (date: string) =>
  dayjs(date).format('ddd D MMM YYYY · HH:mm')

async function onBackUp() {
  busy.value = 'backup'
  try {
    const info = await backUp('manual')
    message.value = {
      tone: 'secondary',
      text: `Backed up ${pluralBooks(info.books)}.`,
    }
  } catch (error) {
    message.value = { tone: 'primary', text: errorText(error, 'back up') }
  } finally {
    busy.value = null
  }
}

async function onRestore() {
  const backup = restoring.value
  if (!backup) return
  busy.value = 'restore'
  try {
    await restore(backup.name)
    message.value = {
      tone: 'secondary',
      text: `Restored the backup from ${formatDate(backup.createdAt)}.`,
    }
    emit('restored')
  } catch (error) {
    message.value = { tone: 'primary', text: errorText(error, 'restore') }
  } finally {
    busy.value = null
    restoring.value = null
  }
}

function errorText(error: unknown, action: string) {
  return `Couldn’t ${action}: ${error instanceof Error ? error.message : 'something went wrong'}.`
}

onMounted(() => {
  refresh().catch(() => {})
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.backups {
  @apply border-stroke flex max-h-80 flex-col overflow-y-auto rounded-xl border;
}
.backup {
  @apply flex items-center justify-between gap-3 px-4 py-2.5 text-sm;
}
.backup + .backup {
  @apply border-stroke-subtle border-t;
}
</style>

<template>
  <section class="paper-flat data-management-card" data-testid="sync-card">
    <div class="data-management-card-header">
      <div class="flex items-center gap-2">
        <IconFolderShare
          class="text-primary"
          :size="ICON_SIZE_MEDIUM"
          stroke="1.5"
        />
        <h5>Sync folder</h5>
      </div>
      <p class="text-ink-secondary text-sm">
        Keep your library the same on several computers, without an account.
        Choose a folder that Dropbox, iCloud Drive, OneDrive or Syncthing keeps
        in sync; BookLib keeps its library there and merges changes from each
        computer.
      </p>
    </div>

    <bl-alert v-if="!supported" tone="neutral" size="sm">
      Folder sync is available in the desktop app.
    </bl-alert>

    <template v-else-if="folder">
      <div class="sync-folder">
        <IconFolder :size="20" stroke="1.6" class="text-ink-muted flex-none" />
        <div class="flex min-w-0 flex-col gap-0.5">
          <p class="truncate font-semibold" :title="folder">{{ folder }}</p>
          <p class="text-ink-muted text-xs" role="status">
            <template v-if="status === 'syncing'">Syncing…</template>
            <template v-else-if="lastSyncedAt">
              Last synced {{ formatTime(lastSyncedAt) }}
            </template>
            <template v-else>Not synced yet</template>
          </p>
        </div>
      </div>

      <bl-alert
        v-if="status === 'error' && error"
        icon="IconAlertTriangle"
        role="alert"
      >
        {{ error }}
      </bl-alert>

      <div class="flex flex-wrap gap-2">
        <bl-button
          variant="secondary"
          :loading="status === 'syncing'"
          @click="sync()"
        >
          <template #prependIcon="iconProps">
            <IconRefresh v-bind="iconProps" />
          </template>
          Sync now
        </bl-button>
        <bl-button variant="secondary" @click="chooseFolder">
          Change folder
        </bl-button>
        <bl-button variant="tertiary" @click="stopSyncing">
          Stop syncing
        </bl-button>
      </div>
      <p class="text-ink-muted text-xs">
        Book covers stay on each computer. When the same book is changed on two
        computers, the latest change is kept.
      </p>
    </template>

    <div v-else class="flex flex-col items-start gap-3">
      <bl-button @click="chooseFolder">
        <template #prependIcon="iconProps">
          <IconFolderPlus v-bind="iconProps" />
        </template>
        Choose a folder
      </bl-button>
      <p class="text-ink-muted text-xs">
        Do the same on your other computers, choosing the same synced folder. A
        backup is made before the first sync.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  IconFolder,
  IconFolderPlus,
  IconFolderShare,
  IconRefresh,
} from '@tabler/icons-vue'

const {
  supported,
  folder,
  lastSyncedAt,
  status,
  error,
  sync,
  chooseFolder,
  stopSyncing,
} = useFolderSync()

const formatTime = (date: string) =>
  formatRelativeDay(toLocalDay(date), toLocalDay(new Date().toISOString())) +
  ` at ${new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
</script>

<style scoped>
@reference '../assets/css/main.css';

.sync-folder {
  @apply bg-surface-subtle border-stroke flex items-center gap-3 rounded-xl border px-4 py-3 text-sm;
}
</style>

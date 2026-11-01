<template>
  <NuxtLayout name="dashboard" title="Settings">
    <div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8">
      <div class="flex flex-col gap-1">
        <span class="section-label text-primary">Settings</span>
        <h3>Library settings</h3>
        <p class="text-ink-secondary">
          Maintenance tools for the data stored on this device.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section class="card" data-testid="settings-integrity">
          <div class="flex items-start gap-4">
            <span class="settings-icon" aria-hidden="true">
              <IconShieldCheck :size="20" stroke="1.6" />
            </span>
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <h5 class="stats-title">Check library integrity</h5>
              <p class="text-ink-secondary text-sm">
                Finds inconsistencies in the stored library data, such as books
                assigned to authors or collections that no longer exist.
              </p>
            </div>
          </div>
          <div class="flex justify-end">
            <bl-button variant="secondary" @click="checkLibrary()">
              <template #prependIcon="iconProps">
                <IconSearch v-bind="iconProps" />
              </template>
              Check library
            </bl-button>
          </div>

          <div
            v-if="libraryIntegrityResult"
            class="paper-dark flex flex-col gap-2 p-4 text-sm"
            role="status"
          >
            <p
              v-if="!integrityProblems.length"
              class="text-ink-primary flex items-center gap-2 font-semibold"
            >
              <IconCircleCheck :size="18" class="text-primary" />
              No problems found
            </p>
            <template v-else>
              <p class="text-ink-primary font-semibold">
                {{ integrityProblems.length }}
                {{ integrityProblems.length === 1 ? 'problem' : 'problems' }}
                found
              </p>
              <ul class="text-ink-secondary flex flex-col gap-1">
                <li v-for="problem in integrityProblems" :key="problem">
                  {{ problem }}
                </li>
              </ul>
            </template>
          </div>
        </section>

        <section class="card border-primary/30" data-testid="settings-reset">
          <div class="flex items-start gap-4">
            <span class="settings-icon" aria-hidden="true">
              <IconAlertTriangle :size="20" stroke="1.6" />
            </span>
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <h5 class="stats-title">Reset library</h5>
              <p class="text-ink-secondary text-sm">
                Permanently deletes all books, authors, collections and goals.
                Consider downloading a full backup from
                <NuxtLink to="/data-management" class="text-primary underline">
                  Data Management
                </NuxtLink>
                first. This cannot be undone.
              </p>
            </div>
          </div>
          <div class="flex justify-end">
            <bl-modal
              size="sm"
              icon="IconAlertTriangle"
              @confirm="resetLibrary"
            >
              <template #trigger>
                <bl-button>
                  <template #prependIcon="iconProps">
                    <IconTrash v-bind="iconProps" />
                  </template>
                  Reset library
                </bl-button>
              </template>
              <template #title>Reset your library?</template>
              <p>
                All books, authors, collections and goals will be permanently
                deleted.
                <strong>This action cannot be undone.</strong>
              </p>

              <template #cancel-label>Cancel</template>
              <template #action-label>Reset library</template>
            </bl-modal>
          </div>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconSearch,
  IconShieldCheck,
  IconTrash,
} from '@tabler/icons-vue'
import type { LibraryIntegrityResult } from '~/types/api'

const { resetLibrary: resetLib, checkLibraryIntegrity } = useBookLibrary()

const libraryIntegrityResult = ref<LibraryIntegrityResult | undefined>()

const integrityProblems = computed(() => {
  const result = libraryIntegrityResult.value
  return result
    ? [...result.books, ...result.authors, ...result.collections]
    : []
})

async function resetLibrary() {
  await resetLib()
  navigateTo('/library')
}

async function checkLibrary() {
  libraryIntegrityResult.value = await checkLibraryIntegrity()
}

useHead({
  title: 'BookLib | Settings',
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.settings-icon {
  @apply bg-primary-50 text-primary rounded-scholarly grid size-9 shrink-0 place-items-center;
}
</style>

<template>
  <NuxtLayout name="dashboard" title="Settings">
    <div
      class="flex flex-1 flex-col gap-10 lg:flex-row 2xl:w-9/12 2xl:overflow-auto"
    >
      <div class="flex flex-1 flex-col gap-16">
        <section class="book-section">
          <h4>Reset library</h4>
          <p>
            Resetting your library will permanently delete your books and
            collections. This action cannot be undone.
          </p>
          <bl-modal size="sm" @confirm="resetLibrary">
            <template #trigger>
              <bl-button class="mt-4">Reset library</bl-button>
            </template>
            <template #title>
              Are you sure you want to reset your library?
            </template>
            <p>
              Resetting your library will permanently delete your books and
              collections. <strong>This action cannot be undone.</strong>
            </p>

            <template #cancel-label> Cancel </template>
            <template #action-label> Reset library </template>
          </bl-modal>
        </section>
        <section class="book-section">
          <h4>Check libray integrity</h4>
          <p>
            Helps find and correctly inconsistencies in the stored library data.
            This can help find books assigned to authors or collections that do
            not exist.
          </p>
          <bl-button class="mt-4" @click="checkLibrary()">
            Check library
          </bl-button>
          <div
            v-if="libraryIntegrityResult"
            class="mt-2 flex flex-col gap-4 rounded-xl bg-accent-light p-4"
          >
            <div
              v-if="
                !libraryIntegrityResult.books.length &&
                !libraryIntegrityResult.authors.length &&
                !libraryIntegrityResult.collections.length
              "
            >
              No problems found!
            </div>
            <div v-for="result in libraryIntegrityResult.books" :key="result">
              {{ result }}
            </div>
            <div v-for="result in libraryIntegrityResult.authors" :key="result">
              {{ result }}
            </div>
            <div
              v-for="result in libraryIntegrityResult.collections"
              :key="result"
            >
              {{ result }}
            </div>
          </div>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { LibraryIntegrityResult } from '~/types/api'

const libraryIntegrityResult = ref<LibraryIntegrityResult | undefined>()

async function resetLibrary() {
  try {
    await $fetch<string | undefined>('/api/library/reset', {
      method: 'post',
    })

    navigateTo('/library')
  } catch (error) {
    console.error(error)
  }
}

async function checkLibrary() {
  try {
    libraryIntegrityResult.value = await $fetch(
      '/api/library/check-integrity',
      {
        method: 'post',
      },
    )
    console.log(libraryIntegrityResult.value)
  } catch (error) {
    console.error(error)
  }
}

useHead({
  title: 'BookLib | Settings',
})
</script>

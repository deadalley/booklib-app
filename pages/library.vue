<template>
  <NuxtLayout name="dashboard" title="Library">
    <!-- Error boundary -->
    <NuxtErrorBoundary>
      <template #error="{ error, clearError }">
        <bl-alert
          icon="IconAlertTriangle"
          title="Something went wrong."
          role="alert"
        >
          {{ error.message || 'An unexpected error occurred.' }}
          <template #actions>
            <bl-button @click="clearError">Reload page</bl-button>
          </template>
        </bl-alert>
      </template>
      <NuxtPage />
    </NuxtErrorBoundary>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useBookLibrary } from '~/composables/use-book-library'

const route = useRoute()

const { isLibraryEmpty } = useBookLibrary()

// An empty library has nothing to browse: send the user to the home page,
// which explains how to add or import books (creation pages stay reachable).
onMounted(async () => {
  if ((await isLibraryEmpty()) && !route.path.includes('/new')) {
    await navigateTo('/home')
  }
})

useHead({
  title: 'BookLib | Library',
})
</script>

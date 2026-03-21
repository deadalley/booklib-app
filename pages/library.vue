<template>
  <NuxtLayout name="dashboard" title="Library" :nav-items="navItems">
    <!-- Error boundary -->
    <NuxtErrorBoundary>
      <template #error="{ error, clearError }">
        <bl-warning-badge>
          <template #icon="iconProps">
            <IconAlertTriangle v-bind="iconProps" class="text-primary" />
          </template>
          <template #title> Something went wrong. </template>
          <template #content>
            <div class="flex flex-col gap-4">
              {{ error.message || 'An unexpected error occurred.' }}
              <bl-button @click="clearError"> Reload page </bl-button>
            </div>
          </template>
        </bl-warning-badge>
      </template>
      <NuxtPage />
    </NuxtErrorBoundary>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconAlertTriangle } from '@tabler/icons-vue'
import { useBookLibrary } from '~/composables/use-book-library'

const route = useRoute()

const { isLibraryEmpty } = useBookLibrary()

const isEmpty = ref<boolean>(false)

onMounted(async () => {
  isEmpty.value = await isLibraryEmpty()
})

const navItems = [
  {
    to: '/library/books',
    label: 'Books',
  },
  {
    to: '/library/collections',
    label: 'Collections',
  },
  {
    to: '/library/authors',
    label: 'Authors',
  },
]

if (isEmpty.value && !route.path.includes('/new')) {
  navigateTo('/home')
}

useHead({
  title: 'BookLib | Library',
})
</script>

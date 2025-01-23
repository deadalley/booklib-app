<template>
  <NuxtLayout name="dashboard" title="Library" :nav-items="navItems">
    <NuxtPage />

    <template #action-btn>
      <NuxtLink class="flex md:inline-flex" to="/library/books/new">
        <bl-button expand>
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Book
        </bl-button>
      </NuxtLink>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'

const route = useRoute()

const { data: isEmpty } = await useFetch<number>('/api/library/is-empty')

const navItems = [
  {
    to: '/library/books',
    label: 'Books',
  },
  {
    to: '/library/collections',
    label: 'Collections',
  },
]

if (isEmpty.value && !route.path.includes('/new')) {
  navigateTo('/home')
}

useHead({
  title: 'BookLib | Library',
})

definePageMeta({
  middleware: 'auth',
})
</script>

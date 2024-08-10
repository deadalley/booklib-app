<template>
  <NuxtLayout name="dashboard" title="Library" :nav-items="navItems">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
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

if (route.path === '/library' || route.path === '/library/') {
  navigateTo('/library/books')
}

useHead({
  title: 'BookLib | Library',
})

definePageMeta({
  middleware: 'auth',
})
</script>

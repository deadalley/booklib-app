<template>
  <NuxtLayout name="dashboard" title="Library" :nav-items="navItems">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
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

navigateTo('/library/books')

useHead({
  title: 'BookLib | Library',
})

definePageMeta({
  middleware: 'auth',
})
</script>

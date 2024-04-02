<template>
  <NuxtLayout name="dashboard" title="Home">
    <div class="flex flex-col">
      <h1 class="mb-8">
        Welcome to your new library, {{ user?.user_metadata.name }}!
      </h1>
      <div class="flex items-center gap-5">
        <p class="text-xl">Start by adding your first book:</p>
        <NuxtLink class="flex md:inline-flex" to="/library/books/new">
          <bl-button expand>
            <template #prependIcon="prependIcon">
              <IconPlus v-bind="prependIcon" />
            </template>
            My first book
          </bl-button>
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'
const user = useSupabaseUser()

useHead({
  title: 'BookLib | Home',
})

definePageMeta({
  middleware: 'auth',
})
</script>

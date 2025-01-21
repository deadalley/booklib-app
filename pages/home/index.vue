<template>
  <NuxtLayout name="dashboard" title="Home">
    <div v-if="isEmpty" class="flex flex-col">
      <h1 class="mb-8">
        Welcome to your new library, {{ user?.user_metadata.name }}!
      </h1>
      <div class="flex flex-col items-center gap-4">
        <NuxtImg
          src="/book-graphics.svg"
          alt="Book"
          class="h-96 object-cover object-center"
        />
        <h4>Your library is empty.</h4>
        <p class="text-center text-lg">
          It looks like you don't have any books yet in your library.
          <br />
          Let's add your first book.
        </p>
        <NuxtLink class="mt-4 flex md:inline-flex" to="/library/books/new">
          <bl-button expand>
            <template #prependIcon="prependIcon">
              <IconPlus v-bind="prependIcon" />
            </template>
            Add first book to library
          </bl-button>
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'
const user = useSupabaseUser()

const { data: isEmpty } = await useFetch<number>('/api/library/is-empty')

useHead({
  title: 'BookLib | Home',
})

definePageMeta({
  middleware: 'auth',
})
</script>

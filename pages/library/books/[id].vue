<template>
  <div v-if="book" class="flex flex-col gap-10 flex-1 overflow-auto">
    <header class="flex flex-col gap-2">
      <div class="flex gap-3 justify-between items-end">
        <h2 class="flex items-end leading-none">
          {{ isNew ? 'New Book' : book.title }}
        </h2>
        <div v-if="!isNew" class="flex flex-col leading-tight justify-end">
          <p>Added on</p>
          <h6>01/01/2021</h6>
        </div>
      </div>
      <h5>{{ book.author }}</h5>
    </header>
    <div class="flex gap-10 flex-1 overflow-auto">
      <bl-book-image
        :editing="true"
        :book-id="book.id"
        alt="book-cover"
      ></bl-book-image>
      <div class="overflow-y-auto flex-[3] flex flex-col gap-16">
        <section v-if="!editing" class="book-section">
          <bl-input id="id" type="hidden" name="id"></bl-input>
          <div class="flex justify-between w-full col-span-12">
            <h4>Summary</h4>
            <bl-button compact variant="secondary" @click="onEdit(true)"
              >Edit</bl-button
            >
          </div>
          <p class="col-span-12 text-gray-dark">
            {{ book?.summary ?? 'No summary available' }}
          </p>
        </section>
        <section class="book-section">
          <bl-book-form
            :default-values="book"
            :editing="editing"
            :on-edit="onEdit"
            :on-refetch="fetchBook"
          ></bl-book-form>
        </section>
        <section v-if="!isNew" class="book-section">
          <h5>Delete book</h5>
          <div class="flex gap-3 justify-between">
            <p>
              Are you sure you want to delete this book? This action cannot be
              undone.
            </p>
            <bl-button compact @click="deleteBook">Delete</bl-button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const editing = ref(isNew.value)
const book = ref()

async function fetchBook() {
  if (route.params.id === 'new') {
    book.value = {}
  } else {
    const data = await $fetch<Book>(`/api/books/${route.params.id}`, {})
    book.value = data
  }
}

async function deleteBook() {
  const data = await $fetch<Book>(`/api/books/${route.params.id}`, {
    method: 'delete',
  })

  navigateTo('/library')
}

function onEdit(value: boolean) {
  editing.value = value
}

onMounted(() => {
  fetchBook()
})

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  alias: ['/new'],
})
</script>

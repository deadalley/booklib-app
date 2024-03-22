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
      <div class="overflow-y-auto flex-[3]">
        <bl-book-form
          :default-values="book"
          :editing="editing"
          :on-edit="onEdit"
          :on-discard="() => onEdit(false)"
        ></bl-book-form>
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

if (route.params.id === 'new') {
  book.value = {}
} else {
  const data = await $fetch<Book>(`/api/books/${route.params.id}`, {})
  book.value = data
}

function onEdit(value: boolean) {
  editing.value = value
}

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  alias: ['/new'],
})
</script>

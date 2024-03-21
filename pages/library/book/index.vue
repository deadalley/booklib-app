<template>
  <div class="flex flex-col gap-10 flex-1 overflow-auto">
    <header class="flex flex-col gap-2">
      <div class="flex gap-3 justify-between items-end">
        <h2 class="flex items-end leading-none">{{ book.title }}</h2>
        <div class="flex flex-col leading-tight justify-end">
          <p>Added on</p>
          <h6>01/01/2021</h6>
        </div>
      </div>
      <h5>{{ book.author }}</h5>
    </header>
    <div class="flex gap-10 flex-1 overflow-auto">
      <bl-book-image
        :editing="editing"
        :cover-src="book.coverSrc"
        alt="book-cover"
      ></bl-book-image>
      <div class="overflow-y-auto flex-[3]">
        <bl-book-form
          :default-values="book"
          :editing="editing"
          :on-edit="() => onEdit(true)"
          :on-discard="() => onEdit(false)"
        ></bl-book-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '../../../types/book'

const book: Book = {
  title: 'Revival',
  author: 'Stephen King',
  coverSrc: 'https://picsum.photos/160/220',
  year: 2022,
  summary:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tristique ligula sit amet orci egestas, quis lacinia nisi volutpat. Aliquam consectetur metus sit amet dui suscipit, eget sagittis diam luctus. Donec et elit diam. Aenean metus massa, dapibus vitae odio vel, congue aliquam quam. Nunc dictum id nisl sed feugiat. Donec posuere a neque non pretium.',
}

const editing = ref(false)

function onEdit(value: boolean) {
  editing.value = value
}

useHead({
  title: 'BookLib | My Library',
})
</script>

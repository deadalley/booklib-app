<script setup>
import BookImageSmall from './book-image-small.vue'
import { buildBook } from '../utils'

const state = reactive({
  book: buildBook(),
})
</script>

<template>
  <Story title="Book Image Small">
    <Variant title="Default">
      <div class="w-[300px]">
        <BookImageSmall :coverSrc="state.book.coverSrc" />
      </div>
    </Variant>
    <Variant title="Empty">
      <div class="w-[300px]">
        <BookImageSmall />
      </div>
    </Variant>
  </Story>
</template>

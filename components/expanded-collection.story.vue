<script setup>
import { buildBook, buildCollection } from '../utils'

const state = reactive({
  collection: buildCollection(),
  books: [buildBook({ id: 1 }), buildBook({ id: 2 }), buildBook({ id: 3 })],
})
</script>

<template>
  <Story title="Molecules/Expanded Collection">
    <bl-expanded-collection
      :collection="state.collection"
      :books="state.books"
    />
  </Story>
</template>

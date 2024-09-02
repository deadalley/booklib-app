<script setup>
import GenreTag from './genre-tag.vue'

const state = reactive({
  value: 'Mystery',
})
</script>

<template>
  <Story title="Genre Tag">
    <Variant title="Default">
      <GenreTag :value="state.value" />

      <template #controls>
        Value: <input v-model="state.value" type="text" />
      </template>
    </Variant>
  </Story>
</template>

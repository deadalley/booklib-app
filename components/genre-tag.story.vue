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
        Value: <input type="text" v-model="state.value" />
      </template>
    </Variant>
  </Story>
</template>

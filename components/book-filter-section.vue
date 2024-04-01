<template>
  <div v-if="!!elements.length">
    <h5 class="mb-4">{{ title }}</h5>
    <div class="flex w-full flex-wrap gap-3">
      <bl-pill
        v-for="element in elements"
        :key="element"
        :selected="selectedElements.includes(element)"
        @click="onSelect(element)"
      >
        {{ element }}
      </bl-pill>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  elements: string[]
}>()

const selectedElements = defineModel({
  type: Array<String>,
  default: [],
})

function onSelect(element: string) {
  if (selectedElements.value.includes(element)) {
    const index = selectedElements.value.findIndex((el) => el === element)
    selectedElements.value.splice(index, 1)
  } else {
    selectedElements.value.push(element)
  }
}
</script>

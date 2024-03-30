<template>
  <div v-if="!!elements.length">
    <h5 class="mb-4">{{ title }}</h5>
    <div class="flex w-full flex-wrap gap-3">
      <bl-pill
        v-for="element in elements"
        :key="element"
        :selected="selectedElements.includes(element)"
        @click="onSelect(selectedElements, element)"
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
  selectedElements: string[]
}>()

function onSelect(elements: string[], element: string) {
  if (elements.includes(element)) {
    const index = elements.findIndex((el) => el === element)
    elements.splice(index, 1)
  } else {
    elements.push(element)
  }
}
</script>

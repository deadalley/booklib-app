<template>
  <div v-if="!!elements.length">
    <h5 class="mb-4">{{ title }}</h5>
    <div class="flex w-full flex-wrap gap-3">
      <bl-pill
        v-for="(element, index) in elements"
        :key="element"
        :selected="selectedElements.includes(element)"
        @click="onSelect(selectedElements, element, index)"
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

function onSelect(elements: string[], element: string, index: number) {
  if (elements.includes(element)) {
    elements.splice(index, 1)
  } else {
    elements.push(element)
  }
}
</script>

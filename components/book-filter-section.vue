<template>
  <div v-if="!!elements.length" class="filter-section">
    <div class="filter-section-header">
      <label class="filter-section-label">{{ title }}</label>
      <button
        v-if="selectedElements?.length"
        class="filter-section-reset"
        @click="onReset"
      >
        Reset
      </button>
    </div>
    <div class="columns-2 gap-6">
      <bl-checkbox
        v-for="element in elements"
        :id="element"
        :key="element"
        :checked="selectedElements?.includes(element)"
        align="left"
        class="mb-1"
        @change="onSelect(element)"
      >
        {{ getDisplayValue(element) }}
      </bl-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import languageOptions from '~/public/languages-2.json'

defineProps<{
  title: string
  elements: string[]
  genre?: boolean
}>()

const selectedElements = defineModel({
  type: Array<string>,
  default: [],
})

function getDisplayValue(element: string) {
  return languageOptions[element as keyof typeof languageOptions] ?? element
}

function onSelect(element: string) {
  if (selectedElements.value.includes(element)) {
    const index = selectedElements.value.findIndex((el) => el === element)
    selectedElements.value.splice(index, 1)
  } else {
    selectedElements.value.push(element)
  }
}

function onReset() {
  selectedElements.value = []
}
</script>

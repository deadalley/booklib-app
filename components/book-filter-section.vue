<template>
  <div v-if="!!elements.length">
    <h6 class="mb-4">{{ title }}</h6>
    <div class="flex w-full flex-wrap gap-3">
      <bl-pill
        v-for="element in elements"
        v-if="!genre"
        :key="element"
        :selected="selectedElements.includes(element)"
        @click="onSelect(element)"
      >
        {{ getDisplayValue(element) }}
      </bl-pill>
      <bl-genre-tag
        v-for="(element, index) in elements"
        v-if="!!genre"
        :key="element"
        :value="element"
        :index="index"
        :selected="selectedElements.includes(element)"
        @click="onSelect(element)"
      />
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
</script>

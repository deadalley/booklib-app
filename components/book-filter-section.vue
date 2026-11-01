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
        v-for="option in options"
        :id="`filter-${idPrefix}-${option.value}`"
        :key="option.value"
        :checked="selectedElements?.includes(option.value)"
        align="left"
        class="mb-1"
        @change="onSelect(option.value)"
      >
        {{ option.label }}
      </bl-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import languageOptions from '~/public/languages-2.json'

type FilterOption = { value: string; label: string }

const props = defineProps<{
  title: string
  /** Plain values (language codes are shown as names) or value/label pairs. */
  elements: (string | FilterOption)[]
}>()

const idPrefix = computed(() =>
  props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
)

const options = computed<FilterOption[]>(() =>
  props.elements.map((element) =>
    typeof element === 'string'
      ? { value: element, label: getDisplayValue(element) }
      : element,
  ),
)

const selectedElements = defineModel({
  type: Array<string>,
  default: [],
})

function getDisplayValue(element: string) {
  return languageOptions[element as keyof typeof languageOptions] ?? element
}

function onSelect(element: string) {
  selectedElements.value = selectedElements.value.includes(element)
    ? selectedElements.value.filter((el) => el !== element)
    : [...selectedElements.value, element]
}

function onReset() {
  selectedElements.value = []
}
</script>

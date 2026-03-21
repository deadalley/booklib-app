<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div
    class="menu-popper-root"
    :class="{
      'with-wrapper': withWrapper,
      [side]: true,
    }"
  >
    <ComboboxRoot
      v-model="selectValue"
      v-model:search-term="searchTerm"
      v-model:open="open"
      class="relative"
      :multiple="multiple"
      :filter-function="filterFunction"
      :display-value="getDisplayValue"
      :reset-search-term-on-select="false"
      :reset-search-term-on-blur="false"
    >
      <ComboboxAnchor
        :class="{
          'form-inner': withWrapper,
          'border-primary!': focused,
        }"
      >
        <ComboboxInput
          v-bind="$attrs"
          class="w-full"
          :class="{ hidden: !(editing && !hidden) }"
          :placeholder="placeholder"
          @focus="onFocus"
          @blur="onBlur"
        />
        <IconX
          v-if="clearable && selectValue"
          class="cursor-pointer"
          :size="14"
          @click="onClear"
        />
      </ComboboxAnchor>

      <div v-if="multiple" class="mt-2 flex flex-wrap gap-1">
        <bl-removable-tag
          v-for="(item, index) in selectValue"
          :key="item"
          :value="item"
          :index="index"
          removable
          @remove="onRemoveItem"
        />
      </div>

      <ComboboxContent
        :align="align"
        :side="side"
        :avoid-collisions="false"
        position="popper"
        class="menu-content"
      >
        <ComboboxViewport class="w-full">
          <ComboboxEmpty as-child>
            <div class="autocomplete-empty-item" @click="onAddNew">
              {{
                canCreateNew
                  ? `Add ${searchTerm ?? 'new'}`
                  : (notFoundLabel ?? 'No matches')
              }}
            </div>
          </ComboboxEmpty>

          <ComboboxGroup
            v-if="extendedOptions"
            class="flex w-full flex-col gap-1"
          >
            <ComboboxItem
              v-for="(option, index) in extendedOptions"
              :key="index"
              class="menu-item"
              :value="option.value"
            >
              <ComboboxLabel>
                {{ option.label }}
              </ComboboxLabel>
            </ComboboxItem>
          </ComboboxGroup>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxRoot>
  </div>
</template>

<script setup lang="ts">
import { map, indexBy, prop } from 'ramda'
import type { SelectOption } from './raw-select.vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxViewport,
} from 'radix-vue'
import { IconX } from '@tabler/icons-vue'

export type AutocompleteProps = {
  dataTestid?: string
  options: SelectOption[]
  placeholder?: string
  withWrapper?: boolean
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  multiple?: boolean
  clearable?: boolean
  editing?: boolean
  hidden?: boolean
  canCreateNew?: boolean
  notFoundLabel?: string
}

const props = withDefaults(defineProps<AutocompleteProps>(), {
  withWrapper: true,
  canCreateNew: false,
  editing: true,
  hidden: false,
  clearable: false,
  side: 'bottom',
  multiple: false,
})

const selectValue = defineModel<string | string[]>()
const searchTerm = defineModel<string>('searchTerm')
const focused = defineModel<boolean>('focused')
const open = ref<boolean>(false)
const extendedOptions = ref([...props.options])

watch(
  () => props.options,
  (options) => {
    extendedOptions.value = [...options]
  },
  { deep: true, immediate: true },
)

const labelByValue = computed<Record<string, string>>(() =>
  map(prop('label'), indexBy(prop('value'), extendedOptions.value)),
)

function onFocus() {
  focused.value = true
  open.value = true
}

function onBlur() {
  focused.value = false
}

function filterFunction(list: string[], searchTerm: string) {
  return list.filter((option) => {
    return labelByValue.value[option]
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  })
}

function onAddNew() {
  if (searchTerm.value) {
    extendedOptions.value.push({
      value: searchTerm.value,
      label: searchTerm.value,
    })

    if (props.multiple) {
      if (!Array.isArray(selectValue.value)) {
        selectValue.value = []
      }
      selectValue.value.push(searchTerm.value)
    } else {
      selectValue.value = searchTerm.value
    }
  }

  open.value = false
}

function onClear() {
  if (props.multiple) {
    selectValue.value = []
  } else {
    selectValue.value = undefined
  }
}

function onRemoveItem(index: number) {
  if (props.multiple) {
    if (Array.isArray(selectValue.value)) {
      selectValue.value = selectValue.value.filter((_, i) => i !== index)
    }
  } else {
    throw new Error('Tried to remove item from single select')
  }
}

// This function is not executed when multiple is true
function getDisplayValue(value: string) {
  return labelByValue.value[value] ?? value
}
</script>

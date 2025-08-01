<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div
    class="relative w-full"
    :class="{
      'popper-with-wrapper': withWrapper,
      popper: !withWrapper,
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
          'flex size-full items-center gap-3': !withWrapper,
          'form-inner': withWrapper,
          '!border-main': focused,
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
        class="base-container bottom-2 z-50 mt-1 max-h-96 w-full flex-col overflow-y-auto overflow-x-hidden"
      >
        <ComboboxViewport class="w-full">
          <ComboboxEmpty as-child>
            <div
              class="w-full rounded-lg px-4 py-[0.35rem] hover:cursor-pointer hover:bg-accent-light"
              @click="onAddNew"
            >
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
              class="relative flex w-full cursor-pointer select-none items-center rounded-lg px-4 py-[0.35rem] text-base data-[disabled]:pointer-events-none data-[highlighted]:bg-accent-light data-[state=checked]:bg-main data-[disabled]:text-accent data-[state=checked]:text-white data-[highlighted]:outline-none"
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
import type { SelectProps } from './raw-select.vue'
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

export type AutocompleteProps = SelectProps & {
  clearable?: boolean
  editing?: boolean
  hidden?: boolean
  canCreateNew?: boolean
  notFoundLabel?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  multiple?: boolean
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
const extendedOptions = ref(props.options!)

const labelByValue = computed<Record<string, string>>(() =>
  map(prop('label'), indexBy(prop('value'), props.options!)),
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

<style scoped>
[data-radix-popper-content-wrapper] {
  position: absolute !important;
}

.popper-with-wrapper [data-radix-popper-content-wrapper] {
  width: 100%;
}

.popper [data-radix-popper-content-wrapper] {
  width: calc(100% + 30px);
}

.popper.bottom [data-radix-popper-content-wrapper] {
  margin-top: 8px !important;
}

.popper.top [data-radix-popper-content-wrapper] {
  padding-bottom: 12px !important;
}

.popper-with-wrapper.top [data-radix-popper-content-wrapper] {
  padding-bottom: 8px !important;
}

.select-trigger[data-state='open'] .select-chevron {
  transform: rotate(180deg);
}
</style>

<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div
    class="relative w-full"
    :class="{
      'popper-with-wrapper': withWrapper,
      popper: !withWrapper,
    }"
  >
    <ComboboxRoot
      v-model="selectValue"
      v-model:search-term="searchTerm"
      v-model:open="open"
      class="relative"
      :filter-function="filterFunction"
      :display-value="(v) => labelByValue[v]"
      reset-search-term-on-select
      reset-search-term-on-blur
    >
      <ComboboxAnchor
        :class="{
          'flex size-full items-center gap-3': !withWrapper,
          'formkit-inner': withWrapper,
        }"
      >
        <ComboboxInput
          v-bind="$attrs"
          :class="{ hidden: !(editing && !hidden), 'w-full': true }"
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

      <ComboboxContent position="popper">
        <ComboboxViewport
          class="base-container z-10 max-h-96 w-full max-w-full overflow-y-auto overflow-x-hidden"
        >
          <ComboboxEmpty as-child>
            <div
              class="w-full rounded-lg px-4 py-[0.35rem] hover:cursor-pointer hover:bg-accent-light"
              @click="onAddNew"
            >
              {{
                canCreateNew
                  ? `Add ${searchTerm}`
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
}

const props = withDefaults(defineProps<AutocompleteProps>(), {
  withWrapper: true,
  canCreateNew: false,
  editing: true,
  hidden: false,
  clearable: false,
})

const selectValue = defineModel<string>()
const searchTerm = defineModel<string>('searchTerm')
const open = ref<boolean>(false)
const focused = ref(false)
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
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  })
}

function onAddNew() {
  if (searchTerm.value) {
    extendedOptions.value.push({
      value: searchTerm.value,
      label: searchTerm.value,
    })

    selectValue.value = searchTerm.value
    open.value = false
  }
}

function onClear() {
  selectValue.value = undefined
}
</script>

<style scoped>
[data-radix-popper-content-wrapper] {
  position: absolute !important;
  transform: none !important;
  top: var(--radix-popper-anchor-height) !important;
}

.popper-with-wrapper [data-radix-popper-content-wrapper] {
  width: 100%;
  margin-top: 4px;
}

.popper [data-radix-popper-content-wrapper] {
  width: calc(100% + 30px);
  margin-top: 8px !important;
  margin-left: -15px !important;
}
</style>

<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div
    :data-testid="dataTestid"
    class="menu-popper-root select"
    :class="{
      'with-wrapper': withWrapper,
      [side]: true,
    }"
  >
    <SelectRoot v-model="selectValue" class="relative">
      <SelectTrigger
        class="menu-trigger relative"
        :class="{
          'flex size-full items-center gap-3': !withWrapper,
          'form-inner': withWrapper,
          'border-primary!': focused,
        }"
        @focus="onFocus"
        @blur="onBlur"
      >
        <div class="flex flex-1 items-center gap-1">
          <component :is="icons[icon]" v-if="icon" :size="16" stroke="1.5" />
          <SelectValue :placeholder="placeholder" />
        </div>
        <input class="w-0 opacity-0" />
        <component
          :is="side === 'top' ? IconChevronUp : IconChevronDown"
          class="menu-chevron"
          :size="ICON_SIZE_SMALL"
        />
      </SelectTrigger>

      <SelectPortal disabled>
        <SelectContent
          :align="align"
          :side="side"
          :avoid-collisions="false"
          position="popper"
          class="menu-content"
        >
          <SelectViewport class="w-full">
            <SelectGroup v-if="options" class="flex w-full flex-col gap-1">
              <SelectItem
                v-for="(option, index) in options"
                :key="index"
                class="menu-item"
                :value="option.value"
              >
                <component
                  :is="icons[option.icon]"
                  v-if="option.icon"
                  :size="16"
                  stroke="1.5"
                />
                <SelectItemText>
                  {{ option.label }}
                </SelectItemText>
              </SelectItem>
            </SelectGroup>

            <template v-for="(group, index) in groups" :key="group.label">
              <SelectLabel v-if="group.label" class="select-group-label">
                {{ group.label }}
              </SelectLabel>
              <SelectGroup class="flex w-full flex-col gap-1">
                <SelectItem
                  v-for="option in group.options"
                  :key="option.value"
                  class="menu-item"
                  :value="option.value"
                >
                  <SelectItemText>
                    {{ option.label }}
                  </SelectItemText>
                  <component
                    :is="icons[option.icon]"
                    v-if="option.icon"
                    :size="16"
                    stroke="1.5"
                  />
                </SelectItem>
              </SelectGroup>
              <SelectSeparator
                v-if="index < (groups?.length ?? 0) - 1"
                class="bg-surface mt-0 h-px w-full"
              />
            </template>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup lang="ts">
import { icons, IconChevronDown, IconChevronUp } from '@tabler/icons-vue'
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'radix-vue'

export type SelectOption = {
  label: string
  value: string
  icon?: keyof typeof icons
}
export type SelectProps = {
  dataTestid?: string
  options?: SelectOption[]
  groups?: { label?: string; options: SelectOption[] }[]
  placeholder?: string
  withWrapper?: boolean
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const props = withDefaults(defineProps<SelectProps>(), {
  withWrapper: true,
  side: 'bottom',
})

const selectValue = defineModel<string>()
const focused = defineModel<boolean>('focused')

const icon = computed(
  () => props.options?.find(({ value }) => selectValue.value === value)?.icon,
)

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
}
</script>

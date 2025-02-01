<template>
  <div class="relative w-full" :class="$props.class">
    <SelectRoot v-model="selectValue" class="relative">
      <SelectTrigger
        :class="{
          'flex size-full items-center gap-3': !withWrapper,
          'formkit-inner': withWrapper,
        }"
      >
        <SelectValue class="flex size-full" :placeholder="placeholder" />
        <input class="w-0 opacity-0" />
        <!--  eslint-disable-next-line tailwindcss/no-custom-classname -->
        <IconChevronDown class="chevron" size="1.2em" />
      </SelectTrigger>

      <SelectPortal disabled>
        <SelectContent position="popper">
          <SelectViewport
            class="base-container z-10 max-h-96 w-full max-w-full overflow-y-auto overflow-x-hidden"
          >
            <SelectGroup v-if="options" class="flex w-full flex-col gap-1">
              <SelectItem
                v-for="(option, index) in options"
                :key="index"
                class="relative flex w-full cursor-pointer select-none items-center rounded-lg px-4 py-[0.35rem] text-base data-[disabled]:pointer-events-none data-[highlighted]:bg-accent-light data-[state=checked]:bg-main data-[disabled]:text-accent data-[state=checked]:text-white data-[highlighted]:outline-none"
                :value="option.value"
              >
                <SelectItemText>
                  {{ option.label }}
                </SelectItemText>
              </SelectItem>
            </SelectGroup>

            <template v-for="(group, index) in groups" :key="group.label">
              <SelectLabel
                v-if="group.label"
                class="mt-2 w-full uppercase text-accent-dark"
              >
                {{ group.label }}
              </SelectLabel>
              <SelectGroup class="flex w-full flex-col gap-1">
                <SelectItem
                  v-for="option in group.options"
                  :key="option.value"
                  class="relative flex w-full cursor-pointer select-none items-center rounded-lg px-4 py-[0.35rem] text-base data-[disabled]:pointer-events-none data-[highlighted]:bg-accent-light data-[state=checked]:bg-main data-[disabled]:text-accent data-[state=checked]:text-white data-[highlighted]:outline-none"
                  :value="option.value"
                >
                  <SelectItemText>
                    {{ option.label }}
                  </SelectItemText>
                </SelectItem>
              </SelectGroup>
              <SelectSeparator
                v-if="index < (groups?.length ?? 0) - 1"
                class="mt-0 h-px w-full bg-accent"
              />
            </template>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue'
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

export type SelectOption = { label: string; value: string }

withDefaults(
  defineProps<{
    options?: SelectOption[]
    groups?: { label?: string; options: SelectOption[] }[]
    placeholder?: string
    withWrapper?: boolean
  }>(),
  { withWrapper: true },
)

const selectValue = defineModel<string>()
</script>

<style scoped>
[data-radix-popper-content-wrapper] {
  background-color: green !important ;
  position: absolute !important;
  width: 100%;
  transform: none !important;
  top: var(--radix-popper-anchor-height) !important;
  margin-top: 4px;
}

[data-state='open'] .chevron {
  transform: rotate(180deg);
}

.chevron {
  transition: transform 300ms;
}
</style>

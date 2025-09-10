<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div
    class="popper relative w-full"
    :class="{
      [side]: true,
    }"
  >
    <DropdownMenuRoot>
      <DropdownMenuTrigger class="dropdown-trigger">
        <bl-button v-bind="$props" expand variant="tertiary">
          <slot />
          <template v-if="withChevron" #appendIcon="iconProps">
            <IconChevronDown
              v-bind="iconProps"
              :size="15"
              stroke="2"
              class="dropdown-chevron transition-transform duration-300 ease-in"
            />
          </template>
        </bl-button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal disabled>
        <DropdownMenuContent
          :align="align"
          :avoid-collisions="false"
          position="popper"
          class="base-container top-2 z-50 mt-1 max-h-96 flex-col overflow-y-auto overflow-x-hidden"
        >
          <DropdownMenuItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            class="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-4 py-[0.35rem] text-base data-[disabled]:pointer-events-none data-[highlighted]:bg-accent-light data-[state=checked]:bg-main data-[disabled]:text-accent data-[state=checked]:text-white data-[highlighted]:outline-none"
            @click="$emit('click', item.value)"
          >
            <component
              :is="icons[item.icon]"
              v-if="item.icon"
              :size="16"
              stroke="1.5"
            />
            {{ item.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>

<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import { IconChevronDown, icons } from '@tabler/icons-vue'

export type DropdownItem = {
  label: string
  value: string
  icon?: keyof typeof icons
}

withDefaults(
  defineProps<{
    items: DropdownItem[]
    withChevron?: boolean
    align?: 'start' | 'center' | 'end'
    side?: 'top' | 'right' | 'bottom' | 'left'
  }>(),
  { withChevron: true, align: 'start', side: 'bottom' },
)

defineEmits<{
  (e: 'click', val: string): void
}>()
</script>

<style scoped>
.dropdown-trigger {
  position: relative;
}

.dropdown-trigger[data-state='open'] .dropdown-chevron {
  transform: rotate(180deg);
}

.popper [data-radix-popper-content-wrapper] {
  position: absolute !important;
  width: 100%;
}
</style>

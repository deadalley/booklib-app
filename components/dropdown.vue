<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="relative">
    <DropdownMenuRoot>
      <DropdownMenuTrigger class="dropdown-trigger">
        <bl-button v-bind="$props" expand variant="secondary">
          <slot />
          <template #appendIcon="iconProps">
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
          class="dropdown-content base-container top-2 z-10 max-h-96 flex-col overflow-y-auto overflow-x-hidden"
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
              class=""
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

defineProps<{
  items: DropdownItem[]
}>()

defineEmits<{
  (e: 'click', val: string): void
}>()
</script>

<style scoped>
[data-radix-popper-content-wrapper] {
  position: absolute !important;
  width: 100%;
  transform: none !important;
  top: var(--radix-popper-anchor-height) !important;
  margin-top: 4px;
}

.dropdown-trigger {
  position: relative;
}

.dropdown-trigger[data-state='open'] .dropdown-chevron {
  transform: rotate(180deg);
}
</style>

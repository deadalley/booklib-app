<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div
    class="menu-popper-root with-wrapper dropdown"
    :class="{
      [side]: true,
    }"
  >
    <DropdownMenuRoot>
      <DropdownMenuTrigger class="menu-trigger">
        <bl-button v-bind="$props" expand variant="secondary">
          <slot />
          <template v-if="withChevron" #appendIcon="iconProps">
            <IconChevronDown
              v-bind="iconProps"
              :size="15"
              stroke="2"
              class="menu-chevron"
            />
          </template>
        </bl-button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal disabled>
        <DropdownMenuContent
          :align="align"
          :avoid-collisions="false"
          position="popper"
          class="menu-content"
        >
          <DropdownMenuItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            class="menu-item"
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

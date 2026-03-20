<template>
  <transition name="sidebar-slide-right">
    <div
      v-show="open"
      class="border-l-stroke bg-surface-canvas text-ink-primary absolute inset-x-0 top-0 z-50 flex h-full flex-col gap-8 overflow-auto border-l px-8 pb-16 pt-8 shadow-md md:left-[unset] md:w-[355px]"
    >
      <div class="flex justify-between">
        <h4 v-if="!!title">{{ title }}</h4>

        <bl-icon-button variant="tertiary" @click="$emit('close')">
          <template #default="iconProps">
            <IconX v-bind="iconProps" />
          </template>
        </bl-icon-button>
      </div>
      <div>
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'

defineProps<{ title?: string; open?: boolean }>()

defineEmits(['close'])
</script>

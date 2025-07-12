<template>
  <transition name="sidebar-slide-right">
    <div
      v-show="isOpen"
      class="absolute inset-x-0 top-0 z-50 flex h-full flex-col gap-8 overflow-auto border-l border-l-accent bg-background px-8 pb-16 pt-8 text-black shadow-md md:left-[unset] md:w-[355px]"
    >
      <div class="flex justify-between">
        <h4 v-if="!!title">{{ title }}</h4>

        <bl-icon-button variant="tertiary" @click="onClose">
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

defineProps<{ title?: string; isOpen: boolean; onClose: () => void }>()
</script>

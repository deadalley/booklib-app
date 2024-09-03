<template>
  <transition name="sidebar-slide">
    <div
      v-show="isOpen"
      class="absolute right-0 top-0 flex h-full flex-col gap-12 overflow-auto border-l border-l-accent bg-background px-8 pb-16 pt-8 text-black shadow-md md:w-[355px]"
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

<style scoped>
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

.sidebar-slide-enter-to,
.sidebar-slider-leave-from {
  @apply -translate-x-0;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  @apply translate-x-full;
}
</style>

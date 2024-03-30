<template>
  <TransitionRoot
    :show="isOpen ?? false"
    enter="transition ease-in-out duration-300 transform"
    enter-from="translate-x-full"
    enter-to="-translate-x-0"
    leave="transition ease-in-out duration-300 transform"
    leave-from="-translate-x-0"
    leave-to="translate-x-full"
    as="div"
    class="absolute right-0 top-0 flex h-full flex-col gap-8 border-l border-l-accent bg-background px-8 pb-16 pt-8 text-black shadow-md md:w-[355px]"
  >
    <bl-icon-button variant="tertiary" @click="onClose">
      <template #default="iconProps">
        <IconX v-bind="iconProps" />
      </template>
    </bl-icon-button>
    <div>
      <slot></slot>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot } from '@headlessui/vue'
import { IconX } from '@tabler/icons-vue'

defineProps<{ isOpen: boolean; onClose: () => void }>()
</script>

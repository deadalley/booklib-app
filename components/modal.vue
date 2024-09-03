<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <DialogRoot>
    <DialogTrigger>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-black"
      />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed left-1/2 top-1/2 z-[100] max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
      >
        <DialogTitle as="div" class="flex w-full items-end justify-center">
          <h4 class="flex-1">
            <slot name="title" />
          </h4>
          <DialogClose>
            <bl-icon-button variant="secondary">
              <template #default="iconProps">
                <IconX v-bind="iconProps" />
              </template>
            </bl-icon-button>
          </DialogClose>
        </DialogTitle>
        <div class="relative flex h-full flex-col overflow-auto">
          <slot />
        </div>
        <div class="flex items-baseline justify-end gap-2">
          <DialogClose>
            <bl-button
              v-if="$slots['cancel-label']"
              variant="secondary"
              @click="_onCancel"
            >
              <slot name="cancel-label" />
            </bl-button>
          </DialogClose>
          <DialogClose>
            <bl-button @click="_onConfirm">
              <slot name="action-label" />
            </bl-button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'radix-vue'
import { IconX } from '@tabler/icons-vue'

const props = defineProps<{
  onCancel?: () => void
  onConfirm?: () => void
}>()

const isOpen = ref(false)

function setIsOpen(value: boolean) {
  isOpen.value = value
}

function _onCancel() {
  props.onCancel?.()
  setIsOpen(false)
}

function _onConfirm() {
  props.onConfirm?.()
  setIsOpen(false)
}

defineExpose({
  isOpen,
  setIsOpen,
})
</script>

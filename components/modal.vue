<template>
  <Dialog :open="isOpen" class="relative z-50" @close="setIsOpen">
    <!-- The backdrop, rendered as a fixed sibling to the panel container -->
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

    <!-- Full-screen container to center the panel -->
    <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
      <!-- The actual dialog panel -->
      <DialogPanel class="min-w-max rounded-m bg-background p-9">
        <DialogTitle as="h3" class="mb-4 font-medium"
          ><slot name="title"></slot
        ></DialogTitle>
        <slot></slot>
        <div class="flex justify-end gap-2">
          <bl-button variant="secondary" @click="_onCancel">
            <slot name="cancel-label"></slot>
          </bl-button>
          <FormKit type="submit">
            <bl-button @click="_onConfirm">
              <slot name="action-label"></slot>
            </bl-button>
          </FormKit>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const props = defineProps({
  onCancel: {
    type: Function,
    required: false,
  },
  onConfirm: {
    type: Function,
    required: false,
  },
})

const isOpen = ref(false)

function setIsOpen(value) {
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

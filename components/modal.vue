<template>
  <Dialog :open="isOpen" class="relative z-50" @close="setIsOpen">
    <!-- The backdrop, rendered as a fixed sibling to the panel container -->
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

    <!-- Full-screen container to center the panel -->
    <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
      <!-- The actual dialog panel -->
      <DialogPanel
        class="relative flex size-4/5 flex-col overflow-auto rounded-m bg-background p-9"
      >
        <DialogTitle as="h3" class="mb-4 font-medium"
          ><slot name="title"
        /></DialogTitle>
        <slot />
        <div class="flex items-baseline justify-end gap-2">
          <bl-button
            v-if="$slots['cancel-label']"
            variant="secondary"
            @click="_onCancel"
          >
            <slot name="cancel-label" />
          </bl-button>
          <FormKit v-if="$slots['action-label']" type="submit">
            <bl-button @click="_onConfirm">
              <slot name="action-label" />
            </bl-button>
          </FormKit>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

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

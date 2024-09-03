<script setup>
import { ref } from 'vue'

const modalRef = ref()

function openModal() {
  modalRef.value.setIsOpen(true)
}
</script>

<template>
  <Story title="Organisms/Modal">
    <bl-modal ref="modalRef">
      <template #trigger>
        <bl-button @click="openModal">Open</bl-button>
      </template>
      <template #title>Modal Title</template>
      This is modal content.
      <template #cancel-label>Cancel</template>
      <template #action-label>CTA</template>
    </bl-modal>
  </Story>
</template>

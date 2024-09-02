<script setup>
import { ref } from 'vue'
import Modal from './modal.vue'

const modalRef = ref()

function openModal() {
  modalRef.value.setIsOpen(true)
}
</script>

<template>
  <Story title="Modal">
    <bl-button @click="openModal">Open</bl-button>
    <Modal ref="modalRef">
      <template #title>Modal Title</template>
      This is modal content.
      <template #cancel-label>Cancel</template>
      <template #action-label>CTA</template>
    </Modal>
  </Story>
</template>

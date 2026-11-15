<template>
  <bl-modal v-model="chooserOpen" size="sm" sheet>
    <template #title>Add a book</template>
    <template #subtitle>How do you want to add it?</template>

    <div class="grid grid-cols-2 gap-2.5" data-testid="add-book-options">
      <bl-option-card
        layout="stack"
        size="sm"
        icon-well="square"
        icon="IconPencil"
        title="Enter manually"
        description="Type in the title, author and the rest"
        aria-label="Enter manually"
        class="min-h-28"
        @click="addManually"
      />
      <bl-option-card
        layout="stack"
        size="sm"
        icon-well="square"
        icon="IconBarcode"
        title="Scan ISBN"
        description="Fill in the details from the barcode"
        aria-label="Scan ISBN"
        class="min-h-28"
        @click="openScanner"
      />
    </div>
  </bl-modal>

  <!-- The new book page opens once a scan is chosen -->
  <bl-isbn-scanner v-model="scannerOpen" @use="addFromScan" />
</template>

<script setup lang="ts">
const { chooserOpen, scannerOpen, openScanner, addManually, addFromScan } =
  useAddBook()
</script>

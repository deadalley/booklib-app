<template>
  <Story title="Organisms/Modal">
    <bl-modal>
      <template #trigger>
        <bl-button>Open</bl-button>
      </template>
      <template #title>Modal Title</template>
      This is modal content.
      <template #cancel-label>Cancel</template>
      <template #action-label>CTA</template>
    </bl-modal>
  </Story>
</template>

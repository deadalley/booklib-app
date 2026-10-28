<template>
  <bl-modal v-model="open" size="sm" @confirm="$emit('confirm', deleteBooks)">
    <template v-if="$slots['trigger']" #trigger>
      <slot name="trigger" />
    </template>
    <template #title>
      Are you sure you want to delete
      <strong class="contents">{{ name }}</strong>
      ?
    </template>
    <bl-checkbox v-model="deleteBooks" align="left">
      <template v-if="!deleteBooks">
        Your books will
        <strong>not</strong>
        be deleted.
      </template>
      <template v-if="deleteBooks">
        Your books
        <strong>will</strong>
        be deleted.
      </template>
      This action cannot be undone.
    </bl-checkbox>
    <template #cancel-label>Cancel</template>
    <template #action-label>Delete</template>
  </bl-modal>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()

defineEmits<{ (e: 'confirm', deleteBooks: boolean): void }>()

const open = defineModel<boolean>({ default: false })

const deleteBooks = ref(false)

watch(open, (isOpen) => {
  if (isOpen) deleteBooks.value = false
})
</script>

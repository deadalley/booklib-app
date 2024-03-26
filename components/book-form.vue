<template>
  <ClientOnly>
    <FormKit
      ref="formRef"
      type="form"
      :value="defaultValues"
      :actions="false"
      @submit="onSubmit"
    >
      <div class="form-section">
        <h4>Overview</h4>
        <div class="form-row">
          <bl-input
            id="title"
            :editing="editing"
            name="title"
            label="Title"
            placeholder="Title"
          />
        </div>
        <div class="form-row">
          <bl-input
            id="publisher"
            :editing="editing"
            name="publisher"
            label="Publisher"
            placeholder="Publisher"
          />
          <bl-input
            id="language"
            :editing="editing"
            name="language"
            label="Language"
            placeholder="Language"
          />
        </div>
        <div class="form-row">
          <bl-input
            id="year"
            :editing="editing"
            name="year"
            label="Year"
            placeholder="Year"
            type="number"
          />
          <bl-input
            id="pages"
            :editing="editing"
            name="pages"
            label="Pages"
            placeholder="Pages"
            type="number"
          />
        </div>
        <div class="form-row">
          <bl-input
            id="originalTitle"
            :editing="editing"
            name="originalTitle"
            label="Original Title"
            placeholder="Original Title"
          />
          <bl-input
            id="originalLanguage"
            :editing="editing"
            name="originalLanguage"
            label="Original Language"
            placeholder="Original Language"
          />
        </div>
        <div class="form-row">
          <bl-input
            id="isbn"
            :editing="editing"
            name="isbn"
            label="ISBN"
            placeholder="ISBN"
          />
        </div>
        <div v-if="editing" class="form-row">
          <bl-input
            id="summary"
            type="textarea"
            :editing="editing"
            name="summary"
            label="Summary"
            placeholder="Summary"
            :rows="4"
          />
        </div>
      </div>
      <div v-if="editing" class="flex gap-2 justify-end">
        <bl-button compact variant="secondary" @click="() => onEdit(false)"
          >Discard</bl-button
        >
        <FormKit type="submit">
          <bl-button compact>Save</bl-button>
        </FormKit>
      </div>
    </FormKit>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Book } from '~/types/book'

const props = defineProps({
  defaultValues: {
    type: Object as PropType<Book>,
    required: false,
  },
  editing: {
    type: Boolean,
    default: true,
  },
  onEdit: {
    type: Function,
    required: true,
  },
  onRefetch: {
    type: Function,
    required: false,
  },
})

async function onSubmit(book: Book) {
  const updatedBook = await $fetch<Book>('/api/books', {
    method: 'post',
    body: { ...book, id: book.id ?? props.defaultValues?.id },
  })

  if (updatedBook) {
    props.onEdit(false)
    props.onRefetch?.()
  }
}
</script>

<template>
  <ClientOnly>
    <FormKit type="form" :actions="false" :value="defaultValues">
      <section v-if="!editing">
        <div class="flex justify-between w-full col-span-12">
          <h4>Summary</h4>
          <bl-button compact variant="secondary" @click="onEdit()"
            >Edit</bl-button
          >
        </div>
        <p class="col-span-12">{{ defaultValues?.summary }}</p>
      </section>
      <section>
        <h4>Overview</h4>
        <div class="form-row">
          <bl-input
            id="title"
            asd="title"
            :editing="editing"
            name="title"
            label="Title"
            placeholder="Title"
            :value="defaultValues?.title"
          />
        </div>
        <div class="form-row">
          <bl-input
            id="publisher"
            :editing="editing"
            name="publisher"
            label="Publisher"
            placeholder="Publisher"
            default-value="defaultValues.publisher"
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
            input-type="number"
          />
          <bl-input
            id="pages"
            :editing="editing"
            name="pages"
            label="Pages"
            placeholder="Pages"
            input-type="number"
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
            input-type="number"
          />
        </div>
        <div v-if="editing" class="form-row">
          <bl-textarea-input
            id="summary"
            :editing="editing"
            name="summary"
            label="Summary"
            placeholder="Summary"
            :rows="4"
          />
        </div>
      </section>
      <div v-if="editing" class="flex gap-2 justify-end">
        <bl-button compact variant="secondary" @click="onDiscard()"
          >Discard</bl-button
        >
        <bl-button compact type="submit">Save</bl-button>
      </div>
    </FormKit>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Book } from '../types/book'

defineProps({
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
  onDiscard: {
    type: Function,
    required: true,
  },
})
</script>

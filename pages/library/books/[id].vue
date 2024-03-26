<template>
  <div v-if="book" class="flex flex-col gap-10 flex-1 overflow-auto">
    <header class="flex flex-col gap-2">
      <div class="flex gap-3 justify-between items-end">
        <h2 class="flex items-end leading-none">
          {{ isNew ? 'New Book' : book.title }}
        </h2>
        <div v-if="!isNew" class="flex flex-col leading-tight justify-end">
          <p>Added on</p>
          <h6>01/01/2021</h6>
        </div>
      </div>
      <h5>{{ book.author }}</h5>
    </header>
    <div class="flex gap-10 flex-1 overflow-auto">
      <!-- <bl-loading v-if="true"></bl-loading> -->

      <bl-book-image
        :editing="true"
        :book-id="book.id"
        alt="book-cover"
      ></bl-book-image>
      <div class="overflow-y-auto flex-[3] flex flex-col gap-16">
        <section v-if="!editing" class="book-section">
          <bl-input id="id" type="hidden" name="id"></bl-input>
          <div class="flex justify-between w-full col-span-12">
            <h4>Summary</h4>
            <bl-button compact variant="secondary" @click="onEdit(true)"
              >Edit</bl-button
            >
          </div>
          <p class="col-span-12 text-gray-dark">
            {{ book?.summary ?? 'No summary available' }}
          </p>
        </section>
        <section class="book-section">
          <!-- <bl-book-form
            :default-values="book"
            :editing="editing"
            :on-cancel="onCancel"
            :on-submit="onSubmit"
          ></bl-book-form> -->
          <ClientOnly>
            <FormKit
              ref="formRef"
              type="form"
              :value="book"
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
                <bl-button compact variant="secondary" @click="onCancel"
                  >Discard</bl-button
                >
                <FormKit type="submit">
                  <bl-button compact>Save</bl-button>
                </FormKit>
              </div>
            </FormKit>
          </ClientOnly>
        </section>
        <section v-if="!isNew" class="book-section">
          <h5>Delete book</h5>
          <div class="flex gap-3 justify-between">
            <p>
              Are you sure you want to delete this book? This action cannot be
              undone.
            </p>
            <bl-button compact @click="openDeleteModal">Delete</bl-button>
          </div>
          <bl-modal ref="deleteModalRef" :on-confirm="deleteBook">
            <template #title
              >Are you sure you want to delete <strong>{{ book.title }}</strong
              >?</template
            >
            This action cannot be undone.
            <template #cancel-label> Cancel </template>
            <template #action-label> Delete </template>
          </bl-modal>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const editing = ref(isNew.value)
const deleteModalRef = ref()
const book = ref()
const loading = ref(false)

function openDeleteModal() {
  deleteModalRef.value.setIsOpen(true)
}

async function fetchBook() {
  if (route.params.id === 'new') {
    book.value = {}
  } else {
    loading.value = true
    const data = await $fetch<Book>(`/api/books/${route.params.id}`, {})
    book.value = data
    loading.value = false
  }
}

async function deleteBook() {
  await $fetch<Book>(`/api/books/${route.params.id}`, {
    method: 'delete',
  })

  navigateTo('/library')
}

function onEdit(value: boolean) {
  editing.value = value
}

function onCancel() {
  if (isNew.value) {
    navigateTo('/library')
  } else {
    editing.value = false
  }
}

async function onSubmit(book: Book) {
  console.log(book)
  const updatedBook = await $fetch<Book>('/api/books', {
    method: 'post',
    body: book,
  })

  console.log(updatedBook)

  if (updatedBook) {
    if (isNew) {
      navigateTo(`/library/books/${updatedBook.id}`)
    } else {
      fetchBook()
    }
  }
}

onMounted(() => {
  fetchBook()
})

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  alias: ['/new'],
})
</script>

<template>
  <NuxtLayout name="dashboard" title="Settings">
    <div
      class="flex flex-1 flex-col gap-10 lg:flex-row 2xl:w-9/12 2xl:overflow-auto"
    >
      <div class="flex flex-1 flex-col gap-16">
        <section class="book-section">
          <h4>Reset library</h4>
          <p>
            Resetting your library will permanently delete your books and
            collections. This action cannot be undone.
          </p>
          <bl-modal size="sm" @confirm="resetLibrary">
            <template #trigger>
              <bl-button class="mt-4">Reset library</bl-button>
            </template>
            <template #title
              >Are you sure you want to reset your library?</template
            >
            <p>
              Resetting your library will permanently delete your books and
              collections. <strong>This action cannot be undone.</strong>
            </p>

            <template #cancel-label> Cancel </template>
            <template #action-label> Reset library </template>
          </bl-modal>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
async function resetLibrary() {
  try {
    await $fetch<string | undefined>('/api/library/reset', {
      method: 'post',
    })

    navigateTo('/library')
  } catch (error) {
    console.error(error)
  }
}

useHead({
  title: 'BookLib | Settings',
})
</script>

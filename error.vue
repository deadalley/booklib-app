<template>
  <div
    class="bg-surface-canvas grid min-h-dvh place-items-center px-4 py-10 sm:px-6"
  >
    <div
      class="paper-flat flex w-full max-w-md flex-col items-center gap-4 px-6 py-8 text-center sm:px-10 sm:py-10"
    >
      <NuxtImg
        :src="getAssetPath('/book-graphics-3.svg')"
        width="240"
        height="240"
        alt=""
        class="h-auto w-40 sm:w-56"
      />
      <span class="section-label text-primary">
        {{ is404 ? 'Error 404' : 'Unexpected error' }}
      </span>
      <h3>{{ is404 ? 'Page not found' : 'Something went wrong' }}</h3>
      <p class="text-ink-secondary">
        {{
          is404
            ? 'This page does not exist or has moved.'
            : 'BookLib ran into a problem. Your library data is safe.'
        }}
      </p>
      <div
        class="mt-2 flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row"
      >
        <bl-button variant="secondary" class="justify-center" @click="goBack">
          Go back
        </bl-button>
        <bl-button class="justify-center" @click="handleError">
          Return to your library
        </bl-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import { NuxtImg } from '#components'
import { getAssetPath } from '~/utils/assets'

const props = defineProps({
  error: Object as () => NuxtError,
})

const is404 = computed(() => props.error?.statusCode === 404)

const handleError = () => clearError({ redirect: '/home' })

function goBack() {
  clearError()
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/home')
  }
}
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center">
    <NuxtImg
      :src="getAssetPath('/book-graphics-3.svg')"
      width="512"
      height="512"
      alt="Error image"
      class="-mb-24 -mt-64"
    />
    <template v-if="error?.statusCode === 404">
      <h1>Not Found.</h1>
      <h3>This page does not exist.</h3>
      <bl-button class="mt-12" @click="handleError">
        Return to your library
      </bl-button>
    </template>
    <template v-else>
      <h1>Oh no!</h1>
      <h3>Something went wrong with BookLib.</h3>
      <bl-button class="mt-12" @click="handleError">
        Return to your library
      </bl-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import { NuxtImg } from '#components'

defineProps({
  error: Object as () => NuxtError,
})

const handleError = () => clearError({ redirect: '/home' })
</script>

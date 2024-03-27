<template>
  <div class="w-screen h-screen flex items-center justify-center">
    Waiting for login...
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

const cookieName = useRuntimeConfig().public.supabase.cookieName
const redirectPath = useCookie(`${cookieName}-redirect-path`).value

watch(
  user,
  () => {
    if (user.value) {
      if (redirectPath) {
        useCookie(`${cookieName}-redirect-path`).value = null
        return navigateTo(redirectPath || '/')
      } else {
        return navigateTo('/library/books')
      }
    }
  },
  { immediate: true },
)
</script>

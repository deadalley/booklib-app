<template>
  <div
    class="flex h-screen w-screen flex-col items-center justify-center gap-4"
  >
    <bl-loading class="size-16" />
    <h6>Signing in...</h6>
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

useHead({
  title: 'BookLib',
})
</script>

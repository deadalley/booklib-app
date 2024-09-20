<template>
  <div class="flex h-screen w-screen items-center p-16">
    <NuxtImg
      src="/books-4.jpg"
      alt="Books"
      class="h-full max-w-4xl rounded-3xl border-2 border-main object-cover object-center"
    />
    <div class="flex h-full flex-col px-28 py-12">
      <h2>BOOKLIB</h2>

      <ClientOnly>
        <div class="flex flex-1 flex-col justify-center gap-12">
          <div>
            <h1>Reset password</h1>
            <p>
              Choose a new password and go back to managing your books with
              BookLib.
            </p>
          </div>

          <div class="flex flex-col justify-center gap-8 md:w-[400px]">
            <FormKit
              type="form"
              :value="{}"
              :actions="false"
              @submit="handlePasswordUpdate"
            >
              <bl-input
                id="password"
                name="password"
                label="New password"
                placeholder="New password"
                type="password"
              />

              <FormKit type="submit" class="w-full">
                <bl-button expand type="submit" :disabled="loading">
                  <bl-loading v-if="loading" class="size-4" />
                  {{ loading ? 'Signing in...' : 'Update password' }}
                </bl-button>
              </FormKit>
            </FormKit>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUrlSearchParams } from '@vueuse/core'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)

const params = useUrlSearchParams()

watch(user, () => {}, { immediate: true })

onMounted(async () => {
  if (params.code && typeof params.code === 'string') {
    await supabase.auth.exchangeCodeForSession(params.code)
  } else {
    navigateTo('/login')
  }
})

async function handlePasswordUpdate({ password }: { password: string }) {
  loading.value = true

  const { error } = await supabase.auth.updateUser({ password })

  if (error) throw error
  else navigateTo('/library')
}

useHead({
  title: 'BookLib',
})
</script>

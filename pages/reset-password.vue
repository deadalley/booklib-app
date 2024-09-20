<template>
  <div class="flex h-screen w-screen items-center p-16">
    <NuxtImg
      src="/books-3.jpg"
      alt="Books"
      class="h-full max-w-4xl rounded-3xl border-2 border-main object-cover object-center"
    />
    <div class="flex h-full flex-col px-28 py-12">
      <h2>BOOKLIB</h2>

      <ClientOnly>
        <div class="flex flex-1 flex-col justify-center gap-12">
          <template v-if="!success">
            <div>
              <h1>Forgot your password?</h1>
              <p>No problem! You can reset it here!</p>
            </div>

            <div class="flex flex-col justify-center gap-8 md:w-[400px]">
              <FormKit
                type="form"
                :value="{}"
                :actions="false"
                @submit="handlePasswordReset"
              >
                <bl-input
                  id="email"
                  name="email"
                  label="E-mail"
                  placeholder="E-mail"
                />

                <FormKit type="submit" class="w-full">
                  <bl-button expand type="submit" :disabled="loading">
                    <bl-loading v-if="loading" class="size-4" />
                    {{
                      loading ? 'Sending e-mail...' : 'Request password reset'
                    }}
                  </bl-button>
                </FormKit>
              </FormKit>

              <p class="text-center">
                Already have an account?
                <NuxtLink
                  to="/login"
                  class="cursor-pointer text-main hover:text-main/80"
                >
                  Sign in.
                </NuxtLink>
              </p>
            </div>
          </template>

          <template v-if="success">
            <div class="flex flex-col justify-center gap-12">
              <div>
                <h4>Email sent!</h4>
                <p>
                  We've sent you an e-mail for resetting your password. Check
                  your mailbox.
                </p>
              </div>
              <NuxtLink to="/login">
                <bl-button expand>Go to sign in</bl-button>
              </NuxtLink>
            </div>
          </template>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const loading = ref(false)
const success = ref(false)

async function handlePasswordReset({ email }: { email: string }) {
  loading.value = true

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/update-password',
  })

  if (error) throw error

  await Promise.resolve()

  loading.value = false
  success.value = true
}

useHead({
  title: 'BookLib',
})
</script>

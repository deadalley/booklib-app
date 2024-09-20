<template>
  <div class="flex h-screen w-screen items-center p-16">
    <NuxtImg
      src="/books-1.jpg"
      alt="Books"
      class="h-full max-w-4xl rounded-3xl border-2 border-main object-cover object-center"
    />
    <div class="flex h-full flex-col px-28 py-12">
      <h2>BOOKLIB</h2>

      <ClientOnly>
        <div class="flex flex-1 flex-col justify-center gap-12">
          <div>
            <h1>Welcome to your library!</h1>
            <p>Sign in to start managing your books with BookLib.</p>
          </div>

          <div class="flex flex-col justify-center gap-8 md:w-[400px]">
            <bl-button
              type="button"
              expand
              variant="tertiary"
              :disabled="!!loading"
              @click="handleGoogleLogin"
            >
              <bl-loading v-if="loading === 'google'" class="size-4" />
              <NuxtImg
                src="/google.svg"
                alt="Books"
                class="h-6 object-cover object-center"
              />
              {{
                loading === 'google' ? 'Signing in...' : 'Sign in with Google'
              }}
            </bl-button>

            <div class="flex items-center gap-4">
              <hr class="w-full text-accent" />
              or
              <hr class="w-full text-accent" />
            </div>

            <FormKit
              type="form"
              :value="{}"
              :actions="false"
              @submit="handleEmailLogin"
            >
              <bl-input
                id="email"
                name="email"
                label="E-mail"
                placeholder="E-mail"
              />
              <bl-input
                id="password"
                name="password"
                label="Password"
                placeholder="Password"
                type="password"
              />
              <p v-if="!!errorMessage" class="text-main">{{ errorMessage }}</p>
              <NuxtLink
                to="/reset-password"
                class="w-full cursor-pointer text-right text-accent-dark underline hover:text-main"
              >
                Forgot your password?
              </NuxtLink>

              <FormKit type="submit" class="w-full">
                <bl-button expand type="submit" :disabled="!!loading">
                  <bl-loading v-if="loading === 'email'" class="size-4" />
                  {{ loading === 'email' ? 'Signing in...' : 'Sign in' }}
                </bl-button>
              </FormKit>
            </FormKit>

            <p class="text-center">
              Don't have an account?
              <NuxtLink
                to="/sign-up"
                class="cursor-pointer text-main hover:text-main/80"
              >
                Create an account.
              </NuxtLink>
            </p>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const loading = ref<'google' | 'email' | undefined>(undefined)
const errorMessage = ref<string | undefined>()

async function handleGoogleLogin() {
  loading.value = 'google'

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/confirm',
    },
  })

  if (error) {
    throw error
    loading.value = undefined
  }
}

async function handleEmailLogin({
  email,
  password,
}: {
  email: string
  password: string
}) {
  loading.value = 'email'
  errorMessage.value = undefined

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    switch (error.code) {
      case 'invalid_credentials':
        errorMessage.value = 'Wrong e-mail or password.'
        break
      default:
        throw error
    }
    loading.value = undefined
  } else {
    navigateTo('/home')
  }
}

useHead({
  title: 'BookLib',
})
</script>

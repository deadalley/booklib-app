<template>
  <div class="flex h-screen w-screen items-center p-16">
    <NuxtImg
      src="/books-2.jpg"
      alt="Books"
      class="h-full max-w-4xl rounded-3xl border-2 border-main object-cover object-center"
    />
    <div class="flex h-full flex-col px-28 py-12">
      <h2>BOOKLIB</h2>

      <ClientOnly>
        <div class="flex flex-1 flex-col justify-center gap-12">
          <div>
            <h1>Create your account</h1>
            <p>Create your BookLib account and start managing your books.</p>
          </div>

          <div class="flex flex-col justify-center gap-8 md:w-[400px]">
            <bl-button expand variant="tertiary" @click="handleGoogleLogin">
              <NuxtImg
                src="/google.svg"
                alt="Books"
                class="h-6 object-cover object-center"
              />
              Sign up with Google
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
              @submit="handleEmailSignup"
            >
              <bl-input id="name" name="name" label="Name" placeholder="Name" />
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

              <FormKit type="submit" class="w-full">
                <bl-button expand type="submit" compact
                  >Create account</bl-button
                >
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
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const loading = ref(false)

async function handleGoogleLogin() {
  loading.value = true

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/confirm',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) throw error
}

async function handleEmailSignup({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  loading.value = true

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:3000/account-verified',
      data: {
        first_name: name,
      },
    },
  })

  if (error) throw error
}

useHead({
  title: 'BookLib',
})
</script>

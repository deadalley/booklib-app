<template>
  <NuxtLayout name="dashboard" title="Profile">
    <div
      class="flex flex-1 flex-col gap-10 lg:flex-row 2xl:w-9/12 2xl:overflow-auto"
    >
      <div class="lg:w-80">
        <NuxtImg
          :src="profile?.profileSrc"
          alt="Profile"
          class="h-auto w-full rounded-full object-cover"
        />
      </div>

      <div class="flex flex-1 flex-col gap-16">
        <ClientOnly>
          <FormKit
            type="form"
            :value="profile ?? {}"
            :actions="false"
            @submit="onSubmit"
          >
            <section class="book-section max-w-screen-md">
              <div class="form-row">
                <bl-input
                  id="name"
                  :editing="editing"
                  name="name"
                  label="Name"
                  placeholder="Name"
                />
                <!-- <bl-input
                    id="username"
                    :editing="editing"
                    name="username"
                    label="Username"
                    placeholder="Username"
                  /> -->
                <div
                  v-if="!!profile?.joinedAt"
                  class="flex flex-col justify-end leading-tight"
                >
                  <p>Joined</p>
                  <h6 class="w-max">{{ profile.joinedAt }}</h6>
                </div>
              </div>
              <div class="form-row">
                <bl-input
                  id="email"
                  :editing="editing"
                  name="email"
                  label="E-mail"
                  placeholder="E-mail"
                />
              </div>
            </section>

            <div v-if="editing" class="flex justify-end gap-2">
              <bl-button compact variant="secondary" @click="onCancel">
                Discard changes
              </bl-button>
              <FormKit type="submit">
                <bl-button type="submit" compact>Save changes</bl-button>
              </FormKit>
            </div>
          </FormKit>
        </ClientOnly>

        <section class="book-section">
          <h4>Delete account</h4>
          <p>
            Deleting your account will permanently delete your books and
            collections. You won't be able to track your books or see any
            statistics anymore. This action cannot be undone.
          </p>
          <bl-modal :on-confirm="deleteAccount" size="sm">
            <template #trigger>
              <bl-button class="mt-4">Delete account</bl-button>
            </template>
            <template #title
              >Are you sure you want to delete your account?</template
            >
            <p>
              Deleting your account will permanently delete your books and
              collections. You won't be able to track your books or see any
              statistics anymore. <strong>This action cannot be undone.</strong>
            </p>

            <template #cancel-label> Cancel </template>
            <template #action-label> Delete </template>
          </bl-modal>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
const user = useSupabaseUser()

type Profile = {
  username: string
  email?: string
  name: string
  profileSrc: string
  joinedAt: string
}

const editing = ref(false)
const profile = ref<Profile>()

onMounted(() => {
  if (user.value) {
    console.log(user.value)
    profile.value = {
      username: user.value.user_metadata.username,
      name: user.value.user_metadata.full_name,
      email: user.value.email,
      profileSrc: user.value.user_metadata.avatar_url,
      joinedAt: format(user.value.created_at ?? '', 'dd MMM yyyy'),
    }
  }
})

async function onSubmit() {}

async function deleteAccount() {}

function onCancel() {}

useHead({
  title: 'BookLib | Profile',
})

definePageMeta({
  middleware: 'auth',
})
</script>

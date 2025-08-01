<template>
  <div
    class="relative flex size-full flex-col gap-4 overflow-y-hidden overflow-x-visible sm:gap-8"
    v-bind="$attrs"
  >
    <div class="flex flex-col items-baseline justify-between lg:flex-row">
      <div class="flex w-full items-center gap-3">
        <h3>{{ title }}</h3>
        <bl-total-tag v-if="total">{{ total }}</bl-total-tag>
        <div class="flex flex-1 justify-end sm:hidden">
          <IconChevronDown
            :size="ICON_SIZE_MEDIUM"
            stroke="1.5"
            class="cursor-pointer text-accent-darker transition-all duration-300 hover:text-main"
            :class="{ 'rotate-180': actionsOpen }"
            @click="actionsOpen = !actionsOpen"
          />
        </div>
      </div>
      <div
        class="w-full overflow-hidden transition-all duration-300 ease-in-out"
        :class="{
          'max-h-96 opacity-100': actionsOpen,
          'max-h-0 opacity-0': !actionsOpen,
        }"
      >
        <div
          class="mt-5 flex w-full flex-1 flex-col justify-end gap-3 transition-transform duration-300 ease-in-out lg:flex-row"
          :class="[
            { 'md:mr-[355px]': !!sidebarContent },
            actionsOpen ? 'translate-y-0' : '-translate-y-full',
          ]"
        >
          <slot name="navbar" />
        </div>
      </div>
    </div>
    <slot />
  </div>
  <bl-loading-overlay v-if="loading" />
</template>

<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue'

defineProps<{
  title: string
  total: string | number
  sidebarContent?: string
  loading?: boolean
}>()

const actionsOpen = ref(true)

onMounted(() => {
  if (isMobile()) {
    actionsOpen.value = false
  }
})
</script>

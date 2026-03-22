<template>
  <div
    class="relative flex size-full flex-col overflow-x-visible"
    v-bind="$attrs"
  >
    <div class="mb-6 flex flex-col">
      <div class="flex items-baseline justify-between">
        <!-- Header -->
        <div class="flex w-full items-center gap-3">
          <!-- Title -->
          <h3>{{ title }}</h3>
          <!-- Total -->
          <bl-total-tag v-if="total">{{ total }}</bl-total-tag>
          <!-- Sidebar trigger button -->
          <div class="flex flex-1 justify-end sm:hidden">
            <IconChevronDown
              :size="ICON_SIZE_MEDIUM"
              stroke="1.5"
              class="text-ink-secondary hover:text-primary cursor-pointer transition-all duration-300"
              :class="{ 'rotate-180': actionsOpen }"
              @click="actionsOpen = !actionsOpen"
            />
          </div>
        </div>
        <slot v-if="!isMobile()" name="headerActions" />
      </div>
      <!-- Actions -->
      <div
        class="z-10 flex w-full flex-col gap-3 transition-all duration-300 ease-in-out"
        :class="{
          'max-h-96 opacity-100': actionsOpen,
          'max-h-0 opacity-0': !actionsOpen,
          'mt-4': !isMobile(),
        }"
      >
        <div
          class="flex w-full flex-1 flex-col justify-end gap-3 overflow-x-auto overflow-y-visible p-0.5 transition-transform duration-300 ease-in-out lg:mt-0 lg:flex-row"
          :class="[
            { 'md:mr-[355px]': !!sidebarContent },
            actionsOpen ? 'translate-y-0' : '-translate-y-full',
          ]"
        >
          <div
            class="paper-sm flex w-fit justify-end gap-2 overflow-visible p-2"
          >
            <slot name="navbar" />
          </div>
        </div>
        <slot v-if="isMobile()" name="headerActions" />
      </div>
    </div>
    <!-- Content -->
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

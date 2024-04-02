<template>
  <div
    class="inline-flex h-min items-center gap-3 rounded-m border bg-white px-5 py-3 text-base outline-none transition-all duration-100 ease-in placeholder:text-accent lg:w-[355px]"
    :class="{
      'border-white': !focused,
      'border-accent': focused,
    }"
  >
    <IconSearch :size="ICON_SIZE_MEDIUM" />
    <input class="w-full" v-bind="$attrs" @focus="onFocus" @blur="onBlur" />
  </div>
</template>

<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'

const focused = ref(false)

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
}

defineOptions({
  inheritAttrs: false,
})
</script>

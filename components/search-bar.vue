<template>
  <div
    class="inline-flex h-min w-full items-center gap-3 rounded-xl border bg-white px-4 py-[0.35rem] text-base outline-none transition-all duration-100 ease-in placeholder:text-accent lg:w-[355px]"
    :class="{
      'border-main text-black': focused,
      'border-accent text-accent-dark': !focused,
    }"
  >
    <IconSearch :size="ICON_SIZE_SMALL" />
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

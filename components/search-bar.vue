<template>
  <div
    class="formkit-inner !lg:min-w-[500px] !w-full"
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
watch(focused, (v) => console.log(v))
</script>

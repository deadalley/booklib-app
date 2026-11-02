<template>
  <div
    class="form-inner inline-flex lg:w-[355px]"
    :class="{
      'border-primary text-ink-primary': focused,
      'border-stroke text-ink-muted': !focused,
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

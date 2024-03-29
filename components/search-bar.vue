<template>
  <div class="formkit-inner !lg:w-[500px] !w-full">
    <IconSearch :size="ICON_SIZE_MEDIUM" />
    <input class="w-full" v-bind="$attrs" />
  </div>
</template>

<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'

defineOptions({
  inheritAttrs: false,
})
</script>

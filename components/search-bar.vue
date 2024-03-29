<template>
  <div class="formkit-inner !w-96">
    <IconSearch :size="ICON_SIZE_MEDIUM" />
    <input class="w-full" v-bind="$attrs" />
  </div>
</template>

<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'
import { ICON_SIZE_MEDIUM } from '~/utils'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <TabsContent :value="value"><slot /></TabsContent>
</template>

<script setup lang="ts">
import { TabsContent } from 'radix-vue'

defineProps<{
  value: string
}>()
</script>

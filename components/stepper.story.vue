<script setup>
const state = reactive({
  steps: [
    {
      step: 1,
      title: 'Address',
      description: 'Add your address here',
      icon: 'IconHome',
    },
    {
      step: 2,
      title: 'Shipping',
      description: 'Set your preferred shipping method',
      icon: 'IconArchive',
    },
    {
      step: 3,
      title: 'Checkout',
      description: 'Confirm your order',
      icon: 'IconCheck',
    },
  ],
  currentStep: 2,
})
</script>

<template>
  <Story title="Molecules/Stepper" class="bg-background"
    ><bl-stepper v-bind="state"
  /></Story>
</template>

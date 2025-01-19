<script setup>
const state = reactive({
  steps: [
    {
      step: 1,
      title: 'Queued',
      description: 'Add your address here',
      icon: 'IconStackPush',
    },
    {
      step: 2,
      title: 'Reading',
      description: 'Set your preferred shipping method',
      icon: 'IconEyeglass2',
    },
    {
      step: 3,
      title: 'Read',
      description: 'Confirm your order',
      icon: 'IconBook',
    },
  ],
  currentStep: 2,
})
</script>

<template>
  <Story title="Molecules/Stepper" class="bg-background">
    <Variant title="Default">
      <bl-stepper v-bind="state" />
    </Variant>
    <Variant title="No Icons">
      <bl-stepper
        v-bind="state"
        :steps="state.steps.map(({ icon, ...step }) => step)"
      />
    </Variant>
    <Variant title="No Title and Description">
      <bl-stepper
        v-bind="state"
        :steps="state.steps.map(({ title, description, ...step }) => step)"
      />
    </Variant>
    <Variant title="No Description">
      <bl-stepper
        v-bind="state"
        :steps="state.steps.map(({ description, ...step }) => step)"
      />
    </Variant>
  </Story>
</template>

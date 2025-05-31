<template>
  <NuxtLayout name="dashboard" title="Tracking">
    <h3 class="mb-3">Goals</h3>
    <div class="grid grid-cols-12 gap-4">
      <bl-tile class="col-span-12 items-center justify-center gap-4 py-8">
        <IconChartAreaLine class="text-main" size="70" stroke="1.5" />
        You don't have any goals yet.
        <bl-goal-modal v-model="selectedGoal" :is-new="!selectedGoal">
          <template #trigger="triggerProps">
            <bl-button v-bind="triggerProps">Create a new goal</bl-button>
          </template>
        </bl-goal-modal>
      </bl-tile>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconChartAreaLine } from '@tabler/icons-vue'
import type { Goal } from '~/types/goal'

const selectedGoal = ref<Goal | undefined>()

useHead({
  title: 'BookLib | Tracking',
})
</script>

<template>
  <bl-modal :open="open" size="sm" icon="IconChartAreaLine" @cancel="onCancel">
    <template #trigger>
      <slot name="trigger" @click="open = true" />
    </template>

    <template #title>
      {{ isNew ? goal?.title : 'New goal' }}
    </template>

    <ClientOnly>
      <div class="flex flex-1 flex-col gap-16 overflow-visible overflow-y-auto">
        <FormKit
          id="goal"
          v-model="goal"
          type="form"
          :actions="false"
          @submit="onSubmit"
        >
          <section class="book-section">
            <div class="form-section">
              <div class="form-row">
                <bl-input
                  id="title"
                  name="title"
                  label="Goal title"
                  placeholder="Title"
                />
              </div>
              <div class="form-row">
                <bl-checkbox
                  id="isActive"
                  v-model="trackingGoal"
                  name="isActive"
                  align="left"
                >
                  Active
                </bl-checkbox>
              </div>
            </div>
          </section>
          <section class="book-section">
            <h6 class="flex flex-1 items-center gap-2">
              <IconTimeDuration30
                class="text-main"
                :size="ICON_SIZE_SMALL"
                stroke="1.5"
              />
              Duration
            </h6>
            <div class="form-row">
              <bl-input
                id="startedAt"
                type="date"
                name="startedAt"
                label="Start on"
                placeholder="Start date"
                :formatter="dateFormatter"
              />
              <bl-input
                id="finishedAt"
                type="date"
                name="finishedAt"
                label="Finish on"
                placeholder="End date"
                :formatter="dateFormatter"
              />
            </div>
          </section>
          <section class="book-section">
            <h6 class="flex flex-1 items-center gap-2">
              <IconLicense
                class="text-main"
                :size="ICON_SIZE_SMALL"
                stroke="1.5"
              />
              Tracking
            </h6>
            <div class="form-row items-end">
              <bl-input
                id="amount"
                type="number"
                name="amount"
                placeholder="Amount"
              />
              <bl-select
                id="type"
                type="select"
                name="type"
                placeholder="Type"
                :options="
                  Object.values(GOAL_TYPE_MAP).map(
                    ({ id, description, icon }) => ({
                      label: description,
                      value: id,
                      icon,
                    }),
                  )
                "
              />
              <bl-select
                id="interval"
                type="select"
                name="interval"
                placeholder="Interval"
                :options="
                  Object.values(GOAL_INTERVAL_MAP).map(
                    ({ id, description }) => ({
                      label: description,
                      value: id,
                    }),
                  )
                "
              />
            </div>
          </section>
          <div class="flex items-baseline justify-end gap-2">
            <bl-button variant="secondary" @click="onCancel">
              Cancel
            </bl-button>
            <bl-button @click="onSubmit">Save</bl-button>
          </div>
        </FormKit>
      </div>
    </ClientOnly>
  </bl-modal>
</template>

<script setup lang="ts">
import type { Goal } from '~/types/goal'
import { reset } from '@formkit/core'
import { IconLicense, IconTimeDuration30 } from '@tabler/icons-vue'

defineProps<{ isNew?: boolean }>()

const goal = defineModel<Goal | undefined>()

const open = ref<boolean>(false)
const trackingGoal = ref<boolean>(false)

function onSubmit() {
  reset('goal')
}

function onCancel() {
  reset('goal')
  open.value = false
}

function dateFormatter(date: Date | undefined): string | undefined {
  return date && toDefaultDate(date)
}
</script>

<template>
  <bl-modal v-model="open" size="sm" icon="IconCalendar">
    <template #title>
      <span>
        {{ title }}
        <span class="goal-modal-sub">{{ goal.title }}</span>
      </span>
    </template>

    <form class="flex flex-col items-start gap-4" @submit.prevent="save">
      <div class="text-ink-secondary flex items-baseline gap-2 font-semibold">
        <b class="font-display text-ink-primary text-[2rem] font-semibold">
          {{ formatGoalNumber(total) }}
        </b>
        <span class="whitespace-nowrap">/ {{ goal.amount }} {{ unit }}</span>
        <span
          v-if="total >= goal.amount"
          class="goal-tag goal-tag-tracking ml-1 self-center"
        >
          Target met
        </span>
      </div>

      <ul class="flex w-full flex-col gap-2">
        <li
          v-for="(row, index) in rows"
          :key="row.id"
          class="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3"
        >
          <span class="form-label">Entry {{ index + 1 }}</span>
          <span class="form-inner">
            <input
              :ref="
                (el) =>
                  index === rows.length - 1 &&
                  (lastInput = el as HTMLInputElement)
              "
              v-model="row.value"
              type="number"
              min="0"
              :step="goal.type === 'hours' ? 0.5 : 1"
              placeholder="0"
              class="form-input"
              :aria-label="`Entry ${index + 1} ${unit}`"
            />
            <span class="text-ink-muted text-sm font-semibold">{{ unit }}</span>
          </span>
          <bl-icon-button
            variant="tertiary"
            :aria-label="`Remove entry ${index + 1}`"
            @click="removeRow(row.id)"
          >
            <template #default="iconProps">
              <IconTrash v-bind="iconProps" />
            </template>
          </bl-icon-button>
        </li>
      </ul>

      <bl-button variant="secondary" size="sm" @click="addRow">
        <template #prependIcon="iconProps">
          <IconPlus v-bind="iconProps" />
        </template>
        Add entry
      </bl-button>

      <div class="flex w-full justify-end gap-2">
        <bl-button variant="secondary" @click="open = false">Cancel</bl-button>
        <bl-button :disabled="!dirty" @click="save">Save day</bl-button>
      </div>
      <button type="submit" hidden />
    </form>
  </bl-modal>
</template>

<script setup lang="ts">
import { IconPlus, IconTrash } from '@tabler/icons-vue'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import type { Goal } from '~/types/goal'

type Row = { id: string; value: string }

const props = defineProps<{ goal: Goal; day: string }>()

const emit = defineEmits<{ (e: 'save', goal: Goal): void }>()

const open = defineModel<boolean>({ default: false })

const rows = ref<Row[]>([])
const lastInput = ref<HTMLInputElement>()

const unit = computed(() => getGoalUnit(props.goal, 2))

const title = computed(() => dayjs.utc(props.day).format('dddd, MMMM D'))

const dayEntries = computed(() =>
  props.goal.entries.filter(
    (entry) => toSimpleDate(entry.createdAt) === props.day,
  ),
)

const total = computed(() =>
  rows.value.reduce((sum, row) => sum + (+row.value || 0), 0),
)

const dirty = computed(
  () =>
    JSON.stringify(
      rows.value.filter((row) => +row.value > 0).map((row) => +row.value),
    ) !==
    JSON.stringify(
      dayEntries.value.map((entry) => getGoalEntryValue(props.goal, entry)),
    ),
)

watch(
  open,
  (isOpen) => {
    if (!isOpen) return
    rows.value = dayEntries.value.map((entry) => ({
      id: entry.id,
      value: String(getGoalEntryValue(props.goal, entry)),
    }))
    if (!rows.value.length) addRow()
    nextTick(() => lastInput.value?.focus())
  },
  { immediate: true },
)

function addRow() {
  rows.value = [...rows.value, { id: uuidv4(), value: '' }]
  nextTick(() => lastInput.value?.focus())
}

function removeRow(id: string) {
  rows.value = rows.value.filter((row) => row.id !== id)
}

function save() {
  if (!dirty.value || props.goal.type === 'books') return

  const key = props.goal.type
  const kept = props.goal.entries.filter(
    (entry) => toSimpleDate(entry.createdAt) !== props.day,
  )
  const next = rows.value
    .filter((row) => +row.value > 0)
    .map((row) => ({ id: row.id, [key]: +row.value, createdAt: props.day }))

  emit('save', { ...props.goal, entries: [...kept, ...next] } as Goal)
  open.value = false
}
</script>

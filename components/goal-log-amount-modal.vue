<template>
  <bl-modal v-model="open" size="sm" :icon="GOAL_TYPE_MAP[goal.type].icon">
    <template #title>
      <span>
        Log {{ goal.type }}
        <span class="goal-modal-sub">{{ goal.title }}</span>
      </span>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="save">
      <div class="flex flex-col gap-4 sm:flex-row">
        <label class="form-wrapper">
          <span class="form-label">
            {{ GOAL_TYPE_MAP[goal.type].description }}
          </span>
          <span class="form-inner">
            <input
              ref="amountInput"
              v-model="amount"
              type="number"
              min="0"
              :step="goal.type === 'hours' ? 0.5 : 1"
              placeholder="0"
              class="form-input"
            />
          </span>
        </label>
        <label class="form-wrapper">
          <span class="form-label">Read on</span>
          <span class="form-inner" :class="{ error: !dateValid }">
            <input
              v-model="date"
              type="date"
              class="form-input"
              :min="windowStart"
              :max="windowEnd"
            />
          </span>
        </label>
      </div>
      <p v-if="!dateValid" class="form-error -mt-2">
        Pick a date between {{ formatGoalDate(windowStart) }} and
        {{ formatGoalDate(windowEnd) }}.
      </p>
      <div class="flex justify-end gap-2">
        <bl-button variant="secondary" @click="open = false">Cancel</bl-button>
        <bl-button :disabled="!(+amount > 0) || !dateValid" @click="save">
          Log {{ goal.type }}
        </bl-button>
      </div>
      <button type="submit" hidden />
    </form>
  </bl-modal>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { Goal, HourGoalEntry, PageGoalEntry } from '~/types/goal'

const props = defineProps<{ goal: Goal }>()

const emit = defineEmits<{
  (e: 'save', entry: PageGoalEntry | HourGoalEntry): void
}>()

const open = defineModel<boolean>({ default: false })

const amount = ref('')
const windowStart = computed(() => toSimpleDate(props.goal.startAt))
const windowEnd = computed(() => toSimpleDate(props.goal.finishAt))
const date = ref(getGoalDefaultLogDate(props.goal))
const dateValid = computed(
  () => !!date.value && isInGoalWindow(props.goal, date.value),
)
const amountInput = ref<HTMLInputElement>()

watch(
  open,
  (isOpen) => {
    if (!isOpen) return
    amount.value = ''
    date.value = getGoalDefaultLogDate(props.goal)
    nextTick(() => amountInput.value?.focus())
  },
  { immediate: true },
)

function save() {
  if (!(+amount.value > 0) || !dateValid.value || props.goal.type === 'books')
    return

  emit('save', {
    id: uuidv4(),
    createdAt: date.value,
    ...(props.goal.type === 'pages'
      ? { pages: +amount.value }
      : { hours: +amount.value }),
  } as PageGoalEntry | HourGoalEntry)
  open.value = false
}
</script>

<template>
  <NuxtLayout name="dashboard" title="Tracking">
    <div class="tracking">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-primary text-xs font-bold tracking-[0.18em] uppercase">
            Tracking
          </p>
          <h3>Goals</h3>
        </div>
        <bl-button @click="openGoalModal('new')">
          <template #prependIcon="iconProps">
            <IconPlus v-bind="iconProps" />
          </template>
          New goal
        </bl-button>
      </div>

      <bl-empty v-if="loaded && !goals.length" icon="IconChartAreaLine">
        <template #label>
          <p>You don’t have any goals yet.</p>
        </template>
        <template #action>
          <bl-button @click="openGoalModal('new')">Create a new goal</bl-button>
        </template>
      </bl-empty>

      <template v-else>
        <bl-goal-today-panel
          v-if="groups.active.length"
          :goals="groups.active"
          @jump="jumpTo"
          @log="(goal) => (logFor = goal.id)"
        />

        <section v-if="groups.active.length" class="group">
          <p class="goal-section-label">Active · {{ groups.active.length }}</p>
          <bl-goal-tile
            v-for="goal in groups.active"
            :key="goal.id"
            v-bind="tileProps(goal)"
            v-on="tileListeners(goal)"
          />
        </section>

        <section v-if="groups.paused.length" class="group">
          <p class="goal-section-label">Paused · {{ groups.paused.length }}</p>
          <bl-goal-tile
            v-for="goal in groups.paused"
            :key="goal.id"
            v-bind="tileProps(goal)"
            v-on="tileListeners(goal)"
          />
        </section>

        <section v-if="groups.done.length" class="group">
          <button
            type="button"
            class="goal-section-label hover:text-primary cursor-pointer"
            :aria-expanded="showDone"
            @click="showDone = !showDone"
          >
            Finished &amp; expired · {{ groups.done.length }}
            <IconChevronDown
              :size="14"
              stroke="2"
              class="transition-transform"
              :class="{ 'rotate-180': showDone }"
            />
          </button>
          <template v-if="showDone">
            <bl-goal-tile
              v-for="goal in groups.done"
              :key="goal.id"
              v-bind="tileProps(goal)"
              v-on="tileListeners(goal)"
            />
          </template>
        </section>
      </template>
    </div>

    <bl-goal-modal
      v-if="goalModal"
      :model-value="true"
      :goal="goalModal.goal"
      :mode="goalModal.mode"
      :authors="authors"
      :books="books"
      @update:model-value="(value) => !value && (goalModal = null)"
      @save="onSaveGoalFromModal"
    />

    <template v-if="logGoal">
      <bl-goal-log-book-modal
        v-if="logGoal.type === 'books'"
        :model-value="true"
        :goal="logGoal"
        :books="viewBooks"
        @update:model-value="(value) => !value && (logFor = null)"
        @save="(entry) => onLogEntry(logGoal!, entry)"
      />
      <bl-goal-log-amount-modal
        v-else
        :model-value="true"
        :goal="logGoal"
        @update:model-value="(value) => !value && (logFor = null)"
        @save="(entry) => onLogEntry(logGoal!, entry)"
      />
    </template>

    <bl-goal-day-modal
      v-if="dayGoal && dayFor"
      :model-value="true"
      :goal="dayGoal"
      :day="dayFor.day"
      @update:model-value="(value) => !value && (dayFor = null)"
      @save="saveGoal"
    />

    <bl-modal
      v-if="confirmDelete"
      :model-value="true"
      size="sm"
      @update:model-value="(value) => !value && (confirmDelete = null)"
      @confirm="onDeleteGoal"
    >
      <template #title>
        <span>
          Are you sure you want to delete
          <strong>{{ confirmDelete.title }}</strong>
          ?
        </span>
      </template>
      This action cannot be undone.
      <template #cancel-label>Cancel</template>
      <template #action-label>Delete</template>
    </bl-modal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconChevronDown, IconPlus } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Goal } from '~/types/goal'

const props = defineProps<{ openNew?: boolean }>()

const { getAuthors, getBooks, getGoals, createGoal, deleteGoal } =
  useBookLibrary()

const route = useRoute()

const authors = ref<Author[]>([])
const books = ref<Book[]>([])
const goals = ref<Goal[]>([])
const loaded = ref(false)

const openIds = ref(new Set<string>())
const showDone = ref(false)
const logFor = ref<string | null>(null)
const dayFor = ref<{ goalId: string; day: string } | null>(null)
const confirmDelete = ref<Goal | null>(null)
const goalModal = ref<{
  mode: 'new' | 'edit' | 'repeat'
  goal: Goal | null
} | null>(null)

async function load() {
  const [authorData, bookData, goalData] = await Promise.all([
    getAuthors(),
    getBooks(),
    getGoals(),
  ])
  authors.value = authorData
  books.value = bookData
  goals.value = goalData
  loaded.value = true
}

const viewBooks = computed<ViewBook[]>(() =>
  books.value.map((book) => ({
    ...book,
    authorName: authors.value.find(({ id }) => id === book.author)?.name,
  })),
)

const resolvedGoals = computed(() =>
  goals.value.map((goal) => resolveGoal(goal, books.value)),
)

const groups = computed(() => {
  const active: Goal[] = []
  const paused: Goal[] = []
  const done: Goal[] = []

  resolvedGoals.value.forEach((goal) => {
    const status = getGoalStatus(goal)
    if (status === 'tracking') active.push(goal)
    else if (status === 'not-tracking') paused.push(goal)
    else done.push(goal)
  })

  const byFinish = (a: Goal, b: Goal) =>
    toSimpleDate(a.finishAt).localeCompare(toSimpleDate(b.finishAt))
  active.sort(byFinish)
  done.sort((a, b) => byFinish(b, a))

  return { active, paused, done }
})

const findGoal = (id: string | null | undefined) =>
  resolvedGoals.value.find((goal) => goal.id === id)

const logGoal = computed(() => findGoal(logFor.value))
const dayGoal = computed(() => findGoal(dayFor.value?.goalId))

function tileProps(goal: Goal) {
  return {
    goal,
    books: viewBooks.value,
    authors: authors.value,
    open: openIds.value.has(goal.id),
  }
}

function tileListeners(goal: Goal) {
  return {
    toggle: () => toggle(goal.id),
    update: saveGoal,
    edit: () => openGoalModal('edit', stripAutoEntries(goal)),
    delete: () => (confirmDelete.value = goal),
    repeat: () => openGoalModal('repeat', getRepeatedGoal(goal)),
    log: () => (logFor.value = goal.id),
    day: (day: string) => (dayFor.value = { goalId: goal.id, day }),
  }
}

function toggle(id: string) {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}

function expand(id: string) {
  openIds.value = new Set([...openIds.value, id])
}

function jumpTo(id: string) {
  expand(id)
  nextTick(() => {
    document
      .getElementById(`goal-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function openGoalModal(
  mode: 'new' | 'edit' | 'repeat',
  goal: Goal | null = null,
) {
  goalModal.value = { mode, goal }
}

async function saveGoal(goal: Goal) {
  await createGoal(stripAutoEntries(goal))
  await load()
}

async function onSaveGoalFromModal(goal: Goal) {
  await saveGoal(goal)
  expand(goal.id)
}

async function onLogEntry(goal: Goal, entry: Goal['entries'][number]) {
  await saveGoal({ ...goal, entries: [...goal.entries, entry] } as Goal)
  expand(goal.id)
}

async function onDeleteGoal() {
  if (!confirmDelete.value) return
  await deleteGoal(confirmDelete.value.id)
  confirmDelete.value = null
  await load()
}

onMounted(async () => {
  await load()

  const focusId = route.hash.startsWith('#goal-')
    ? route.hash.slice('#goal-'.length)
    : undefined
  const firstActive = groups.value.active[0]?.id

  if (focusId && findGoal(focusId)) {
    const status = getGoalStatus(findGoal(focusId)!)
    if (status === 'completed' || status === 'expired') showDone.value = true
    jumpTo(focusId)
  } else if (firstActive) {
    expand(firstActive)
  }

  if (props.openNew) openGoalModal('new')
})

useHead({
  title: 'BookLib | Tracking',
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.tracking {
  @apply mx-auto flex w-full max-w-[90rem] flex-col gap-6;
  container-type: inline-size;
}
.group {
  @apply flex flex-col gap-4;
}
.tracking :deep(:focus-visible) {
  @apply outline-primary! outline-offset-2!;
  outline-style: solid !important;
  outline-width: 2px !important;
}
</style>

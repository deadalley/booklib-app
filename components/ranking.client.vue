<template>
  <div class="flex flex-col gap-4">
    <apexchart
      type="rangeBar"
      :height="height ?? maxItems * 36"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

export type RankingItem = {
  label: string
  description?: string
  value: number
}

const props = withDefaults(
  defineProps<{ items: RankingItem[]; height?: number; maxItems?: number }>(),
  {
    maxItems: 5,
  },
)

const _items = computed(() => {
  const sortedItems = props.items
    .slice(0, props.maxItems)
    .sort(({ value: v1 }, { value: v2 }) => v2 - v1)

  return sortedItems
})

const chartWidthAdjust = computed<number>(
  () => Math.max(..._items.value.map(({ value }) => value)) + 28,
)

const series = computed(() => [
  {
    name: 'highlight',
    data: _items.value.slice(0, 1).map(({ label, value }) => ({
      x: formatLabel(label, value),
      y: [0, value],
    })),
    color: tailwind.theme.colors.main,
  },
  {
    name: 'data',
    data: _items.value.slice(1).map(({ label, value }) => ({
      x: formatLabel(label, value),
      y: [0, value],
    })),
    color: tailwind.theme.colors['accent-dark'],
  },
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    zoom: {
      enabled: false,
    },
    sparkline: {
      enabled: true,
    },
  },
  plotOptions: {
    bar: {
      barHeight: '3px',
      horizontal: true,
      isDumbbell: true,
      dumbbellColors: [
        ['transparent', tailwind.theme.colors.main],
        ['transparent', tailwind.theme.colors['accent-dark']],
      ],
      dataLabels: {
        position: 'top',
        hideOverflowingLabels: false,
      },
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    offsetX: 10,
    style: {
      fontSize: '18px',
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      colors: [
        tailwind.theme.colors.main,
        tailwind.theme.colors['accent-dark'],
      ],
    },
    formatter: (_, { dataPointIndex, seriesIndex, config: { series } }) => {
      const label = series[seriesIndex]?.data[dataPointIndex]?.x
      return label
    },
  },
  grid: {
    show: false,
  },
  states: {
    hover: {
      filter: {
        type: 'none',
      },
    },
  },
  xaxis: {
    min: 0,
    max: chartWidthAdjust.value,
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  tooltip: {
    enabled: false,
  },
}))

function formatLabel(label: string, value: number) {
  return `${label} (${value})`
}
</script>
